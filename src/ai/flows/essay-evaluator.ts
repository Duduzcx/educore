'use server';

/**
 * @fileOverview Aurora - Avaliador de Redação Profissional.
 * Analisa o texto e fornece correções gramaticais detalhadas.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

const CorrectionSchema = z.object({
  original: z.string().describe('O trecho errado encontrado no texto.'),
  suggestion: z.string().describe('A forma correta sugerida pela Aurora.'),
  reason: z.string().describe('Breve explicação do porquê está errado (regra gramatical).')
});

const CompetencySchema = z.object({
  score: z.number().describe('Pontuação de 0 a 200.'),
  feedback: z.string().describe('Análise detalhada da competência.'),
});

const EssayEvaluatorInputSchema = z.object({
  theme: z.string().describe('O tema proposto.'),
  text: z.string().describe('O texto da redação escrito pelo aluno.'),
});

const EssayEvaluatorOutputSchema = z.object({
  total_score: z.number().describe('Nota final de 0 a 1000.'),
  competencies: z.object({
    c1: CompetencySchema.describe('Domínio da norma culta.'),
    c2: CompetencySchema.describe('Compreender a proposta e aplicar conceitos.'),
    c3: CompetencySchema.describe('Selecionar, relacionar e organizar informações.'),
    c4: CompetencySchema.describe('Conhecimento dos mecanismos linguísticos.'),
    c5: CompetencySchema.describe('Proposta de intervenção.'),
  }),
  detailed_corrections: z.array(CorrectionSchema).describe('Lista de erros gramaticais e ortográficos encontrados.'),
  general_feedback: z.string().describe('Visão geral do texto.'),
  suggestions: z.array(z.string()).describe('Lista de ações para melhorar a nota.'),
});

const prompt = ai.definePrompt({
  name: 'essayEvaluatorPrompt',
  model: googleAI.model('gemini-3-flash-preview'),
  input: { schema: EssayEvaluatorInputSchema },
  output: { schema: EssayEvaluatorOutputSchema },
  config: { temperature: 0.3 },
  system: `Você é a Aurora, corretora sênior nota 1000. 
  Analise o texto seguindo o padrão oficial do INEP.
  REGRAS ADICIONAIS:
  1. Identifique no mínimo 3 trechos com erros gramaticais, ortográficos ou de coesão para o campo "detailed_corrections".
  2. Seja extremamente criteriosa com a Competência 1.
  3. Atribua notas apenas em múltiplos de 40.`,
  prompt: `Analise a seguinte redação:
  
  TEMA: {{{theme}}}
  TEXTO DO ALUNO:
  {{{text}}}`,
});

export const essayEvaluatorFlow = ai.defineFlow(
  {
    name: 'essayEvaluator',
    inputSchema: EssayEvaluatorInputSchema,
    outputSchema: EssayEvaluatorOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) throw new Error("A Aurora não conseguiu analisar este texto.");
    return output;
  }
);
