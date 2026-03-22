"use server";

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { getCurrentTenant } from './tenants';

export async function getIAConfig() {
  const tenant = await getCurrentTenant();
  if (!tenant) return null;

  try {
    const data = await prisma.tenant.findUnique({
      where: { id: tenant.id },
      select: {
        ia_persona: true,
        ia_ativo: true,
        ia_config: true,
      }
    });
    return data;
  } catch (error) {
    console.error('Erro ao buscar configuração de IA:', error);
    return null;
  }
}

export async function updateIAConfig(data: {
  ia_persona?: string;
  ia_ativo?: boolean;
  ia_config?: string;
}) {
  const tenant = await getCurrentTenant();
  if (!tenant) return { error: 'Não autorizado' };

  try {
    const updated = await (prisma as any).tenant.update({
      where: { id: tenant.id },
      data: {
        ia_persona: data.ia_persona,
        ia_ativo: data.ia_ativo,
        ia_config: data.ia_config,
      }
    });

    revalidatePath('/dashboard/ia-config');
    return { success: true, ia_ativo: updated.ia_ativo };
  } catch (error: any) {
    console.error('Erro ao atualizar configuração de IA:', error);
    return { error: 'Erro ao salvar configurações no banco.' };
  }
}
