import { NextResponse } from 'next/server';

/**
 * ROTA DESATIVADA (FAXINA GERAL)
 * O sistema agora usa lógica de horário no cliente para evitar erros de servidor.
 */
export async function POST() {
  return NextResponse.json({ isLive: false, status: 'inactive' });
}
