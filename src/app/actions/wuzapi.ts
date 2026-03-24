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
        'token': adminToken,
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

    return { success: true };
  } catch (error: any) {
    console.error("Erro interno ao criar WuzAPI user:", error);
    return { error: error.message || 'Erro desconhecido' };
  }
}

export async function getWuzapiConnectionStatus() {
  const tenant = await getCurrentTenant();
  if (!tenant || !tenant.instancia) return { error: 'Não autorizado ou sem token de instância' };

  try {
    const wuzapiUrl = getWuzapiUrl();
    const response = await fetch(`${wuzapiUrl}/session/status`, {
      method: 'GET',
      headers: {
        'token': tenant.instancia
      },
      cache: 'no-store'
    });

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
  const tenant = await getCurrentTenant();
  if (!tenant || !tenant.instancia) return { error: 'Não autorizado' };

  try {
    const wuzapiUrl = getWuzapiUrl();
    
    // Tenta usar o endpoint com param de telefone que os forks do WuzAPI usam para pareamento via código
    const response = await fetch(`${wuzapiUrl}/session/pair?phone=${phone}`, {
      method: 'GET',
      headers: {
        'token': tenant.instancia
      },
      cache: 'no-store'
    });

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
  const tenant = await getCurrentTenant();
  if (!tenant || !tenant.instancia) return { error: 'Não autorizado' };

  try {
    const wuzapiUrl = getWuzapiUrl();
    const response = await fetch(`${wuzapiUrl}/session/qr`, {
      method: 'GET',
      headers: {
        'token': tenant.instancia
      },
      cache: 'no-store'
    });

    if (!response.ok) {
      return { error: 'Falha ao buscar QR Code' };
    }

    const data = await response.json();
    return { success: true, qr: data.qr_code || data.code || data.qrmessage || data };
  } catch (error: any) {
    console.error("Erro ao buscar QR:", error);
    return { error: error.message };
  }
}
