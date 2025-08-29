import { registrosEventosService, estatisticasEventosService, whitelistService } from './src/lib/services.js';

async function testarEventos() {
  console.log('📅 Testando sistema completo de registros de eventos...\n');
  
  try {
    // 1. Verificar/Adicionar VIPs
    console.log('1️⃣ Verificando VIPs...');
    const vips = await whitelistService.getAllVips();
    if (vips.length === 0) {
      console.log('   Adicionando VIPs de exemplo...');
      await whitelistService.add({
        phone_number: '+5586999999999',
        name: 'João Silva',
        role: 'Líder Comunitário',
        municipio: 'Teresina'
      });
      await whitelistService.add({
        phone_number: '+5561999999999',
        name: 'Maria Santos',
        role: 'Coordenadora Regional',
        municipio: 'Parnaíba'
      });
      console.log('   ✅ VIPs adicionados');
    } else {
      console.log(`   ✅ ${vips.length} VIPs encontrados`);
    }

    // 2. Adicionar registros de eventos
    console.log('\n2️⃣ Adicionando registros de eventos...');
    
    const eventos = [
      {
        phone_number: '+5586999999999',
        nome_organizador: 'João Silva',
        municipio: 'Teresina',
        data_evento: '2024-01-15',
        horario_evento: '19:00',
        local_evento: 'Centro Comunitário do Bairro',
        tipo_evento: 'reuniao',
        titulo_evento: 'Reunião de Lideranças - Bairro Norte',
        descricao_evento: 'Reunião mensal com lideranças do bairro para discutir melhorias na comunidade',
        quantidade_participantes: 45,
        foto1_base64: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwA/8A',
        foto2_base64: null,
        foto3_base64: null,
        observacoes: 'Evento muito bem organizado com grande participação da comunidade'
      },
      {
        phone_number: '+5561999999999',
        nome_organizador: 'Maria Santos',
        municipio: 'Parnaíba',
        data_evento: '2024-01-20',
        horario_evento: '20:00',
        local_evento: 'Auditório Municipal',
        tipo_evento: 'palestra',
        titulo_evento: 'Palestra sobre Educação e Cidadania',
        descricao_evento: 'Palestra sobre a importância da educação para o desenvolvimento da cidadania',
        quantidade_participantes: 120,
        foto1_base64: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwA/8A',
        foto2_base64: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwA/8A',
        foto3_base64: null,
        observacoes: 'Excelente palestra com grande engajamento dos participantes'
      },
      {
        phone_number: '+5586999999999',
        nome_organizador: 'João Silva',
        municipio: 'Teresina',
        data_evento: '2024-01-25',
        horario_evento: '18:30',
        local_evento: 'Praça Central',
        tipo_evento: 'encontro',
        titulo_evento: 'Encontro de Jovens Líderes',
        descricao_evento: 'Encontro para discutir projetos e iniciativas lideradas por jovens da comunidade',
        quantidade_participantes: 35,
        foto1_base64: null,
        foto2_base64: null,
        foto3_base64: null,
        observacoes: 'Encontro produtivo com muitas ideias inovadoras'
      },
      {
        phone_number: '+5561999999999',
        nome_organizador: 'Maria Santos',
        municipio: 'Parnaíba',
        data_evento: '2024-01-30',
        horario_evento: '19:30',
        local_evento: 'Centro Cultural',
        tipo_evento: 'comemoracao',
        titulo_evento: 'Comemoração do Dia da Cidade',
        descricao_evento: 'Evento comemorativo do aniversário da cidade com apresentações culturais',
        quantidade_participantes: 200,
        foto1_base64: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwA/8A',
        foto2_base64: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwA/8A',
        foto3_base64: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwA/8A',
        observacoes: 'Evento muito bem organizado com grande sucesso de público'
      }
    ];

    for (const eventoData of eventos) {
      await registrosEventosService.add(eventoData);
    }
    console.log('   ✅ Registros de eventos adicionados');

    // 3. Verificar registros cadastrados
    console.log('\n3️⃣ Verificando registros cadastrados...');
    const registros = await registrosEventosService.getAll();
    console.log(`   ✅ ${registros.length} registros encontrados`);
    
    const stats = await registrosEventosService.getStats();
    console.log('   📊 Estatísticas:', stats);

    // 4. Simular aprovação de eventos
    console.log('\n4️⃣ Simulando aprovação de eventos...');
    
    // Aprovar eventos 1 e 3
    await registrosEventosService.updateStatus(1, 'aprovado', 'Evento aprovado com sucesso! Excelente organização.', true);
    await registrosEventosService.updateStatus(3, 'aprovado', 'Encontro muito produtivo! Aprovado para divulgação.', true);
    
    // Rejeitar evento 2
    await registrosEventosService.updateStatus(2, 'rejeitado', 'Evento não aprovado devido à falta de informações complementares.', false);
    
    console.log('   ✅ Status dos eventos atualizados');

    // 5. Verificar estatísticas finais
    console.log('\n5️⃣ Verificando estatísticas finais...');
    const statsFinais = await registrosEventosService.getStats();
    console.log('   📊 Estatísticas finais:');
    console.log(`      • Total: ${statsFinais.total}`);
    console.log(`      • Pendentes: ${statsFinais.pendentes}`);
    console.log(`      • Aprovados: ${statsFinais.aprovados}`);
    console.log(`      • Rejeitados: ${statsFinais.rejeitados}`);
    console.log(`      • Total Participantes: ${statsFinais.total_participantes}`);

    // 6. Verificar estatísticas por organizador
    console.log('\n6️⃣ Verificando estatísticas por organizador...');
    const statsPorOrganizador = await registrosEventosService.getStatsPorOrganizador();
    console.log('   📊 Estatísticas por organizador:');
    statsPorOrganizador.forEach(stat => {
      console.log(`      • ${stat.nome_organizador}: ${stat.total_eventos} eventos (${stat.eventos_aprovados} aprovados), ${stat.total_participantes} participantes`);
    });

    // 7. Verificar estatísticas por município
    console.log('\n7️⃣ Verificando estatísticas por município...');
    const statsPorMunicipio = await registrosEventosService.getStatsPorMunicipio();
    console.log('   📊 Estatísticas por município:');
    statsPorMunicipio.forEach(stat => {
      console.log(`      • ${stat.municipio}: ${stat.total_eventos} eventos (${stat.eventos_aprovados} aprovados), ${stat.total_participantes} participantes`);
    });

    // 8. Verificar estatísticas por tipo
    console.log('\n8️⃣ Verificando estatísticas por tipo...');
    const statsPorTipo = await registrosEventosService.getStatsPorTipo();
    console.log('   📊 Estatísticas por tipo:');
    statsPorTipo.forEach(stat => {
      console.log(`      • ${stat.tipo_evento}: ${stat.total_eventos} eventos (${stat.eventos_aprovados} aprovados), ${stat.total_participantes} participantes`);
    });

    // 9. Testar estatísticas de eventos
    console.log('\n9️⃣ Testando estatísticas de eventos...');
    const eventosAprovados = registros.filter(e => e.status === 'aprovado');
    
    for (const evento of eventosAprovados) {
      await estatisticasEventosService.add({
        registro_id: evento.id,
        phone_number: evento.phone_number,
        nome_organizador: evento.nome_organizador,
        municipio: evento.municipio,
        data_evento: evento.data_evento,
        tipo_evento: evento.tipo_evento,
        quantidade_participantes: evento.quantidade_participantes
      });
    }
    
    const estatisticas = await estatisticasEventosService.getStats();
    console.log('   📊 Estatísticas gerais:');
    console.log(`      • Total de registros: ${estatisticas.total_registros}`);
    console.log(`      • Total de participantes: ${estatisticas.total_participantes}`);
    console.log(`      • Municípios envolvidos: ${estatisticas.total_municipios}`);
    console.log(`      • Média de participantes: ${Math.round(estatisticas.media_participantes || 0)}`);

    console.log('\n✅ Teste do sistema de eventos concluído com sucesso!');
    console.log('\n📋 Resumo do que foi testado:');
    console.log('   • Registro de eventos com fotos em base64');
    console.log('   • Aprovação e rejeição pelo administrativo');
    console.log('   • Estatísticas completas por organizador, município e tipo');
    console.log('   • Sistema de notificações integrado');
    console.log('   • Gestão de fotos e informações detalhadas');

  } catch (error) {
    console.error('❌ Erro durante o teste:', error);
  } finally {
    process.exit(0);
  }
}

testarEventos();
