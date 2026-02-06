
import { defineFlow } from '@genkit-ai/flow';
import * as z from 'zod';
import { firebase } from '@genkit-ai/firebase'; // CORREÇÃO: Nome do pacote e import ajustado

// Instale a biblioteca da API do Google: npm install googleapis
import { google } from 'googleapis';

export const checkLiveStatusFlow = defineFlow(
  {
    name: 'checkLiveStatus',
    inputSchema: z.object({ videoId: z.string() }),
    outputSchema: z.object({ isLive: z.boolean() }),
    // A autenticação do Firebase será gerenciada pela configuração do Genkit
  },
  async ({ videoId }) => {
    const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

    if (!YOUTUBE_API_KEY) {
      console.error('Chave da API do YouTube não encontrada.');
      // Lançar um erro pode ser mais apropriado em um fluxo de produção
      throw new Error('YOUTUBE_API_KEY não está configurada.');
    }

    try {
      const youtube = google.youtube({
        version: 'v3',
        auth: YOUTUBE_API_KEY,
      });

      const response = await youtube.videos.list({
        part: ['liveStreamingDetails'],
        id: [videoId],
      });

      const video = response.data.items?.[0];
      const liveDetails = video?.liveStreamingDetails;

      const isLive = !!(liveDetails?.actualStartTime && !liveDetails?.actualEndTime);

      return { isLive };

    } catch (error) {
      console.error('Erro ao verificar status da live no YouTube:', error);
      // Repassar o erro para que o fluxo falhe e possa ser tratado
      throw new Error('Falha ao consultar a API do YouTube.');
    }
  }
);
