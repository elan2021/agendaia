"use server";

import { getCurrentTenant } from './tenants';
import { getTenantPrisma, prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const AppointmentSchema = z.object({
  cliente_tel: z.string().min(8, "Telefone inválido"),
  cliente_nome: z.string().min(2, "Nome é obrigatório"),
  servico_id: z.string(),
  profissional_id: z.string(),
  inicio: z.string(),
  status: z.string().optional().default("confirmado"),
  observacoes: z.string().optional(),
});

async function getPrisma() {
  const tenant = await getCurrentTenant();
  if (!tenant) return null;
  if (!tenant.turso_db_url) return prisma;
  return await getTenantPrisma(tenant.turso_db_url, tenant.turso_db_token);
}

export async function createPublicAppointment(tenantId: string, data: z.infer<typeof AppointmentSchema>) {
  // Get tenant info from global DB to get Turso credentials
  const tenant = await (prisma as any).tenant.findUnique({ where: { id: tenantId } });
  if (!tenant) {
    return { error: 'Empresa não encontrada.' };
  }

  const tPrisma = tenant.turso_db_url ? await getTenantPrisma(tenant.turso_db_url, tenant.turso_db_token) : prisma;
  if (!tPrisma) return { error: 'Falha na conexão com o banco de dados.' };

  const v = AppointmentSchema.parse(data);

  // Garante que o cliente exista
  await (tPrisma as any).cliente.upsert({
    where: { telefone: v.cliente_tel },
    create: { telefone: v.cliente_tel, nome: v.cliente_nome },
    update: { nome: v.cliente_nome },
  });

  // Busca duração do serviço
  const servico = await (tPrisma as any).servico.findUnique({ where: { id: v.servico_id } });
  if (!servico) throw new Error("Serviço não encontrado");

  const inicioDate = new Date(v.inicio);
  const fimDate = new Date(inicioDate.getTime() + servico.duracao_min * 60000);

  const appointment = await (tPrisma as any).agendamento.create({
    data: {
      cliente_tel: v.cliente_tel,
      servico_id: v.servico_id,
      profissional_id: v.profissional_id,
      inicio: inicioDate,
      fim: fimDate,
      status: v.status,
      observacoes: v.observacoes,
    },
  });

  revalidatePath('/dashboard/agenda');
  return { success: true, appointment };
}

export async function createAppointment(data: z.infer<typeof AppointmentSchema>) {
  const tPrisma = await getPrisma();
  if (!tPrisma) return { error: 'Banco não provisionado ou não autorizado.' };

  const v = AppointmentSchema.parse(data);

  // Garante que o cliente exista e tenha o nome atualizado
  await (tPrisma as any).cliente.upsert({
    where: { telefone: v.cliente_tel },
    create: { telefone: v.cliente_tel, nome: v.cliente_nome },
    update: { nome: v.cliente_nome },
  });

  // Busca duração do serviço para calcular o fim
  const servico = await (tPrisma as any).servico.findUnique({ where: { id: v.servico_id } });
  if (!servico) throw new Error("Serviço não encontrado");

  const inicioDate = new Date(v.inicio);
  const fimDate = new Date(inicioDate.getTime() + servico.duracao_min * 60000);

  const appointment = await (tPrisma as any).agendamento.create({
    data: {
      cliente_tel: v.cliente_tel,
      servico_id: v.servico_id,
      profissional_id: v.profissional_id,
      inicio: inicioDate,
      fim: fimDate,
      status: v.status,
      observacoes: v.observacoes,
    },
  });

  revalidatePath('/dashboard/agenda');
  return { success: true, appointment };
}

export async function getClientByPhone(telefone: string) {
  const tPrisma = await getPrisma();
  if (!tPrisma) return null;

  return await (tPrisma as any).cliente.findUnique({
    where: { telefone },
  });
}

export async function getAvailableSlots(profissional_id: string, dateStr: string, servico_id: string) {
  const tPrisma = await getPrisma();
  if (!tPrisma) return [];

  const [pro, servico, appointments] = await Promise.all([
    (tPrisma as any).profissional.findUnique({ where: { id: profissional_id } }),
    (tPrisma as any).servico.findUnique({ where: { id: servico_id } }),
    (tPrisma as any).agendamento.findMany({
      where: {
        profissional_id,
        inicio: {
          gte: new Date(`${dateStr}T00:00:00-03:00`),
          lte: new Date(`${dateStr}T23:59:59-03:00`),
        },
        status: { not: 'cancelado' }
      }
    })
  ]);

  if (!pro || !servico) return [];

  const dayOfWeek = new Date(dateStr).toLocaleDateString('pt-BR', { weekday: 'short' }).toLowerCase().replace('.', '');
  // Map pt-BR short day to our DIAS keys
  const dayMap: Record<string, string> = {
    'seg': 'seg', 'ter': 'ter', 'qua': 'qua', 'qui': 'qui', 'sex': 'sex', 'sáb': 'sab', 'dom': 'dom'
  };
  const targetDay = dayMap[dayOfWeek] || dayOfWeek;

  let schedules;
  try {
    schedules = JSON.parse(pro.horarios);
  } catch {
    return [];
  }

  const daySched = schedules[targetDay];
  if (!daySched || !daySched.ativo) return [];

  const slots = [];
  const currentTime = new Date(`${dateStr}T${daySched.inicio}:00-03:00`);
  const endTime = new Date(`${dateStr}T${daySched.fim}:00-03:00`);

  while (currentTime < endTime) {
    const slotEnd = new Date(currentTime.getTime() + servico.duracao_min * 60000);
    
    // Check if slot is within working hours
    if (slotEnd > endTime) break;

    // Check lunch break
    if (daySched.almoco_inicio && daySched.almoco_fim) {
      const almocoStart = new Date(`${dateStr}T${daySched.almoco_inicio}:00-03:00`);
      const almocoEnd = new Date(`${dateStr}T${daySched.almoco_fim}:00-03:00`);
      
      // If slot overlaps with lunch
      if (currentTime < almocoEnd && slotEnd > almocoStart) {
        currentTime.setMinutes(currentTime.getMinutes() + 15);
        continue;
      }
    }

    // Check existing appointments
    const hasConflict = appointments.some((app: any) => {
      const appStart = new Date(app.inicio);
      const appEnd = new Date(app.fim);
      return (currentTime < appEnd && slotEnd > appStart);
    });

    if (!hasConflict) {
      slots.push(currentTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo' }));
    }

    currentTime.setMinutes(currentTime.getMinutes() + 15);
  }

  return slots;
}

export async function updateAppointmentStatus(id: string, status: string) {
  const tPrisma = await getPrisma();
  if (!tPrisma) return { error: 'Banco não provisionado ou não autorizado.' };

  const appointment = await (tPrisma as any).agendamento.update({
    where: { id },
    data: { status },
  });

  revalidatePath('/dashboard/agenda');
  return { success: true, appointment };
}

export async function deleteAppointment(id: string) {
  const tPrisma = await getPrisma();
  if (!tPrisma) return { error: 'Banco não provisionado ou não autorizado.' };

  await (tPrisma as any).agendamento.delete({ where: { id } });
  revalidatePath('/dashboard/agenda');
  return { success: true };
}

export async function getAppointments(date?: string) {
  const tPrisma = await getPrisma();
  if (!tPrisma) return [];

  if (date) {
    // Para um servidor UTC, o dia em Brasília (UTC-3) começa às 03:00 UTC do dia wall-clock e termina às 02:59 UTC do dia seguinte.
    const start = new Date(`${date}T00:00:00-03:00`);
    const end = new Date(`${date}T23:59:59-03:00`);

    return await (tPrisma as any).agendamento.findMany({
      where: {
        inicio: { gte: start, lte: end },
      },
      include: {
        cliente: true,
        servico: true,
        profissional: true,
      },
      orderBy: { inicio: 'asc' },
    });
  }

  return await (tPrisma as any).agendamento.findMany({
    include: {
      cliente: true,
      servico: true,
      profissional: true,
    },
    orderBy: { inicio: 'asc' },
  });
}

export async function getClients() {
  const tPrisma = await getPrisma();
  if (!tPrisma) return [];

  return await (tPrisma as any).cliente.findMany({
    orderBy: { criado_em: 'desc' },
  });
}

export async function deleteClient(telefone: string) {
  const tPrisma = await getPrisma();
  if (!tPrisma) return { error: 'Banco não provisionado ou não autorizado.' };

  // Remove related appointments first to respect foreign key constraints
  await (tPrisma as any).agendamento.deleteMany({ where: { cliente_tel: telefone } });
  await (tPrisma as any).cliente.delete({ where: { telefone } });
  revalidatePath('/dashboard/clientes');
  return { success: true };
}
