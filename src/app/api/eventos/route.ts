import { NextRequest, NextResponse } from 'next/server';
import { registrosEventosService } from '@/lib/services';

export async function GET() {
  try {
    const eventos = await registrosEventosService.getAll();
    return NextResponse.json(eventos);
  } catch (error) {
    console.error('Erro ao buscar eventos:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const evento = await registrosEventosService.add(body);
    
    return NextResponse.json(evento, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar evento:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
