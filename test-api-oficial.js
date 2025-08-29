// Teste da nova implementação baseada na documentação oficial da API da Câmara
import fetch from 'node-fetch';

const BASE = "https://dadosabertos.camara.leg.br/api/v2";

const defaultInit = {
  headers: {
    "Accept": "application/json",
    "User-Agent": "JadyelBot/1.0 (Contato: gabinete@jadyel.com.br)"
  },
};

async function testarAPIOficial() {
  console.log('🔍 Testando nova implementação baseada na documentação oficial da API da Câmara...\n');
  
  const deputadoId = 220697;
  const tipos = ['PL', 'PLP', 'PEC'];
  
  // Teste 1: Buscar informações do deputado
  console.log('1️⃣ Testando busca de informações do deputado...');
  try {
    const deputadoUrl = `${BASE}/deputados/${deputadoId}`;
    const response = await fetch(deputadoUrl, defaultInit);
    
    if (response.ok) {
      const data = await response.json();
      console.log(`✅ Deputado encontrado: ${data.dados?.nomeCivil}`);
      console.log(`   Partido: ${data.dados?.siglaPartido}`);
      console.log(`   UF: ${data.dados?.siglaUf}`);
    } else {
      console.log(`❌ Erro ao buscar deputado: ${response.status}`);
    }
  } catch (error) {
    console.log(`❌ Erro: ${error.message}`);
  }
  
  // Teste 2: Buscar proposições por autor usando ID
  console.log('\n2️⃣ Testando busca de proposições por autor usando ID...');
  for (const tipo of tipos) {
    try {
      const url = `${BASE}/proposicoes?autor=${deputadoId}&siglaTipo=${tipo}&itens=50&ordem=DESC&ordenarPor=id`;
      console.log(`🔍 Buscando ${tipo}: ${url}`);
      
      const response = await fetch(url, defaultInit);
      
      if (response.ok) {
        const data = await response.json();
        const proposicoes = data.dados || [];
        console.log(`✅ Encontradas ${proposicoes.length} proposições ${tipo} do deputado`);
        
        if (proposicoes.length > 0) {
          console.log('📋 Primeiras proposições:');
          proposicoes.slice(0, 3).forEach((p, i) => {
            console.log(`   ${i + 1}. ${p.siglaTipo} ${p.numero}/${p.ano} - ${p.ementa?.substring(0, 80)}...`);
          });
        }
      } else {
        console.log(`⚠️ Erro ao buscar ${tipo}: ${response.status}`);
      }
    } catch (error) {
      console.log(`❌ Erro ao buscar ${tipo}: ${error.message}`);
    }
  }
  
  // Teste 3: Buscar proposições por nome do autor
  console.log('\n3️⃣ Testando busca de proposições por nome do autor...');
  for (const tipo of tipos) {
    try {
      const nomeEncoded = encodeURIComponent("Jadyel Alencar");
      const url = `${BASE}/proposicoes?autor=${nomeEncoded}&siglaTipo=${tipo}&itens=50&ordem=DESC&ordenarPor=id`;
      console.log(`🔍 Buscando ${tipo} por nome: ${url}`);
      
      const response = await fetch(url, defaultInit);
      
      if (response.ok) {
        const data = await response.json();
        const proposicoes = data.dados || [];
        console.log(`✅ Encontradas ${proposicoes.length} proposições ${tipo} do autor "Jadyel Alencar"`);
        
        if (proposicoes.length > 0) {
          console.log('📋 Primeiras proposições:');
          proposicoes.slice(0, 3).forEach((p, i) => {
            console.log(`   ${i + 1}. ${p.siglaTipo} ${p.numero}/${p.ano} - ${p.ementa?.substring(0, 80)}...`);
          });
        }
      } else {
        console.log(`⚠️ Erro ao buscar ${tipo} por nome: ${response.status}`);
      }
    } catch (error) {
      console.log(`❌ Erro ao buscar ${tipo} por nome: ${error.message}`);
    }
  }
  
  // Teste 4: Verificar endpoint específico do deputado
  console.log('\n4️⃣ Testando endpoint específico do deputado...');
  try {
    const url = `${BASE}/deputados/${deputadoId}/proposicoes`;
    console.log(`🔍 URL: ${url}`);
    
    const response = await fetch(url, defaultInit);
    console.log(`Status: ${response.status}`);
    
    if (response.ok) {
      const data = await response.json();
      const proposicoes = data.dados || [];
      console.log(`✅ Encontradas ${proposicoes.length} proposições do deputado`);
      
      if (proposicoes.length > 0) {
        console.log('📋 Primeiras proposições:');
        proposicoes.slice(0, 5).forEach((p, i) => {
          console.log(`   ${i + 1}. ${p.siglaTipo} ${p.numero}/${p.ano} - ${p.ementa?.substring(0, 60)}...`);
        });
      }
    } else {
      console.log(`❌ Endpoint não disponível: ${response.status}`);
    }
  } catch (error) {
    console.log(`❌ Erro: ${error.message}`);
  }
  
  // Teste 5: Buscar proposições recentes e verificar autores
  console.log('\n5️⃣ Testando busca de proposições recentes e verificação de autores...');
  let projetosEncontrados = [];
  
  for (const tipo of tipos) {
    try {
      const url = `${BASE}/proposicoes?siglaTipo=${tipo}&itens=20&ordem=DESC&ordenarPor=id`;
      console.log(`🔍 Buscando proposições recentes do tipo ${tipo}...`);
      
      const response = await fetch(url, defaultInit);
      
      if (response.ok) {
        const data = await response.json();
        const proposicoes = data.dados || [];
        console.log(`📊 Encontradas ${proposicoes.length} proposições recentes do tipo ${tipo}`);
        
        // Verificar autores das primeiras 5 proposições
        const proposicoesParaVerificar = proposicoes.slice(0, 5);
        
        for (const proposicao of proposicoesParaVerificar) {
          try {
            const isAutor = await verificarSeDeputadoEAutor(proposicao.id, deputadoId);
            
            if (isAutor) {
              console.log(`✅ PROJETO ENCONTRADO: ${proposicao.siglaTipo} ${proposicao.numero}/${proposicao.ano}`);
              console.log(`   Ementa: ${proposicao.ementa?.substring(0, 100)}...`);
              
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
      } else {
        console.log(`⚠️ Erro ao buscar ${tipo}: ${response.status}`);
      }
    } catch (error) {
      console.log(`❌ Erro ao buscar ${tipo}: ${error.message}`);
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
    fs.writeFileSync('projetos-api-oficial.json', JSON.stringify(projetosEncontrados, null, 2));
    console.log('\n💾 Resultados salvos em projetos-api-oficial.json');
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

testarAPIOficial().catch(console.error);
