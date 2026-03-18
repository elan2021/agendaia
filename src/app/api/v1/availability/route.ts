import { NextResponse } from 'next/server';
import { prisma, getTenantPrisma } from '@/lib/prisma';

export async function GET(request: Request) {
  const apiKey = request.headers.get('X-API-Key');
  const { searchParams } = new URL(request.url);
  const profissionalId = searchParams.get('profissional_id');
  const servicoId = searchParams.get('servico_id');
  const dateStr = searchParams.get('data'); // YYYY-MM-DD

  if (!apiKey) {
    return NextResponse.json({ error: 'API Key is required.' }, { status: 401 });
  }

  if (!profissionalId || !servicoId || !dateStr) {
    return NextResponse.json({ error: 'Missing required parameters: profissional_id, servico_id, data.' }, { status: 400 });
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
      const [pro, servico, appointments] = await Promise.all([
        (tenantPrisma as any).profissional.findUnique({ where: { id: profissionalId } }),
        (tenantPrisma as any).servico.findUnique({ where: { id: servicoId } }),
        (tenantPrisma as any).agendamento.findMany({
          where: {
            profissional_id: profissionalId,
            inicio: {
              gte: new Date(`${dateStr}T00:00:00`),
              lte: new Date(`${dateStr}T23:59:59`),
            },
            status: { not: 'cancelado' }
          }
        })
      ]);

      if (!pro || !servico) {
        return NextResponse.json({ error: 'Professional or Service not found.' }, { status: 404 });
      }

      // Logic from getAvailableSlots
      const dayOfWeek = new Date(dateStr).toLocaleDateString('pt-BR', { weekday: 'short' }).toLowerCase().replace('.', '');
      const dayMap: Record<string, string> = {
        'seg': 'seg', 'ter': 'ter', 'qua': 'qua', 'qui': 'qui', 'sex': 'sex', 'sáb': 'sab', 'dom': 'dom'
      };
      const targetDay = dayMap[dayOfWeek] || dayOfWeek;

      let schedules;
      try {
        schedules = JSON.parse(pro.horarios);
      } catch {
        return NextResponse.json({ slots: [] });
      }

      const daySched = schedules[targetDay];
      if (!daySched || !daySched.ativo) {
        return NextResponse.json({ slots: [] });
      }

      const slots = [];
      const currentTime = new Date(`${dateStr}T${daySched.inicio}:00`);
      const endTime = new Date(`${dateStr}T${daySched.fim}:00`);

      while (currentTime < endTime) {
        const slotEnd = new Date(currentTime.getTime() + servico.duracao_min * 60000);
        
        if (slotEnd > endTime) break;

        // Check lunch break
        if (daySched.almoco_inicio && daySched.almoco_fim) {
          const almocoStart = new Date(`${dateStr}T${daySched.almoco_inicio}:00`);
          const almocoEnd = new Date(`${dateStr}T${daySched.almoco_fim}:00`);
          
          if (currentTime < almocoEnd && slotEnd > almocoStart) {
            currentTime.setMinutes(currentTime.getMinutes() + 15);
            continue;
          }
        }

        // Check existing appointments
        const hasConflict = appointments.some((app: any) => {
          const appStart = new Date(app.inicio);
          const appEnd = new Date(app.fim);
          return (currentTime < appEnd && slotEnd > appStart);
        });

        if (!hasConflict) {
          slots.push(currentTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));
        }

        currentTime.setMinutes(currentTime.getMinutes() + 15);
      }

      return NextResponse.json({
        professional: pro.nome,
        service: servico.nome,
        date: dateStr,
        slots
      });

    } finally {
      await tenantPrisma.$disconnect();
    }

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
