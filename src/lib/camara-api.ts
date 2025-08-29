// lib/camara-api.ts
// Implementação baseada na documentação oficial da API da Câmara dos Deputados
// https://dadosabertos.camara.leg.br/swagger/api.html

const BASE = "https://dadosabertos.camara.leg.br/api/v2";

const defaultInit = {
  headers: {
    "Accept": "application/json",
    "User-Agent": "JadyelBot/1.0 (Contato: gabinete@jadyel.com.br)"
  },
};

interface CamaraProjeto {
  id: string;
  tipo: string;
  numero: string;
  ano: string;
  ementa: string;
  dataApresentacao?: string;
  status?: string;
  url: string;
}

interface ProposicaoAPI {
  id: number;
  uri: string;
  siglaTipo: string;
  numero: number;
  ano: number;
  ementa: string;
  dataApresentacao: string;
  uriAutores: string;
  uriTramitacoes: string;
  statusProposicao?: {
    tramitacao?: {
      situacao?: {
        descricao?: string;
      };
    };
  };
}

/**
 * Busca proposições do deputado Jadyel Alencar usando a API oficial
 * Baseado na documentação: https://dadosabertos.camara.leg.br/swagger/api.html
 */
export async function buscarProposicoesDoDeputado({
  idDeputado = 220697,
  tipos = ["PL", "PEC", "PLP"],
  itensPorPagina = 100,
}: {
  idDeputado?: number;
  tipos?: string[];
  itensPorPagina?: number;
}): Promise<CamaraProjeto[]> {
  console.log(`🔍 Buscando proposições do deputado ${idDeputado} (Jadyel Alencar) via API oficial...`);
  
  const projetos: CamaraProjeto[] = [];
  
  try {
    // Abordagem 1: Buscar por nome do deputado (mais eficaz)
    console.log('📋 Buscando proposições por nome do deputado...');
    const projetosPorNome = await buscarProposicoesPorNome("Jadyel Alencar", tipos, itensPorPagina);
    
    if (projetosPorNome.length > 0) {
      console.log(`✅ Encontrados ${projetosPorNome.length} projetos via busca por nome`);
      return projetosPorNome;
    }
    
    // Abordagem 2: Tentar buscar diretamente por autor usando ID
    console.log('🔄 Tentando busca direta por autor usando ID...');
    const projetosDiretos = await buscarProposicoesPorAutor(idDeputado, tipos, itensPorPagina);
    
    if (projetosDiretos.length > 0) {
      console.log(`✅ Encontrados ${projetosDiretos.length} projetos via busca direta`);
      return projetosDiretos;
    }
    
    // Abordagem 3: Se não encontrou, buscar proposições recentes e verificar autores
    console.log('🔄 Buscando proposições recentes e verificando autores...');
    const projetosRecentes = await buscarProposicoesRecentesEVerificarAutores(idDeputado, tipos, itensPorPagina);
    
    if (projetosRecentes.length > 0) {
      console.log(`✅ Encontrados ${projetosRecentes.length} projetos via verificação de autores`);
      return projetosRecentes;
    }
    
    console.log('⚠️ Nenhum projeto encontrado via API oficial');
    return [];
    
  } catch (error) {
    console.error('❌ Erro ao buscar proposições via API:', error);
    return [];
  }
}

/**
 * Busca proposições diretamente por autor usando o endpoint de proposições
 */
