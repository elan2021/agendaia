"use server";

import { getCurrentTenant } from './tenants';
import { getTenantPrisma } from '@/lib/prisma';

export async function getDashboardStats() {
  const tenant = await getCurrentTenant();
  if (!tenant) return null;

  // If tenant is not provisioned yet, return empty stats
  if (!tenant.turso_db_url || !tenant.turso_db_url.startsWith('libsql')) {
    return {
      totalAppointments: 0,
      activeClients: 0,
      todayAppointments: 0,
      newClientsMonth: 0,
      monthlyRevenue: 0,
      nextAppointments: []
    };
  }

  // Use the tenant-specific prisma client
  const tPrisma = await getTenantPrisma(tenant.turso_db_url, tenant.turso_db_token);

  // Helper to get Brasilia Date
  const getBRDate = (d: Date) => new Date(d.getTime() - 3 * 3600000);

  const now = new Date();
  const nowBR = getBRDate(now);
  
  // Today range in UTC for the query
  // Zero hours in BR today
  const brTodayStart = new Date(nowBR.getFullYear(), nowBR.getMonth(), nowBR.getDate(), 0, 0, 0);
  const brTodayEnd = new Date(nowBR.getFullYear(), nowBR.getMonth(), nowBR.getDate(), 23, 59, 59);
  
  // Convert back to UTC for Prisma
  const todayStartUTC = new Date(brTodayStart.getTime() + 3 * 3600000).toISOString();
  const todayEndUTC = new Date(brTodayEnd.getTime() + 3 * 3600000).toISOString();
  
  const monthStartBR = new Date(nowBR.getFullYear(), nowBR.getMonth(), 1, 0, 0, 0);
  const monthStartUTC = new Date(monthStartBR.getTime() + 3 * 3600000).toISOString();

  try {
    const [
      totalAppointments,
      activeClients,
      todayAppointments,
      newClientsMonth,
      nextAppointmentsRaw,
      allAgendamentos
    ] = await Promise.all([
      (tPrisma as any).agendamento.count(),
      (tPrisma as any).cliente.count(),
      (tPrisma as any).agendamento.count({
        where: {
          inicio: { gte: todayStartUTC, lte: todayEndUTC },
          status: { not: 'cancelado' }
        }
      }),
      (tPrisma as any).cliente.count({
        where: {
          criado_em: { gte: monthStartUTC }
        }
      }),
      (tPrisma as any).agendamento.findMany({
        where: {
          inicio: { gte: now.toISOString() },
          status: { not: 'cancelado' }
        },
        include: {
          cliente: true,
          servico: true,
          profissional: true
        },
        orderBy: { inicio: 'asc' },
        take: 5
      }),
      (tPrisma as any).agendamento.findMany({
        where: { 
          inicio: { gte: monthStartUTC },
          status: { in: ['confirmado', 'pago'] }
        },
        include: { servico: true }
      })
    ]);

    // Calculate Revenue
    const monthlyRevenue = allAgendamentos.reduce((sum: number, a: any) => sum + (a.servico?.preco || 0), 0);

    const monthNames = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];

    const formattedNext = nextAppointmentsRaw.map((a: any) => {
      const d = new Date(a.inicio);
      const br = getBRDate(d);
      
      const day = br.getUTCDate().toString().padStart(2, '0');
      const month = monthNames[br.getUTCMonth()];
      const hours = br.getUTCHours().toString().padStart(2, '0');
      const mins = br.getUTCMinutes().toString().padStart(2, '0');

      return {
        ...a,
        hora_display: `${hours}:${mins}`,
        data_display: `${day} DE ${month}.`
      };
    });

    return {
      totalAppointments,
      activeClients,
      todayAppointments,
      newClientsMonth,
      monthlyRevenue,
      nextAppointments: formattedNext
    };
  } catch (error) {
    console.error('Erro ao buscar stats do dashboard (tenant):', error);
    return null;
  }
}
