// Script para testar a integração do bot com materiais

import { materiaisService } from './src/lib/services.js';

async function testarBotMateriais() {
  console.log('🤖 Testando integração do bot com materiais...\n');
  
  try {
    // Simular perguntas que os usuários fariam ao bot
    const perguntas = [
      'Tem bandeiras disponíveis?',
      'Quero saber sobre santinhos',
      'Preciso de adesivos',
      'Tem camisetas?',
      'Qual o estoque de materiais?',
      'Preciso de panfletos',
      'Tem bonés?'
    ];

    console.log('📝 Simulando perguntas dos usuários:\n');

    for (const pergunta of perguntas) {
      console.log(`👤 Usuário: "${pergunta}"`);
      
      // Simular a lógica do bot
      const normalizedMessage = pergunta.toLowerCase();
      
      if (normalizedMessage.includes('material') || normalizedMessage.includes('materiais') || 
          normalizedMessage.includes('bandeira') || normalizedMessage.includes('bandeiras') ||
          normalizedMessage.includes('santinho') || normalizedMessage.includes('santinhos') ||
          normalizedMessage.includes('adesivo') || normalizedMessage.includes('adesivos') ||
          normalizedMessage.includes('camiseta') || normalizedMessage.includes('camisetas') ||
          normalizedMessage.includes('boné') || normalizedMessage.includes('bonés') ||
          normalizedMessage.includes('panfleto') || normalizedMessage.includes('panfletos') ||
          normalizedMessage.includes('estoque')) {
        
        // Busca específica para materiais
        const materiais = await materiaisService.search(pergunta);
        
        if (materiais.length > 0) {
          if (materiais.length === 1) {
            const material = materiais[0];
            const resposta = `Material: ${material.nome}\nCategoria: ${material.categoria}\nEstoque: ${material.estoque_atual} unidades\nCusto: R$ ${material.custo_unitario.toFixed(2)}\nFornecedor: ${material.fornecedor || 'Não informado'}`;
            console.log(`🤖 Bot: "${resposta}"`);
          } else {
            let resposta = `Encontrei ${materiais.length} materiais relacionados:\n\n`;
            materiais.slice(0, 5).forEach((material, index) => {
              resposta += `${index + 1}. ${material.nome} (${material.categoria}) - Estoque: ${material.estoque_atual}\n`;
            });
            resposta += `\nPara mais detalhes, especifique o material desejado.`;
            console.log(`🤖 Bot: "${resposta}"`);
          }
        } else {
          console.log(`🤖 Bot: "Não encontrei materiais específicos. Posso ajudar com informações sobre projetos, realizações ou bandeiras."`);
        }
      } else {
        console.log(`🤖 Bot: "Posso ajudar com assuntos relacionados ao Deputado. Tente perguntar sobre projetos, realizações ou bandeiras."`);
      }
      
      console.log(''); // Linha em branco para separar
    }

    // Testar busca específica por categoria
    console.log('🔍 Testando busca por categorias específicas:\n');
    
    const categorias = ['BANDEIRAS', 'SANTINHOS', 'ADESIVOS', 'CAMISETAS'];
    
    for (const categoria of categorias) {
      console.log(`👤 Usuário: "Quero ${categoria.toLowerCase()}"`);
      
      const materiais = await materiaisService.getByCategoria(categoria);
      
      if (materiais.length > 0) {
        let resposta = `Materiais disponíveis em ${categoria}:\n\n`;
        materiais.forEach((material, index) => {
          resposta += `${index + 1}. ${material.nome}\n   Estoque: ${material.estoque_atual} unidades\n   Custo: R$ ${material.custo_unitario.toFixed(2)}\n\n`;
        });
        console.log(`🤖 Bot: "${resposta}"`);
      } else {
        console.log(`🤖 Bot: "Não temos ${categoria.toLowerCase()} disponíveis no momento."`);
      }
      
      console.log('');
    }

    // Testar estoque baixo
    console.log('⚠️ Testando alerta de estoque baixo:\n');
    
    const estoqueBaixo = await materiaisService.getEstoqueBaixo();
    
    if (estoqueBaixo.length > 0) {
      console.log('👤 Usuário: "Quais materiais estão com estoque baixo?"');
      let resposta = `Materiais com estoque baixo:\n\n`;
      estoqueBaixo.forEach((material, index) => {
        resposta += `${index + 1}. ${material.nome}\n   Estoque atual: ${material.estoque_atual}\n   Estoque mínimo: ${material.estoque_minimo}\n\n`;
      });
      console.log(`🤖 Bot: "${resposta}"`);
    } else {
      console.log('👤 Usuário: "Quais materiais estão com estoque baixo?"');
      console.log('🤖 Bot: "Todos os materiais estão com estoque adequado!"');
    }

    console.log('\n✅ Teste de integração concluído com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro no teste:', error);
  }
}

// Executar teste
testarBotMateriais();
