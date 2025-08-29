import { NextRequest, NextResponse } from 'next/server';
import { solicitacoesMarketingService } from '@/lib/services';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const { status, resposta_administrativo, valor_final, data_entrega } = await request.json();
    
    const solicitacao = await solicitacoesMarketingService.updateStatus(
      id, 
      status, 
      resposta_administrativo, 
      valor_final, 
      data_entrega
    );
    
    return NextResponse.json(solicitacao);
  } catch (error) {
    console.error('Erro ao atualizar solicitação de marketing:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
