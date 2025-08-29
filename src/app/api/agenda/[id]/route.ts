import { NextRequest, NextResponse } from 'next/server';
import { agendaService } from '@/lib/services';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'ID inválido' },
        { status: 400 }
      );
    }

    const horario = await agendaService.getById(id);
    if (!horario) {
      return NextResponse.json(
        { error: 'Horário não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(horario);
  } catch (error) {
    console.error('Erro ao buscar horário:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'ID inválido' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const {
      data,
      horario_inicio,
      horario_fim,
      local,
      tipo_agendamento,
      observacoes,
      disponivel
    } = body;

    if (!data || !horario_inicio || !horario_fim) {
      return NextResponse.json(
        { error: 'Data, horário de início e fim são obrigatórios' },
        { status: 400 }
      );
    }

    const horario = await agendaService.update(id, {
      data,
      horario_inicio,
      horario_fim,
      local: local || '',
      tipo_agendamento: tipo_agendamento || 'reuniao',
      observacoes: observacoes || '',
      disponivel: disponivel !== false
    });

    if (!horario) {
      return NextResponse.json(
        { error: 'Horário não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(horario);
  } catch (error) {
    console.error('Erro ao atualizar horário:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'ID inválido' },
        { status: 400 }
      );
    }

    await agendaService.delete(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao excluir horário:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
