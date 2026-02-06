'use server';

/**
 * @fileOverview Gerador de Quizzes via IA para Professores.
 * Focado em emular o estilo e rigor de vestibulares nacionais (ENEM, FUVEST, etc).
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const QuestionSchema = z.object({
  question: z.string().describe('O enunciado da pergunta, preferencialmente contextualizado.'),
  options: z.array(z.string()).length(4).describe('Quatro opções de resposta.'),
  correctIndex: z.number().min(0).max(3).describe('O índice da resposta correta (0-3).'),
  explanation: z.string().describe('Uma breve explicação pedagógica do porquê esta é a resposta correta.'),
  sourceStyle: z.string().describe('O estilo de vestibular que esta questão emula (ex: Estilo ENEM, Estilo FUVEST).'),
});

const QuizGeneratorInputSchema = z.object({
  topic: z.string().describe('O tópico ou título do módulo para o qual gerar o quiz.'),
  description: z.string().optional().describe('Descrição adicional do conteúdo para dar contexto à IA.'),
});
export type QuizGeneratorInput = z.infer<typeof QuizGeneratorInputSchema>;

const QuizGeneratorOutputSchema = z.object({
  questions: z.array(QuestionSchema).describe('Lista de questões geradas pela IA baseadas em vestibulares.'),
});
export type QuizGeneratorOutput = z.infer<typeof QuizGeneratorOutputSchema>;

export async function generateQuiz(input: QuizGeneratorInput): Promise<QuizGeneratorOutput> {
  return generateQuizFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateQuizPrompt',
  model: 'googleai/gemini-1.5-flash',
  input: { schema: QuizGeneratorInputSchema },
  output: { schema: QuizGeneratorOutputSchema },
  config: {
    temperature: 0.8,
  },
  prompt: `Você é um professor especialista em exames de admissão (Vestibulares e ENEM).
  Sua tarefa é criar um mini-quiz de 3 questões de múltipla escolha sobre o seguinte tema:
  
  Tema: {{{topic}}}
  Contexto: {{{description}}}
  
  REGRAS CRÍTICAS:
  1. ESTILO VESTIBULAR: As questões DEVEM emular o estilo de grandes exames brasileiros (ENEM, FUVEST, UNICAMP, VUNESP).
  2. CONTEXTUALIZAÇÃO: Utilize textos base, situações-problema ou gráficos descritos (em texto) conforme o padrão ENEM.
  3. DISTRATORES: As opções incorretas devem ser plausíveis (distratores), baseadas em erros comuns de raciocínio sobre o tema.
  4. EXPLICAÇÃO: A explicação deve ser clara, ensinando o conceito por trás da resposta correta.
  5. IDIOMA: Responda estritamente em Português Brasileiro.`,
});

const generateQuizFlow = ai.defineFlow(
  {
    name: 'generateQuizFlow',
    inputSchema: QuizGeneratorInputSchema,
    outputSchema: QuizGeneratorOutputSchema,
  },
  async input => {
    const { output } = await prompt(input);
    return output!;
  }
);
