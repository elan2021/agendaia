"use server";

import { getCurrentTenant } from './tenants';

// Função auxiliar para pegar a URL base do WuzAPI
function getWuzapiUrl() {
  const url = process.env.WUZAPI_URL;
  if (!url) throw new Error("A variável de ambiente WUZAPI_URL não está definida.");
  return url.replace(/\/$/, ''); // Garante que não termine com barra
}

function getWuzapiAdminToken() {
  const token = process.env.WUZAPI_ADMIN_TOKEN;
  if (!token) throw new Error("A variável de ambiente WUZAPI_ADMIN_TOKEN não está definida.");
  return token;
}

export async function createWuzapiUser(tenantName: string, wuzapiToken: string) {
  try {
    const wuzapiUrl = getWuzapiUrl();
    const adminToken = getWuzapiAdminToken();

    const response = await fetch(`${wuzapiUrl}/admin/users`, {
      method: 'POST',
      headers: {
        'Authorization': adminToken,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: tenantName,
        token: wuzapiToken,
        events: "All"
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Erro ao criar usuário WuzAPI:", errorText);
      return { error: `Erro da API do WhatsApp: ${response.statusText}` };
    }

    return { success: true, token: wuzapiToken };
  } catch (error: any) {
    console.error("Erro interno ao criar WuzAPI user:", error);
    return { error: error.message || 'Erro desconhecido' };
  }
}

export async function setupWuzapiWebhook(tenantToken: string, plano: string) {
  try {
    const wuzapiUrl = getWuzapiUrl();
    
    // Logica de URLs por plano conforme solicitado
    const isPro = plano === 'pro' || plano === 'pró';
    const webhookUrl = isPro 
      ? 'https://automacoes-n8n.npsqp7.easypanel.host/webhook-test/agendamento_automatico'
      : 'https://automacoes-n8n.npsqp7.easypanel.host/webhook-test/agendamento_link';

    const response = await fetch(`${wuzapiUrl}/webhook`, {
      method: 'POST',
      headers: {
        'token': tenantToken,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        WebhookURL: webhookUrl,
        Subscribe: ["Message"]
      })
    });

    if (!response.ok) {
      console.error(`[WuzAPI] Falha ao configurar Webhook para token ${tenantToken}:`, await response.text());
    } else {
      console.log(`[WuzAPI] Webhook (${plano}) configurado com sucesso: ${webhookUrl}`);
    }
  } catch (error) {
    console.error("[WuzAPI] Erro de rede ao configurar Webhook:", error);
  }
}

// Função para garantir que usuários antigos (ou que falharam na criação)
// sejam criados no WuzAPI sob demanda antes de tentar pegar o QR Code.
async function ensureWuzapiUser(tenant: any, forceRecreate = false) {
  if (tenant.instancia && tenant.instancia !== 'default' && !forceRecreate) {
    return tenant.instancia; // Já tem uma instância/token gerado e não forçamos recriar
  }

  // Se não tem, vamos criar agora
  const res = await createWuzapiUser(tenant.slug, tenant.slug);
  if (res.success) {
    // Salva no banco
    const { prisma } = await import('@/lib/prisma');
    await (prisma as any).tenant.update({
      where: { id: tenant.id },
      data: { instancia: tenant.slug }
    });
    return tenant.slug;
  }
  return null;
}

// Acorda o client manager do WhatsMeow dentro do WuzAPI
async function initWuzapiSession(token: string) {
  try {
    const wuzapiUrl = getWuzapiUrl();
    await fetch(`${wuzapiUrl}/session/connect`, {
      method: 'POST',
      headers: {
        'token': token,
        'Content-Type': 'application/json'
      },
      cache: 'no-store', // CRÍTICO: Previne o Next.js 14 de cachear esse POST e fingir que chamou
      // Immediate: true fala pro wuzapi responder o HTTP 200 na hora e continuar background
      body: JSON.stringify({ Subscribe: ["Message"], Immediate: true })
    });

    // RACE CONDITION FIX: O WuzAPI retorna 200 pro connect imediatamente, mas inicia a engine
    // usando Goroutines. Atrasamos a próxima execução (QR ou Status) em 2500ms pra dar tempo
    // do WhatsApp responder o Wss e popular o QR Code no banco de dados local.
    await new Promise(resolve => setTimeout(resolve, 2500));
  } catch(e) {
    console.error("Warning: Falha ao chamar /session/connect (Wakeup)", e);
  }
}

export async function getWuzapiConnectionStatus() {
  let tenant = await getCurrentTenant();
  if (!tenant) return { error: 'Não autorizado' };

  // Garante que o usuário existe no WuzAPI, ou tenta criar se não existir
  const token = await ensureWuzapiUser(tenant);
  if (!token) return { error: 'Falha ao recuperar token da instância' };

  try {
    const wuzapiUrl = getWuzapiUrl();
    let response = await fetch(`${wuzapiUrl}/session/status`, {
      method: 'GET',
      headers: {
        'token': token
      },
      cache: 'no-store'
    });

    // Auto-healing: recria o usuário se o servidor WuzAPI não reconhecer o token
    if (response.status === 401) {
      console.warn("WuzAPI retornou 401. Tentando recriar usuário...");
      const newToken = await ensureWuzapiUser(tenant, true);
      if (newToken) {
        response = await fetch(`${wuzapiUrl}/session/status`, {
          method: 'GET',
          headers: { 'token': newToken },
          cache: 'no-store'
        });
      }
    }

    if (!response.ok) {
        return { status: 'disconnected', state: 'unauthenticated' };
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Erro ao checar status WuzAPI:", error);
    return { status: 'disconnected', state: 'server_error' };
  }
}

export async function connectWuzapiPhone(phone: string) {
  let tenant = await getCurrentTenant();
  if (!tenant) return { error: 'Não autorizado' };

  const token = await ensureWuzapiUser(tenant);
  if (!token) return { error: 'Falha ao inicializar integração de IA.' };

  // WuzAPI requires engine to be started before requesting Pair Code
  await initWuzapiSession(token);

  try {
    const wuzapiUrl = getWuzapiUrl();
    
    let response = await fetch(`${wuzapiUrl}/session/pair?phone=${phone}`, {
      method: 'GET',
      headers: {
        'token': token
      },
      cache: 'no-store'
    });

    // Auto-healing
    if (response.status === 401) {
      console.warn("WuzAPI retornou 401 no pair. Tentando recriar usuário...");
      const newToken = await ensureWuzapiUser(tenant, true);
      if (newToken) {
        await initWuzapiSession(newToken);
        response = await fetch(`${wuzapiUrl}/session/pair?phone=${phone}`, {
          method: 'GET',
          headers: { 'token': newToken },
          cache: 'no-store'
        });
      }
    }

    if (!response.ok) {
        // Se a rota /pair não existir (fork original não tem), tentamos ver se retorna QR no connect
        return { error: 'O pareamento por código não é suportado por esta versão do servidor. Tente QR Code se disponível.' };
    }

    const data = await response.json();
    return { success: true, pairingCode: data.code || data.pairingCode };
  } catch (error: any) {
    console.error("Erro ao iniciar pareamento:", error);
    return { error: error.message };
  }
}

export async function logoutWuzapi() {
  const tenant = await getCurrentTenant();
  if (!tenant || !tenant.instancia) return { error: 'Não autorizado' };

  try {
    const wuzapiUrl = getWuzapiUrl();
    const response = await fetch(`${wuzapiUrl}/session/logout`, {
      method: 'POST',
      headers: {
        'token': tenant.instancia
      }
    });

    if (!response.ok) {
      return { error: 'Falha ao desconectar' };
    }

    return { success: true };
  } catch (error: any) {
    console.error("Erro no logout WuzAPI:", error);
    return { error: error.message };
  }
}

export async function getWuzapiQR() {
  let tenant = await getCurrentTenant();
  if (!tenant) return { error: 'Não autorizado' };

  const token = await ensureWuzapiUser(tenant);
  if (!token) return { error: 'Falha ao inicializar integração de IA.' };

  // WuzAPI requires engine to be started before requesting QR Code
  await initWuzapiSession(token);

  try {
    const wuzapiUrl = getWuzapiUrl();
    let response = await fetch(`${wuzapiUrl}/session/qr`, {
      method: 'GET',
      headers: {
        'token': token
      },
      cache: 'no-store'
    });

    // Auto-healing
    if (response.status === 401) {
      console.warn("WuzAPI retornou 401 no QR. Tentando recriar usuário...");
      try {
        const resCreate = await createWuzapiUser(tenant.slug, tenant.slug);
        if (resCreate.success) {
           const { prisma } = await import('@/lib/prisma');
           await (prisma as any).tenant.update({ where: { id: tenant.id }, data: { instancia: tenant.slug } });
           
           await initWuzapiSession(tenant.slug);
           
           response = await fetch(`${wuzapiUrl}/session/qr`, {
             method: 'GET',
             headers: { 'token': tenant.slug },
             cache: 'no-store'
           });
        } else {
           return { error: `Falha na Auto-recriação do admin/users do WuzAPI: ${resCreate.error}` };
        }
      } catch (catchedErr: any) {
         return { error: `Erro interno no auto-healing: ${catchedErr.message}` };
      }
    }

    // Em raras race conditions, o WuzAPI pode demorar para setar a session ou dar o QR code de fato
    // Se o backend ainda acusar "no session" (geralmente Erro 500) ou devolver QR vazio, retentamos 1 vez

    if (!response.ok && response.status === 500) {
      await new Promise(r => setTimeout(r, 2000));
      response = await fetch(`${wuzapiUrl}/session/qr`, {
        method: 'GET',
        headers: { 'token': token },
        cache: 'no-store'
      });
    }

    if (!response.ok) {
      // Tentar ler se mandaram alguma msg de erro da api
      let errApi = "";
      try { const errObj = await response.json(); errApi = errObj.error || errObj.message; } catch(e){}
      return { error: `Falha ao buscar QR Code. Verifique se o WuzAPI está no ar. Detalhes: ${errApi}` };
    }

    let data = await response.json();
    let qrValue = data?.data?.qr_code || data?.data?.QRCode || data?.data?.qr || data?.qr_code || data?.QRCode || data?.qr;
    if (qrValue === "") qrValue = null; // Garante falsy se vazio
    
    if (!qrValue) {
      console.warn("QR code retornou vazio no JSON... Esperando mais dados do WuzAPI e retentando.");
      await new Promise(r => setTimeout(r, 2000));
      response = await fetch(`${wuzapiUrl}/session/qr`, {
        method: 'GET',
        headers: { 'token': token },
        cache: 'no-store'
      });
      if (response.ok) {
        data = await response.json();
        qrValue = data?.data?.qr_code || data?.data?.QRCode || data?.data?.qr || data?.qr_code || data?.QRCode || data?.qr;
        if (qrValue === "") qrValue = null;
      }
    }

    if (!qrValue) {
      return { error: `A conta do WhatsApp não retornou o QR rápido o suficiente, por favor clique no botão de novo!` };
    }

    return { success: true, qr: qrValue };
  } catch (error: any) {
    console.error("Erro ao buscar QR:", error);
    return { error: `Erro no servidor: ${error.message}` };
  }
}
