"use server";

import { getCurrentTenant } from './tenants';
import { getTenantPrisma, prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const ProfessionalSchema = z.object({
  id: z.string().optional(),
  nome: z.string().min(2, "O nome deve ter pelo menos 2 caracteres"),
  especialidades: z.string(),
  horarios: z.string(),
  ativo: z.boolean().default(true),
  comissao_tipo: z.string().nullable().optional(),
  comissao_valor: z.number().nullable().optional(),
});

async function getPrisma() {
  const tenant = await getCurrentTenant();
  if (!tenant) return null;
  if (!tenant.turso_db_url) return prisma;
  return await getTenantPrisma(tenant.turso_db_url, tenant.turso_db_token);
}

export async function createProfessional(data: any) {
  try {
    const tPrisma = await getPrisma();
    if (!tPrisma) return { error: 'Banco não provisionado ou não autorizado.' };

    let validatedData;
    try {
      validatedData = ProfessionalSchema.parse(data);
    } catch (zodErr: any) {
      console.error('ERRO_ZOD_PRO:', zodErr.errors);
      return { error: 'Dados inválidos: ' + zodErr.errors.map((e: any) => e.message).join(', ') };
    }

    const pro = await (tPrisma as any).profissional.create({
      data: {
        nome: validatedData.nome,
        especialidades: validatedData.especialidades,
        horarios: validatedData.horarios,
        ativo: validatedData.ativo,
        comissao_tipo: validatedData.comissao_tipo ?? null,
        comissao_valor: validatedData.comissao_valor ?? null,
      },
    });

    revalidatePath('/dashboard/profissionais');
    return { success: true, pro };
  } catch (err: any) {
    console.error('ERRO_SERVER_CREATE_PRO:', err);
    return { error: err.message || 'Erro interno ao criar profissional.' };
  }
}

export async function updateProfessional(id: string, data: any) {
  try {
    const tPrisma = await getPrisma();
    if (!tPrisma) return { error: 'Banco não provisionado ou não autorizado.' };

    const validatedData = ProfessionalSchema.parse(data);

    const pro = await (tPrisma as any).profissional.update({
      where: { id },
      data: {
        nome: validatedData.nome,
        especialidades: validatedData.especialidades,
        horarios: validatedData.horarios,
        ativo: validatedData.ativo,
        comissao_tipo: validatedData.comissao_tipo ?? null,
        comissao_valor: validatedData.comissao_valor ?? null,
      },
    });

    revalidatePath('/dashboard/profissionais');
    return { success: true, pro };
  } catch (err: any) {
    console.error('ERRO_SERVER_UPDATE_PRO:', err);
    return { error: err.message || 'Erro interno ao atualizar profissional.' };
  }
}

export async function deleteProfessional(id: string) {
  try {
    const tPrisma = await getPrisma();
    if (!tPrisma) return { error: 'Banco não provisionado ou não autorizado.' };

    await (tPrisma as any).profissional.delete({
      where: { id },
    });

    revalidatePath('/dashboard/profissionais');
    return { success: true };
  } catch (err: any) {
    console.error('ERRO_SERVER_DELETE_PRO:', err);
    if (err.code === 'P2003') {
      return { error: 'Não é possível excluir este profissional porque ele já possui agendamentos vinculados.' };
    }
    return { error: 'Erro ao excluir profissional: ' + (err.message || 'Erro desconhecido') };
  }
}

export async function getProfessionals() {
  const tPrisma = await getPrisma();
  if (!tPrisma) return [];

  return await (tPrisma as any).profissional.findMany();
}
