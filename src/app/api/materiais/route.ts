import { NextRequest, NextResponse } from 'next/server';
import { materiaisService } from '@/lib/services';

export async function GET() {
  try {
    const materiais = await materiaisService.getAll();
    return NextResponse.json(materiais);
  } catch (error) {
    console.error('Erro ao buscar materiais:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const materialData = await request.json();
    
    // Validação básica
    if (!materialData.nome || !materialData.categoria) {
      return NextResponse.json(
        { error: 'Nome e categoria são obrigatórios' },
        { status: 400 }
      );
    }

    const material = await materiaisService.add(materialData);
    return NextResponse.json(material, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar material:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
