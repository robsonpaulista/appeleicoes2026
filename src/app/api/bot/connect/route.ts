import { NextResponse } from 'next/server';

export async function POST() {
  try {
    // Aqui você pode adicionar lógica para iniciar o bot
    // Por enquanto, apenas retorna sucesso
    console.log('Comando de conexão do bot recebido');
    
    return NextResponse.json({ 
      success: true, 
      message: 'Comando de conexão enviado. Verifique o terminal para o QR Code.' 
    });
  } catch (error) {
    console.error('Erro ao conectar bot:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
