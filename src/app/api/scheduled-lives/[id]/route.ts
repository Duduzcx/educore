import { NextResponse } from 'next/server';

/**
 * @fileOverview Rota de Gerenciamento de Lives Individuais.
 * Ajustada para os tipos estritos do Next.js 15 (params como Promise).
 */

export const dynamic = 'force-dynamic';

const getMockLive = (id: string) => ({
  id: id,
  title: 'Aula Magna de Revisão Compromisso',
  teacher_name: 'Prof. Ana Lúcia',
  start_time: new Date(Date.now() + 3600 * 1000).toISOString(),
  status: 'scheduled',
  cover_url: `https://picsum.photos/seed/${id}/1200/630`,
  description: 'Uma revisão completa dos tópicos mais importantes para o curso Compromisso.'
});

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    if (id === 'not-found') {
        return NextResponse.json({ error: 'Transmissão não encontrada.' }, { status: 404 });
    }

    const mockLive = getMockLive(id);
    return NextResponse.json(mockLive);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const existingLive = getMockLive(id);
    const updatedLive = { ...existingLive, ...body };
    return NextResponse.json(updatedLive);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    return new Response(null, { status: 204 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}