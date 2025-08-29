import { NextRequest, NextResponse } from 'next/server';
import { knowledgeBaseService } from '@/lib/services';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const kbId = decodeURIComponent(params.id);
    
    await knowledgeBaseService.delete(kbId);
    
    return NextResponse.json(
      { message: 'Item removido com sucesso' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erro ao remover item:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
