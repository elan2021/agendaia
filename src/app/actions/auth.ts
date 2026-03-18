"use server";

import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function requestOTP(whatsapp: string) {
  if (!whatsapp) return { error: 'Telefone é obrigatório.' };

  // Check if tenant exists
  const tenant = await prisma.tenant.findUnique({
    where: { whatsapp_numero: whatsapp }
  });

  if (!tenant) {
    return { error: 'Nenhuma empresa cadastrada com este número de WhatsApp.' };
  }

  // Generate 6 digit code
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  // Store code
  await (prisma as any).verificationCode.create({
    data: {
      whatsapp,
      code,
      expiresAt
    }
  });

  // Send via WhatsApp n8n Webhook
  const webhookUrl = 'https://automacoes-n8n.npsqp7.easypanel.host/webhook/otp';
  
  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        whatsapp,
        code,
        message: `Seu código de acesso Atendimento Inteligente é: ${code}`
      })
    });

    if (!response.ok) {
        console.error('Falha ao enviar OTP via n8n:', await response.text());
    }
  } catch (error) {
    console.error('Erro de conexão ao enviar OTP:', error);
  }

  // Still log for debugging
  console.log(`\n\n---------- LOGIN OTP CODE ----------`);
  console.log(`PARA: ${whatsapp}`);
  console.log(`CÓDIGO: ${code}`);
  console.log(`------------------------------------\n\n`);

  return { success: true };
}

export async function verifyOTP(whatsapp: string, code: string) {
  if (!whatsapp || !code) return { error: 'Dados incompletos.' };

  const verification = await (prisma as any).verificationCode.findFirst({
    where: {
      whatsapp,
      code,
      used: false,
      expiresAt: { gte: new Date() }
    },
    orderBy: { createdAt: 'desc' }
  });

  if (!verification) {
    return { error: 'Código inválido ou expirado.' };
  }

  // Mark as used
  await (prisma as any).verificationCode.update({
    where: { id: verification.id },
    data: { used: true }
  });

  const tenant = await prisma.tenant.findUnique({
    where: { whatsapp_numero: whatsapp }
  });

  if (!tenant) return { error: 'Erro ao identificar empresa.' };

  // Create session
  const token = Math.random().toString(36).substring(2) + Date.now().toString(36);
  const sessionExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  await (prisma as any).session.create({
    data: {
      tenantId: tenant.id,
      token,
      expiresAt: sessionExpires
    }
  });

  // Set cookie
  cookies().set('atendimento_session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    expires: sessionExpires,
    path: '/'
  });

  return { success: true };
}

export async function logout() {
  const token = cookies().get('atendimento_session')?.value;
  if (token) {
    await (prisma as any).session.deleteMany({ where: { token } });
    cookies().delete('atendimento_session');
  }
  redirect('/login');
}

export async function getCurrentSession() {
  const token = cookies().get('atendimento_session')?.value;
  if (!token) return null;

  const session = await (prisma as any).session.findUnique({
    where: { 
      token,
      expiresAt: { gte: new Date() }
    }
  });

  if (!session) return null;

  const tenant = await prisma.tenant.findUnique({
    where: { id: session.tenantId }
  });

  return { session, tenant };
}


