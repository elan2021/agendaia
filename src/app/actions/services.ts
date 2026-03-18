"use server";

import { getCurrentTenant } from './tenants';
import { getTenantPrisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const ServiceSchema = z.object({
  id: z.string().optional(),
  nome: z.string().min(2, "O nome deve ter pelo menos 2 caracteres"),
  duracao_min: z.number().min(5, "A duração mínima é de 5 minutos"),
  preco: z.number().min(0, "O preço não pode ser negativo"),
  descricao: z.string().optional(),
  ativo: z.boolean().default(true),
  profissionais_ids: z.string().default("[]"),
});

async function getPrisma() {
  const tenant = await getCurrentTenant();
  if (!tenant || !tenant.turso_db_url) return null;
  return await getTenantPrisma(tenant.turso_db_url, tenant.turso_db_token);
}

export async function createService(data: z.infer<typeof ServiceSchema>) {
  const tPrisma = await getPrisma();
  if (!tPrisma) return { error: 'Banco não provisionado ou não autorizado.' };

  const validatedData = ServiceSchema.parse(data);

  const service = await (tPrisma as any).servico.create({
    data: {
      nome: validatedData.nome,
      duracao_min: validatedData.duracao_min,
      preco: validatedData.preco,
      descricao: validatedData.descricao,
      ativo: validatedData.ativo,
      profissionais_ids: validatedData.profissionais_ids,
    },
  });

  revalidatePath('/dashboard/servicos');
  return { success: true, service };
}

export async function updateService(id: string, data: z.infer<typeof ServiceSchema>) {
  const tPrisma = await getPrisma();
  if (!tPrisma) return { error: 'Banco não provisionado ou não autorizado.' };

  const validatedData = ServiceSchema.parse(data);

  const service = await (tPrisma as any).servico.update({
    where: { id },
    data: {
      nome: validatedData.nome,
      duracao_min: validatedData.duracao_min,
      preco: validatedData.preco,
      descricao: validatedData.descricao,
      ativo: validatedData.ativo,
      profissionais_ids: validatedData.profissionais_ids,
    },
  });

  revalidatePath('/dashboard/servicos');
  return { success: true, service };
}

export async function deleteService(id: string) {
  const tPrisma = await getPrisma();
  if (!tPrisma) return { error: 'Banco não provisionado ou não autorizado.' };

  await (tPrisma as any).servico.delete({
    where: { id },
  });

  revalidatePath('/dashboard/servicos');
  return { success: true };
}

export async function getServices() {
  const tPrisma = await getPrisma();
  if (!tPrisma) return [];

  return await (tPrisma as any).servico.findMany();
}
