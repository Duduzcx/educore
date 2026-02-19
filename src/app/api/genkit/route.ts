
import { ai } from '@/ai/genkit';
import { NextRequest, NextResponse } from 'next/server';

import '@/ai/flows/concept-explanation-assistant';
import '@/ai/flows/financial-aid-determination';
import '@/ai/flows/quiz-generator';

export async function POST(req: NextRequest) {
  try {
    const text = await req.text();
    if (!text) {
      return NextResponse.json(
        { error: 'Request body is empty' },
        { status: 400 }
      );
    }

    let body;
    try {
      body = JSON.parse(text);
    } catch (e) {
      return NextResponse.json(
        { error: 'Invalid JSON input' },
        { status: 400 }
      );
    }

    const { flowId, input } = body;

    if (!flowId) {
      return NextResponse.json(
        { error: 'flowId is required' },
        { status: 400 }
      );
    }

    // Genkit 1.x pattern: ai.run(flowId, input)
    const result = await ai.run(flowId, input);

    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    console.error(`Error running flow:`, error);
    return NextResponse.json(
      { error: `An error occurred: ${error.message || 'Unknown error'}` },
      { status: 500 }
    );
  }
}
