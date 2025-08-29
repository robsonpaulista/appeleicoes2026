import { NextResponse } from 'next/server';
import { camaraScheduler } from '@/lib/scheduler';

export async function GET() {
  try {
    const status = camaraScheduler.getStatus();
    const stats = camaraScheduler.getStats();
    
    return NextResponse.json({
      success: true,
      status,
      stats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Erro ao buscar status do scheduler:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
