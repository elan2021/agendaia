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

  const now = new Date();

  // Today range in UTC for the query
  const todayStartUTC = new Date(`${now.toISOString().split('T')[0]}T00:00:00-03:00`);
  const todayEndUTC = new Date(`${now.toISOString().split('T')[0]}T23:59:59-03:00`);
  
  const monthStartISO = `${now.toISOString().split('T')[0].substring(0, 7)}-01T00:00:00-03:00`;
  const monthStartUTC = new Date(monthStartISO);

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
      const date = new Date(a.inicio);
      
      const hora_display = new Intl.DateTimeFormat('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'America/Sao_Paulo'
      }).format(date);

      const day = new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        timeZone: 'America/Sao_Paulo'
      }).format(date);

      const month = new Intl.DateTimeFormat('pt-BR', {
        month: 'short',
        timeZone: 'America/Sao_Paulo'
      }).format(date).toUpperCase().replace('.', '');

      return {
        ...a,
        hora_display,
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
