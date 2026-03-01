import { NextRequest, NextResponse } from 'next/server';
import { conceptExplanationAssistantFlow } from '@/ai/flows/concept-explanation-assistant';
import { financialAidDeterminationFlow } from '@/ai/flows/financial-aid-determination';
import { quizGeneratorFlow } from '@/ai/flows/quiz-generator';
import { bulkQuestionParserFlow } from '@/ai/flows/bulk-question-parser';
import { essayTopicGeneratorFlow } from '@/ai/flows/essay-topic-generator';
import { essayEvaluatorFlow } from '@/ai/flows/essay-evaluator';

/**
 * @fileOverview Gateway de API para os fluxos da Aurora IA.
 */

export async function POST(req: NextRequest) {
  try {
    const text = await req.text();
    if (!text || text.trim() === '') {
      return NextResponse.json({ error: 'Corpo vazio.' }, { status: 400 });
    }

    const { flowId, input } = JSON.parse(text);

    if (!flowId) {
      return NextResponse.json({ error: 'flowId é obrigatório.' }, { status: 400 });
    }

    const flows: Record<string, any> = {
      conceptExplanationAssistant: conceptExplanationAssistantFlow,
      financialAidDetermination: financialAidDeterminationFlow,
      quizGenerator: quizGeneratorFlow,
      bulkQuestionParser: bulkQuestionParserFlow,
      essayTopicGenerator: essayTopicGeneratorFlow,
      essayEvaluator: essayEvaluatorFlow,
    };

    const targetFlow = flows[flowId];

    if (!targetFlow) {
      return NextResponse.json({ error: `Flow '${flowId}' não cadastrado.` }, { status: 404 });
    }

    const result = await targetFlow(input);

    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    console.error(`[AURORA API] Erro:`, error);
    return NextResponse.json(
      { error: error.message || 'Falha na comunicação com a Aurora.' },
      { status: 500 }
    );
  }
}
