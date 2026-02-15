
'use server';

/**
 * @fileOverview Aurora - Assistente Pedagógica e Administrativa Ativa.
 * 
 * - conceptExplanationAssistant - Função principal (Server Action).
 * - Conectada ao Gemini 1.5 Flash e API do ENEM Oficial.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// --- DEFINIÇÃO DE FERRAMENTAS (TOOLS) ---

const enemLookup = ai.defineTool(
  {
    name: 'enemLookup',
    description: 'Busca questões reais do ENEM na base oficial para ilustrar temas.',
    inputSchema: z.object({
      query: z.string().describe('O tema da questão (ex: "segunda lei de newton").'),
    }),
    outputSchema: z.array(z.object({
      question: z.string(),
      year: z.number(),
      answer: z.string(),
    })),
  },
  async (input) => {
    try {
      const response = await fetch(`https://api.enem.dev/v1/questions?q=${encodeURIComponent(input.query)}&limit=2`);
      if (!response.ok) return [];
      const data = await response.json();
      return (data || []).map((item: any) => ({
        question: item.context || item.title,
        year: item.year || 2023,
        answer: item.correctAnswer || "A",
      }));
    } catch (e) {
      return [];
    }
  }
);

const youtubeSearch = ai.defineTool(
  {
    name: 'youtubeSearch',
    description: 'Busca videoaulas no YouTube para complementar o aprendizado.',
    inputSchema: z.object({
      query: z.string().describe('O tema da videoaula (ex: "aula de derivadas").'),
    }),
    outputSchema: z.array(z.object({
      title: z.string(),
      url: z.string(),
      thumbnail: z.string(),
    })),
  },
  async (input) => {
    const apiKey = process.env.YOUTUBE_API_KEY;
    if (!apiKey) return [];
    try {
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(input.query)}&type=video&maxResults=2&key=${apiKey}`
      );
      const data = await response.json();
      return (data.items || []).map((item: any) => ({
        title: item.snippet.title,
        url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
        thumbnail: item.snippet.thumbnails.default.url,
      }));
    } catch (e) {
      return [];
    }
  }
);

// --- FLOW PRINCIPAL DA AURORA ---

const MessageSchema = z.object({
  role: z.enum(['user', 'model']).describe('Papel.'),
  content: z.string().describe('Conteúdo.'),
});

const ConceptExplanationAssistantInputSchema = z.object({
  query: z.string(),
  history: z.array(MessageSchema).optional(),
  context: z.string().optional().describe('Contexto adicional (ex: resumo da aula atual).'),
});
export type ConceptExplanationAssistantInput = z.infer<typeof ConceptExplanationAssistantInputSchema>;

const ConceptExplanationAssistantOutputSchema = z.object({
  response: z.string(),
});
export type ConceptExplanationAssistantOutput = z.infer<typeof ConceptExplanationAssistantOutputSchema>;

export async function conceptExplanationAssistant(input: ConceptExplanationAssistantInput): Promise<ConceptExplanationAssistantOutput> {
  return conceptExplanationAssistantFlow(input);
}

const prompt = ai.definePrompt({
  name: 'conceptExplanationAssistantPrompt',
  model: 'googleai/gemini-1.5-flash',
  tools: [enemLookup, youtubeSearch],
  input: { schema: ConceptExplanationAssistantInputSchema },
  output: { schema: ConceptExplanationAssistantOutputSchema },
  config: { temperature: 0.7 },
  prompt: `Você é a Aurora, a assistente pedagógica de elite do Compromisso.
Sua missão é ajudar estudantes brasileiros com dúvidas para o ENEM e vestibulares.

ESTRUTURA DE RESPOSTA OBRIGATÓRIA:
1. Explicação: Explique o conceito de forma simples, mas com rigor acadêmico.
2. Exemplo Real: SEMPRE cite uma questão real do ENEM relacionada usando a ferramenta enemLookup se possível.
3. Apoio Visual: Ofereça um vídeo complementar usando youtubeSearch se o tema for complexo.

{{#if context}}
CONTEXTO DA AULA ATUAL:
{{{context}}}
{{/if}}

REGRAS:
- Use Português Brasileiro profissional e empático.
- Se o usuário perguntar algo não acadêmico, direcione-o gentilmente de volta aos estudos.

Histórico:
{{#each history}}
{{role}}: {{content}}
{{/each}}

Pergunta: {{{query}}}`,
});

const conceptExplanationAssistantFlow = ai.defineFlow(
  {
    name: 'conceptExplanationAssistantFlow',
    inputSchema: ConceptExplanationAssistantInputSchema,
    outputSchema: ConceptExplanationAssistantOutputSchema,
  },
  async input => {
    try {
      const { output } = await prompt(input);
      if (!output || !output.response) throw new Error("Resposta vazia.");
      return output;
    } catch (error: any) {
      console.error("Erro Aurora IA:", error);
      return { response: "Olá! Tive um pequeno soluço no processamento. Pode repetir sua dúvida?" };
    }
  }
);