async function buscarProposicoesPorAutor(
  idDeputado: number, 
  tipos: string[], 
  itensPorPagina: number
): Promise<CamaraProjeto[]> {
  const projetos: CamaraProjeto[] = [];
  
  for (const tipo of tipos) {
    try {
      // Endpoint: /proposicoes?autor={id}&siglaTipo={tipo}
      const url = `${BASE}/proposicoes?autor=${idDeputado}&siglaTipo=${tipo}&itens=${itensPorPagina}&ordem=DESC&ordenarPor=id`;
      
      console.log(`🔍 Buscando ${tipo} do deputado ${idDeputado}: ${url}`);
      
      const response = await fetch(url, defaultInit);
      
      if (!response.ok) {
        console.log(`⚠️ Erro ao buscar ${tipo}: ${response.status}`);
        continue;
      }
      
      const data = await response.json();
      const proposicoes = data.dados || [];
      
      console.log(`📊 Encontradas ${proposicoes.length} proposições ${tipo} do deputado`);
      
      for (const proposicao of proposicoes) {
        const projeto: CamaraProjeto = {
          id: `${proposicao.siglaTipo}-${proposicao.numero}-${proposicao.ano}`,
          tipo: proposicao.siglaTipo,
          numero: proposicao.numero.toString(),
          ano: proposicao.ano.toString(),
          ementa: proposicao.ementa || `Projeto ${proposicao.siglaTipo} ${proposicao.numero}/${proposicao.ano}`,
          dataApresentacao: proposicao.dataApresentacao,
          status: proposicao.statusProposicao?.tramitacao?.situacao?.descricao,
          url: `https://www.camara.leg.br/proposicoesWeb/fichadetramitacao?idProposicao=${proposicao.id}`
        };
        
        projetos.push(projeto);
        console.log(`✅ Projeto encontrado: ${proposicao.siglaTipo} ${proposicao.numero}/${proposicao.ano}`);
      }
      
    } catch (error) {
      console.log(`❌ Erro ao buscar ${tipo}:`, error);
    }
  }
  
  return projetos;
}

/**
 * Busca proposições recentes e verifica se o deputado é autor
 */
