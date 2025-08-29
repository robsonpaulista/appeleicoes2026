import { NextRequest, NextResponse } from 'next/server';
import { registrosEventosService } from '@/lib/services';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const evento = await registrosEventosService.getById(id);
    
    if (!evento) {
      return NextResponse.json({ error: 'Evento não encontrado' }, { status: 404 });
    }
    
    return NextResponse.json(evento);
  } catch (error) {
    console.error('Erro ao buscar evento:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const body = await request.json();
    
    // Verificar se é uma atualização de status ou dados completos
    if (body.status && body.resposta_administrativo !== undefined) {
      // Atualização de status (aprovado/rejeitado)
      const evento = await registrosEventosService.updateStatus(
        id, 
        body.status, 
        body.resposta_administrativo, 
        body.aprovado
      );
      return NextResponse.json(evento);
    } else {
      // Atualização completa dos dados
      const evento = await registrosEventosService.update(id, body);
      return NextResponse.json(evento);
    }
  } catch (error) {
    console.error('Erro ao atualizar evento:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    await registrosEventosService.delete(id);
    
    return NextResponse.json({ message: 'Evento excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir evento:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
