import { NextResponse } from 'next/server';

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

  return NextResponse.json({
    message: `hoje é ${data} ${hora}`,
    data,
    hora,
    timestamp: now.toISOString()
  });
}
