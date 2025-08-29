import { NextResponse } from 'next/server';
import { solicitacoesAgendaService } from '@/lib/services';

export async function GET() {
  try {
    const stats = await solicitacoesAgendaService.getStats();
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Erro ao buscar estatísticas das solicitações de agenda:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
