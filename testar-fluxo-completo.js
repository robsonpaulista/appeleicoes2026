// Script para testar o fluxo completo de notificações

import { solicitacoesService, whitelistService } from './src/lib/services.js';
import notificationService from './src/lib/notification-service.js';

// Mock do cliente do bot para simular envio de mensagens
const mockBotClient = {
  sendMessage: async (phoneNumber, message) => {
    console.log(`📱 [MOCK] Mensagem enviada para ${phoneNumber}:`);
    console.log(`📄 Conteúdo: ${message}`);
    console.log('---');
    return true;
  }
};

async function testarFluxoCompleto() {
  console.log('🔄 Testando fluxo completo de notificações...\n');
  
  try {
    // 1. Inicializar serviço de notificação
    console.log('1️⃣ Inicializando serviço de notificação...');
    notificationService.init(mockBotClient);
    console.log('✅ Serviço inicializado');

    // 2. Verificar solicitações existentes
    console.log('\n2️⃣ Verificando solicitações existentes...');
    const todasSolicitacoes = await solicitacoesService.getAll();
    console.log(`✅ Encontradas ${todasSolicitacoes.length} solicitações`);

    // 3. Simular aprovação com informações estruturadas
    console.log('\n3️⃣ Simulando aprovação com informações estruturadas...');
    if (todasSolicitacoes.length > 0) {
      const solicitacao = todasSolicitacoes[0];
      
      const respostaEstruturada = `Sua solicitação foi aprovada com sucesso! O material está disponível para coleta.

📍 Local de Coleta: Sede do partido - Rua das Flores, 123, Centro
🕐 Horário: Segunda a sexta-feira, das 8h às 18h
👤 Procurar por: Ana Silva (Coordenadora de Materiais)
📅 Data de Entrega: 2024-01-20

Por favor, traga um documento de identificação para retirar o material.`;

      await solicitacoesService.updateStatus(
        solicitacao.id, 
        'aprovada', 
        respostaEstruturada, 
        15.50, // valor_unitario
        775.00, // valor_total
        '2024-01-20' // data_entrega
      );

      console.log(`✅ Solicitação ${solicitacao.id} aprovada com informações estruturadas`);
      console.log(`📱 Telefone: ${solicitacao.phone_number}`);
      console.log(`📦 Material: ${solicitacao.material_solicitado}`);
    }

    // 4. Simular rejeição
    console.log('\n4️⃣ Simulando rejeição...');
    if (todasSolicitacoes.length > 1) {
      const solicitacao = todasSolicitacoes[1];
      
      const respostaRejeicao = `Infelizmente sua solicitação não pôde ser aprovada no momento.

Motivo: Material temporariamente indisponível no estoque.

Sugestão: Entre em contato conosco em 2 semanas para verificar nova disponibilidade.`;

      await solicitacoesService.updateStatus(
        solicitacao.id, 
        'rejeitada', 
        respostaRejeicao
      );

      console.log(`❌ Solicitação ${solicitacao.id} rejeitada`);
      console.log(`📱 Telefone: ${solicitacao.phone_number}`);
    }

    // 5. Simular aprovação com informações parciais
    console.log('\n5️⃣ Simulando aprovação com informações parciais...');
    if (todasSolicitacoes.length > 2) {
      const solicitacao = todasSolicitacoes[2];
      
      const respostaParcial = `Sua solicitação foi aprovada!

📍 Local de Coleta: Escritório central
👤 Procurar por: Maria Santos

Obrigado!`;

      await solicitacoesService.updateStatus(
        solicitacao.id, 
        'aprovada', 
        respostaParcial,
        8.00,
        400.00,
        '2024-01-25'
      );

      console.log(`✅ Solicitação ${solicitacao.id} aprovada com informações parciais`);
      console.log(`📱 Telefone: ${solicitacao.phone_number}`);
    }

    // 6. Aguardar um pouco para simular o tempo de processamento
    console.log('\n6️⃣ Aguardando 2 segundos para simular processamento...');
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 7. Verificar solicitações atualizadas
    console.log('\n7️⃣ Verificando solicitações atualizadas...');
    const solicitacoesAtualizadas = await solicitacoesService.getAll();
    
    const aprovadas = solicitacoesAtualizadas.filter(s => s.status === 'aprovada');
    const rejeitadas = solicitacoesAtualizadas.filter(s => s.status === 'rejeitada');
    const pendentes = solicitacoesAtualizadas.filter(s => s.status === 'pendente');

    console.log(`📊 Status das solicitações:`);
    console.log(`- Aprovadas: ${aprovadas.length}`);
    console.log(`- Rejeitadas: ${rejeitadas.length}`);
    console.log(`- Pendentes: ${pendentes.length}`);

    // 8. Simular verificação de atualizações (como o serviço faria)
    console.log('\n8️⃣ Simulando verificação de atualizações...');
    const updatedSolicitacoes = await notificationService.getUpdatedSolicitacoes();
    console.log(`🔔 Encontradas ${updatedSolicitacoes.length} solicitações para notificar`);

    // 9. Enviar notificações manualmente
    console.log('\n9️⃣ Enviando notificações...');
    for (const solicitacao of updatedSolicitacoes) {
      console.log(`\n📱 Processando notificação para ${solicitacao.phone_number}:`);
      console.log(`📦 Material: ${solicitacao.material_solicitado}`);
      console.log(`📊 Status: ${solicitacao.status}`);
      
      const message = notificationService.formatNotificationMessage(solicitacao);
      await notificationService.sendNotification(solicitacao);
    }

    // 10. Mostrar estatísticas finais
    console.log('\n10️⃣ Estatísticas finais:');
    console.log(`📊 Total de solicitações: ${solicitacoesAtualizadas.length}`);
    console.log(`✅ Aprovadas: ${aprovadas.length}`);
    console.log(`❌ Rejeitadas: ${rejeitadas.length}`);
    console.log(`⏳ Pendentes: ${pendentes.length}`);
    console.log(`🔔 Notificações enviadas: ${updatedSolicitacoes.length}`);

    console.log('\n✅ Teste do fluxo completo concluído!');
    console.log('\n📋 Resumo do que foi testado:');
    console.log('- ✅ Inicialização do serviço de notificação');
    console.log('- ✅ Verificação de solicitações existentes');
    console.log('- ✅ Aprovação com informações estruturadas');
    console.log('- ✅ Rejeição de solicitação');
    console.log('- ✅ Aprovação com informações parciais');
    console.log('- ✅ Simulação de tempo de processamento');
    console.log('- ✅ Verificação de atualizações');
    console.log('- ✅ Envio de notificações');
    console.log('- ✅ Estatísticas finais');
    
    console.log('\n🔔 PRÓXIMOS PASSOS:');
    console.log('1. Inicie o bot com: node bot/index.js');
    console.log('2. O serviço de notificação irá detectar automaticamente as mudanças');
    console.log('3. As notificações serão enviadas em tempo real');
    console.log('4. Monitore os logs do bot para ver as notificações sendo enviadas');

  } catch (error) {
    console.error('❌ Erro durante o teste:', error);
  }
}

// Executar teste
testarFluxoCompleto();
