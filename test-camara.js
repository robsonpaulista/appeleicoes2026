// Script de teste para verificar projetos da Câmara
import fetch from 'node-fetch';

async function testarCamara() {
  console.log('🔍 Testando busca de projetos na Câmara dos Deputados...');
  
  const url = 'https://www.camara.leg.br/busca-portal?contextoBusca=BuscaProposicoes&pagina=1&order=relevancia&abaEspecifica=true&filtros=%5B%7B%22autores.nome%22%3A%22Jadyel%20Alencar%22%7D%5D&tipos=PL,PLP,PEC';
  
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
      }
    });

    if (!response.ok) {
      throw new Error(`Erro HTTP: ${response.status} ${response.statusText}`);
    }

    const html = await response.text();
    console.log('✅ Página carregada com sucesso');
    
    // Buscar por diferentes padrões
    const padroes = [
      /(?:PL|PLP|PEC)\s*\d+\/\d{4}/gi,
      /proposicao/gi,
      /resultado/gi,
      /item/gi,
      /card/gi
    ];
    
    console.log('\n📊 Análise da página:');
    padroes.forEach((padrao, index) => {
      const matches = html.match(padrao);
      console.log(`Padrão ${index + 1}: ${matches ? matches.length : 0} encontrados`);
    });
    
    // Buscar especificamente por projetos
    const projetos = html.match(/(?:PL|PLP|PEC)\s*\d+\/\d{4}/gi);
    if (projetos) {
      console.log(`\n🎯 Projetos encontrados: ${projetos.length}`);
      projetos.forEach((projeto, index) => {
        console.log(`${index + 1}. ${projeto}`);
      });
    }
    
    // Salvar HTML para análise
    const fs = await import('fs');
    fs.writeFileSync('camara-debug.html', html);
    console.log('\n💾 HTML salvo em camara-debug.html para análise');
    
  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

testarCamara();
