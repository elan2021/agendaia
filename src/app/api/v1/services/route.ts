import { NextResponse } from 'next/server';
import { prisma, getTenantPrisma } from '@/lib/prisma';

export async function GET(request: Request) {
  const apiKey = request.headers.get('X-API-Key');

  if (!apiKey) {
    return NextResponse.json({ error: 'API Key is required.' }, { status: 401 });
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
      const services = await (tenantPrisma as any).servico.findMany({
        where: { ativo: true },
        include: {
          agendamentos: false // We don't need appointments here
        }
      });

      // Parse profissionais_ids and fetch basic info if needed
      // For now, let's just return what we have in Servico model
      // but according to user request: "exibe os dados dos serviços e os profissionais que realizam"
      
      const allProfessionals = await tenantPrisma.profissional.findMany({
        where: { ativo: true }
      });

      const formattedServices = services.map((service: any) => {
        const professionalIds = JSON.parse(service.profissionais_ids || '[]');
        const assignedProfessionals = allProfessionals.filter(p => professionalIds.includes(p.id));
        
        return {
          id: service.id,
          nome: service.nome,
          duracao_min: service.duracao_min,
          preco: service.preco,
          descricao: service.descricao,
          profissionais: assignedProfessionals.map(p => ({
            id: p.id,
            nome: p.nome,
            especialidades: p.especialidades
          }))
        };
      });

      return NextResponse.json({
        company: tenant.nome,
        services: formattedServices
      });

    } finally {
      await tenantPrisma.$disconnect();
    }

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
