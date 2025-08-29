import { NextResponse } from 'next/server';
import { configService } from '@/lib/services';

export async function POST() {
  try {
    // Buscar configuração do bot
    const config = await configService.get();
    
    if (!config.botPhoneNumber) {
      return NextResponse.json(
        { error: 'Número do bot não configurado' },
        { status: 400 }
      );
    }

    // Atualizar status para ativo
    await configService.updateStatus(true, new Date().toISOString());
    
    console.log('🚀 Bot iniciado para o número:', config.botPhoneNumber);
    
    return NextResponse.json({ 
      success: true, 
      message: `Bot iniciado para ${config.botPhoneNumber}`,
      botNumber: config.botPhoneNumber
    });
  } catch (error) {
    console.error('Erro ao iniciar bot:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
