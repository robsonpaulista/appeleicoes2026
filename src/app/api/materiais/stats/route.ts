import { NextResponse } from 'next/server';
import { materiaisService } from '@/lib/services';

export async function GET() {
  try {
    const stats = await materiaisService.getStats();
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Erro ao buscar estatísticas dos materiais:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