async function buscarProposicoesRecentesEVerificarAutores(
  idDeputado: number, 
  tipos: string[], 
  itensPorPagina: number
): Promise<CamaraProjeto[]> {
  const projetos: CamaraProjeto[] = [];
  
  for (const tipo of tipos) {
    try {
      // Buscar proposições recentes do tipo
      const url = `${BASE}/proposicoes?siglaTipo=${tipo}&itens=50&ordem=DESC&ordenarPor=id`;
      
      console.log(`🔍 Buscando proposições recentes do tipo ${tipo}...`);
      
      const response = await fetch(url, defaultInit);
      
      if (!response.ok) {
        console.log(`⚠️ Erro ao buscar ${tipo}: ${response.status}`);
        continue;
      }
      
      const data = await response.json();
      const proposicoes = data.dados || [];
      
      console.log(`📊 Verificando autores de ${proposicoes.length} proposições ${tipo}`);
      
      // Verificar autores das primeiras 20 proposições
      const proposicoesParaVerificar = proposicoes.slice(0, 20);
      
      for (const proposicao of proposicoesParaVerificar) {
        try {
          const isAutor = await verificarSeDeputadoEAutor(proposicao.id, idDeputado);
          
          if (isAutor) {
            console.log(`✅ Proposição ${proposicao.siglaTipo} ${proposicao.numero}/${proposicao.ano} pertence ao deputado!`);
            
            const projeto: CamaraProjeto = {
              id: `${proposicao.siglaTipo}-${proposicao.numero}-${proposicao.ano}`,
              tipo: proposicao.siglaTipo,
              numero: proposicao.numero.toString(),
              ano: proposicao.ano.toString(),
              ementa: proposicao.ementa || `Projeto ${proposicao.siglaTipo} ${proposicao.numero}/${proposicao.ano}`,
              dataApresentacao: proposicao.dataApresentacao,
              status: proposicao.statusProposicao?.tramitacao?.situacao?.descricao,
              url: `https://www.camara.leg.br/proposicoesWeb/fichadetramitacao?idProposicao=${proposicao.id}`
            };
            
            projetos.push(projeto);
          }
        } catch (error) {
          console.log(`⚠️ Erro ao verificar autores da proposição ${proposicao.id}`);
        }
        
        // Aguardar um pouco entre as verificações
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      // Se já encontramos alguns projetos, podemos parar
      if (projetos.length >= 10) {
        console.log(`🎯 Encontrados ${projetos.length} projetos, parando busca...`);
        break;
      }
      
    } catch (error) {
      console.log(`❌ Erro ao buscar proposições do tipo ${tipo}:`, error);
    }
  }
  
  return projetos;
}

/**
 * Busca proposições por nome do autor
 */
async function buscarProposicoesPorNome(
  nomeDeputado: string, 
  tipos: string[], 
  itensPorPagina: number
): Promise<CamaraProjeto[]> {
  const projetos: CamaraProjeto[] = [];
  
  for (const tipo of tipos) {
    try {
      // Endpoint: /proposicoes?autor={nome}&siglaTipo={tipo}
      const nomeEncoded = encodeURIComponent(nomeDeputado);
      const url = `${BASE}/proposicoes?autor=${nomeEncoded}&siglaTipo=${tipo}&itens=${itensPorPagina}&ordem=DESC&ordenarPor=id`;
      
      console.log(`🔍 Buscando ${tipo} do autor "${nomeDeputado}": ${url}`);
      
      const response = await fetch(url, defaultInit);
      
      if (!response.ok) {
        console.log(`⚠️ Erro ao buscar ${tipo} por nome: ${response.status}`);
        continue;
      }
      
      const data = await response.json();
      const proposicoes = data.dados || [];
      
      console.log(`📊 Encontradas ${proposicoes.length} proposições ${tipo} do autor "${nomeDeputado}"`);
      
      for (const proposicao of proposicoes) {
        const projeto: CamaraProjeto = {
          id: `${proposicao.siglaTipo}-${proposicao.numero}-${proposicao.ano}`,
          tipo: proposicao.siglaTipo,
          numero: proposicao.numero.toString(),
          ano: proposicao.ano.toString(),
          ementa: proposicao.ementa || `Projeto ${proposicao.siglaTipo} ${proposicao.numero}/${proposicao.ano}`,
          dataApresentacao: proposicao.dataApresentacao,
          status: proposicao.statusProposicao?.tramitacao?.situacao?.descricao,
          url: `https://www.camara.leg.br/proposicoesWeb/fichadetramitacao?idProposicao=${proposicao.id}`
        };
        
        projetos.push(projeto);
        console.log(`✅ Projeto encontrado: ${proposicao.siglaTipo} ${proposicao.numero}/${proposicao.ano}`);
      }
      
    } catch (error) {
      console.log(`❌ Erro ao buscar ${tipo} por nome:`, error);
    }
  }
  
  return projetos;
}

/**
 * Verifica se o deputado é autor de uma proposição
 * Endpoint: /proposicoes/{id}/autores
 */
async function verificarSeDeputadoEAutor(proposicaoId: number, deputadoId: number): Promise<boolean> {
  try {
    const autoresUrl = `${BASE}/proposicoes/${proposicaoId}/autores`;
    const response = await fetch(autoresUrl, defaultInit);
    
    if (!response.ok) {
      return false;
    }
    
    const data = await response.json();
    const autores = data.dados || [];
    
    return autores.some((autor: any) => {
      // Verificar por ID ou por nome
      return autor.id === deputadoId || 
             (autor.nome && autor.nome.toLowerCase().includes('jadyel'));
    });
    
  } catch (error) {
    return false;
  }
}

/**
 * Função para buscar informações do deputado
 * Endpoint: /deputados/{id}
 */
export async function buscarInformacoesDeputado(idDeputado: number) {
  try {
    const url = `${BASE}/deputados/${idDeputado}`;
    const response = await fetch(url, defaultInit);
    
    if (!response.ok) {
      throw new Error(`Erro HTTP: ${response.status}`);
    }
    
    const data = await response.json();
    return data.dados;
    
  } catch (error) {
    console.error('❌ Erro ao buscar informações do deputado:', error);
    return null;
  }
}

/**
 * Função para buscar todas as proposições de um deputado (se disponível)
 * Endpoint: /deputados/{id}/proposicoes
 */
export async function buscarProposicoesDoDeputadoEndpoint(idDeputado: number) {
  try {
    const url = `${BASE}/deputados/${idDeputado}/proposicoes`;
    const response = await fetch(url, defaultInit);
    
    if (!response.ok) {
      throw new Error(`Erro HTTP: ${response.status}`);
    }
    
    const data = await response.json();
    return data.dados || [];
    
  } catch (error) {
    console.error('❌ Erro ao buscar proposições do deputado:', error);
    return [];
  }
}
