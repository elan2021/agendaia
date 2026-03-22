import { NextResponse } from 'next/server';
import { prisma, getTenantPrisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const apiKey = request.headers.get('X-API-Key');

  if (!apiKey) {
    return NextResponse.json({ error: 'API Key is required.' }, { status: 401 });
  }

  try {
    const tenant = await (prisma as any).tenant.findUnique({
      where: { api_key: apiKey }
    });

    if (!tenant || !tenant.ativo) {
      return NextResponse.json({ error: 'Invalid or inactive API Key.' }, { status: 401 });
    }

    if (!tenant.turso_db_url || !tenant.turso_db_token) {
      return NextResponse.json({ error: 'Tenant infrastructure not fully provisioned.' }, { status: 503 });
    }

    const tenantPrisma = getTenantPrisma(tenant.turso_db_url, tenant.turso_db_token);

    try {
      const professionals = await (tenantPrisma as any).profissional.findMany({
        where: { ativo: true },
        select: {
          id: true,
          nome: true,
          especialidades: true,
        },
        orderBy: { nome: 'asc' },
      });

      return NextResponse.json({
        success: true,
        count: professionals.length,
        data: professionals
      });

    } finally {
      await tenantPrisma.$disconnect();
    }

  } catch (error) {
    console.error('API Professionals Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
