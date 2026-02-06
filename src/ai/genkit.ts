import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

/**
 * @fileOverview Configuração central do Genkit 1.x.
 * 
 * Exportamos o objeto 'ai' e o plugin 'googleAI' para uso consistente
 * em todos os fluxos, garantindo que as variáveis de ambiente sejam
 * lidas corretamente tanto localmente quanto no App Hosting.
 */

export const googleAIPlugin = googleAI();

export const ai = genkit({
  plugins: [googleAIPlugin],
});
