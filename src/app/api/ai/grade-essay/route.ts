
import { NextResponse } from 'next/server';
import { gradeEssayFlow } from '@/lib/ai/essay-grading-flow';

// Define o tempo máximo de execução da função
export const maxDuration = 60;

/**
 * Rota da API para corrigir uma redação usando o fluxo de IA.
 * Recebe o tema e o texto da redação, e retorna a análise completa.
 */
export async function POST(request: Request) {
  try {
    // 1. Extrai os dados do corpo da requisição
    const body = await request.json();
    const { theme, text } = body;

    // 2. Validação básica de entrada
    if (!theme || !text) {
      return NextResponse.json(
        { error: 'O tema e o texto da redação são obrigatórios.' },
        { status: 400 }
      );
    }

    // 3. Executa o fluxo de IA para correção da redação
    const result = await gradeEssayFlow(theme, text);

    // 4. Retorna o resultado da análise como JSON
    return NextResponse.json(result);

  } catch (error) {
    console.error('Erro na API de correção de redação:', error);
    
    // 5. Retorna uma mensagem de erro genérica para o cliente
    return NextResponse.json(
      { error: 'Ocorreu um erro inesperado ao processar a correção.' },
      { status: 500 }
    );
  }
}
