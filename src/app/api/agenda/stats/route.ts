import { NextResponse } from 'next/server';
import { agendaService } from '@/lib/services';

export async function GET() {
  try {
    const stats = await agendaService.getStats();
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Erro ao buscar estatísticas da agenda:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
