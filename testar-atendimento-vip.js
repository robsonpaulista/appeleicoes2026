// Script para testar o atendimento personalizado para VIPs

import { whitelistService, knowledgeBaseService } from './src/lib/services.js';

async function testarAtendimentoVIP() {
  console.log('🤖 Testando atendimento personalizado para VIPs...\n');
  
  try {
    // Simular número VIP
    const phoneNumberVIP = '+5511999999999';
    const phoneNumberGeral = '+5511888888888';
    
    // Verificar se o VIP existe
    const isVip = await whitelistService.isVip(phoneNumberVIP);
    console.log(`📱 Número ${phoneNumberVIP} é VIP? ${isVip ? '✅ Sim' : '❌ Não'}`);
    
    if (isVip) {
      // Buscar informações do VIP
      const vipInfo = await whitelistService.getVipInfo(phoneNumberVIP);
      console.log('👤 Informações do VIP:', vipInfo);
      
      // Simular saudação personalizada
      const nome = vipInfo?.name || 'Líder';
      const saudacaoVIP = `Olá ${nome}! Bem-vindo ao gabinete do deputado Jadyel Alencar, será um prazer atendê-lo. Como posso ajudá-lo?`;
      console.log('\n🤖 Saudação VIP:', saudacaoVIP);
    }
    
    // Verificar usuário geral
    const isVipGeral = await whitelistService.isVip(phoneNumberGeral);
    console.log(`\n📱 Número ${phoneNumberGeral} é VIP? ${isVipGeral ? '✅ Sim' : '❌ Não'}`);
    
    if (!isVipGeral) {
      const saudacaoGeral = 'Olá! Bem-vindo ao gabinete do deputado Jadyel Alencar, será um prazer atendê-lo. Posso ajudar com informações sobre projetos, realizações e bandeiras. Digite "menu" para ver as opções.';
      console.log('\n🤖 Saudação Geral:', saudacaoGeral);
    }
    
    // Testar busca de projetos
    console.log('\n📋 Testando busca de projetos...');
    const projetos = await knowledgeBaseService.searchProjetos();
    console.log(`Encontrados ${projetos.length} projetos`);
    
    if (projetos.length > 0) {
      console.log('📋 Projetos encontrados:');
      projetos.slice(0, 3).forEach((projeto, index) => {
        console.log(`   ${index + 1}. ${projeto.titulo}`);
      });
    }
    
    // Testar busca específica do PL-2628
    console.log('\n🔍 Testando busca específica do PL-2628...');
    const pl2628 = await knowledgeBaseService.search('PL-2628');
    
    if (pl2628.length > 0) {
      console.log('✅ PL-2628 encontrado!');
      console.log('📋 Título:', pl2628[0].titulo);
      console.log('🏷️ Tags:', pl2628[0].tags);
    } else {
      console.log('❌ PL-2628 não encontrado');
    }
    
    console.log('\n✅ Teste concluído com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro no teste:', error);
  }
}

// Executar teste
testarAtendimentoVIP();
