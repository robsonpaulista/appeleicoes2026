// Script para testar o sistema de solicitações de materiais

import { solicitacoesService, whitelistService } from './src/lib/services.js';

async function testarSolicitacoes() {
  console.log('📋 Testando sistema de solicitações de materiais...\n');
  
  try {
    // 1. Simular solicitações de diferentes lideranças
    console.log('1️⃣ Simulando solicitações de lideranças...');
    
    const solicitacoesExemplo = [
      {
        phone_number: '+5511999999999',
        nome_solicitante: 'João Silva',
        material_solicitado: 'Preciso de 50 bandeiras para o evento de domingo',
        quantidade: 50,
        observacoes: 'Evento importante no centro da cidade'
      },
      {
        phone_number: '+5511888888888',
        nome_solicitante: 'Maria Santos',
        material_solicitado: 'Quero santinhos para distribuir na feira',
        quantidade: 1000,
        observacoes: 'Feira municipal no sábado'
      },
      {
        phone_number: '+5511777777777',
        nome_solicitante: 'Pedro Costa',
        material_solicitado: 'Solicito adesivos para colar nos carros',
        quantidade: 200,
        observacoes: 'Campanha de rua'
      },
      {
        phone_number: '+5511666666666',
        nome_solicitante: 'Ana Oliveira',
        material_solicitado: 'Preciso de camisetas para a equipe',
        quantidade: 20,
        observacoes: 'Equipe de voluntários'
      }
    ];

    for (const solicitacao of solicitacoesExemplo) {
      const resultado = await solicitacoesService.add(solicitacao);
      console.log(`✅ Solicitação registrada: ${resultado.nome_solicitante} - ${resultado.material_solicitado}`);
    }

    // 2. Listar todas as solicitações
    console.log('\n2️⃣ Listando todas as solicitações...');
    const todasSolicitacoes = await solicitacoesService.getAll();
    console.log(`Total de solicitações: ${todasSolicitacoes.length}`);
    
    todasSolicitacoes.forEach((solicitacao, index) => {
      console.log(`${index + 1}. ${solicitacao.nome_solicitante} - ${solicitacao.material_solicitado} (${solicitacao.status})`);
    });

    // 3. Buscar solicitações por status
    console.log('\n3️⃣ Buscando solicitações pendentes...');
    const pendentes = await solicitacoesService.getByStatus('pendente');
    console.log(`Solicitações pendentes: ${pendentes.length}`);
    pendentes.forEach(solicitacao => {
      console.log(`- ${solicitacao.nome_solicitante}: ${solicitacao.material_solicitado}`);
    });

    // 4. Simular resposta administrativa (aprovar uma solicitação)
    console.log('\n4️⃣ Simulando resposta administrativa...');
    if (todasSolicitacoes.length > 0) {
      const primeiraSolicitacao = todasSolicitacoes[0];
      const resultado = await solicitacoesService.updateStatus(
        primeiraSolicitacao.id, 
        'aprovada', 
        'Solicitação aprovada! Entraremos em contato para combinar a entrega.'
      );
      console.log(`✅ Solicitação ${primeiraSolicitacao.id} aprovada: ${resultado.resposta_administrativo}`);
    }

    // 5. Simular resposta administrativa (rejeitar uma solicitação)
    console.log('\n5️⃣ Simulando rejeição de solicitação...');
    if (todasSolicitacoes.length > 1) {
      const segundaSolicitacao = todasSolicitacoes[1];
      const resultado = await solicitacoesService.updateStatus(
        segundaSolicitacao.id, 
        'rejeitada', 
        'Infelizmente não temos este material disponível no momento. Tentaremos repor o estoque em breve.'
      );
      console.log(`❌ Solicitação ${segundaSolicitacao.id} rejeitada: ${resultado.resposta_administrativo}`);
    }

    // 6. Obter estatísticas atualizadas
    console.log('\n6️⃣ Obtendo estatísticas atualizadas...');
    const stats = await solicitacoesService.getStats();
    console.log('📊 Estatísticas das solicitações:');
    console.log(`- Total de solicitações: ${stats.total_solicitacoes}`);
    console.log(`- Solicitações pendentes: ${stats.solicitacoes_pendentes}`);
    console.log(`- Solicitações aprovadas: ${stats.solicitacoes_aprovadas}`);
    console.log(`- Solicitações rejeitadas: ${stats.solicitacoes_rejeitadas}`);

    // 7. Simular fluxo completo do bot
    console.log('\n7️⃣ Simulando fluxo completo do bot...');
    
    const mensagensBot = [
      'Preciso de bandeiras para o evento',
      'Quero santinhos para distribuir',
      'Solicito adesivos para campanha',
      'Preciso de camisetas para a equipe'
    ];

    for (const mensagem of mensagensBot) {
      console.log(`👤 Líder: "${mensagem}"`);
      
      // Simular a lógica do bot
      const normalizedMessage = mensagem.toLowerCase();
      
      if (normalizedMessage.includes('material') || normalizedMessage.includes('materiais') || 
          normalizedMessage.includes('bandeira') || normalizedMessage.includes('bandeiras') ||
          normalizedMessage.includes('santinho') || normalizedMessage.includes('santinhos') ||
          normalizedMessage.includes('adesivo') || normalizedMessage.includes('adesivos') ||
          normalizedMessage.includes('camiseta') || normalizedMessage.includes('camisetas') ||
          normalizedMessage.includes('boné') || normalizedMessage.includes('bonés') ||
          normalizedMessage.includes('panfleto') || normalizedMessage.includes('panfletos') ||
          normalizedMessage.includes('preciso') || normalizedMessage.includes('quero') ||
          normalizedMessage.includes('solicito') || normalizedMessage.includes('solicitação')) {
        
        // Registrar solicitação de material
        const solicitacao = await solicitacoesService.add({
          phone_number: '+5511555555555',
          nome_solicitante: 'Líder Teste',
          material_solicitado: mensagem,
          quantidade: 1,
          observacoes: `Solicitação via bot: ${mensagem}`
        });
        
        console.log(`🤖 Bot: "Solicitação registrada com sucesso! Sua solicitação de material foi enviada para o administrativo. Em breve entraremos em contato para confirmar a disponibilidade."`);
      } else {
        console.log(`🤖 Bot: "Posso ajudar com assuntos relacionados ao Deputado. Tente perguntar sobre projetos, realizações ou bandeiras."`);
      }
      
      console.log(''); // Linha em branco para separar
    }

    console.log('\n✅ Teste de solicitações concluído com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro no teste:', error);
  }
}

// Executar teste
testarSolicitacoes();
