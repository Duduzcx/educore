import { NextResponse } from 'next/server';

// TODO: Refatorar para usar o Firebase Admin SDK
// A lógica do Supabase foi removida. É necessário reimplementar os
// métodos GET e POST usando o Firestore ou Realtime Database.

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Lógica de busca de lives no Firebase
    // Exemplo (pseudo-código):
    // const lives = await firestore.collection('lives').orderBy('start_time').get();
    // const data = lives.docs.map(doc => doc.data());
    const data: any[] = []; // Retorno vazio por enquanto
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const requiredFields = ['title', 'start_time', 'teacher_id'];
    
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json({ error: `O campo ${field} é obrigatório.` }, { status: 400 });
      }
    }

    // Lógica de inserção de live no Firebase
    // Exemplo (pseudo-código):
    // const newLive = await firestore.collection('lives').add(body);
    const data = { id: 'mock-id', ...body }; // Retorno mockado por enquanto
    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
