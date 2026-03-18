import { NextResponse } from 'next/server';
import { prisma, getTenantPrisma } from '@/lib/prisma';

export async function GET(request: Request) {
  const apiKey = request.headers.get('X-API-Key');
  const { searchParams } = new URL(request.url);
  const telefone = searchParams.get('telefone');

  if (!apiKey) {
    return NextResponse.json({ error: 'API Key is required.' }, { status: 401 });
  }

  if (!telefone) {
    return NextResponse.json({ error: 'Phone number is required as a query parameter (?telefone=...).' }, { status: 400 });
  }

  try {
    // Find tenant in global database
    const tenant = await (prisma as any).tenant.findUnique({
      where: { api_key: apiKey }
    });

    if (!tenant || !tenant.ativo) {
      return NextResponse.json({ error: 'Invalid or inactive API Key.' }, { status: 401 });
    }

    if (!tenant.turso_db_url || !tenant.turso_db_token) {
      return NextResponse.json({ error: 'Tenant infrastructure not fully provisioned.' }, { status: 503 });
    }

    // Connect to tenant's specific database
    const tenantPrisma = getTenantPrisma(tenant.turso_db_url, tenant.turso_db_token);

    try {
      const client = await (tenantPrisma as any).cliente.findUnique({
        where: { telefone },
      });

      if (!client) {
        return NextResponse.json({ 
          success: false, 
          message: 'Client not found.' 
        }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        client: {
          nome: client.nome,
          telefone: client.telefone,
          criado_em: client.criado_em
        }
      });

    } finally {
      await tenantPrisma.$disconnect();
    }

  } catch (error) {
    console.error('API Client Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
