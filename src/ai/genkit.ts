import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

/**
 * @fileOverview Configuração central do Genkit 1.x para o Compromisso.
 * 
 * Exportamos o objeto 'ai' configurado com o plugin do Google AI.
 */

export const ai = genkit({
  plugins: [googleAI()],
});
