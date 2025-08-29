// Script para testar o sistema de notificações automáticas

import { solicitacoesService, whitelistService } from './src/lib/services.js';

async function testarNotificacoes() {
  console.log('🔔 Testando sistema de notificações automáticas...\n');
  
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

    // 2. Verificar solicitações existentes
    console.log('\n2️⃣ Verificando solicitações existentes...');
    const todasSolicitacoes = await solicitacoesService.getAll();
    console.log(`✅ Encontradas ${todasSolicitacoes.length} solicitações`);

    // 3. Simular aprovação com informações completas
    console.log('\n3️⃣ Simulando aprovação com informações completas...');
    if (todasSolicitacoes.length > 0) {
      const solicitacao = todasSolicitacoes[0];
      
      const respostaCompleta = `Sua solicitação foi aprovada com sucesso! O material está disponível para coleta.

📍 Local de Coleta: Sede do partido - Rua das Flores, 123, Centro
🕐 Horário: Segunda a sexta-feira, das 8h às 18h
👤 Procurar por: Ana Silva (Coordenadora de Materiais)
📅 Data de Entrega: 2024-01-20

Por favor, traga um documento de identificação para retirar o material.`;

      const resultado = await solicitacoesService.updateStatus(
        solicitacao.id, 
        'aprovada', 
        respostaCompleta, 
        '2024-01-20'
      );

      console.log(`✅ Solicitação ${solicitacao.id} aprovada com informações completas`);
      console.log(`📱 Notificação será enviada para: ${solicitacao.phone_number}`);
      console.log(`📦 Material: ${solicitacao.material_solicitado}`);
    }

    // 4. Simular rejeição
    console.log('\n4️⃣ Simulando rejeição...');
    if (todasSolicitacoes.length > 1) {
      const solicitacao = todasSolicitacoes[1];
      
      const respostaRejeicao = `Infelizmente sua solicitação não pôde ser aprovada no momento.

Motivo: Material temporariamente indisponível no estoque.

Sugestão: Entre em contato conosco em 2 semanas para verificar nova disponibilidade.`;

      const resultado = await solicitacoesService.updateStatus(
        solicitacao.id, 
        'rejeitada', 
        respostaRejeicao
      );

      console.log(`❌ Solicitação ${solicitacao.id} rejeitada`);
      console.log(`📱 Notificação será enviada para: ${solicitacao.phone_number}`);
    }

    // 5. Verificar solicitações atualizadas
    console.log('\n5️⃣ Verificando solicitações atualizadas...');
    const solicitacoesAtualizadas = await solicitacoesService.getAll();
    
    const aprovadas = solicitacoesAtualizadas.filter(s => s.status === 'aprovada');
    const rejeitadas = solicitacoesAtualizadas.filter(s => s.status === 'rejeitada');
    const pendentes = solicitacoesAtualizadas.filter(s => s.status === 'pendente');

    console.log(`📊 Status das solicitações:`);
    console.log(`- Aprovadas: ${aprovadas.length}`);
    console.log(`- Rejeitadas: ${rejeitadas.length}`);
    console.log(`- Pendentes: ${pendentes.length}`);

    // 6. Mostrar exemplo de mensagens que serão enviadas
    console.log('\n6️⃣ Exemplo de mensagens que serão enviadas:');
    
    if (aprovadas.length > 0) {
      const aprovada = aprovadas[0];
      console.log('\n📱 MENSAGEM DE APROVAÇÃO:');
      console.log(`Para: ${aprovada.phone_number}`);
      console.log(`Material: ${aprovada.material_solicitado}`);
      console.log(`Quantidade: ${aprovada.quantidade}`);
      console.log(`Resposta: ${aprovada.resposta_administrativo}`);
    }

    if (rejeitadas.length > 0) {
      const rejeitada = rejeitadas[0];
      console.log('\n📱 MENSAGEM DE REJEIÇÃO:');
      console.log(`Para: ${rejeitada.phone_number}`);
      console.log(`Material: ${rejeitada.material_solicitado}`);
      console.log(`Resposta: ${rejeitada.resposta_administrativo}`);
    }

    console.log('\n✅ Teste de notificações concluído!');
    console.log('\n📋 Resumo do que foi testado:');
    console.log('- ✅ Verificação de VIPs cadastrados');
    console.log('- ✅ Verificação de solicitações existentes');
    console.log('- ✅ Simulação de aprovação com informações completas');
    console.log('- ✅ Simulação de rejeição');
    console.log('- ✅ Verificação de status das solicitações');
    console.log('- ✅ Exemplo de mensagens que serão enviadas');
    
    console.log('\n🔔 PRÓXIMOS PASSOS:');
    console.log('1. Inicie o bot com: node bot/index.js');
    console.log('2. O serviço de notificação irá detectar as mudanças automaticamente');
    console.log('3. As mensagens serão enviadas para os líderes em até 30 segundos');
    console.log('4. Monitore os logs do bot para ver as notificações sendo enviadas');

  } catch (error) {
    console.error('❌ Erro durante o teste:', error);
  }
}

// Executar teste
testarNotificacoes();
