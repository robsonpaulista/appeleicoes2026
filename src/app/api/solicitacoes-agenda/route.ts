import { NextRequest, NextResponse } from 'next/server';
import { solicitacoesAgendaService } from '@/lib/services';

export async function GET() {
  try {
    const solicitacoes = await solicitacoesAgendaService.getAll();
    return NextResponse.json(solicitacoes);
  } catch (error) {
    console.error('Erro ao buscar solicitações de agenda:', error);
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
      phone_number,
      nome_solicitante,
      municipio_solicitante,
      data_solicitada,
      horario_solicitado,
      tipo_agendamento,
      assunto,
      descricao,
      local_preferido,
      duracao_estimada,
      prioridade,
      observacoes
    } = body;

    if (!phone_number || !data_solicitada || !assunto) {
      return NextResponse.json(
        { error: 'Telefone, data solicitada e assunto são obrigatórios' },
        { status: 400 }
      );
    }

    const solicitacao = await solicitacoesAgendaService.add({
      phone_number,
      nome_solicitante: nome_solicitante || '',
      municipio_solicitante: municipio_solicitante || '',
      data_solicitada,
      horario_solicitado: horario_solicitado || '',
      tipo_agendamento: tipo_agendamento || 'reuniao',
      assunto,
      descricao: descricao || '',
      local_preferido: local_preferido || '',
      duracao_estimada: duracao_estimada || 60,
      prioridade: prioridade || 'normal',
      observacoes: observacoes || ''
    });

    return NextResponse.json(solicitacao, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar solicitação de agenda:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
