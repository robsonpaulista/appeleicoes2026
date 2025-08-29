import { NextResponse } from 'next/server';
import { solicitacoesService } from '@/lib/services';

export async function GET() {
  try {
    const solicitacoes = await solicitacoesService.getAll();
    return NextResponse.json(solicitacoes);
  } catch (error) {
    console.error('Erro ao buscar solicitações:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
