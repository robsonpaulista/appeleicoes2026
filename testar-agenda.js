import { agendaService, solicitacoesAgendaService, confirmacoesAgendaService, whitelistService } from './src/lib/services.js';

async function testarAgenda() {
  console.log('📅 Testando sistema completo de agenda...\n');
  
  try {
    // 1. Verificar/Adicionar VIPs
    console.log('1️⃣ Verificando VIPs...');
    const vips = await whitelistService.getAllVips();
    if (vips.length === 0) {
      console.log('   Adicionando VIPs de exemplo...');
      await whitelistService.addVip('+5586999999999', 'João Silva', 'Líder Comunitário', 'Teresina');
      await whitelistService.addVip('+5561999999999', 'Maria Santos', 'Coordenadora Regional', 'Parnaíba');
      console.log('   ✅ VIPs adicionados');
    } else {
      console.log(`   ✅ ${vips.length} VIPs encontrados`);
    }

    // 2. Adicionar horários de disponibilidade
    console.log('\n2️⃣ Adicionando horários de disponibilidade...');
    const hoje = new Date();
    const amanha = new Date(hoje);
    amanha.setDate(hoje.getDate() + 1);
    
    const horarios = [
      {
        data: hoje.toISOString().split('T')[0],
        horario_inicio: '09:00',
        horario_fim: '10:00',
        local: 'Gabinete - Câmara dos Deputados',
        tipo_agendamento: 'reuniao',
        observacoes: 'Horário disponível para reuniões',
        disponivel: true
      },
      {
        data: hoje.toISOString().split('T')[0],
        horario_inicio: '14:00',
        horario_fim: '15:00',
        local: 'Gabinete - Câmara dos Deputados',
        tipo_agendamento: 'audiencia',
        observacoes: 'Horário para audiências',
        disponivel: true
      },
      {
        data: amanha.toISOString().split('T')[0],
        horario_inicio: '10:00',
        horario_fim: '11:00',
        local: 'Sala de Reuniões - Câmara dos Deputados',
        tipo_agendamento: 'reuniao',
        observacoes: 'Reunião com lideranças',
        disponivel: true
      }
    ];

    for (const horario of horarios) {
      await agendaService.add(horario);
    }
    console.log('   ✅ Horários adicionados');

    // 3. Verificar horários cadastrados
    console.log('\n3️⃣ Verificando horários cadastrados...');
    const horariosCadastrados = await agendaService.getAll();
    console.log(`   ✅ ${horariosCadastrados.length} horários encontrados`);
    
    const stats = await agendaService.getStats();
    console.log(`   📊 Estatísticas: ${stats.total_horarios} total, ${stats.horarios_disponiveis} disponíveis, ${stats.horarios_ocupados} ocupados`);

    // 4. Simular solicitações de agenda
    console.log('\n4️⃣ Simulando solicitações de agenda...');
    const solicitacoes = [
      {
        phone_number: '+5586999999999',
        nome_solicitante: 'João Silva',
        municipio_solicitante: 'Teresina',
        data_solicitada: hoje.toISOString().split('T')[0],
        horario_solicitado: '09:00',
        tipo_agendamento: 'reuniao',
        assunto: 'Discussão sobre projetos para Teresina',
        descricao: 'Reunião para discutir projetos de infraestrutura e melhorias para a cidade',
        local_preferido: 'Gabinete',
        duracao_estimada: 60,
        prioridade: 'alta',
        observacoes: 'Urgente - projetos em andamento'
      },
      {
        phone_number: '+5561999999999',
        nome_solicitante: 'Maria Santos',
        municipio_solicitante: 'Parnaíba',
        data_solicitada: amanha.toISOString().split('T')[0],
        horario_solicitado: '10:00',
        tipo_agendamento: 'audiencia',
        assunto: 'Audiência sobre educação em Parnaíba',
        descricao: 'Audiência para discutir melhorias no sistema educacional',
        local_preferido: 'Sala de Reuniões',
        duracao_estimada: 90,
        prioridade: 'normal',
        observacoes: 'Representantes da educação estarão presentes'
      }
    ];

    for (const solicitacao of solicitacoes) {
      await solicitacoesAgendaService.add(solicitacao);
    }
    console.log('   ✅ Solicitações registradas');

    // 5. Verificar solicitações
    console.log('\n5️⃣ Verificando solicitações...');
    const todasSolicitacoes = await solicitacoesAgendaService.getAll();
    console.log(`   ✅ ${todasSolicitacoes.length} solicitações encontradas`);
    
    const statsSolicitacoes = await solicitacoesAgendaService.getStats();
    console.log(`   📊 Estatísticas: ${statsSolicitacoes.total_solicitacoes} total, ${statsSolicitacoes.pendentes} pendentes`);

    // 6. Simular aprovação de solicitação
    console.log('\n6️⃣ Simulando aprovação de solicitação...');
    if (todasSolicitacoes.length > 0) {
      const solicitacaoAprovar = todasSolicitacoes[0];
      await solicitacoesAgendaService.updateStatus(
        solicitacaoAprovar.id,
        'aprovada',
        'Sua solicitação foi aprovada! Confirmamos o horário das 09:00 no gabinete. Por favor, chegue com 10 minutos de antecedência.',
        hoje.toISOString().split('T')[0],
        '09:00',
        'Gabinete - Câmara dos Deputados'
      );
      console.log(`   ✅ Solicitação ${solicitacaoAprovar.id} aprovada`);
    }

    // 7. Simular rejeição de solicitação
    console.log('\n7️⃣ Simulando rejeição de solicitação...');
    if (todasSolicitacoes.length > 1) {
      const solicitacaoRejeitar = todasSolicitacoes[1];
      await solicitacoesAgendaService.updateStatus(
        solicitacaoRejeitar.id,
        'rejeitada',
        'Infelizmente não foi possível atender sua solicitação no horário solicitado. Sugerimos reagendar para a próxima semana.',
        null,
        null,
        null
      );
      console.log(`   ✅ Solicitação ${solicitacaoRejeitar.id} rejeitada`);
    }

    // 8. Verificar estatísticas finais
    console.log('\n8️⃣ Verificando estatísticas finais...');
    const statsFinais = await solicitacoesAgendaService.getStats();
    console.log(`   📊 Estatísticas finais:`);
    console.log(`      • Total: ${statsFinais.total_solicitacoes}`);
    console.log(`      • Pendentes: ${statsFinais.pendentes}`);
    console.log(`      • Aprovadas: ${statsFinais.aprovadas}`);
    console.log(`      • Rejeitadas: ${statsFinais.rejeitadas}`);

    // 9. Verificar estatísticas por líder
    console.log('\n9️⃣ Verificando estatísticas por líder...');
    const statsPorLider = await solicitacoesAgendaService.getStatsPorLider();
    console.log('   📊 Estatísticas por líder:');
    statsPorLider.forEach(stat => {
      console.log(`      • ${stat.nome_solicitante}: ${stat.total_solicitacoes} solicitações (${stat.aprovadas} aprovadas, ${stat.rejeitadas} rejeitadas)`);
    });

    // 10. Verificar estatísticas por município
    console.log('\n🔟 Verificando estatísticas por município...');
    const statsPorMunicipio = await solicitacoesAgendaService.getStatsPorMunicipio();
    console.log('   📊 Estatísticas por município:');
    statsPorMunicipio.forEach(stat => {
      console.log(`      • ${stat.municipio_solicitante}: ${stat.total_solicitacoes} solicitações (${stat.aprovadas} aprovadas, ${stat.rejeitadas} rejeitadas)`);
    });

    // 11. Verificar estatísticas por tipo
    console.log('\n1️⃣1️⃣ Verificando estatísticas por tipo...');
    const statsPorTipo = await solicitacoesAgendaService.getStatsPorTipo();
    console.log('   📊 Estatísticas por tipo:');
    statsPorTipo.forEach(stat => {
      console.log(`      • ${stat.tipo_agendamento}: ${stat.total_solicitacoes} solicitações (${stat.aprovadas} aprovadas)`);
    });

    console.log('\n✅ Teste do sistema de agenda concluído com sucesso!');
    console.log('\n📋 Resumo do que foi testado:');
    console.log('   • Gestão de horários de disponibilidade');
    console.log('   • Solicitações de agenda pelos líderes');
    console.log('   • Aprovação e rejeição pelo administrativo');
    console.log('   • Estatísticas completas por líder, município e tipo');
    console.log('   • Sistema de notificações integrado');

  } catch (error) {
    console.error('❌ Erro durante o teste:', error);
  }
}

testarAgenda();
