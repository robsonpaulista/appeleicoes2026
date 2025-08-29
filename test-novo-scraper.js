// Teste da nova implementação do scraper da Câmara
import fetch from 'node-fetch';

const BASE = "https://dadosabertos.camara.leg.br/api/v2";

const defaultInit = {
  headers: {
    "Accept": "application/json",
    "User-Agent": "JadyelBot/1.0 (Contato: gabinete@jadyel.com.br)"
  },
};

async function testarNovoScraper() {
  console.log('🔍 Testando nova implementação do scraper da Câmara...\n');
  
  const deputadoId = 220697;
  
  // Teste 1: Buscar proposições recentes e verificar autores
  console.log('1️⃣ Testando busca de proposições recentes e verificação de autores...');
  
  const tipos = ['PL', 'PLP', 'PEC'];
  let projetosEncontrados = [];
  
  for (const tipo of tipos) {
    try {
      console.log(`\n📋 Buscando proposições do tipo ${tipo}...`);
      
      const url = `${BASE}/proposicoes?siglaTipo=${tipo}&itens=20&ordem=DESC&ordenarPor=id`;
      const response = await fetch(url, defaultInit);
      
      if (!response.ok) {
        console.log(`⚠️ Erro ao buscar ${tipo}: ${response.status}`);
        continue;
      }
      
      const data = await response.json();
      const proposicoes = data.dados || [];
      
      console.log(`📊 Encontradas ${proposicoes.length} proposições do tipo ${tipo}`);
      
      // Verificar autores das primeiras 5 proposições
      const proposicoesParaVerificar = proposicoes.slice(0, 5);
      
      for (const proposicao of proposicoesParaVerificar) {
        try {
          const isAutor = await verificarSeDeputadoEAutor(proposicao.id, deputadoId);
          
          if (isAutor) {
            console.log(`✅ PROJETO ENCONTRADO: ${proposicao.siglaTipo} ${proposicao.numero}/${proposicao.ano}`);
            console.log(`   Ementa: ${proposicao.ementa?.substring(0, 100)}...`);
            console.log(`   ID: ${proposicao.id}`);
            
            projetosEncontrados.push({
              id: `${proposicao.siglaTipo}-${proposicao.numero}-${proposicao.ano}`,
              tipo: proposicao.siglaTipo,
              numero: proposicao.numero.toString(),
              ano: proposicao.ano.toString(),
              ementa: proposicao.ementa || `Projeto ${proposicao.siglaTipo} ${proposicao.numero}/${proposicao.ano}`,
              dataApresentacao: proposicao.dataApresentacao,
              url: `https://www.camara.leg.br/proposicoesWeb/fichadetramitacao?idProposicao=${proposicao.id}`
            });
          }
        } catch (error) {
          console.log(`⚠️ Erro ao verificar autores da proposição ${proposicao.id}`);
        }
        
        // Aguardar um pouco entre as verificações
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
    } catch (error) {
      console.log(`❌ Erro ao buscar proposições do tipo ${tipo}:`, error);
    }
  }
  
  console.log(`\n🎯 RESULTADO FINAL:`);
  console.log(`   Total de projetos do deputado Jadyel Alencar encontrados: ${projetosEncontrados.length}`);
  
  if (projetosEncontrados.length > 0) {
    console.log('\n📋 Projetos encontrados:');
    projetosEncontrados.forEach((projeto, index) => {
      console.log(`\n${index + 1}. ${projeto.tipo} ${projeto.numero}/${projeto.ano}`);
      console.log(`   ID: ${projeto.id}`);
      console.log(`   Ementa: ${projeto.ementa.substring(0, 100)}...`);
      console.log(`   URL: ${projeto.url}`);
    });
    
    // Salvar resultados
    const fs = await import('fs');
    fs.writeFileSync('projetos-jadyel-encontrados.json', JSON.stringify(projetosEncontrados, null, 2));
    console.log('\n💾 Resultados salvos em projetos-jadyel-encontrados.json');
  } else {
    console.log('\n❌ Nenhum projeto do deputado Jadyel Alencar foi encontrado');
    console.log('🔄 Isso pode indicar que:');
    console.log('   - O deputado ainda não apresentou projetos');
    console.log('   - Os projetos estão em uma página diferente');
    console.log('   - Há algum problema com a API');
  }
}

async function verificarSeDeputadoEAutor(proposicaoId, deputadoId) {
  try {
    const autoresUrl = `${BASE}/proposicoes/${proposicaoId}/autores`;
    const response = await fetch(autoresUrl, defaultInit);
    
    if (!response.ok) {
      return false;
    }
    
    const data = await response.json();
    const autores = data.dados || [];
    
    return autores.some((autor) => {
      // Verificar por ID ou por nome
      return autor.id === deputadoId || 
             (autor.nome && autor.nome.toLowerCase().includes('jadyel'));
    });
    
  } catch (error) {
    return false;
  }
}

testarNovoScraper().catch(console.error);
