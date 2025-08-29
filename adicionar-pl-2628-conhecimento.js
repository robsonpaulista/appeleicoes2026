// Script para adicionar o PL-2628/2022 à base de conhecimento do bot

import { knowledgeBaseService } from './src/lib/services.js';

async function adicionarPL2628AoConhecimento() {
  console.log('📋 Adicionando PL-2628/2022 à base de conhecimento...\n');
  
  try {
    // Dados do PL-2628/2022
    const pl2628 = {
      kb_id: 'pl-2628-2022',
      titulo: 'PL-2628/2022 - ECA Digital (Proteção de Crianças em Ambientes Digitais)',
      conteudo: `O deputado Jadyel Alencar foi relator do PL-2628/2022, conhecido como "ECA Digital", um projeto de alcance nacional que cria regras para a proteção de crianças e adolescentes em ambientes digitais. Como relator, ele liderou um dos projetos mais importantes para a proteção infantil, que foi aprovado por ampla maioria na Câmara dos Deputados em 20/08/2025.

Este projeto combate a pedofilia, sexualização precoce, automutilação e jogos de azar online, estabelecendo obrigações para fornecedores de aplicativos e redes sociais. A atuação do deputado como relator foi fundamental para construir o consenso suprapartidário necessário para a aprovação desta importante legislação de proteção infantil.

**Principais conquistas do projeto:**
• Proteção contra conteúdos nocivos (pedofilia, sexualização precoce)
• Combate à automutilação e jogos de azar online
• Controle parental centralizado nas lojas de aplicativos
• Canais de denúncia para conteúdos inadequados
• Responsabilização das plataformas digitais
• Empoderamento das famílias no controle do acesso digital

O PL-2628/2022 representa um dos principais legados parlamentares do deputado Jadyel Alencar, demonstrando sua capacidade de liderança técnica e política em temas de proteção infantil de grande relevância nacional.`,
      resposta: `O deputado Jadyel Alencar foi relator do PL-2628/2022, conhecido como "ECA Digital", um projeto de alcance nacional que cria regras para a proteção de crianças e adolescentes em ambientes digitais. Como relator, ele liderou um dos projetos mais importantes para a proteção infantil, que foi aprovado por ampla maioria na Câmara dos Deputados em 20/08/2025.

Este projeto combate a pedofilia, sexualização precoce, automutilação e jogos de azar online, estabelecendo obrigações para fornecedores de aplicativos e redes sociais. A atuação do deputado como relator foi fundamental para construir o consenso suprapartidário necessário para a aprovação desta importante legislação de proteção infantil.

**Principais conquistas:**
• Proteção contra conteúdos nocivos
• Combate à pedofilia e sexualização precoce
• Controle parental centralizado
• Responsabilização das plataformas digitais
• Empoderamento das famílias

O PL-2628/2022 representa um dos principais legados parlamentares do deputado Jadyel Alencar.`,
      tags: 'projetos,PL-2628,ECA Digital,proteção infantil,crianças,adolescentes,redes sociais,relator,Jadyel Alencar,aprovado,câmara',
      fonte: 'Base de conhecimento - Projeto específico',
      categoria: 'projetos'
    };

    // Verificar se já existe e atualizar, senão adicionar
    const existing = await knowledgeBaseService.search('PL-2628');
    let resultado;
    
    if (existing.length > 0) {
      // Atualizar o projeto existente
      resultado = await knowledgeBaseService.update(existing[0].kb_id, pl2628);
      console.log('🔄 PL-2628/2022 atualizado com sucesso!');
    } else {
      // Adicionar novo projeto
      resultado = await knowledgeBaseService.add(pl2628);
      console.log('✅ PL-2628/2022 adicionado com sucesso!');
    }
    
    console.log('📋 ID:', resultado.kb_id);
    console.log('🏷️ Tags:', pl2628.tags);
    console.log('📝 Categoria:', pl2628.categoria);
    
    // Verificar se foi adicionado corretamente
    const busca = await knowledgeBaseService.search('PL-2628');
    console.log('\n🔍 Teste de busca por "PL-2628":');
    console.log('Resultados encontrados:', busca.length);
    
    if (busca.length > 0) {
      console.log('✅ Projeto encontrado na busca!');
      console.log('📋 Título:', busca[0].titulo);
    }
    
  } catch (error) {
    console.error('❌ Erro ao adicionar PL-2628:', error);
  }
}

// Executar
adicionarPL2628AoConhecimento();
