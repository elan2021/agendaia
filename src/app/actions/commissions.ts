"use server";

import { getCurrentTenant } from './tenants';
import { getTenantPrisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import crypto from 'crypto';

export type CommissionEntry = {
  profissional_id: string;
  profissional_nome: string;
  especialidade: string;
  comissao_tipo: string | null;
  comissao_valor: number | null;
  total_atendimentos: number;
  faturamento_total: number;
  comissao_calculada: number;
  ja_pago: boolean;
  pagamento_id: string | null;
};

async function getPrisma() {
  const tenant = await getCurrentTenant();
  if (!tenant || !tenant.turso_db_url) return null;
  return await getTenantPrisma(tenant.turso_db_url, tenant.turso_db_token);
}

export async function getCommissionsData(mes: number, ano: number): Promise<CommissionEntry[]> {
  const tPrisma = await getPrisma();
  if (!tPrisma) return [];

  const startDate = new Date(ano, mes - 1, 1).toISOString();
  const endDate   = new Date(ano, mes, 0, 23, 59, 59).toISOString();

  try {
    const [profissionais, agendamentos, servicos] = await Promise.all([
      (tPrisma as any).profissional.findMany({ where: { ativo: true } }),
      (tPrisma as any).agendamento.findMany({
        where: { inicio: { gte: startDate, lte: endDate }, status: { not: 'cancelado' } },
      }),
      (tPrisma as any).servico.findMany(),
    ]);

    let pagamentos: any[] = [];
    try {
      pagamentos = await (tPrisma as any).comissaoPagamento.findMany({ where: { mes, ano } });
    } catch { /* table may not exist yet */ }

    const servicoMap  = new Map(servicos.map((s: any) => [s.id, s]));
    const pagamentoMap = new Map(pagamentos.map(p => [p.profissional_id, p]));

    return profissionais.map((pro: any) => {
      const ags = agendamentos.filter((a: any) => a.profissional_id === pro.id);
      const faturamento_total = ags.reduce((sum: number, a: any) => {
        const s = servicoMap.get(a.servico_id) as any;
        return sum + (s?.preco ?? 0);
      }, 0);

      let comissao_calculada = 0;
      if (pro.comissao_tipo && pro.comissao_valor != null) {
        if (pro.comissao_tipo === 'fixo') comissao_calculada = pro.comissao_valor * ags.length;
        if (pro.comissao_tipo === 'porcentagem') comissao_calculada = (faturamento_total * pro.comissao_valor) / 100;
      }

      const pagamento = pagamentoMap.get(pro.id) ?? null;

      const especialidade = (() => {
        try { const a = JSON.parse(pro.especialidades); return Array.isArray(a) ? a[0] : pro.especialidades; }
        catch { return pro.especialidades; }
      })();

      return {
        profissional_id: pro.id,
        profissional_nome: pro.nome,
        especialidade,
        comissao_tipo: pro.comissao_tipo ?? null,
        comissao_valor: pro.comissao_valor ?? null,
        total_atendimentos: ags.length,
        faturamento_total,
        comissao_calculada,
        ja_pago: !!pagamento,
        pagamento_id: (pagamento as any)?.id ?? null,
      };
    });
  } catch (error) {
    console.error('Erro ao buscar dados de comissões (tenant):', error);
    return [];
  }
}

export async function marcarComissaoPaga(
  profissional_id: string,
  mes: number,
  ano: number,
  valor_total: number,
  observacao?: string,
) {
  const tPrisma = await getPrisma();
  if (!tPrisma) return { error: 'Banco não provisionado ou não autorizado.' };

  await (tPrisma as any).comissaoPagamento.create({
    data: {
      id: crypto.randomUUID(),
      profissional_id,
      mes,
      ano,
      valor_total,
      pago_em: new Date().toISOString(),
      observacao: observacao ?? null,
    },
  });
  revalidatePath('/dashboard/comissoes');
  return { success: true };
}

export async function desmarcarComissaoPaga(pagamento_id: string) {
  const tPrisma = await getPrisma();
  if (!tPrisma) return { error: 'Banco não provisionado ou não autorizado.' };

  await (tPrisma as any).comissaoPagamento.delete({ where: { id: pagamento_id } });
  revalidatePath('/dashboard/comissoes');
  return { success: true };
}
