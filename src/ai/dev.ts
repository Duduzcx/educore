/**
 * @fileOverview Arquivo de desenvolvimento para o Genkit.
 * Removida a dependência do dotenv para evitar erros de build no ambiente serverless do Netlify.
 */

import '@/ai/flows/concept-explanation-assistant.ts';
import '@/ai/flows/financial-aid-determination.ts';
import '@/ai/flows/quiz-generator.ts';