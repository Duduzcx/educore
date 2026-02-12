import { NextResponse } from 'next/server';
import { gradeEssayFlow } from '@/lib/ai/essay-grading-flow';

export const maxDuration = 60;

/**
 * Rota da API para corrigir uma redação usando o fluxo de IA.
 * CORREÇÃO: Nome da função importada ajustado para gradeEssayFlow.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { theme, text } = body;

    if (!theme || !text) {
      return NextResponse.json(
        { error: 'O tema e o texto da redação são obrigatórios.' },
        { status: 400 }
      );
    }

    const result = await gradeEssayFlow(theme, text);
    return NextResponse.json(result);

  } catch (error) {
    console.error('Erro na API de correção de redação:', error);
    return NextResponse.json(
      { error: 'Ocorreu um erro inesperado ao processar a correção.' },
      { status: 500 }
    );
  }
}