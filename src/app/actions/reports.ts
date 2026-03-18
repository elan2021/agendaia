"use server";

import { getCurrentTenant } from './tenants';
import { getTenantPrisma } from '@/lib/prisma';

async function getPrisma() {
  const tenant = await getCurrentTenant();
  if (!tenant || !tenant.turso_db_url) return null;
  return await getTenantPrisma(tenant.turso_db_url, tenant.turso_db_token);
}

export async function getReportsData(month?: number, year?: number) {
  const tPrisma = await getPrisma();
  if (!tPrisma) return null;

  const now = new Date();
  const targetMonth = month !== undefined ? month : now.getMonth();
  const targetYear = year !== undefined ? year : now.getFullYear();

  const startDate = new Date(targetYear, targetMonth, 1).toISOString();
  const endDate = new Date(targetYear, targetMonth + 1, 0, 23, 59, 59).toISOString();

  // Prev month for comparison
  const prevMonthStart = new Date(targetYear, targetMonth - 1, 1).toISOString();
  const prevMonthEnd = new Date(targetYear, targetMonth, 0, 23, 59, 59).toISOString();

  try {
    const [
      currentMonthAgendamentos,
      prevMonthAgendamentos,
      newClients,
      totalClients,
      recentHistory,
      professionalsCount
    ] = await Promise.all([
      (tPrisma as any).agendamento.findMany({
        where: {
          inicio: { gte: startDate, lte: endDate },
          status: { not: 'cancelado' }
        },
        include: { servico: true, profissional: true, cliente: true }
      }),
      (tPrisma as any).agendamento.findMany({
        where: {
          inicio: { gte: prevMonthStart, lte: prevMonthEnd },
          status: { not: 'cancelado' }
        },
        include: { servico: true }
      }),
      (tPrisma as any).cliente.count({
        where: { criado_em: { gte: startDate, lte: endDate } }
      }),
      (tPrisma as any).cliente.count(),
      (tPrisma as any).agendamento.findMany({
        where: {
          status: { in: ['pago', 'confirmado'] }
        },
        include: { cliente: true, servico: true },
        orderBy: { inicio: 'desc' },
        take: 10
      }),
      (tPrisma as any).profissional.count()
    ]);

    // Calculations
    const faturamentoTotal = currentMonthAgendamentos.reduce((sum: number, a: any) => sum + (a.servico?.preco || 0), 0);
    const faturamentoAnterior = prevMonthAgendamentos.reduce((sum: number, a: any) => sum + (a.servico?.preco || 0), 0);
    
    const faturamentoChange = faturamentoAnterior > 0 
      ? ((faturamentoTotal - faturamentoAnterior) / faturamentoAnterior) * 100 
      : 0;

    const ticketMedio = currentMonthAgendamentos.length > 0 
      ? faturamentoTotal / currentMonthAgendamentos.length 
      : 0;

    // Occupancy (rough estimation based on total slots vs taken)
    const workDaysInMonth = 22; // avg
    const totalPossibleSlots = professionalsCount * workDaysInMonth * 24;
    const ocupacao = totalPossibleSlots > 0 
      ? (currentMonthAgendamentos.length / totalPossibleSlots) * 100 
      : 0;

    return {
      faturamentoTotal,
      faturamentoChange: faturamentoChange.toFixed(1),
      newClients,
      ticketMedio: ticketMedio.toFixed(2),
      ocupacao: ocupacao.toFixed(1),
      recentHistory,
      currentMonthName: new Date(targetYear, targetMonth).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
    };
  } catch (error) {
    console.error('Erro ao buscar dados de relatórios (tenant):', error);
    return null;
  }
}
