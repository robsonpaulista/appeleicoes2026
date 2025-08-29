import { NextRequest, NextResponse } from 'next/server';
import { whitelistService } from '@/lib/services';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { phone: string } }
) {
  try {
    const phoneNumber = decodeURIComponent(params.phone);
    
    await whitelistService.removeVip(phoneNumber);
    
    return NextResponse.json(
      { message: 'Usuário VIP removido com sucesso' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erro ao remover VIP:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
