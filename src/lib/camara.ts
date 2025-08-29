// lib/camara.ts
const BASE = "https://dadosabertos.camara.leg.br/api/v2";

// Por boas práticas, sempre envie um User-Agent identificando seu app
const defaultInit: RequestInit = {
  headers: {
    "Accept": "application/json",
    "User-Agent": "JadyelBot/1.0 (Contato: gabinete@jadyel.com.br)"
  },
};

interface Proposicao {
  id: number;
  uri: string;
  tipo: string;
  numero: number;
  ano: number;
  ementa: string;
  dataApresentacao: string;
  uriAutores: string;
  uriTramitacoes: string;
  url?: string;
}

/**
 * Busca proposições do deputado Jadyel Alencar de forma eficiente
 */
export async function buscarProposicoesDoDeputado({
  idDeputado = 220697, // Jadyel Alencar
  tipos = ["PL", "PEC", "PLP"],
  itensPorPagina = 100,
}: {
  idDeputado?: number;
  tipos?: string[];
  itensPorPagina?: number;
}): Promise<Proposicao[]> {
  console.log(`🔍 Buscando proposições do deputado ${idDeputado} (Jadyel Alencar)...`);
  
  const resultados: any[] = [];

  // Função auxiliar para GET
  async function getJson(u: URL) {
    const resp = await fetch(u.toString(), defaultInit);
    if (resp.ok) {
      return await resp.json();
    }
    throw new Error(`Falha ${resp.status} ao buscar ${u.pathname}`);
  }

  // Função para verificar se o deputado é autor de uma proposição
  async function verificarAutor(proposicaoId: number): Promise<boolean> {
    try {
      const autoresUrl = `${BASE}/proposicoes/${proposicaoId}/autores`;
      const data = await getJson(new URL(autoresUrl));
      
      if (data.dados && Array.isArray(data.dados)) {
        return data.dados.some((autor: any) => autor.id === idDeputado);
      }
      return false;
    } catch (error) {
      console.log(`⚠️ Erro ao verificar autores da proposição ${proposicaoId}`);
      return false;
    }
  }

  // Buscar proposições recentes de cada tipo
  for (const tipo of tipos) {
    console.log(`\n🔍 Buscando proposições recentes do tipo ${tipo}...`);
    
    try {
      const urlBase = new URL(`${BASE}/proposicoes`);
      urlBase.searchParams.set("siglaTipo", tipo);
      urlBase.searchParams.set("itens", String(itensPorPagina));
      urlBase.searchParams.set("ordem", "DESC");
      urlBase.searchParams.set("ordenarPor", "id");
      
      const data = await getJson(urlBase);
      const paginaDados = data?.dados ?? [];
      
      console.log(`📊 Encontradas ${paginaDados.length} proposições recentes do tipo ${tipo}`);
      
      // Verificar apenas as primeiras 20 proposições de cada tipo
      const proposicoesParaVerificar = paginaDados.slice(0, 20);
      
      for (const proposicao of proposicoesParaVerificar) {
        const isAutor = await verificarAutor(proposicao.id);
        
        if (isAutor) {
          console.log(`✅ Proposição ${proposicao.siglaTipo} ${proposicao.numero}/${proposicao.ano} pertence ao deputado!`);
          resultados.push(proposicao);
        }
      }
      
      // Se já encontramos algumas proposições do deputado, podemos parar
      if (resultados.length >= 10) {
        console.log(`🎯 Encontradas ${resultados.length} proposições do deputado, parando busca...`);
        break;
      }
      
      // Aguardar um pouco entre os tipos
      await new Promise(r => setTimeout(r, 200));
      
    } catch (error) {
      console.error(`❌ Erro ao buscar proposições do tipo ${tipo}:`, error);
    }
  }

  console.log(`🎯 Total de proposições do deputado encontradas: ${resultados.length}`);

  // Mapeia um formato mais amigável
  return resultados.map((p: any) => ({
    id: p.id,
    uri: p.uri,
    tipo: p.siglaTipo,
    numero: p.numero,
    ano: p.ano,
    ementa: p.ementa,
    dataApresentacao: p.dataApresentacao,
    uriAutores: p.uriAutores,
    uriTramitacoes: p.uriTramitacoes,
    url: `https://www.camara.leg.br/proposicoesWeb/fichadetramitacao?idProposicao=${p.id}`
  }));
}
