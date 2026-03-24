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

export async function getPublicAvailableSlots(tenantId: string, profissionalId: string, servicoId: string, dateStr: string) {
  if (!tenantId || !profissionalId || !servicoId || !dateStr) return { slots: [] };

  try {
    const tenant = await (prisma as any).tenant.findUnique({ where: { id: tenantId } });
    if (!tenant?.turso_db_url) return { slots: [] };

    const tPrisma = getTenantPrisma(tenant.turso_db_url, tenant.turso_db_token);

    try {
      const [pro, servico, appointments] = await Promise.all([
        (tPrisma as any).profissional.findUnique({ where: { id: profissionalId } }),
        (tPrisma as any).servico.findUnique({ where: { id: servicoId } }),
        (tPrisma as any).agendamento.findMany({
          where: {
            profissional_id: profissionalId,
            inicio: {
              gte: new Date(`${dateStr}T00:00:00-03:00`),
              lte: new Date(`${dateStr}T23:59:59-03:00`),
            },
            status: { not: 'cancelado' }
          }
        })
      ]);

      if (!pro || !servico) return { slots: [] };

      const dayOfWeek = new Date(`${dateStr}T12:00:00`).toLocaleDateString('pt-BR', { weekday: 'short', timeZone: 'America/Sao_Paulo' }).toLowerCase().replace('.', '');
      const dayMap: Record<string, string> = { 'seg': 'seg', 'ter': 'ter', 'qua': 'qua', 'qui': 'qui', 'sex': 'sex', 'sáb': 'sab', 'dom': 'dom' };
      const targetDay = dayMap[dayOfWeek] || dayOfWeek;

      let schedules;
      try { schedules = JSON.parse(pro.horarios); } catch { return { slots: [] }; }

      const daySched = schedules[targetDay];
      if (!daySched || !daySched.ativo) return { slots: [] };

      const slots: string[] = [];
      const currentTime = new Date(`${dateStr}T${daySched.inicio}:00-03:00`);
      const endTime = new Date(`${dateStr}T${daySched.fim}:00-03:00`);

      while (currentTime < endTime) {
        const slotEnd = new Date(currentTime.getTime() + servico.duracao_min * 60000);
        if (slotEnd > endTime) break;

        if (daySched.almoco_inicio && daySched.almoco_fim) {
          const almocoStart = new Date(`${dateStr}T${daySched.almoco_inicio}:00-03:00`);
          const almocoEnd = new Date(`${dateStr}T${daySched.almoco_fim}:00-03:00`);
          if (currentTime < almocoEnd && slotEnd > almocoStart) {
            currentTime.setMinutes(currentTime.getMinutes() + 15);
            continue;
          }
        }

        const hasConflict = appointments.some((app: any) => {
          const appStart = new Date(app.inicio);
          const appEnd = new Date(app.fim);
          return currentTime < appEnd && slotEnd > appStart;
        });

        if (!hasConflict) {
          slots.push(currentTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo' }));
        }

        currentTime.setMinutes(currentTime.getMinutes() + 15);
      }

      return { slots };
    } finally {
      await tPrisma.$disconnect();
    }
  } catch (err) {
    console.error('Erro ao buscar slots públicos:', err);
    return { slots: [] };
  }
}
