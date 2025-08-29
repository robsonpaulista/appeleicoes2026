// Teste do novo scraper da Câmara dos Deputados
import fetch from 'node-fetch';

async function testarScraperCamara() {
  console.log('🔍 Testando novo scraper da Câmara dos Deputados...\n');
  
  const url = 'https://www.camara.leg.br/busca-portal?contextoBusca=BuscaProposicoes&pagina=1&order=relevancia&abaEspecifica=true&filtros=%5B%7B%22autores.nome%22%3A%22Jadyel%20Alencar%22%7D%5D&tipos=PL,PLP,PEC';
  
  try {
    console.log(`📋 Acessando portal oficial: ${url}`);
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Cache-Control': 'max-age=0'
      }
    });

    if (!response.ok) {
      throw new Error(`Erro HTTP: ${response.status} ${response.statusText}`);
    }

    const html = await response.text();
    console.log('✅ Página carregada com sucesso');
    console.log(`📊 Tamanho do HTML: ${html.length} caracteres`);
    
    // Salvar HTML para análise
    const fs = await import('fs');
    fs.writeFileSync('camara-scraper-debug.html', html);
    console.log('💾 HTML salvo em camara-scraper-debug.html');
    
    // Testar extração de projetos
    console.log('\n🔍 Testando extração de projetos...');
    
    const projetos = extrairProjetosDoHTML(html);
    
    console.log(`\n🎯 Resultado da extração:`);
    console.log(`   Total de projetos encontrados: ${projetos.length}`);
    
    if (projetos.length > 0) {
      console.log('\n📋 Projetos encontrados:');
      projetos.forEach((projeto, index) => {
        console.log(`\n${index + 1}. ${projeto.tipo} ${projeto.numero}/${projeto.ano}`);
        console.log(`   ID: ${projeto.id}`);
        console.log(`   Ementa: ${projeto.ementa.substring(0, 100)}...`);
        console.log(`   URL: ${projeto.url}`);
      });
    } else {
      console.log('❌ Nenhum projeto encontrado no HTML');
      
      // Análise do HTML para debug
      console.log('\n🔍 Análise do HTML para debug:');
      
      const analises = [
        { nome: 'Projetos PL', padrao: /PL\s*\d+\/\d{4}/gi },
        { nome: 'Projetos PLP', padrao: /PLP\s*\d+\/\d{4}/gi },
        { nome: 'Projetos PEC', padrao: /PEC\s*\d+\/\d{4}/gi },
        { nome: 'Palavra "Jadyel"', padrao: /jadyel/gi },
        { nome: 'Palavra "Alencar"', padrao: /alencar/gi },
        { nome: 'Palavra "proposição"', padrao: /proposi[çc][ãa]o/gi },
        { nome: 'Palavra "projeto"', padrao: /projeto/gi },
        { nome: 'Palavra "deputado"', padrao: /deputado/gi }
      ];
      
      analises.forEach(analise => {
        const matches = html.match(analise.padrao);
        console.log(`   ${analise.nome}: ${matches ? matches.length : 0} encontrados`);
      });
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

function extrairProjetosDoHTML(html) {
  const projetos = [];
  
  // Padrões para encontrar projetos
  const padroes = [
    /(PL|PLP|PEC)\s*(\d+)\/(\d{4})/gi,
    /(PL|PLP|PEC)\s*nº?\s*(\d+)\/(\d{4})/gi,
    /(PL|PLP|PEC)-(\d+)\/(\d{4})/gi
  ];
  
  let encontrados = new Set();
  
  for (const padrao of padroes) {
    let match;
    while ((match = padrao.exec(html)) !== null) {
      const tipo = match[1];
      const numero = match[2];
      const ano = match[3];
      const chave = `${tipo}-${numero}-${ano}`;
      
      if (!encontrados.has(chave)) {
        encontrados.add(chave);
        
        const ementa = extrairEmenta(html, match.index);
        
        const projeto = {
          id: chave,
          tipo,
          numero,
          ano,
          ementa: ementa || `Projeto ${tipo} ${numero}/${ano} apresentado pelo deputado Jadyel Alencar`,
          url: `https://www.camara.leg.br/proposicoesWeb/fichadetramitacao?idProposicao=${chave}`
        };
        
        projetos.push(projeto);
      }
    }
  }
  
  return projetos;
}

function extrairEmenta(html, index) {
  const contexto = html.substring(index, index + 2000);
  
  const padroesEmenta = [
    /<p[^>]*class="[^"]*ementa[^"]*"[^>]*>([^<]+)<\/p>/i,
    /<div[^>]*class="[^"]*ementa[^"]*"[^>]*>([^<]+)<\/div>/i,
    /<span[^>]*class="[^"]*ementa[^"]*"[^>]*>([^<]+)<\/span>/i,
    /<p[^>]*>([^<]{50,200})<\/p>/i,
    /<div[^>]*>([^<]{50,200})<\/div>/i
  ];
  
  for (const padrao of padroesEmenta) {
    const match = contexto.match(padrao);
    if (match && match[1]) {
      const ementa = match[1].trim()
        .replace(/\s+/g, ' ')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"');
      
      if (ementa.length > 20 && ementa.length < 500) {
        return ementa;
      }
    }
  }
  
  return '';
}

testarScraperCamara();
