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
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59).toISOString();
  
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  try {
    const [
      totalAppointments,
      activeClients,
      todayAppointments,
      newClientsMonth,
      nextAppointments
    ] = await Promise.all([
      (tPrisma as any).agendamento.count(),
      (tPrisma as any).cliente.count(),
      (tPrisma as any).agendamento.count({
        where: {
          inicio: { gte: todayStart, lte: todayEnd },
          status: { not: 'cancelado' }
        }
      }),
      (tPrisma as any).cliente.count({
        where: {
          criado_em: { gte: monthStart }
        }
      }),
      (tPrisma as any).agendamento.findMany({
        where: {
          inicio: { gte: new Date(now.getTime() - 60 * 60000).toISOString() }, // De 1 hora atrás em diante
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
          inicio: { gte: monthStart },
          status: { in: ['confirmado', 'pago'] }
        },
        include: { servico: true, profissional: true }
      })
    ]);

    // Calculate Revenue (estimated from confirmed/paid)
    const allAgendamentos = await (tPrisma as any).agendamento.findMany({
      where: { 
        inicio: { gte: monthStart },
        status: { in: ['confirmado', 'pago'] }
      },
      include: { servico: true }
    });

    const monthlyRevenue = allAgendamentos.reduce((sum: number, a: any) => sum + (a.servico?.preco || 0), 0);

    return {
      totalAppointments,
      activeClients,
      todayAppointments,
      newClientsMonth,
      monthlyRevenue,
      nextAppointments
    };
  } catch (error) {
    console.error('Erro ao buscar stats do dashboard (tenant):', error);
    return null;
  }
}
