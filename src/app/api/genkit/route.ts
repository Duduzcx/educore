import { NextResponse } from 'next/server';

/**
 * ROTA DESATIVADA (FAXINA GERAL)
 * Removida a dependência do Genkit via API para estabilizar o boot do servidor.
 */
export async function POST() {
  return NextResponse.json({ success: true, message: 'API Offline por design.' });
}
