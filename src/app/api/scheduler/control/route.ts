import { NextRequest, NextResponse } from 'next/server';
import { camaraScheduler } from '@/lib/scheduler';

export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json();
    
    switch (action) {
      case 'start':
        await camaraScheduler.startScheduler();
        return NextResponse.json({
          success: true,
          message: 'Scheduler iniciado com sucesso',
          timestamp: new Date().toISOString()
        });
        
      case 'stop':
        camaraScheduler.stopScheduler();
        return NextResponse.json({
          success: true,
          message: 'Scheduler parado com sucesso',
          timestamp: new Date().toISOString()
        });
        
      case 'sync':
        const result = await camaraScheduler.executeManualSync();
        return NextResponse.json({
          success: true,
          message: 'Sincronização manual executada',
          result,
          timestamp: new Date().toISOString()
        });
        
      default:
        return NextResponse.json(
          { error: 'Ação inválida. Use: start, stop, sync' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Erro ao controlar scheduler:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
