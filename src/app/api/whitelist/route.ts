import { NextRequest, NextResponse } from 'next/server';
import { whitelistService } from '@/lib/services';

export async function GET() {
  try {
    const vips = await whitelistService.getAllVips();
    return NextResponse.json(vips);
  } catch (error) {
    console.error('Erro ao buscar VIPs:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { phoneNumber, name, role, municipio } = await request.json();
    
    if (!phoneNumber || !name) {
      return NextResponse.json(
        { error: 'Telefone e nome são obrigatórios' },
        { status: 400 }
      );
    }

    const vip = await whitelistService.addVip(phoneNumber, name, role, municipio);
    return NextResponse.json(vip, { status: 201 });
  } catch (error) {
    console.error('Erro ao adicionar VIP:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
