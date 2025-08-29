// Teste da API da Câmara dos Deputados
const BASE = "https://dadosabertos.camara.leg.br/api/v2";

const defaultInit = {
  headers: {
    "Accept": "application/json",
    "User-Agent": "JadyelBot/1.0 (Contato: gabinete@jadyel.com.br)"
  },
};

async function testarAPI() {
  console.log('🧪 Testando API da Câmara dos Deputados...');
  
  // Teste 1: Verificar se o deputado existe
  console.log('\n1️⃣ Testando endpoint do deputado...');
  try {
    const deputadoUrl = `${BASE}/deputados/220697`;
    console.log(`URL: ${deputadoUrl}`);
    
    const response = await fetch(deputadoUrl, defaultInit);
    console.log(`Status: ${response.status}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Deputado encontrado:', data.dados?.nomeCivil);
    } else {
      console.log('❌ Erro ao buscar deputado');
    }
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
  
  // Teste 2: Verificar proposições usando autor
  console.log('\n2️⃣ Testando proposições por autor...');
  try {
    const proposicoesUrl = `${BASE}/proposicoes?autor=220697&siglaTipo=PL&siglaTipo=PEC&siglaTipo=PLP&itens=10&pagina=1&ordem=ASC&ordenarPor=ano`;
    console.log(`URL: ${proposicoesUrl}`);
    
    const response = await fetch(proposicoesUrl, defaultInit);
    console.log(`Status: ${response.status}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log(`✅ Proposições encontradas: ${data.dados?.length || 0}`);
      
      if (data.dados && data.dados.length > 0) {
        console.log('📋 Primeiras proposições:');
        data.dados.slice(0, 3).forEach((p, i) => {
          console.log(`   ${i + 1}. ${p.siglaTipo} ${p.numero}/${p.ano} - ${p.ementa?.substring(0, 50)}...`);
        });
      }
    } else {
      console.log('❌ Erro ao buscar proposições');
    }
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
  
  // Teste 3: Verificar proposições sem filtro de autor
  console.log('\n3️⃣ Testando proposições sem filtro de autor...');
  try {
    const proposicoesUrl = `${BASE}/proposicoes?siglaTipo=PL&itens=5&pagina=1&ordem=DESC&ordenarPor=id`;
    console.log(`URL: ${proposicoesUrl}`);
    
    const response = await fetch(proposicoesUrl, defaultInit);
    console.log(`Status: ${response.status}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log(`✅ Proposições encontradas: ${data.dados?.length || 0}`);
      
      if (data.dados && data.dados.length > 0) {
        console.log('📋 Primeiras proposições:');
        data.dados.slice(0, 3).forEach((p, i) => {
          console.log(`   ${i + 1}. ${p.siglaTipo} ${p.numero}/${p.ano} - ${p.ementa?.substring(0, 50)}...`);
        });
      }
    } else {
      console.log('❌ Erro ao buscar proposições');
    }
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
  
  // Teste 4: Verificar autores de uma proposição
  console.log('\n4️⃣ Testando autores de uma proposição...');
  try {
    const autoresUrl = `${BASE}/proposicoes/2526777/autores`;
    console.log(`URL: ${autoresUrl}`);
    
    const response = await fetch(autoresUrl, defaultInit);
    console.log(`Status: ${response.status}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log(`✅ Autores encontrados: ${data.dados?.length || 0}`);
      
      if (data.dados && data.dados.length > 0) {
        console.log('📋 Autores:');
        data.dados.forEach((a, i) => {
          console.log(`   ${i + 1}. ${a.nome} (ID: ${a.id})`);
        });
      }
    } else {
      console.log('❌ Erro ao buscar autores');
    }
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

testarAPI().catch(console.error);
