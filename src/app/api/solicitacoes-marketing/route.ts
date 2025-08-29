import { NextRequest, NextResponse } from 'next/server';
import { solicitacoesMarketingService } from '@/lib/services';

export async function GET() {
  try {
    const solicitacoes = await solicitacoesMarketingService.getAll();
    return NextResponse.json(solicitacoes);
  } catch (error) {
    console.error('Erro ao buscar solicitações de marketing:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const solicitacaoData = await request.json();
    const solicitacao = await solicitacoesMarketingService.add(solicitacaoData);
    return NextResponse.json(solicitacao, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar solicitação de marketing:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
