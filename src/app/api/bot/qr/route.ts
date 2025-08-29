import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Aqui você pode integrar com o whatsapp-web.js para obter o QR Code real
    // Por enquanto, vamos criar um QR Code de exemplo
    const qrData = 'https://wa.me/5586998391000'; // Número do bot configurado
    
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrData)}`;
    
    return NextResponse.json({ 
      qrCode: qrCodeUrl,
      message: 'Escaneie este QR Code com o WhatsApp do número configurado'
    });
  } catch (error) {
    console.error('Erro ao gerar QR Code:', error);
    return NextResponse.json(
      { error: 'Erro ao gerar QR Code' },
      { status: 500 }
    );
  }
}
