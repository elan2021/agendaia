import { NextResponse } from 'next/server';
import { prisma, getTenantPrisma } from '@/lib/prisma';
import { z } from 'zod';

const AppointmentSchema = z.object({
  cliente_tel: z.string().min(8, "Telefone inválido"),
  cliente_nome: z.string().min(2, "Nome é obrigatório"),
  servico_id: z.string(),
  profissional_id: z.string(),
  inicio: z.string(), // ISO String
  status: z.string().optional().default("confirmado"),
  observacoes: z.string().optional(),
});

const UpdateStatusSchema = z.object({
  id: z.string(),
  status: z.enum(["confirmado", "cancelado", "realizado", "falta"]),
});

export async function GET(request: Request) {
  const apiKey = request.headers.get('X-API-Key');
  const { searchParams } = new URL(request.url);
  const clienteId = searchParams.get('cliente_id'); // We use phone as ID

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

    const tenantPrisma = getTenantPrisma(tenant.turso_db_url, tenant.turso_db_token);

    try {
      const where: any = {};
      if (clienteId) {
        where.cliente_tel = clienteId;
      }

      const appointments = await (tenantPrisma as any).agendamento.findMany({
        where,
        include: {
          cliente: true,
          servico: true,
          profissional: true,
        },
        orderBy: { inicio: 'desc' },
      });

      return NextResponse.json({
        success: true,
        appointments: appointments.map((app: any) => ({
          id: app.id,
          cliente: app.cliente.nome,
          cliente_tel: app.cliente_tel,
          servico: app.servico.nome,
          profissional: app.profissional.nome,
          inicio: app.inicio,
          fim: app.fim,
          status: app.status
        }))
      });

    } finally {
      await tenantPrisma.$disconnect();
    }
  } catch (error) {
    console.error('API Appointments GET Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
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
  
      const body = await request.json();
      const v = UpdateStatusSchema.parse(body);
  
      const tenantPrisma = getTenantPrisma(tenant.turso_db_url, tenant.turso_db_token);
  
      try {
        const appointment = await (tenantPrisma as any).agendamento.update({
          where: { id: v.id },
          data: { status: v.status },
        });
  
        return NextResponse.json({
          success: true,
          message: `Status updated to ${v.status}`,
          appointment: {
            id: appointment.id,
            status: appointment.status
          }
        });
  
      } finally {
        await tenantPrisma.$disconnect();
      }
  
    } catch (error: any) {
      if (error instanceof z.ZodError) {
          return NextResponse.json({ error: 'Validation failed', details: error.issues }, { status: 400 });
      }
      console.error('API Appointment PATCH Error:', error);
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
  }

export async function POST(request: Request) {
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

    const body = await request.json();
    const v = AppointmentSchema.parse(body);

    // Connect to tenant's specific database
    const tenantPrisma = getTenantPrisma(tenant.turso_db_url, tenant.turso_db_token);

    try {
      // 1. Upsert Client
      await (tenantPrisma as any).cliente.upsert({
        where: { telefone: v.cliente_tel },
        create: { telefone: v.cliente_tel, nome: v.cliente_nome },
        update: { nome: v.cliente_nome },
      });

      // 2. Fetch service to calculate end time
      const servico = await (tenantPrisma as any).servico.findUnique({ 
        where: { id: v.servico_id } 
      });

      if (!servico) {
        return NextResponse.json({ error: 'Service not found.' }, { status: 404 });
      }

      // If no timezone offset provided, treat as Brasília (UTC-3)
      const inicioStr = v.inicio.includes('+') || v.inicio.endsWith('Z') || v.inicio.includes('-', 11)
        ? v.inicio
        : v.inicio + '-03:00';
      const inicioDate = new Date(inicioStr);
      const fimDate = new Date(inicioDate.getTime() + servico.duracao_min * 60000);

      // 3. Create Appointment
      const appointment = await (tenantPrisma as any).agendamento.create({
        data: {
          cliente_tel: v.cliente_tel,
          servico_id: v.servico_id,
          profissional_id: v.profissional_id,
          inicio: inicioDate,
          fim: fimDate,
          status: v.status,
          observacoes: v.observacoes,
          origem: 'api_externa'
        },
        include: {
            cliente: true,
            servico: true,
            profissional: true
        }
      });

      return NextResponse.json({
        success: true,
        message: 'Appointment created successfully.',
        appointment: {
            id: appointment.id,
            cliente: appointment.cliente.nome,
            servico: appointment.servico.nome,
            profissional: appointment.profissional.nome,
            inicio: appointment.inicio,
            fim: appointment.fim,
            status: appointment.status
        }
      });

    } finally {
      await tenantPrisma.$disconnect();
    }

  } catch (error: any) {
    if (error instanceof z.ZodError) {
        return NextResponse.json({ error: 'Validation failed', details: error.issues }, { status: 400 });
    }
    console.error('API Appointment Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
