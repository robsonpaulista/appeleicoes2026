import { NextRequest, NextResponse } from 'next/server';
import { agendaService } from '@/lib/services';

export async function GET() {
  try {
    const horarios = await agendaService.getAll();
    return NextResponse.json(horarios);
  } catch (error) {
    console.error('Erro ao buscar horários:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
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

    const horario = await agendaService.add({
      data,
      horario_inicio,
      horario_fim,
      local: local || '',
      tipo_agendamento: tipo_agendamento || 'reuniao',
      observacoes: observacoes || '',
      disponivel: disponivel !== false
    });

    return NextResponse.json(horario, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar horário:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
