import { NextRequest, NextResponse } from 'next/server';
import { solicitacoesAgendaService } from '@/lib/services';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'ID inválido' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const {
      status,
      resposta_administrativo,
      data_confirmada,
      horario_confirmado,
      local_confirmado
    } = body;

    if (!status || !resposta_administrativo) {
      return NextResponse.json(
        { error: 'Status e resposta administrativa são obrigatórios' },
        { status: 400 }
      );
    }

    const solicitacao = await solicitacoesAgendaService.updateStatus(
      id,
      status,
      resposta_administrativo,
      data_confirmada || null,
      horario_confirmado || null,
      local_confirmado || null
    );

    if (!solicitacao) {
      return NextResponse.json(
        { error: 'Solicitação não encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json(solicitacao);
  } catch (error) {
    console.error('Erro ao atualizar solicitação de agenda:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
