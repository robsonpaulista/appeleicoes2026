import { NextRequest, NextResponse } from 'next/server';
import { knowledgeBaseService } from '@/lib/services';

export async function GET() {
  try {
    const items = await knowledgeBaseService.getAll();
    return NextResponse.json(items);
  } catch (error) {
    console.error('Erro ao buscar base de conhecimento:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const kbData = await request.json();
    
    if (!kbData.kb_id || !kbData.titulo || !kbData.conteudo || !kbData.resposta) {
      return NextResponse.json(
        { error: 'Todos os campos obrigatórios devem ser preenchidos' },
        { status: 400 }
      );
    }

    const item = await knowledgeBaseService.add(kbData);
    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error('Erro ao adicionar item na base:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
