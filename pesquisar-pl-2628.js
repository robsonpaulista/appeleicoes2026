// Script para pesquisar informações sobre o PL-2628/2022
// e os destaques do deputado Jadyel Alencar como relator

const BASE = "https://dadosabertos.camara.leg.br/api/v2";

const defaultInit = {
  headers: {
    "Accept": "application/json",
    "User-Agent": "JadyelBot/1.0 (Contato: gabinete@jadyel.com.br)"
  },
};

async function pesquisarPL2628() {
  console.log('🔍 Pesquisando informações sobre o PL-2628/2022...\n');
  
  try {
    // Buscar o projeto específico
    const url = `${BASE}/proposicoes?numero=2628&ano=2022&siglaTipo=PL`;
    console.log(`📋 URL da busca: ${url}`);
    
    const response = await fetch(url, defaultInit);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Dados encontrados:', JSON.stringify(data, null, 2));
      
      if (data.dados && data.dados.length > 0) {
        const projeto = data.dados[0];
        console.log('\n📋 Informações do PL-2628/2022:');
        console.log(`   ID: ${projeto.id}`);
        console.log(`   Tipo: ${projeto.siglaTipo}`);
        console.log(`   Número: ${projeto.numero}`);
        console.log(`   Ano: ${projeto.ano}`);
        console.log(`   Ementa: ${projeto.ementa}`);
        console.log(`   Data Apresentação: ${projeto.dataApresentacao}`);
        console.log(`   Status: ${projeto.statusProposicao?.tramitacao?.situacao?.descricao || 'N/A'}`);
        
        // Buscar autores
        console.log('\n🔍 Buscando autores...');
        const autoresUrl = `${BASE}/proposicoes/${projeto.id}/autores`;
        const autoresResponse = await fetch(autoresUrl, defaultInit);
        
        if (autoresResponse.ok) {
          const autoresData = await autoresResponse.json();
          console.log('👥 Autores:', JSON.stringify(autoresData, null, 2));
        }
        
        // Buscar relatores
        console.log('\n🔍 Buscando relatores...');
        const relatoresUrl = `${BASE}/proposicoes/${projeto.id}/relatores`;
        const relatoresResponse = await fetch(relatoresUrl, defaultInit);
        
        if (relatoresResponse.ok) {
          const relatoresData = await relatoresResponse.json();
          console.log('📝 Relatores:', JSON.stringify(relatoresData, null, 2));
        }
        
        // Buscar tramitações
        console.log('\n🔍 Buscando tramitações...');
        const tramitacoesUrl = `${BASE}/proposicoes/${projeto.id}/tramitacoes`;
        const tramitacoesResponse = await fetch(tramitacoesUrl, defaultInit);
        
        if (tramitacoesResponse.ok) {
          const tramitacoesData = await tramitacoesResponse.json();
          console.log('📊 Tramitações:', JSON.stringify(tramitacoesData, null, 2));
        }
        
      } else {
        console.log('⚠️ Projeto não encontrado');
      }
    } else {
      console.log(`❌ Erro na busca: ${response.status}`);
    }
    
  } catch (error) {
    console.error('❌ Erro na pesquisa:', error);
  }
}

// Executar pesquisa
pesquisarPL2628();
