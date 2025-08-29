// Script para testar o sistema completo de dashboard com estatísticas

import { solicitacoesService, entregasService, whitelistService } from './src/lib/services.js';

async function testarDashboardCompleto() {
  console.log('📊 Testando sistema completo de dashboard...\n');
  
  try {
    // 1. Adicionar alguns VIPs para teste
    console.log('1️⃣ Adicionando VIPs para teste...');
    const vips = [
      { phone: '+5511999999999', name: 'João Silva', role: 'Líder', municipio: 'São Paulo' },
      { phone: '+5511888888888', name: 'Maria Santos', role: 'Coordenadora', municipio: 'Rio de Janeiro' },
      { phone: '+5511777777777', name: 'Pedro Costa', role: 'Líder', municipio: 'Belo Horizonte' },
      { phone: '+5511666666666', name: 'Ana Oliveira', role: 'Coordenadora', municipio: 'Salvador' },
      { phone: '+5511555555555', name: 'Carlos Lima', role: 'Líder', municipio: 'Brasília' }
    ];

    for (const vip of vips) {
      try {
        await whitelistService.addVip(vip.phone, vip.name, vip.role, vip.municipio);
        console.log(`✅ VIP adicionado: ${vip.name} - ${vip.municipio}`);
      } catch (error) {
        console.log(`⚠️ VIP já existe: ${vip.name}`);
      }
    }

    // 2. Simular solicitações com valores
    console.log('\n2️⃣ Simulando solicitações com valores...');
    const solicitacoesComValores = [
      {
        phone_number: '+5511999999999',
        nome_solicitante: 'João Silva',
        municipio_solicitante: 'São Paulo',
        material_solicitado: 'Bandeiras para evento de domingo',
        quantidade: 50,
        valor_unitario: 15.00,
        valor_total: 750.00,
        observacoes: 'Evento importante no centro da cidade'
      },
      {
        phone_number: '+5511888888888',
        nome_solicitante: 'Maria Santos',
        municipio_solicitante: 'Rio de Janeiro',
        material_solicitado: 'Santinhos para distribuir na feira',
        quantidade: 1000,
        valor_unitario: 0.50,
        valor_total: 500.00,
        observacoes: 'Feira municipal no sábado'
      },
      {
        phone_number: '+5511777777777',
        nome_solicitante: 'Pedro Costa',
        municipio_solicitante: 'Belo Horizonte',
        material_solicitado: 'Adesivos para colar nos carros',
        quantidade: 200,
        valor_unitario: 2.00,
        valor_total: 400.00,
        observacoes: 'Campanha de rua'
      },
      {
        phone_number: '+5511666666666',
        nome_solicitante: 'Ana Oliveira',
        municipio_solicitante: 'Salvador',
        material_solicitado: 'Camisetas para a equipe',
        quantidade: 20,
        valor_unitario: 25.00,
        valor_total: 500.00,
        observacoes: 'Equipe de voluntários'
      },
      {
        phone_number: '+5511555555555',
        nome_solicitante: 'Carlos Lima',
        municipio_solicitante: 'Brasília',
        material_solicitado: 'Bonés para distribuição',
        quantidade: 100,
        valor_unitario: 12.00,
        valor_total: 1200.00,
        observacoes: 'Evento de inauguração'
      },
      {
        phone_number: '+5511999999999',
        nome_solicitante: 'João Silva',
        municipio_solicitante: 'São Paulo',
        material_solicitado: 'Panfletos para campanha',
        quantidade: 500,
        valor_unitario: 0.30,
        valor_total: 150.00,
        observacoes: 'Segunda solicitação do João'
      }
    ];

    for (const solicitacao of solicitacoesComValores) {
      const resultado = await solicitacoesService.add(solicitacao);
      console.log(`✅ Solicitação registrada: ${resultado.nome_solicitante} - ${resultado.material_solicitado} - R$ ${resultado.valor_total}`);
    }

    // 3. Simular aprovações e rejeições
    console.log('\n3️⃣ Simulando aprovações e rejeições...');
    const todasSolicitacoes = await solicitacoesService.getAll();
    
    // Aprovar algumas solicitações
    const aprovacoes = [
      { id: todasSolicitacoes[0].id, resposta: 'Solicitação aprovada! Entraremos em contato para combinar a entrega.' },
      { id: todasSolicitacoes[1].id, resposta: 'Aprovado! Temos o material disponível.' },
      { id: todasSolicitacoes[2].id, resposta: 'Solicitação aprovada com sucesso.' }
    ];

    for (const aprovacao of aprovacoes) {
      await solicitacoesService.updateStatus(aprovacao.id, 'aprovada', aprovacao.resposta, '2024-01-15');
      console.log(`✅ Solicitação ${aprovacao.id} aprovada`);
    }

    // Rejeitar uma solicitação
    await solicitacoesService.updateStatus(todasSolicitacoes[3].id, 'rejeitada', 'Infelizmente não temos este material disponível no momento.');
    console.log(`❌ Solicitação ${todasSolicitacoes[3].id} rejeitada`);

    // 4. Simular entregas realizadas
    console.log('\n4️⃣ Simulando entregas realizadas...');
    const entregas = [
      {
        solicitacao_id: todasSolicitacoes[0].id,
        phone_number: '+5511999999999',
        nome_solicitante: 'João Silva',
        municipio_solicitante: 'São Paulo',
        material_entregue: 'Bandeiras para evento de domingo',
        quantidade_entregue: 50,
        valor_unitario: 15.00,
        valor_total_entregue: 750.00,
        data_entrega: '2024-01-15',
        responsavel_entrega: 'Equipe de Logística',
        observacoes_entrega: 'Entregue no local do evento'
      },
      {
        solicitacao_id: todasSolicitacoes[1].id,
        phone_number: '+5511888888888',
        nome_solicitante: 'Maria Santos',
        municipio_solicitante: 'Rio de Janeiro',
        material_entregue: 'Santinhos para distribuir na feira',
        quantidade_entregue: 1000,
        valor_unitario: 0.50,
        valor_total_entregue: 500.00,
        data_entrega: '2024-01-16',
        responsavel_entrega: 'Equipe de Logística',
        observacoes_entrega: 'Entregue na sede do partido'
      }
    ];

    for (const entrega of entregas) {
      const resultado = await entregasService.add(entrega);
      console.log(`✅ Entrega registrada: ${resultado.nome_solicitante} - R$ ${resultado.valor_total_entregue}`);
    }

    // 5. Testar estatísticas gerais
    console.log('\n5️⃣ Testando estatísticas gerais...');
    const statsSolicitacoes = await solicitacoesService.getStats();
    console.log('📊 Estatísticas de Solicitações:');
    console.log(`- Total: ${statsSolicitacoes.total_solicitacoes}`);
    console.log(`- Pendentes: ${statsSolicitacoes.solicitacoes_pendentes}`);
    console.log(`- Aprovadas: ${statsSolicitacoes.solicitacoes_aprovadas}`);
    console.log(`- Rejeitadas: ${statsSolicitacoes.solicitacoes_rejeitadas}`);
    console.log(`- Valor total solicitado: R$ ${statsSolicitacoes.valor_total_solicitado}`);
    console.log(`- Valor total aprovado: R$ ${statsSolicitacoes.valor_total_aprovado}`);

    // 6. Testar estatísticas por líder
    console.log('\n6️⃣ Testando estatísticas por líder...');
    const statsPorLider = await solicitacoesService.getStatsPorLider();
    console.log('👥 Estatísticas por Líder:');
    statsPorLider.forEach(lider => {
      console.log(`- ${lider.nome_solicitante} (${lider.municipio_solicitante}):`);
      console.log(`  * Solicitações: ${lider.total_solicitacoes}`);
      console.log(`  * Aprovadas: ${lider.solicitacoes_aprovadas}`);
      console.log(`  * Valor solicitado: R$ ${lider.valor_total_solicitado}`);
      console.log(`  * Valor aprovado: R$ ${lider.valor_total_aprovado}`);
    });

    // 7. Testar estatísticas por município
    console.log('\n7️⃣ Testando estatísticas por município...');
    const statsPorMunicipio = await solicitacoesService.getStatsPorMunicipio();
    console.log('🏙️ Estatísticas por Município:');
    statsPorMunicipio.forEach(municipio => {
      console.log(`- ${municipio.municipio_solicitante}:`);
      console.log(`  * Líderes: ${municipio.total_lideres}`);
      console.log(`  * Solicitações: ${municipio.total_solicitacoes}`);
      console.log(`  * Valor solicitado: R$ ${municipio.valor_total_solicitado}`);
      console.log(`  * Valor aprovado: R$ ${municipio.valor_total_aprovado}`);
      console.log(`  * Valor médio: R$ ${municipio.valor_medio_por_solicitacao}`);
    });

    // 8. Testar estatísticas por material
    console.log('\n8️⃣ Testando estatísticas por material...');
    const statsPorMaterial = await solicitacoesService.getStatsPorMaterial();
    console.log('📦 Estatísticas por Material:');
    statsPorMaterial.forEach(material => {
      console.log(`- ${material.material_solicitado}:`);
      console.log(`  * Solicitações: ${material.total_solicitacoes}`);
      console.log(`  * Quantidade solicitada: ${material.quantidade_total_solicitada}`);
      console.log(`  * Quantidade aprovada: ${material.quantidade_aprovada}`);
      console.log(`  * Valor solicitado: R$ ${material.valor_total_solicitado}`);
      console.log(`  * Valor aprovado: R$ ${material.valor_total_aprovado}`);
      console.log(`  * Valor médio unitário: R$ ${material.valor_medio_unitario}`);
    });

    // 9. Testar estatísticas de entregas
    console.log('\n9️⃣ Testando estatísticas de entregas...');
    const statsEntregas = await entregasService.getStats();
    console.log('🚚 Estatísticas de Entregas:');
    console.log(`- Total de entregas: ${statsEntregas.total_entregas}`);
    console.log(`- Quantidade total entregue: ${statsEntregas.quantidade_total_entregue}`);
    console.log(`- Valor total entregue: R$ ${statsEntregas.valor_total_entregue}`);
    console.log(`- Líderes atendidos: ${statsEntregas.total_lideres_atendidos}`);
    console.log(`- Municípios atendidos: ${statsEntregas.total_municipios_atendidos}`);
    console.log(`- Valor médio por entrega: R$ ${statsEntregas.valor_medio_por_entrega}`);

    // 10. Testar estatísticas de entregas por líder
    console.log('\n🔟 Testando estatísticas de entregas por líder...');
    const statsEntregasPorLider = await entregasService.getStatsPorLider();
    console.log('👥 Entregas por Líder:');
    statsEntregasPorLider.forEach(lider => {
      console.log(`- ${lider.nome_solicitante} (${lider.municipio_solicitante}):`);
      console.log(`  * Entregas: ${lider.total_entregas}`);
      console.log(`  * Quantidade entregue: ${lider.quantidade_total_entregue}`);
      console.log(`  * Valor entregue: R$ ${lider.valor_total_entregue}`);
      console.log(`  * Valor médio: R$ ${lider.valor_medio_por_entrega}`);
    });

    console.log('\n✅ Teste do dashboard completo concluído com sucesso!');
    console.log('\n📋 Resumo do que foi testado:');
    console.log('- ✅ Adição de VIPs');
    console.log('- ✅ Solicitações com valores');
    console.log('- ✅ Aprovações e rejeições');
    console.log('- ✅ Registro de entregas');
    console.log('- ✅ Estatísticas gerais');
    console.log('- ✅ Estatísticas por líder');
    console.log('- ✅ Estatísticas por município');
    console.log('- ✅ Estatísticas por material');
    console.log('- ✅ Estatísticas de entregas');
    console.log('- ✅ Estatísticas de entregas por líder');
    
  } catch (error) {
    console.error('❌ Erro durante o teste:', error);
  }
}

// Executar teste
testarDashboardCompleto();
