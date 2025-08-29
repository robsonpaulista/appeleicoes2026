import { NextResponse } from 'next/server';
import { solicitacoesMarketingService } from '@/lib/services';

export async function GET() {
  try {
    const stats = await solicitacoesMarketingService.getStats();
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Erro ao buscar estatísticas de marketing:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
