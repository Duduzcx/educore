'use server';

/**
 * @fileOverview Aurora - Avaliador de Redação ENEM.
 * Analisa o texto com base nas 5 competências oficiais.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const CompetencySchema = z.object({
  score: z.number().describe('Pontuação de 0 a 200.'),
  feedback: z.string().describe('Análise detalhada do desempenho nesta competência.'),
});

const EssayEvaluatorInputSchema = z.object({
  theme: z.string().describe('O tema proposto.'),
  text: z.string().describe('O texto escrito pelo aluno.'),
});

const EssayEvaluatorOutputSchema = z.object({
  total_score: z.number().describe('Nota final de 0 a 1000.'),
  competencies: z.object({
    c1: CompetencySchema.describe('Domínio da norma culta.'),
    c2: CompetencySchema.describe('Compreensão do tema e estrutura.'),
    c3: CompetencySchema.describe('Organização e defesa de ponto de vista.'),
    c4: CompetencySchema.describe('Mecanismos linguísticos (coesão).'),
    c5: CompetencySchema.describe('Proposta de intervenção.'),
  }),
  general_feedback: z.string().describe('Parecer pedagógico geral.'),
  suggestions: z.array(z.string()).describe('Lista de ações para melhorar a nota.'),
});

export const essayEvaluatorFlow = ai.defineFlow(
  {
    name: 'essayEvaluator',
    inputSchema: EssayEvaluatorInputSchema,
    outputSchema: EssayEvaluatorOutputSchema,
  },
  async (input) => {
    const { output } = await ai.generate({
      model: 'googleai/gemini-1.5-flash',
      input: {
        schema: EssayEvaluatorInputSchema,
        data: input,
      },
      output: {
        schema: EssayEvaluatorOutputSchema,
      },
      system: `Você é a Aurora, corretora oficial de redações do Compromisso.
      Analise o texto seguindo rigorosamente os critérios do ENEM.
      Seja criteriosa, mas motivadora. A soma das competências DEVE resultar na nota total.`,
      prompt: `Avalie a seguinte redação:
      Tema: {{{theme}}}
      Texto: {{{text}}}`,
    });

    if (!output) throw new Error("A Aurora não conseguiu analisar o texto.");
    return output;
  }
);
