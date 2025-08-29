// Script para limpar TODOS os itens da base de dados
const BASE_URL = 'http://localhost:3003';

async function limparTudo() {
  try {
    console.log('🧹 Iniciando limpeza completa da base de dados...');
    
    // Buscar todos os itens
    const response = await fetch(`${BASE_URL}/api/knowledge`);
    const items = await response.json();
    
    console.log(`📊 Encontrados ${items.length} itens na base de dados`);
    
    if (items.length === 0) {
      console.log('✅ Base de dados já está vazia!');
      return;
    }
    
    console.log(`🗑️ Removendo TODOS os ${items.length} itens...`);
    
    // Remover cada item
    for (const item of items) {
      try {
        const deleteResponse = await fetch(`${BASE_URL}/api/knowledge/${encodeURIComponent(item.kb_id)}`, {
          method: 'DELETE'
        });
        
        if (deleteResponse.ok) {
          console.log(`✅ Removido: ${item.kb_id} - ${item.titulo}`);
        } else {
          console.log(`❌ Erro ao remover: ${item.kb_id}`);
        }
      } catch (error) {
        console.log(`❌ Erro ao remover ${item.kb_id}:`, error.message);
      }
    }
    
    console.log('🎉 Limpeza completa concluída!');
    
    // Verificar resultado final
    const finalResponse = await fetch(`${BASE_URL}/api/knowledge`);
    const finalItems = await finalResponse.json();
    
    console.log(`📊 Resultado final: ${finalItems.length} itens restantes`);
    
    if (finalItems.length === 0) {
      console.log('✅ Base de dados completamente limpa!');
    }
    
  } catch (error) {
    console.error('❌ Erro durante a limpeza:', error);
  }
}

limparTudo();
