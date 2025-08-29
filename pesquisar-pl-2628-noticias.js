// Script para pesquisar notícias sobre o PL-2628/2022
// e os destaques do deputado Jadyel Alencar como relator em sites nacionais

import puppeteer from 'puppeteer';
import fs from 'fs';

async function pesquisarNoticiasPL2628() {
  console.log('🔍 Pesquisando notícias sobre o PL-2628/2022 em sites nacionais...\n');
  
  const browser = await puppeteer.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
    
    const resultados = [];
    
    // Lista de sites para pesquisar
    const sites = [
      {
        nome: 'G1',
        url: 'https://g1.globo.com/busca/?q=PL+2628+2022+Jadyel+Alencar',
        seletor: '.feed-post-body'
      },
      {
        nome: 'CNN Brasil',
        url: 'https://www.cnnbrasil.com.br/busca/?q=PL+2628+2022+Jadyel+Alencar',
        seletor: '.search-results'
      },
      {
        nome: 'Estadão',
        url: 'https://busca.estadao.com.br/?q=PL+2628+2022+Jadyel+Alencar',
        seletor: '.search-results'
      },
      {
        nome: 'UOL',
        url: 'https://busca.uol.com.br/?q=PL+2628+2022+Jadyel+Alencar',
        seletor: '.search-results'
      },
      {
        nome: 'Folha',
        url: 'https://search.folha.uol.com.br/?q=PL+2628+2022+Jadyel+Alencar',
        seletor: '.search-results'
      }
    ];
    
    for (const site of sites) {
      console.log(`📰 Pesquisando em ${site.nome}...`);
      
      try {
        await page.goto(site.url, { waitUntil: 'networkidle2', timeout: 30000 });
        
        // Aguardar carregamento dos resultados
        await page.waitForTimeout(3000);
        
        // Tentar diferentes seletores para capturar conteúdo
        const conteudo = await page.evaluate((seletor) => {
          const elementos = document.querySelectorAll(seletor);
          const textos = [];
          
          elementos.forEach((el, index) => {
            if (index < 5) { // Limitar a 5 resultados por site
              const texto = el.textContent?.trim();
              if (texto && texto.length > 50) {
                textos.push(texto);
              }
            }
          });
          
          return textos;
        }, site.seletor);
        
        if (conteudo.length > 0) {
          resultados.push({
            site: site.nome,
            conteudo: conteudo
          });
          console.log(`✅ Encontrados ${conteudo.length} resultados em ${site.nome}`);
        } else {
          console.log(`⚠️ Nenhum resultado encontrado em ${site.nome}`);
        }
        
      } catch (error) {
        console.log(`❌ Erro ao pesquisar em ${site.nome}:`, error.message);
      }
      
      // Aguardar entre as pesquisas
      await page.waitForTimeout(2000);
    }
    
    // Pesquisa específica no Google News
    console.log('\n📰 Pesquisando no Google News...');
    try {
      await page.goto('https://news.google.com/search?q=PL+2628+2022+Jadyel+Alencar&hl=pt-BR&gl=BR&ceid=BR:pt-419', { 
        waitUntil: 'networkidle2', 
        timeout: 30000 
      });
      
      await page.waitForTimeout(3000);
      
      const googleNews = await page.evaluate(() => {
        const artigos = document.querySelectorAll('article');
        const noticias = [];
        
        artigos.forEach((artigo, index) => {
          if (index < 10) {
            const titulo = artigo.querySelector('h3')?.textContent?.trim();
            const fonte = artigo.querySelector('time')?.parentElement?.textContent?.trim();
            const link = artigo.querySelector('a')?.href;
            
            if (titulo) {
              noticias.push({ titulo, fonte, link });
            }
          }
        });
        
        return noticias;
      });
      
      if (googleNews.length > 0) {
        resultados.push({
          site: 'Google News',
          conteudo: googleNews.map(n => `${n.titulo} - ${n.fonte}`)
        });
        console.log(`✅ Encontrados ${googleNews.length} resultados no Google News`);
      }
      
    } catch (error) {
      console.log('❌ Erro ao pesquisar no Google News:', error.message);
    }
    
    // Exibir resultados
    console.log('\n📋 RESULTADOS ENCONTRADOS:\n');
    
    resultados.forEach(resultado => {
      console.log(`\n🌐 ${resultado.site.toUpperCase()}:`);
      resultado.conteudo.forEach((item, index) => {
        console.log(`   ${index + 1}. ${item.substring(0, 200)}...`);
      });
    });
    
    // Salvar resultados em arquivo
    fs.writeFileSync('resultados-pl-2628.json', JSON.stringify(resultados, null, 2));
    console.log('\n💾 Resultados salvos em "resultados-pl-2628.json"');
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  } finally {
    await browser.close();
  }
}

// Executar pesquisa
pesquisarNoticiasPL2628();
