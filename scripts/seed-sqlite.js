import pool from '../src/lib/database.js';

const seedData = async () => {
  try {
    // Inserir números VIP (lideranças)
    await pool.query(`
      INSERT OR IGNORE INTO whitelist (phone_number, name, role) VALUES
      ('+5586999999999', 'João Silva', 'Líder Comunitário'),
      ('+5561999999999', 'Maria Santos', 'Coordenadora Regional');
    `);

    // Inserir base de conhecimento
    await pool.query(`
      INSERT OR IGNORE INTO knowledge_base (kb_id, titulo, conteudo, resposta, fonte, tags) VALUES
      ('PROJ-PIAUÍ-001', 'Projeto ECA Digital (PL 2628/2022)', 
       'O Deputado é relator do PL 2628/2022, conhecido como ECA Digital, que fortalece a proteção de crianças e adolescentes em ambientes digitais.',
       'O Deputado é relator do PL 2628/2022 (ECA Digital), projeto que reforça a proteção de crianças e adolescentes na internet, aprimorando regras para plataformas e responsabilização.',
       'Gabinete - Projetos Prioritários',
       'projetos,bandeiras:criancas,tema:internet,estado:Piauí'),
      
      ('REAL-TERESINA-001', 'Realizações em Teresina - Saúde',
       'Apoio à implantação do Hospital do Amor em Teresina com articulação de terreno e etapas de prevenção oncológica.',
       'Em Teresina, uma das entregas apoiadas foi a vinda do Hospital do Amor, com foco em prevenção e estrutura para ampliar o atendimento oncológico.',
       'Relatório de Entregas por Cidade (Teresina)',
       'realizacoes,cidade:teresina,saude'),
      
      ('REAL-PARNAIBA-001', 'Realizações em Parnaíba - Educação',
       'Destinação de recursos para ampliação de vagas em programas educacionais.',
       'Em Parnaíba, houve destinação de recursos para ampliar vagas em iniciativas de educação, beneficiando escolas e projetos locais.',
       'Relatório de Entregas por Cidade (Parnaíba)',
       'realizacoes,cidade:parnaiba,educacao'),
      
      ('BANDEIRA-001', 'Bandeiras do Deputado',
       'Proteção da infância no ambiente digital, saúde preventiva, apoio à segurança pública e fortalecimento da educação.',
       'Principais bandeiras: proteção da infância no ambiente digital, saúde preventiva, apoio à segurança pública e fortalecimento da educação.',
       'Carta de Princípios',
       'bandeiras');
    `);

    // Inserir respostas padrão
    await pool.query(`
      INSERT OR IGNORE INTO canned_responses (key_name, response_text) VALUES
      ('boas_vindas', 'Olá! 👋 Sou o assistente virtual do Deputado. Como posso ajudar?'),
      ('fallback', 'Não encontrei detalhes sobre isso na nossa base. Este canal responde sobre o Deputado (projetos, bandeiras e realizações por cidade).'),
      ('menu_vip', 'Menu Lideranças:\n1) Agendar Atendimento\n2) Solicitar Material\n3) Registrar Evento/Reunião\n\nObs.: nesta PoC, o menu é ilustrativo; o atendimento geral já está funcionando.'),
      ('menu_geral', 'Este é o canal oficial de informações do Deputado.\nPergunte sobre: projetos, bandeiras, realizações por cidade, agenda e afins.\nDica: cite a cidade para ver realizações locais. Ex.: "obras em Teresina".\nDigite "menu" para ver opções.'),
      ('fallback_tema', 'Posso ajudar com assuntos relacionados ao Deputado: projetos, bandeiras e realizações por cidade.\nSe sua dúvida for outra, posso encaminhar para a equipe humana 😉');
    `);

    console.log('✅ Dados iniciais inseridos com sucesso no SQLite!');
  } catch (error) {
    console.error('❌ Erro ao inserir dados:', error);
  } finally {
    await pool.end();
  }
};

seedData();
