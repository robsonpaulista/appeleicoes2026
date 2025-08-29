import { NextRequest, NextResponse } from 'next/server';
import { registrosEventosService } from '@/lib/services';

export async function GET() {
  try {
    const stats = await registrosEventosService.getStats();
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Erro ao buscar estatísticas dos eventos:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
