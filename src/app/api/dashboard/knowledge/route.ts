import { NextResponse } from 'next/server';
import { knowledgeBaseService } from '@/lib/services';

export async function GET() {
  try {
    const knowledgeItems = await knowledgeBaseService.getAll();
    return NextResponse.json(knowledgeItems);
  } catch (error) {
    console.error('Erro ao buscar base de conhecimento:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
