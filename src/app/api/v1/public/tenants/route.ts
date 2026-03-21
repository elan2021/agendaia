import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { nome, slug, proprietario_nome, whatsapp_numero, instancia } = body;

    if (!nome || !slug || !whatsapp_numero) {
      return NextResponse.json({ error: 'Campos obrigatórios faltando: nome, slug, whatsapp_numero.' }, { status: 400 });
    }

    // Check if slug already exists
    const existing = await prisma.tenant.findUnique({
      where: { slug }
    });

    if (existing) {
      return NextResponse.json({ error: 'Este slug já está sendo usado por outra empresa.' }, { status: 409 });
    }

    // Check if WhatsApp already exists
    const existingWhatsApp = await prisma.tenant.findUnique({
      where: { whatsapp_numero }
    });

    if (existingWhatsApp) {
      return NextResponse.json({ error: 'Este número de WhatsApp já está cadastrado.' }, { status: 409 });
    }

    const tenant = await (prisma as any).tenant.create({
      data: {
        nome,
        slug,
        proprietario_nome: proprietario_nome || '',
        whatsapp_numero,
        instancia: instancia || 'default',
        nicho: 'beleza', // Default
        turso_db_url: '', // Placeholder
        turso_db_token: '', // Placeholder
        api_key: crypto.randomUUID(),
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Empresa cadastrada com sucesso.',
      data: {
        id: tenant.id,
        nome: tenant.nome,
        slug: tenant.slug,
        api_key: tenant.api_key
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Public API Error (Tenant Creation):', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const instancia = searchParams.get('instancia');

  if (!instancia) {
    return NextResponse.json({ error: 'O parâmetro "instancia" é obrigatório.' }, { status: 400 });
  }

  try {
    const tenants = await prisma.tenant.findMany({
      where: { instancia },
      select: {
        id: true,
        nome: true,
        slug: true,
        whatsapp_numero: true,
        instancia: true,
        ativo: true,
        api_key: true,
        criado_em: true
      }
    });

    return NextResponse.json({
      success: true,
      count: tenants.length,
      data: tenants
    });

  } catch (error) {
    console.error('Public API Error (Tenant Listing):', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
