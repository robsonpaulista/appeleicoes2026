import { NextResponse } from 'next/server';
import { solicitacoesService } from '@/lib/services';

export async function GET() {
  try {
    const stats = await solicitacoesService.getStatsPorMunicipio();
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Erro ao buscar estatísticas por município:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
