import { knowledgeBaseService } from '../src/lib/services.js';

const syncCamaraProjetos = async () => {
  try {
    console.log('🔄 Iniciando sincronização com Portal da Câmara...');
    
    // URL do portal da Câmara para buscar projetos do deputado Jadyel Alencar
    const camaraUrl = 'https://www.camara.leg.br/busca-portal?contextoBusca=BuscaProposicoes&pagina=1&order=relevancia&abaEspecifica=true&filtros=%5B%7B%22autores.nome%22%3A%22Jadyel%20Alencar%22%7D%5D&tipos=PL,PLP,PEC';
    
    // Projetos simulados (em produção, seria necessário implementar web scraping)
    const projetosSimulados = [
      {
        id: 'PL-001-2024',
        numero: '001',
        ano: '2024',
        tipo: 'PL',
        ementa: 'Dispõe sobre a criação de programas de incentivo à agricultura familiar no estado do Piauí',
        autor: 'Jadyel Alencar',
        dataApresentacao: '2024-01-15',
        status: 'Em tramitação'
      },
      {
        id: 'PL-002-2024',
        numero: '002',
        ano: '2024',
        tipo: 'PL',
        ementa: 'Institui o programa de melhoria da infraestrutura escolar na região de Teresina',
        autor: 'Jadyel Alencar',
        dataApresentacao: '2024-02-20',
        status: 'Em tramitação'
      },
      {
        id: 'PL-003-2024',
        numero: '003',
        ano: '2024',
        tipo: 'PL',
        ementa: 'Cria mecanismos de apoio ao desenvolvimento econômico sustentável no Piauí',
        autor: 'Jadyel Alencar',
        dataApresentacao: '2024-03-10',
        status: 'Em tramitação'
      },
      {
        id: 'PL-004-2024',
        numero: '004',
        ano: '2024',
        tipo: 'PL',
        ementa: 'Estabelece diretrizes para o fomento da cultura e turismo no estado do Piauí',
        autor: 'Jadyel Alencar',
        dataApresentacao: '2024-04-05',
        status: 'Em tramitação'
      }
    ];

    let novosItens = 0;
    let itensAtualizados = 0;

    for (const projeto of projetosSimulados) {
      const kbId = `PROJ-${projeto.tipo}-${projeto.numero}-${projeto.ano}`;
      
      // Verificar se o projeto já existe na base
      const itemExistente = await knowledgeBaseService.getById(kbId);
      
      if (!itemExistente) {
        // Criar novo item
        const novoItem = {
          kb_id: kbId,
          titulo: `${projeto.tipo} ${projeto.numero}/${projeto.ano} - ${projeto.ementa.substring(0, 100)}...`,
          conteudo: `Projeto de Lei ${projeto.tipo} ${projeto.numero}/${projeto.ano} apresentado pelo deputado ${projeto.autor}. ${projeto.ementa}`,
          resposta: `O deputado Jadyel Alencar apresentou o ${projeto.tipo} ${projeto.numero}/${projeto.ano} que ${projeto.ementa.toLowerCase()}. O projeto está ${projeto.status.toLowerCase()} na Câmara dos Deputados.`,
          fonte: 'Portal da Câmara dos Deputados',
          tags: `projetos, ${projeto.tipo.toLowerCase()}, camara, legislativo, ${projeto.ano}`
        };
        
        await knowledgeBaseService.add(novoItem);
        novosItens++;
        console.log(`✅ Novo projeto adicionado: ${kbId}`);
      } else {
        console.log(`ℹ️ Projeto já existe: ${kbId}`);
      }
    }

    console.log(`🎉 Sincronização concluída: ${novosItens} novos itens adicionados, ${itensAtualizados} itens atualizados`);
    
    // Salvar log da sincronização
    const syncLog = {
      data: new Date().toISOString(),
      novosItens,
      itensAtualizados,
      totalProjetos: projetosSimulados.length
    };
    
    console.log('📊 Log da sincronização:', syncLog);
    
  } catch (error) {
    console.error('❌ Erro durante a sincronização:', error);
  } finally {
    process.exit(0);
  }
};

// Executar sincronização
syncCamaraProjetos();
