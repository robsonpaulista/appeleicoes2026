// Script de teste para a API da Câmara dos Deputados
import fetch from 'node-fetch';

async function testarAPICamara() {
  console.log('🔍 Buscando projetos do deputado Jadyel Alencar...');
  
  const deputadoId = 220697; // ID do deputado Jadyel Alencar
  
  const apiUrl = `https://dadosabertos.camara.leg.br/api/v2/proposicoes?autor=${deputadoId}&ordem=DESC&ordenarPor=id&pagina=1&itens=50`;
  
  console.log(`🔗 Buscando: ${apiUrl}`);
  
  try {
    const response = await fetch(apiUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'application/json',
        'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
      }
    });

    if (!response.ok) {
      console.log(`❌ Erro HTTP: ${response.status} ${response.statusText}`);
      return;
    }

    const data = await response.json();
    console.log('✅ API respondida com sucesso');
    
    if (data.dados && Array.isArray(data.dados)) {
      console.log(`🎯 Projetos encontrados: ${data.dados.length}`);
      
      if (data.dados.length > 0) {
        console.log('\n📋 Projetos:');
        data.dados.forEach((projeto, index) => {
          console.log(`\n${index + 1}. ${projeto.siglaTipo} ${projeto.numero}/${projeto.ano}`);
          console.log(`   ID: ${projeto.id}`);
          console.log(`   Ementa: ${projeto.ementa?.substring(0, 100)}...`);
          console.log(`   Data: ${projeto.dataApresentacao || 'N/A'}`);
          console.log(`   Status: ${projeto.statusProposicao?.tramitacao?.situacao?.descricao || 'N/A'}`);
          console.log(`   URL: ${projeto.uri}`);
          
          // Verificar se tem informações de autor
          if (projeto.autor) {
            console.log(`   Autor: ${JSON.stringify(projeto.autor)}`);
          }
        });
        
        // Salvar dados para análise
        const fs = await import('fs');
        fs.writeFileSync('projetos-jadyel.json', JSON.stringify(data, null, 2));
        console.log('\n💾 Dados salvos em projetos-jadyel.json');
      }
    } else {
      console.log('❌ Nenhum projeto encontrado');
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

testarAPICamara();
