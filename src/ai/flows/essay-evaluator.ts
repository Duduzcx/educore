
'use server';

/**
 * @fileOverview Aurora - Avaliador de Redação ENEM.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

const CompetencySchema = z.object({
  score: z.number().describe('0 a 200.'),
  feedback: z.string().describe('Análise da competência.'),
});

const EssayEvaluatorInputSchema = z.object({
  theme: z.string(),
  text: z.string(),
});

const EssayEvaluatorOutputSchema = z.object({
  total_score: z.number(),
  competencies: z.object({
    c1: CompetencySchema,
    c2: CompetencySchema,
    c3: CompetencySchema,
    c4: CompetencySchema,
    c5: CompetencySchema,
  }),
  general_feedback: z.string(),
  suggestions: z.array(z.string()),
});

const prompt = ai.definePrompt({
  name: 'essayEvaluatorPrompt',
  model: googleAI.model('gemini-1.5-flash'),
  input: { schema: EssayEvaluatorInputSchema },
  output: { schema: EssayEvaluatorOutputSchema },
  system: `Você é a Aurora, corretora oficial de redações. Avalie seguindo as 5 competências do ENEM.`,
  prompt: `Tema: {{{theme}}}\nTexto: {{{text}}}`,
});

export const essayEvaluatorFlow = ai.defineFlow(
  {
    name: 'essayEvaluator',
    inputSchema: EssayEvaluatorInputSchema,
    outputSchema: EssayEvaluatorOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) throw new Error("A IA não conseguiu analisar o texto.");
    return output;
  }
);
