// Script para testar o sistema completo de marketing

import { marketingService, solicitacoesMarketingService, whitelistService } from './src/lib/services.js';

async function testarMarketing() {
  console.log('🎨 Testando sistema completo de marketing...\n');
  
  try {
    // 1. Verificar se há VIPs cadastrados
    console.log('1️⃣ Verificando VIPs cadastrados...');
    const vips = await whitelistService.getAllVips();
    console.log(`✅ Encontrados ${vips.length} VIPs cadastrados`);
    
    if (vips.length === 0) {
      console.log('⚠️ Nenhum VIP cadastrado. Adicionando VIPs de teste...');
      await whitelistService.addVip('+5511999999999', 'João Silva', 'Líder', 'São Paulo');
      await whitelistService.addVip('+5511888888888', 'Maria Santos', 'Coordenadora', 'Rio de Janeiro');
      console.log('✅ VIPs de teste adicionados');
    }

    // 2. Adicionar serviços de marketing de exemplo
    console.log('\n2️⃣ Adicionando serviços de marketing de exemplo...');
    
    const servicosExemplo = [
      {
        nome: 'Criação de Logo',
        categoria: 'Identidade Visual',
        descricao: 'Criação de logomarca personalizada para campanha',
        tempo_estimado: '3-5 dias',
        custo_estimado: 500.00,
        fornecedor: 'Design Studio ABC',
        observacoes: 'Inclui 3 propostas e 2 revisões'
      },
      {
        nome: 'Posts para Instagram',
        categoria: 'Social Media',
        descricao: 'Criação de posts para redes sociais',
        tempo_estimado: '1-2 dias',
        custo_estimado: 150.00,
        fornecedor: 'Social Media Pro',
        observacoes: 'Pacote de 10 posts'
      },
      {
        nome: 'Banner para Evento',
        categoria: 'Design Gráfico',
        descricao: 'Banner personalizado para eventos de campanha',
        tempo_estimado: '2-3 dias',
        custo_estimado: 300.00,
        fornecedor: 'Print Express',
        observacoes: 'Inclui impressão em alta qualidade'
      },
      {
        nome: 'Identidade Visual Completa',
        categoria: 'Identidade Visual',
        descricao: 'Kit completo de identidade visual',
        tempo_estimado: '7-10 dias',
        custo_estimado: 1200.00,
        fornecedor: 'Brand Studio',
        observacoes: 'Logo, cores, tipografia e aplicações'
      }
    ];

    for (const servico of servicosExemplo) {
      await marketingService.add(servico);
      console.log(`✅ Serviço adicionado: ${servico.nome}`);
    }

    // 3. Verificar serviços cadastrados
    console.log('\n3️⃣ Verificando serviços cadastrados...');
    const servicos = await marketingService.getAll();
    console.log(`✅ Total de serviços: ${servicos.length}`);

    // 4. Simular solicitações de marketing
    console.log('\n4️⃣ Simulando solicitações de marketing...');
    
    const solicitacoesExemplo = [
      {
        phone_number: '+5511999999999',
        nome_solicitante: 'João Silva',
        municipio_solicitante: 'São Paulo',
        servico_solicitado: 'Criação de Logo para campanha municipal',
        descricao_projeto: 'Preciso de uma logo moderna para a campanha de vereador. Cores: azul e branco. Deve transmitir confiança e proximidade com o povo.',
        prazo_desejado: '2024-02-15',
        valor_estimado: 500.00,
        observacoes: 'Urgente para início da campanha'
      },
      {
        phone_number: '+5511888888888',
        nome_solicitante: 'Maria Santos',
        municipio_solicitante: 'Rio de Janeiro',
        servico_solicitado: 'Posts para Instagram da campanha',
        descricao_projeto: 'Série de posts para Instagram com foco em propostas e realizações. Tom mais informal e próximo do eleitor.',
        prazo_desejado: '2024-02-10',
        valor_estimado: 300.00,
        observacoes: 'Incluir stories e reels'
      }
    ];

    for (const solicitacao of solicitacoesExemplo) {
      await solicitacoesMarketingService.add(solicitacao);
      console.log(`✅ Solicitação registrada: ${solicitacao.servico_solicitado}`);
    }

    // 5. Verificar solicitações
    console.log('\n5️⃣ Verificando solicitações...');
    const solicitacoes = await solicitacoesMarketingService.getAll();
    console.log(`✅ Total de solicitações: ${solicitacoes.length}`);

    // 6. Simular aprovação de solicitação
    console.log('\n6️⃣ Simulando aprovação de solicitação...');
    if (solicitacoes.length > 0) {
      const solicitacao = solicitacoes[0];
      
      const respostaCompleta = `Sua solicitação de marketing foi aprovada com sucesso! O projeto está em desenvolvimento.

📍 Local de Coleta: Estúdio de Design - Rua das Artes, 456, Centro
🕐 Horário: Segunda a sexta-feira, das 9h às 18h
👤 Procurar por: Ana Designer (Coordenadora de Projetos)
📅 Data de Entrega: 2024-02-15

O designer entrará em contato em breve para alinhar os detalhes do projeto.`;

      await solicitacoesMarketingService.updateStatus(
        solicitacao.id, 
        'aprovada', 
        respostaCompleta, 
        500.00, // valor_final
        '2024-02-15' // data_entrega
      );

      console.log(`✅ Solicitação ${solicitacao.id} aprovada`);
      console.log(`📱 Notificação será enviada para: ${solicitacao.phone_number}`);
    }

    // 7. Simular rejeição de solicitação
    console.log('\n7️⃣ Simulando rejeição de solicitação...');
    if (solicitacoes.length > 1) {
      const solicitacao = solicitacoes[1];
      
      const respostaRejeicao = `Infelizmente sua solicitação não pôde ser aprovada no momento.

Motivo: Prazo muito curto para o tipo de projeto solicitado.

Sugestão: Entre em contato conosco com pelo menos 2 semanas de antecedência para projetos de redes sociais.`;

      await solicitacoesMarketingService.updateStatus(
        solicitacao.id, 
        'rejeitada', 
        respostaRejeicao
      );

      console.log(`❌ Solicitação ${solicitacao.id} rejeitada`);
      console.log(`📱 Notificação será enviada para: ${solicitacao.phone_number}`);
    }

    // 8. Verificar estatísticas
    console.log('\n8️⃣ Verificando estatísticas...');
    const stats = await solicitacoesMarketingService.getStats();
    console.log('📊 Estatísticas gerais:');
    console.log(`- Total de solicitações: ${stats.total_solicitacoes}`);
    console.log(`- Pendentes: ${stats.solicitacoes_pendentes}`);
    console.log(`- Aprovadas: ${stats.solicitacoes_aprovadas}`);
    console.log(`- Rejeitadas: ${stats.solicitacoes_rejeitadas}`);
    console.log(`- Valor total estimado: R$ ${stats.valor_total_estimado}`);

    // 9. Verificar estatísticas por líder
    console.log('\n9️⃣ Verificando estatísticas por líder...');
    const statsPorLider = await solicitacoesMarketingService.getStatsPorLider();
    console.log('📊 Estatísticas por líder:');
    statsPorLider.forEach(lider => {
      console.log(`- ${lider.nome_solicitante} (${lider.municipio_solicitante}): ${lider.total_solicitacoes} solicitações, R$ ${lider.valor_total_estimado}`);
    });

    // 10. Verificar estatísticas por serviço
    console.log('\n🔟 Verificando estatísticas por serviço...');
    const statsPorServico = await solicitacoesMarketingService.getStatsPorServico();
    console.log('📊 Estatísticas por serviço:');
    statsPorServico.forEach(servico => {
      console.log(`- ${servico.servico_solicitado}: ${servico.total_solicitacoes} solicitações, R$ ${servico.valor_total_estimado}`);
    });

    console.log('\n✅ Teste de marketing concluído!');
    console.log('\n📋 Resumo do que foi testado:');
    console.log('- ✅ Verificação de VIPs cadastrados');
    console.log('- ✅ Adição de serviços de marketing');
    console.log('- ✅ Simulação de solicitações');
    console.log('- ✅ Aprovação de solicitação');
    console.log('- ✅ Rejeição de solicitação');
    console.log('- ✅ Verificação de estatísticas');
    console.log('- ✅ Estatísticas por líder');
    console.log('- ✅ Estatísticas por serviço');
    
    console.log('\n🎨 PRÓXIMOS PASSOS:');
    console.log('1. Inicie o bot com: node bot/index.js');
    console.log('2. O serviço de notificação irá detectar as mudanças automaticamente');
    console.log('3. As notificações de marketing serão enviadas para os líderes');
    console.log('4. Acesse /admin/marketing para gerenciar serviços');
    console.log('5. Acesse /admin/solicitacoes-marketing para gerenciar solicitações');

  } catch (error) {
    console.error('❌ Erro durante o teste:', error);
  }
}

// Executar teste
testarMarketing();
