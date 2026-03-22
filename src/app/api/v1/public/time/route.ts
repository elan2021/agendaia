import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const now = new Date();
  
  // Formatando data: DD/MM/YYYY
  const data = now.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'America/Sao_Paulo'
  });

  // Formatando hora: HH:mm:ss
  const hora = now.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZone: 'America/Sao_Paulo',
    hour12: false
  });

  // Dia da semana
  const diaSemana = now.toLocaleDateString('pt-BR', {
    weekday: 'long',
    timeZone: 'America/Sao_Paulo'
  });

  return NextResponse.json({
    message: `hoje é ${diaSemana}, ${data} ${hora}`,
    dia_semana: diaSemana,
    data,
    hora,
    timestamp: now.toISOString()
  });
}
