"use server";

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import crypto from 'crypto';
import { createWuzapiUser, setupWuzapiWebhook } from './wuzapi';

export async function createTenant(formData: FormData) {
  const nome = formData.get('nome') as string;
  const slug = formData.get('slug') as string;
  const proprietario_nome = formData.get('proprietario_nome') as string;
  const whatsapp_numero = formData.get('whatsapp_numero') as string;
  const instancia = formData.get('instancia') as string || 'default';
  const plano = formData.get('plano') as string || 'starter';

  if (!nome || !slug || !whatsapp_numero) {
    return { error: 'Campos obrigatórios faltando.' };
  }

  try {
    // Check if slug already exists
    const existing = await prisma.tenant.findUnique({
      where: { slug }
    });

    if (existing) {
      return { error: 'Este slug já está sendo usado por outra empresa.' };
    }

    // Check if WhatsApp already exists
    const existingWhatsApp = await prisma.tenant.findUnique({
      where: { whatsapp_numero }
    });

    if (existingWhatsApp) {
      return { error: 'Este número de WhatsApp já está cadastrado.' };
    }

    const tenant = await (prisma as any).tenant.create({
      data: {
        nome,
        slug,
        proprietario_nome,
        whatsapp_numero,
        instancia,
        plano,
        nicho: 'beleza', // Default for now
        turso_db_token: '', // Placeholder
        api_key: crypto.randomUUID(),
      }
    });

    // Tentar criar instancia no WuzAPI
    try {
      // Usa tenant.slug como nome e também como token da instância
      await createWuzapiUser(tenant.slug, tenant.slug);

      // Atualiza o tenant com o token do WuzAPI, que passa a ser o slug
      await (prisma as any).tenant.update({
        where: { id: tenant.id },
        data: { instancia: tenant.slug }
      });
      // Atualiza o objeto para o retorno
      tenant.instancia = tenant.slug;

      // Configurar o Webhook N8N correspondente ao plano (Start ou Pró)
      await setupWuzapiWebhook(tenant.slug, plano);
    } catch (e) {
      console.error("Falha ao integrar com WuzAPI (instância não criada):", e);
    }

    revalidatePath('/admin'); // If there's an admin list
    
    return { success: true, tenant };
  } catch (error: any) {
    console.error('ERRO_DETALHADO_CADASTRO:', error);
    return { error: 'Ocorreu um erro interno ao cadastrar a empresa. Por favor, tente novamente.' };
  }
}

export async function getTenants() {
  try {
    const tenants = await prisma.tenant.findMany({
      orderBy: { criado_em: 'desc' }
    });
    return tenants;
  } catch (error) {
    console.error('Erro ao buscar tenants:', error);
    return [];
  }
}

export async function getAdminStats() {
  try {
    const totalTenants = await prisma.tenant.count();
    const activeTenants = await prisma.tenant.count({ where: { ativo: true } });
    const pendingTenants = await prisma.tenant.count({ where: { turso_db_url: '' } });
    
    return {
      totalTenants,
      activeTenants,
      pendingTenants
    };
  } catch (error) {
    console.error('Erro ao buscar stats admin:', error);
    return { totalTenants: 0, activeTenants: 0, pendingTenants: 0 };
  }
}

export async function updateTenant(id: string, data: any) {
  try {
    const tenant = await (prisma as any).tenant.update({
      where: { id },
      data
    });
    
    // Se o plano foi atualizado, reafirmamos o webhook correspondente
    if (data.plano && tenant.instancia !== 'default') {
      await setupWuzapiWebhook(tenant.instancia, data.plano);
    }
    
    revalidatePath('/admin/tenants');
    return { success: true, tenant };
  } catch (error) {
    console.error('Erro ao atualizar tenant:', error);
    return { error: 'Erro ao atualizar tenant.' };
  }
}

export async function getCurrentTenant() {
  const { getCurrentSession } = await import('./auth');
  const sessionData = await getCurrentSession();
  
  if (!sessionData) return null;
  
  return sessionData.tenant;
}

export async function regenerateApiKey() {
  const tenant = await getCurrentTenant();
  if (!tenant) return { error: 'Não autorizado' };

  try {
    const newKey = crypto.randomUUID();
    await (prisma as any).tenant.update({
      where: { id: tenant.id },
      data: { api_key: newKey }
    });
    revalidatePath('/dashboard/configuracoes');
    return { success: true, apiKey: newKey };
  } catch (error) {
    return { error: 'Erro ao regenerar chave' };
  }
}

export async function updateTenantTemplate(template: string) {
  const tenant = await getCurrentTenant();
  
  if (!tenant) {
    return { error: 'Não autorizado' };
  }

  try {
    // Usando executeRaw com template tag para segurança e para verificar se a linha foi afetada
    const result = await prisma.$executeRaw`UPDATE Tenant SET template = ${template} WHERE id = ${tenant.id}`;
    
    console.log(`DEBUG_UPDATE: Template "${template}" persistido no banco. Linhas afetadas: ${result} (Tenant: ${tenant.slug})`);
    
    if (result === 0) {
      console.warn('DEBUG_UPDATE: Nenhuma linha foi alterada. O registro pode ser idêntico ou o ID não foi encontrado.');
    }

    // Limpa o cache para que a mudança apareça no site público e no dashboard
    revalidatePath(`/${tenant.slug}`, 'page');
    revalidatePath('/dashboard/configuracoes', 'page');
    revalidatePath('/', 'layout'); // Garante que layouts globais sejam atualizados
    
    return { success: true, updatedTemplate: template };
  } catch (error: any) {
    console.error('Erro crítico ao atualizar template:', error);
    return { error: 'Erro ao processar atualização no banco de dados.' };
  }
}

export async function updateBusinessInfo(data: {
  nome: string;
  proprietario_nome?: string;
  whatsapp_numero?: string;
  endereco?: string;
  bairro?: string;
  cidade?: string;
  horario_funcionamento?: string;
  logo_url?: string;
  instagram_url?: string;
  facebook_url?: string;
}) {
  const tenant = await getCurrentTenant();
  if (!tenant) return { error: 'Não autorizado' };

  try {
    const updated = await (prisma as any).tenant.update({
      where: { id: tenant.id },
      data: {
        nome: data.nome,
        proprietario_nome: data.proprietario_nome,
        whatsapp_numero: data.whatsapp_numero,
        endereco: data.endereco,
        bairro: data.bairro,
        cidade: data.cidade,
        horario_funcionamento: data.horario_funcionamento,
        logo_url: data.logo_url,
        instagram_url: data.instagram_url,
        facebook_url: data.facebook_url,
      }
    });

    revalidatePath('/dashboard/configuracoes');
    revalidatePath('/dashboard/configuracoes/negocio');
    revalidatePath(`/${updated.slug}`);
    
    return { success: true, tenant: updated };
  } catch (error: any) {
    console.error('ERRO DETALHADO AO ATUALIZAR TENANT:', error);
    return { error: `Erro ao salvar as informações: ${error.message || 'Erro desconhecido'}` };
  }
}

