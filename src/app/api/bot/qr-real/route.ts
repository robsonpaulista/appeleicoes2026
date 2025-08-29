import { NextRequest, NextResponse } from 'next/server';
import { getBotStatus } from '@/lib/bot-status';

export async function GET(request: NextRequest) {
  try {
    // Obter status atual do bot
    const botStatus = getBotStatus();
    
    // Para teste, sempre gerar um QR code
    // Na implementação real, você verificaria se há dados do bot
    let qrData = botStatus.qrData;
    
    // Se não há dados do bot, criar dados de teste
    if (!qrData) {
      qrData = `2@test_qr_code_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    }
    
    // Usar API externa para gerar QR code
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=${encodeURIComponent(qrData)}`;
    
    return NextResponse.json({ 
      success: true,
      qrCode: qrCodeUrl,
      qrData: qrData,
      message: 'QR Code de teste gerado com sucesso!',
      timestamp: new Date().toISOString(),
      botStatus: botStatus.status || 'disconnected'
    });
  } catch (error) {
    console.error('Erro ao gerar QR Code real:', error);
    return NextResponse.json(
      { error: 'Erro ao gerar QR Code real' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action, qrData } = await request.json();
    
    if (action === 'generate') {
      // Gerar QR code com dados específicos
      if (!qrData) {
        return NextResponse.json(
          { error: 'Dados do QR code são obrigatórios' },
          { status: 400 }
        );
      }
      
      const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=${encodeURIComponent(qrData)}`;
      
      return NextResponse.json({ 
        success: true,
        qrCode: qrCodeUrl,
        qrData: qrData,
        message: 'QR Code gerado com sucesso'
      });
    }
    
    return NextResponse.json({ error: 'Ação inválida' }, { status: 400 });
  } catch (error) {
    console.error('Erro ao processar QR Code:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
