import { NextResponse } from 'next/server';
import { entregasService } from '@/lib/services';

export async function GET() {
  try {
    const stats = await entregasService.getStats();
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Erro ao buscar estatísticas de entregas:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
