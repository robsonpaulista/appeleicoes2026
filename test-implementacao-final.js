// Teste final da implementação da API da Câmara
import fetch from 'node-fetch';

const BASE = "https://dadosabertos.camara.leg.br/api/v2";

const defaultInit = {
  headers: {
    "Accept": "application/json",
    "User-Agent": "JadyelBot/1.0 (Contato: gabinete@jadyel.com.br)"
  },
};

async function testarImplementacaoFinal() {
  console.log('🎯 Teste final da implementação da API da Câmara dos Deputados...\n');
  
  const tipos = ['PL', 'PLP', 'PEC'];
  let todosProjetos = [];
  
  // Buscar projetos por nome do deputado (abordagem mais eficaz)
  console.log('📋 Buscando projetos por nome do deputado "Jadyel Alencar"...');
  
  for (const tipo of tipos) {
    try {
      const nomeEncoded = encodeURIComponent("Jadyel Alencar");
      const url = `${BASE}/proposicoes?autor=${nomeEncoded}&siglaTipo=${tipo}&itens=100&ordem=DESC&ordenarPor=id`;
      
      console.log(`🔍 Buscando ${tipo}: ${url}`);
      
      const response = await fetch(url, defaultInit);
      
      if (response.ok) {
        const data = await response.json();
        const proposicoes = data.dados || [];
        
        console.log(`✅ Encontradas ${proposicoes.length} proposições ${tipo} do deputado Jadyel Alencar`);
        
        for (const proposicao of proposicoes) {
          const projeto = {
            id: `${proposicao.siglaTipo}-${proposicao.numero}-${proposicao.ano}`,
            tipo: proposicao.siglaTipo,
            numero: proposicao.numero.toString(),
            ano: proposicao.ano.toString(),
            ementa: proposicao.ementa || `Projeto ${proposicao.siglaTipo} ${proposicao.numero}/${proposicao.ano}`,
            dataApresentacao: proposicao.dataApresentacao,
            status: proposicao.statusProposicao?.tramitacao?.situacao?.descricao,
            url: `https://www.camara.leg.br/proposicoesWeb/fichadetramitacao?idProposicao=${proposicao.id}`
          };
          
          todosProjetos.push(projeto);
          console.log(`   ✅ ${proposicao.siglaTipo} ${proposicao.numero}/${proposicao.ano} - ${proposicao.ementa?.substring(0, 80)}...`);
        }
      } else {
        console.log(`⚠️ Erro ao buscar ${tipo}: ${response.status}`);
      }
      
    } catch (error) {
      console.log(`❌ Erro ao buscar ${tipo}: ${error.message}`);
    }
  }
  
  console.log(`\n🎯 RESULTADO FINAL:`);
  console.log(`   Total de projetos do deputado Jadyel Alencar encontrados: ${todosProjetos.length}`);
  
  // Estatísticas por tipo
  const estatisticas = todosProjetos.reduce((acc, projeto) => {
    acc[projeto.tipo] = (acc[projeto.tipo] || 0) + 1;
    return acc;
  }, {});
  
  console.log('\n📊 Estatísticas por tipo:');
  Object.entries(estatisticas).forEach(([tipo, quantidade]) => {
    console.log(`   ${tipo}: ${quantidade} projetos`);
  });
  
  if (todosProjetos.length > 0) {
    console.log('\n📋 Resumo dos projetos encontrados:');
    todosProjetos.slice(0, 10).forEach((projeto, index) => {
      console.log(`\n${index + 1}. ${projeto.tipo} ${projeto.numero}/${projeto.ano}`);
      console.log(`   Ementa: ${projeto.ementa.substring(0, 100)}...`);
      console.log(`   Data: ${projeto.dataApresentacao || 'N/A'}`);
      console.log(`   Status: ${projeto.status || 'N/A'}`);
      console.log(`   URL: ${projeto.url}`);
    });
    
    if (todosProjetos.length > 10) {
      console.log(`\n... e mais ${todosProjetos.length - 10} projetos`);
    }
    
    // Salvar resultados completos
    const fs = await import('fs');
    fs.writeFileSync('projetos-jadyel-completos.json', JSON.stringify(todosProjetos, null, 2));
    console.log('\n💾 Todos os projetos salvos em projetos-jadyel-completos.json');
    
    // Salvar resumo
    const resumo = {
      totalProjetos: todosProjetos.length,
      estatisticas,
      ultimaAtualizacao: new Date().toISOString(),
      deputado: "Jadyel Silva Alencar",
      idDeputado: 220697,
      fonte: "API Oficial da Câmara dos Deputados",
      url: "https://dadosabertos.camara.leg.br/swagger/api.html"
    };
    
    fs.writeFileSync('resumo-projetos-jadyel.json', JSON.stringify(resumo, null, 2));
    console.log('💾 Resumo salvo em resumo-projetos-jadyel.json');
    
  } else {
    console.log('\n❌ Nenhum projeto do deputado Jadyel Alencar foi encontrado');
    console.log('🔄 Isso pode indicar que:');
    console.log('   - O deputado ainda não apresentou projetos');
    console.log('   - Os projetos estão em uma página diferente');
    console.log('   - Há algum problema com a API');
  }
  
  console.log('\n✅ Teste final concluído!');
}

testarImplementacaoFinal().catch(console.error);
