
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// Inicializa o cliente Supabase
// Certifique-se de que suas variáveis de ambiente SUPABASE_URL e SUPABASE_ANON_KEY estão configuradas
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * @swagger
 * /api/scheduled-lives:
 *   get:
 *     summary: Lista todas as transmissões ao vivo agendadas.
 *     description: Retorna uma lista de todas as lives com status 'scheduled' ou 'live'.
 *     tags:
 *       - Scheduled Lives
 *     responses:
 *       200:
 *         description: Uma lista de transmissões ao vivo.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ScheduledLive'
 *       500:
 *         description: Erro no servidor.
 */
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('scheduled_lives')
      .select('*')
      .in('status', ['scheduled', 'live']);

    if (error) {
      throw error;
    }

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * @swagger
 * /api/scheduled-lives:
 *   post:
 *     summary: Agenda uma nova transmissão ao vivo.
 *     description: Cria uma nova entrada para uma transmissão ao vivo no banco de dados.
 *     tags:
 *       - Scheduled Lives
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NewScheduledLive'
 *     responses:
 *       201:
 *         description: Transmissão ao vivo criada com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ScheduledLive'
 *       400:
 *         description: Dados de entrada inválidos.
 *       500:
 *         description: Erro no servidor.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validação básica dos dados de entrada
    const requiredFields = ['title', 'scheduled_at', 'host_id'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json({ error: `O campo ${field} é obrigatório.` }, { status: 400 });
      }
    }

    const { data, error } = await supabase
      .from('scheduled_lives')
      .insert([body])
      .select();

    if (error) {
      throw error;
    }

    return NextResponse.json(data[0], { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
