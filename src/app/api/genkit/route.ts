
import { run } from 'genkit';
import { NextRequest, NextResponse } from 'next/server';

// Importe seus fluxos de IA aqui
import '@/ai/flows/concept-explanation-assistant';
import '@/ai/flows/financial-aid-determination';
import '@/ai/flows/quiz-generator';

export async function POST(req: NextRequest) {
  const { flowId, input } = await req.json();

  if (!flowId) {
    return NextResponse.json(
      { error: 'flowId is required' },
      { status: 400 }
    );
  }

  try {
    const result = await run(flowId, input);
    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    console.error(`Error running flow ${flowId}:`, error);
    return NextResponse.json(
      { error: `An error occurred: ${error.message || 'Unknown error'}` },
      { status: 500 }
    );
  }
}
