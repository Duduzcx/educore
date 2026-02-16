import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

/**
 * @fileOverview Configuração central do Genkit 1.x para o Compromisso.
 * 
 * Exportamos o objeto 'ai' e o plugin configurado.
 */

export const googleAIPlugin = googleAI();

export const ai = genkit({
  plugins: [googleAIPlugin],
});
