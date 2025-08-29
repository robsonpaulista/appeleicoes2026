import { NextResponse } from 'next/server';

export async function POST() {
  try {
    // Aqui você pode adicionar lógica para parar o bot
    // Por enquanto, apenas retorna sucesso
    console.log('Comando de desconexão do bot recebido');
    
    return NextResponse.json({ 
      success: true, 
      message: 'Bot desconectado com sucesso.' 
    });
  } catch (error) {
    console.error('Erro ao desconectar bot:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
