import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

// Força a rota a ser dinâmica para evitar execução durante o build do Netlify
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('lives')
      .select('*')
      .order('start_time', { ascending: true });

    if (error) throw error;
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

    const { data, error } = await supabase
      .from('lives')
      .insert([body])
      .select();

    if (error) throw error;
    return NextResponse.json(data[0], { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}