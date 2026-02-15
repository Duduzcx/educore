import { NextResponse } from 'next/server';

// TODO: Refatorar para usar o Firebase Functions e Firestore.
// A API de lives foi mocada para remover a dependência do Supabase.

// Força a rota a ser dinâmica para evitar execução durante o build
export const dynamic = 'force-dynamic';

// Mock de um objeto de transmissão ao vivo
const getMockLive = (id: string) => ({
  id: id,
  title: 'Aula Magna de Revisão ENEM',
  teacher_name: 'Prof. Ana Lúcia',
  start_time: new Date(Date.now() + 3600 * 1000).toISOString(), // Em 1 hora
  status: 'scheduled',
  cover_url: `https://picsum.photos/seed/${id}/1200/630`,
  description: 'Uma revisão completa dos tópicos mais importantes para a prova de Ciências Humanas do ENEM.'
});


export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    
    // Simula não encontrar a live se o id for 'not-found'
    if (id === 'not-found') {
        return NextResponse.json({ error: 'Transmissão não encontrada.' }, { status: 404 });
    }

    const mockLive = getMockLive(id);

    return NextResponse.json(mockLive);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const body = await request.json();

    const existingLive = getMockLive(id);
    const updatedLive = { ...existingLive, ...body };
    
    console.log("Simulando atualização da live:", updatedLive);

    return NextResponse.json(updatedLive);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    
    console.log(`Simulando exclusão da live com id: ${id}`);
    
    // Retorna 204 No Content, como se a exclusão tivesse sido bem-sucedida
    return new Response(null, { status: 204 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
