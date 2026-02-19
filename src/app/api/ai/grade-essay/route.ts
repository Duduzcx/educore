import { NextResponse } from 'next/server';
import { gradeEssayFlow } from '@/lib/ai/essay-grading-flow';

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const textData = await request.text();
    if (!textData || textData.trim() === '') {
      return NextResponse.json(
        { error: 'Corpo da requisição vazio.' },
        { status: 400 }
      );
    }

    const body = JSON.parse(textData);
    const { theme, text } = body;

    if (!theme || !text) {
      return NextResponse.json(
        { error: 'O tema e o texto da redação são obrigatórios.' },
        { status: 400 }
      );
    }

    const result = await gradeEssayFlow(theme, text);
    return NextResponse.json(result);

  } catch (error: any) {
    console.error('Erro na API de correção de redação:', error);
    return NextResponse.json(
      { error: `Ocorreu um erro inesperado: ${error.message || 'Falha na comunicação'}` },
      { status: 500 }
    );
  }
}
