import { NextRequest, NextResponse } from 'next/server';
import { configService } from '@/lib/services';

export async function GET() {
  try {
    const config = await configService.get();
    return NextResponse.json(config);
  } catch (error) {
    console.error('Erro ao buscar configurações:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const configData = await request.json();
    const config = await configService.set(configData);
    return NextResponse.json(config);
  } catch (error) {
    console.error('Erro ao salvar configurações:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
