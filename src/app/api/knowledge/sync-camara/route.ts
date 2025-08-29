import { NextRequest, NextResponse } from 'next/server';
import { knowledgeBaseService } from '@/lib/services';
import { buscarProposicoesDoDeputado } from '@/lib/camara-api';
import { camaraScheduler } from '@/lib/scheduler';

interface CamaraProjeto {
  id: number;
  uri: string;
  tipo: string;
  numero: number;
  ano: number;
  ementa: string;
  dataApresentacao: string;
  uriAutores: string;
  uriTramitacoes: string;
  url: string;
}

// Função para buscar projetos reais na Câmara usando a API oficial
async function buscarProjetosCamara(): Promise<CamaraProjeto[]> {
  try {
    console.log('🔍 Buscando projetos reais na Câmara dos Deputados via API oficial...');
    
    // Usar a função utilitária que implementa a estratégia correta
    const proposicoes = await buscarProposicoesDoDeputado({
      idDeputado: 220697, // Jadyel Alencar
      tipos: ["PL", "PEC", "PLP"],
      itensPorPagina: 100
    });
    
    console.log(`🎯 Total de proposições encontradas: ${proposicoes.length}`);
    
    // Mapear para o formato esperado
    const projetos: CamaraProjeto[] = proposicoes.map(proposicao => ({
      id: proposicao.id,
      uri: proposicao.uri,
      tipo: proposicao.tipo,
      numero: proposicao.numero,
      ano: proposicao.ano,
      ementa: proposicao.ementa,
      dataApresentacao: proposicao.dataApresentacao,
      uriAutores: proposicao.uriAutores,
      uriTramitacoes: proposicao.uriTramitacoes,
      url: proposicao.url || `https://www.camara.leg.br/proposicoesWeb/fichadetramitacao?idProposicao=${proposicao.id}`
    }));
    
    console.log(`📊 Projetos por tipo:`);
    const contagemPorTipo = projetos.reduce((acc, projeto) => {
      acc[projeto.tipo] = (acc[projeto.tipo] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    Object.entries(contagemPorTipo).forEach(([tipo, quantidade]) => {
      console.log(`   ${tipo}: ${quantidade} projetos`);
    });
    
    return projetos;
    
  } catch (error) {
    console.error('❌ Erro ao buscar projetos na Câmara:', error);
    
    // Em caso de erro, retornar array vazio para não quebrar o sistema
    console.log('🔄 Retornando array vazio devido ao erro...');
    return [];
  }
}

export async function POST(request: NextRequest) {
  try {
    const { force = false, useScheduler = true } = await request.json();
    
    console.log('🚀 Iniciando sincronização com a Câmara dos Deputados...');
    
    // Se usar scheduler, executar sincronização via scheduler
    if (useScheduler) {
      const result = await camaraScheduler.executeManualSync();
      
      return NextResponse.json({
        success: result.success,
        message: result.success 
          ? `Sincronização concluída: ${result.novosItens} novos itens adicionados, ${result.itensAtualizados} itens atualizados`
          : `Erro na sincronização: ${result.error}`,
        novosItens: result.novosItens,
        itensAtualizados: result.itensAtualizados,
        totalProjetos: result.totalProjetos,
        timestamp: result.timestamp,
        error: result.error
      });
    }
    
    // Método antigo (fallback)
    const projetosCamara = await buscarProjetosCamara();
    
    if (projetosCamara.length === 0) {
      console.log('⚠️ Nenhum projeto encontrado via API oficial');
      return NextResponse.json({
        success: false,
        message: 'Nenhum projeto encontrado via API oficial da Câmara dos Deputados',
        novosItens: 0,
        itensAtualizados: 0,
        totalProjetos: 0
      });
    }
    
    let novosItens = 0;
    let itensAtualizados = 0;

    for (const projeto of projetosCamara) {
      const kbId = `PROJ-${projeto.tipo}-${projeto.numero}-${projeto.ano}`;
      
      // Verificar se o projeto já existe na base
      const itemExistente = await knowledgeBaseService.getById(kbId);
      
      if (!itemExistente) {
        // Criar novo item
        const novoItem = {
          kb_id: kbId,
          titulo: `${projeto.tipo} ${projeto.numero}/${projeto.ano} - ${projeto.ementa.substring(0, 100)}... [Ver projeto](${projeto.url})`,
          conteudo: `Projeto de Lei ${projeto.tipo} ${projeto.numero}/${projeto.ano} apresentado pelo deputado Jadyel Alencar. ${projeto.ementa}`,
          resposta: `O deputado Jadyel Alencar apresentou o ${projeto.tipo} ${projeto.numero}/${projeto.ano} que ${projeto.ementa.toLowerCase()}. O projeto está em tramitação na Câmara dos Deputados.`,
          fonte: 'API Oficial da Câmara dos Deputados',
          tags: `projetos, ${projeto.tipo.toLowerCase()}, camara, legislativo, ${projeto.ano}`
        };
        
        await knowledgeBaseService.add(novoItem);
        novosItens++;
        console.log(`✅ Novo projeto adicionado: ${projeto.tipo} ${projeto.numero}/${projeto.ano}`);
      } else if (force) {
        // Atualizar item existente se forçado
        const itemAtualizado = {
          titulo: `${projeto.tipo} ${projeto.numero}/${projeto.ano} - ${projeto.ementa.substring(0, 100)}... [Ver projeto](${projeto.url})`,
          conteudo: `Projeto de Lei ${projeto.tipo} ${projeto.numero}/${projeto.ano} apresentado pelo deputado Jadyel Alencar. ${projeto.ementa}`,
          resposta: `O deputado Jadyel Alencar apresentou o ${projeto.tipo} ${projeto.numero}/${projeto.ano} que ${projeto.ementa.toLowerCase()}. O projeto está em tramitação na Câmara dos Deputados.`,
          fonte: 'API Oficial da Câmara dos Deputados',
          tags: `projetos, ${projeto.tipo.toLowerCase()}, camara, legislativo, ${projeto.ano}`
        };
        
        await knowledgeBaseService.update(kbId, itemAtualizado);
        itensAtualizados++;
        console.log(`🔄 Projeto atualizado: ${projeto.tipo} ${projeto.numero}/${projeto.ano}`);
      }
    }

    console.log(`✅ Sincronização concluída: ${novosItens} novos, ${itensAtualizados} atualizados`);

    return NextResponse.json({
      success: true,
      message: `Sincronização concluída: ${novosItens} novos itens adicionados, ${itensAtualizados} itens atualizados`,
      novosItens,
      itensAtualizados,
      totalProjetos: projetosCamara.length
    });

  } catch (error) {
    console.error('❌ Erro ao sincronizar projetos da Câmara:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor durante a sincronização' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Retornar informações sobre a última sincronização
    const items = await knowledgeBaseService.getAll();
    const projetosCamara = items.filter(item => item.fonte === 'API Oficial da Câmara dos Deputados');
    
    // Buscar status do scheduler
    const schedulerStatus = camaraScheduler.getStatus();
    const schedulerStats = camaraScheduler.getStats();
    
    return NextResponse.json({
      totalProjetos: projetosCamara.length,
      ultimaSincronizacao: new Date().toISOString(),
      projetos: projetosCamara.slice(0, 10), // Últimos 10 projetos
      scheduler: {
        status: schedulerStatus,
        stats: schedulerStats
      }
    });
  } catch (error) {
    console.error('Erro ao buscar informações de sincronização:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
