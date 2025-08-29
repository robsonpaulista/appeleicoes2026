// Script robusto para testar diferentes abordagens da API da Câmara
const BASE = "https://dadosabertos.camara.leg.br/api/v2";

const defaultInit = {
  headers: {
    "Accept": "application/json",
    "User-Agent": "JadyelBot/1.0 (Contato: gabinete@jadyel.com.br)"
  },
};

async function testarDiferentesAbordagens() {
  console.log('🔍 Testando diferentes abordagens para buscar projetos do deputado Jadyel Alencar...\n');
  
  const deputadoId = 220697;
  
  // Abordagem 1: Buscar por autor usando ID
  console.log('1️⃣ Testando busca por autor usando ID...');
  try {
    const url1 = `${BASE}/proposicoes?autor=${deputadoId}&itens=50`;
    const response1 = await fetch(url1, defaultInit);
    const data1 = await response1.json();
    console.log(`   Status: ${response1.status}`);
    console.log(`   Proposições encontradas: ${data1.dados?.length || 0}`);
    
    if (data1.dados && data1.dados.length > 0) {
      console.log('   ✅ Primeiras proposições:');
      data1.dados.slice(0, 3).forEach((p, i) => {
        console.log(`      ${i + 1}. ${p.siglaTipo} ${p.numero}/${p.ano}`);
      });
    }
  } catch (error) {
    console.log(`   ❌ Erro: ${error.message}`);
  }
  
  // Abordagem 2: Buscar por autor usando nome
  console.log('\n2️⃣ Testando busca por autor usando nome...');
  try {
    const url2 = `${BASE}/proposicoes?autor=Jadyel%20Alencar&itens=50`;
    const response2 = await fetch(url2, defaultInit);
    const data2 = await response2.json();
    console.log(`   Status: ${response2.status}`);
    console.log(`   Proposições encontradas: ${data2.dados?.length || 0}`);
    
    if (data2.dados && data2.dados.length > 0) {
      console.log('   ✅ Primeiras proposições:');
      data2.dados.slice(0, 3).forEach((p, i) => {
        console.log(`      ${i + 1}. ${p.siglaTipo} ${p.numero}/${p.ano}`);
      });
    }
  } catch (error) {
    console.log(`   ❌ Erro: ${error.message}`);
  }
  
  // Abordagem 3: Buscar todas as proposições recentes e verificar autores
  console.log('\n3️⃣ Testando busca de proposições recentes e verificação de autores...');
  try {
    const url3 = `${BASE}/proposicoes?itens=100&ordem=DESC&ordenarPor=id`;
    const response3 = await fetch(url3, defaultInit);
    const data3 = await response3.json();
    console.log(`   Status: ${response3.status}`);
    console.log(`   Proposições encontradas: ${data3.dados?.length || 0}`);
    
    if (data3.dados && data3.dados.length > 0) {
      console.log('   🔍 Verificando autores das primeiras 10 proposições...');
      let encontradas = 0;
      
      for (let i = 0; i < Math.min(10, data3.dados.length); i++) {
        const proposicao = data3.dados[i];
        try {
          const autoresUrl = `${BASE}/proposicoes/${proposicao.id}/autores`;
          const autoresResponse = await fetch(autoresUrl, defaultInit);
          const autoresData = await autoresResponse.json();
          
          if (autoresData.dados && Array.isArray(autoresData.dados)) {
            const temJadyel = autoresData.dados.some(autor => 
              autor.nome && autor.nome.toLowerCase().includes('jadyel')
            );
            
            if (temJadyel) {
              console.log(`      ✅ ${proposicao.siglaTipo} ${proposicao.numero}/${proposicao.ano} - AUTOR: Jadyel Alencar`);
              encontradas++;
            }
          }
        } catch (error) {
          // Ignorar erros individuais
        }
        
        // Aguardar um pouco entre as requisições
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      console.log(`   🎯 Total de proposições do Jadyel encontradas: ${encontradas}`);
    }
  } catch (error) {
    console.log(`   ❌ Erro: ${error.message}`);
  }
  
  // Abordagem 4: Buscar por tipo específico e verificar autores
  console.log('\n4️⃣ Testando busca por tipo PL e verificação de autores...');
  try {
    const url4 = `${BASE}/proposicoes?siglaTipo=PL&itens=50&ordem=DESC&ordenarPor=id`;
    const response4 = await fetch(url4, defaultInit);
    const data4 = await response4.json();
    console.log(`   Status: ${response4.status}`);
    console.log(`   Proposições PL encontradas: ${data4.dados?.length || 0}`);
    
    if (data4.dados && data4.dados.length > 0) {
      console.log('   🔍 Verificando autores das primeiras 5 proposições PL...');
      let encontradas = 0;
      
      for (let i = 0; i < Math.min(5, data4.dados.length); i++) {
        const proposicao = data4.dados[i];
        try {
          const autoresUrl = `${BASE}/proposicoes/${proposicao.id}/autores`;
          const autoresResponse = await fetch(autoresUrl, defaultInit);
          const autoresData = await autoresResponse.json();
          
          if (autoresData.dados && Array.isArray(autoresData.dados)) {
            const temJadyel = autoresData.dados.some(autor => 
              autor.nome && autor.nome.toLowerCase().includes('jadyel')
            );
            
            if (temJadyel) {
              console.log(`      ✅ ${proposicao.siglaTipo} ${proposicao.numero}/${proposicao.ano} - AUTOR: Jadyel Alencar`);
              console.log(`         Ementa: ${proposicao.ementa?.substring(0, 80)}...`);
              encontradas++;
            }
          }
        } catch (error) {
          // Ignorar erros individuais
        }
        
        // Aguardar um pouco entre as requisições
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      console.log(`   🎯 Total de PLs do Jadyel encontradas: ${encontradas}`);
    }
  } catch (error) {
    console.log(`   ❌ Erro: ${error.message}`);
  }
  
  // Abordagem 5: Verificar se o deputado tem proposições usando endpoint específico
  console.log('\n5️⃣ Testando endpoint específico do deputado...');
  try {
    const url5 = `${BASE}/deputados/${deputadoId}/proposicoes`;
    const response5 = await fetch(url5, defaultInit);
    const data5 = await response5.json();
    console.log(`   Status: ${response5.status}`);
    console.log(`   Proposições encontradas: ${data5.dados?.length || 0}`);
    
    if (data5.dados && data5.dados.length > 0) {
      console.log('   ✅ Proposições do deputado:');
      data5.dados.slice(0, 5).forEach((p, i) => {
        console.log(`      ${i + 1}. ${p.siglaTipo} ${p.numero}/${p.ano} - ${p.ementa?.substring(0, 60)}...`);
      });
    }
  } catch (error) {
    console.log(`   ❌ Erro: ${error.message}`);
  }
}

testarDiferentesAbordagens().catch(console.error);
