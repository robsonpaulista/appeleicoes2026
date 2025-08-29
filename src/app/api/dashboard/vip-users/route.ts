import { NextResponse } from 'next/server';
import { whitelistService } from '@/lib/services';

export async function GET() {
  try {
    const vipUsers = await whitelistService.getAllVips();
    return NextResponse.json(vipUsers);
  } catch (error) {
    console.error('Erro ao buscar usuários VIP:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
