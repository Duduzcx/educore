'use server';

/**
 * @fileOverview Aurora - Gerador de Temas de Redação.
 * Cria temas inéditos baseados em eixos temáticos do ENEM.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const EssayTopicInputSchema = z.object({
  category: z.string().optional().describe('Eixo temático opcional (ex: Saúde, Educação, Tecnologia).'),
});

const EssayTopicOutputSchema = z.object({
  title: z.string().describe('O título do tema da redação.'),
  background_text: z.string().describe('Um breve texto motivador ou contexto para o aluno.'),
  keywords: z.array(z.string()).describe('Palavras-chave essenciais para a abordagem.'),
});

export const essayTopicGeneratorFlow = ai.defineFlow(
  {
    name: 'essayTopicGenerator',
    inputSchema: EssayTopicInputSchema,
    outputSchema: EssayTopicOutputSchema,
  },
  async (input) => {
    const { output } = await ai.generate({
      model: 'googleai/gemini-1.5-flash',
      input: {
        schema: EssayTopicInputSchema,
        data: input,
      },
      output: {
        schema: EssayTopicOutputSchema,
      },
      system: `Você é a Aurora, mentora especialista em Redação nota 1000. 
      Sua tarefa é criar temas de redação inéditos no estilo ENEM. 
      O tema deve ser um problema social brasileiro relevante.`,
      prompt: `Gere um tema de redação desafiador{{#if category}} focado no eixo de {{{category}}}{{/if}}.`,
    });

    if (!output) throw new Error("Falha ao gerar tema.");
    return output;
  }
);
