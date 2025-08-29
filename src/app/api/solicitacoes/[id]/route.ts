import { NextRequest, NextResponse } from 'next/server';
import { solicitacoesService } from '@/lib/services';

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

    const { status, resposta_administrativo } = await request.json();
    
    if (!status || !resposta_administrativo) {
      return NextResponse.json(
        { error: 'Status e resposta são obrigatórios' },
        { status: 400 }
      );
    }

    const solicitacao = await solicitacoesService.updateStatus(id, status, resposta_administrativo);
    if (!solicitacao) {
      return NextResponse.json(
        { error: 'Solicitação não encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json(solicitacao);
  } catch (error) {
    console.error('Erro ao atualizar solicitação:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
