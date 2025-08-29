// Script para testar a funcionalidade de materiais

import { materiaisService } from './src/lib/services.js';

async function testarMateriais() {
  console.log('📦 Testando funcionalidade de materiais...\n');
  
  try {
    // 1. Adicionar alguns materiais de exemplo
    console.log('1️⃣ Adicionando materiais de exemplo...');
    
    const materiaisExemplo = [
      {
        nome: 'Bandeira Jadyel Alencar',
        categoria: 'BANDEIRAS',
        descricao: 'Bandeira oficial do deputado Jadyel Alencar',
        estoque_atual: 50,
        estoque_minimo: 10,
        custo_unitario: 25.00,
        fornecedor: 'Gráfica Central',
        observacoes: 'Bandeiras de alta qualidade'
      },
      {
        nome: 'Santinho Eleitoral',
        categoria: 'SANTINHOS',
        descricao: 'Santinho com foto e propostas do deputado',
        estoque_atual: 2000,
        estoque_minimo: 500,
        custo_unitario: 0.15,
        fornecedor: 'Impressão Rápida',
        observacoes: 'Papel couché 90g'
      },
      {
        nome: 'Adesivo Carro',
        categoria: 'ADESIVOS',
        descricao: 'Adesivo para colar no carro',
        estoque_atual: 300,
        estoque_minimo: 50,
        custo_unitario: 2.50,
        fornecedor: 'Adesivos Pro',
        observacoes: 'Resistente à água'
      },
      {
        nome: 'Camiseta Campanha',
        categoria: 'CAMISETAS',
        descricao: 'Camiseta com logo da campanha',
        estoque_atual: 100,
        estoque_minimo: 20,
        custo_unitario: 15.00,
        fornecedor: 'Confecções Silva',
        observacoes: 'Tamanhos P, M, G, GG'
      }
    ];

    for (const material of materiaisExemplo) {
      const resultado = await materiaisService.add(material);
      console.log(`✅ Adicionado: ${resultado.nome}`);
    }

    // 2. Listar todos os materiais
    console.log('\n2️⃣ Listando todos os materiais...');
    const todosMateriais = await materiaisService.getAll();
    console.log(`Total de materiais: ${todosMateriais.length}`);
    
    todosMateriais.forEach((material, index) => {
      console.log(`${index + 1}. ${material.nome} (${material.categoria}) - Estoque: ${material.estoque_atual}`);
    });

    // 3. Buscar por categoria
    console.log('\n3️⃣ Buscando materiais por categoria...');
    const bandeiras = await materiaisService.getByCategoria('BANDEIRAS');
    console.log(`Bandeiras encontradas: ${bandeiras.length}`);
    bandeiras.forEach(bandeira => {
      console.log(`- ${bandeira.nome}: ${bandeira.estoque_atual} unidades`);
    });

    // 4. Buscar por termo
    console.log('\n4️⃣ Buscando materiais por termo...');
    const buscaResultado = await materiaisService.search('bandeira');
    console.log(`Resultados para "bandeira": ${buscaResultado.length}`);
    buscaResultado.forEach(item => {
      console.log(`- ${item.nome} (${item.categoria})`);
    });

    // 5. Verificar estoque baixo
    console.log('\n5️⃣ Verificando materiais com estoque baixo...');
    const estoqueBaixo = await materiaisService.getEstoqueBaixo();
    console.log(`Materiais com estoque baixo: ${estoqueBaixo.length}`);
    estoqueBaixo.forEach(material => {
      console.log(`- ${material.nome}: ${material.estoque_atual}/${material.estoque_minimo}`);
    });

    // 6. Atualizar estoque
    console.log('\n6️⃣ Atualizando estoque...');
    if (todosMateriais.length > 0) {
      const primeiroMaterial = todosMateriais[0];
      const resultado = await materiaisService.updateEstoque(primeiroMaterial.id, 10);
      console.log(`✅ Estoque atualizado: ${resultado.nome} - Novo estoque: ${resultado.estoque_atual}`);
    }

    // 7. Obter estatísticas
    console.log('\n7️⃣ Obtendo estatísticas...');
    const stats = await materiaisService.getStats();
    console.log('📊 Estatísticas:');
    console.log(`- Total de materiais: ${stats.total_materiais}`);
    console.log(`- Total de categorias: ${stats.total_categorias}`);
    console.log(`- Valor total do estoque: R$ ${stats.valor_total_estoque?.toFixed(2) || '0.00'}`);
    console.log(`- Materiais com estoque baixo: ${stats.materiais_estoque_baixo}`);

    // 8. Obter categorias
    console.log('\n8️⃣ Obtendo categorias disponíveis...');
    const categorias = await materiaisService.getCategorias();
    console.log('Categorias disponíveis:', categorias);

    console.log('\n✅ Teste de materiais concluído com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro no teste:', error);
  }
}

// Executar teste
testarMateriais();
