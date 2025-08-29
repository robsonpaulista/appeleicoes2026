import { NextRequest, NextResponse } from 'next/server';
import { marketingService } from '@/lib/services';

export async function GET() {
  try {
    const servicos = await marketingService.getAll();
    return NextResponse.json(servicos);
  } catch (error) {
    console.error('Erro ao buscar serviços de marketing:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const servicoData = await request.json();
    const servico = await marketingService.add(servicoData);
    return NextResponse.json(servico, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar serviço de marketing:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
