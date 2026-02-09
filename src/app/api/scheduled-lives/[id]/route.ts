
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// Inicializa o cliente Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * @swagger
 * /api/scheduled-lives/{id}:
 *   get:
 *     summary: Busca uma transmissão ao vivo específica pelo ID.
 *     description: Retorna os detalhes de uma única transmissão ao vivo.
 *     tags:
 *       - Scheduled Lives
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: O ID da transmissão ao vivo.
 *     responses:
 *       200:
 *         description: Detalhes da transmissão ao vivo.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ScheduledLive'
 *       404:
 *         description: Transmissão ao vivo não encontrada.
 *       500:
 *         description: Erro no servidor.
 */
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const { data, error } = await supabase
      .from('scheduled_lives')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Transmissão ao vivo não encontrada.' }, { status: 404 });
      }
      throw error;
    }

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * @swagger
 * /api/scheduled-lives/{id}:
 *   put:
 *     summary: Atualiza uma transmissão ao vivo existente.
 *     description: Modifica os detalhes de uma transmissão ao vivo com base no seu ID.
 *     tags:
 *       - Scheduled Lives
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: O ID da transmissão ao vivo a ser atualizada.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateScheduledLive'
 *     responses:
 *       200:
 *         description: Transmissão atualizada com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ScheduledLive'
 *       404:
 *         description: Transmissão ao vivo não encontrada.
 *       500:
 *         description: Erro no servidor.
 */
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const body = await request.json();

    const { data, error } = await supabase
      .from('scheduled_lives')
      .update(body)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Transmissão ao vivo não encontrada.' }, { status: 404 });
      }
      throw error;
    }

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * @swagger
 * /api/scheduled-lives/{id}:
 *   delete:
 *     summary: Exclui uma transmissão ao vivo.
 *     description: Remove permanentemente uma transmissão ao vivo do banco de dados.
 *     tags:
 *       - Scheduled Lives
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: O ID da transmissão ao vivo a ser excluída.
 *     responses:
 *       204:
 *         description: Transmissão excluída com sucesso.
 *       404:
 *         description: Transmissão ao vivo não encontrada.
 *       500:
 *         description: Erro no servidor.
 */
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    const { error } = await supabase
      .from('scheduled_lives')
      .delete()
      .eq('id', id);

    if (error) {
        // O ideal é checar se o erro é por não encontrar o registro, mas o delete não retorna isso.
        // Apenas lançamos o erro genérico.
        throw error;
    }

    return new Response(null, { status: 204 }); // 204 No Content
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
