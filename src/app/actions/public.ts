"use server";

import { prisma, getTenantPrisma } from '@/lib/prisma';

export async function getPublicAppointmentsByPhone(tenantId: string, phone: string) {
  if (!tenantId || !phone) return { error: 'Dados inválidos' };

  try {
    const tenant = await (prisma as any).tenant.findUnique({
      where: { id: tenantId }
    });

    if (!tenant || !tenant.turso_db_url || !tenant.turso_db_token) {
      return { error: 'Empresa indisponível no momento.' };
    }

    const tenantPrisma = getTenantPrisma(tenant.turso_db_url, tenant.turso_db_token);

    try {
      const appointments = await (tenantPrisma as any).agendamento.findMany({
        where: { cliente_tel: phone },
        include: {
          servico: true,
          profissional: true,
        },
        orderBy: { inicio: 'desc' }
      });

      return {
        success: true,
        appointments: appointments.map((app: any) => ({
          id: app.id,
          date: new Date(app.inicio).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric', timeZone: 'America/Sao_Paulo' }),
          time: new Date(app.inicio).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo' }),
          service: app.servico ? app.servico.nome : 'Serviço Personalizado',
          prof: app.profissional ? app.profissional.nome : 'Profissional',
          price: app.servico && app.servico.preco ? `R$ ${app.servico.preco.toFixed(2).replace('.', ',')}` : '---',
          status: app.status
        }))
      };
    } finally {
      await tenantPrisma.$disconnect();
    }
  } catch (error) {
    console.error('Erro buscar agendamentos publicos:', error);
    return { error: 'Ocorreu um erro ao buscar agendamentos.' };
  }
}
