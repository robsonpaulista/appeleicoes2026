// Script para recriar o banco de dados com as novas estruturas

import pool from './src/lib/database.js';

async function recriarBanco() {
  console.log('🔄 Recriando banco de dados...\n');
  
  try {
    // Recriar tabela de solicitações com as novas colunas
    console.log('1️⃣ Recriando tabela de solicitações...');
    await pool.query('DROP TABLE IF EXISTS solicitacoes_materiais');
    await pool.query(`
      CREATE TABLE solicitacoes_materiais (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        phone_number TEXT NOT NULL,
        nome_solicitante TEXT,
        municipio_solicitante TEXT,
        material_solicitado TEXT NOT NULL,
        quantidade INTEGER DEFAULT 1,
        valor_unitario REAL DEFAULT 0.00,
        valor_total REAL DEFAULT 0.00,
        observacoes TEXT,
        status TEXT DEFAULT 'pendente',
        resposta_administrativo TEXT,
        data_entrega DATE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Tabela de solicitações recriada');

    // Recriar tabela de entregas
    console.log('2️⃣ Recriando tabela de entregas...');
    await pool.query('DROP TABLE IF EXISTS entregas_materiais');
    await pool.query(`
      CREATE TABLE entregas_materiais (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        solicitacao_id INTEGER,
        phone_number TEXT NOT NULL,
        nome_solicitante TEXT,
        municipio_solicitante TEXT,
        material_entregue TEXT NOT NULL,
        quantidade_entregue INTEGER,
        valor_unitario REAL,
        valor_total_entregue REAL,
        data_entrega DATE,
        responsavel_entrega TEXT,
        observacoes_entrega TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (solicitacao_id) REFERENCES solicitacoes_materiais(id)
      )
    `);
    console.log('✅ Tabela de entregas recriada');

    // Recriar tabela de materiais
    console.log('3️⃣ Recriando tabela de materiais...');
    await pool.query('DROP TABLE IF EXISTS materiais');
    await pool.query(`
      CREATE TABLE materiais (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        categoria TEXT NOT NULL,
        descricao TEXT,
        estoque_atual INTEGER DEFAULT 0,
        estoque_minimo INTEGER DEFAULT 0,
        custo_unitario REAL DEFAULT 0.00,
        fornecedor TEXT,
        observacoes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Tabela de materiais recriada');

    // Recriar outras tabelas necessárias
    console.log('4️⃣ Recriando outras tabelas...');
    
    // Whitelist
    await pool.query('DROP TABLE IF EXISTS whitelist');
    await pool.query(`
      CREATE TABLE whitelist (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        phone_number TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        role TEXT,
        municipio TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Knowledge base
    await pool.query('DROP TABLE IF EXISTS knowledge_base');
    await pool.query(`
      CREATE TABLE knowledge_base (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        kb_id TEXT UNIQUE NOT NULL,
        titulo TEXT NOT NULL,
        conteudo TEXT,
        resposta TEXT NOT NULL,
        fonte TEXT,
        tags TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Conversation logs
    await pool.query('DROP TABLE IF EXISTS conversation_logs');
    await pool.query(`
      CREATE TABLE conversation_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        phone_number TEXT NOT NULL,
        is_vip BOOLEAN DEFAULT 0,
        message_text TEXT NOT NULL,
        response_text TEXT NOT NULL,
        intent TEXT,
        confidence_score REAL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Canned responses
    await pool.query('DROP TABLE IF EXISTS canned_responses');
    await pool.query(`
      CREATE TABLE canned_responses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        key_name TEXT UNIQUE NOT NULL,
        response_text TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Bot config
    await pool.query('DROP TABLE IF EXISTS bot_config');
    await pool.query(`
      CREATE TABLE bot_config (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        bot_phone_number TEXT,
        bot_name TEXT DEFAULT 'Bot WhatsApp Deputado',
        is_active BOOLEAN DEFAULT 0,
        last_connected DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('✅ Todas as tabelas recriadas com sucesso!');
    console.log('\n📋 Estrutura do banco atualizada:');
    console.log('- ✅ solicitacoes_materiais (com municipio_solicitante, valor_unitario, valor_total)');
    console.log('- ✅ entregas_materiais (com todas as colunas de controle)');
    console.log('- ✅ materiais (tabela de estoque)');
    console.log('- ✅ whitelist (VIPs)');
    console.log('- ✅ knowledge_base (base de conhecimento)');
    console.log('- ✅ conversation_logs (logs de conversa)');
    console.log('- ✅ canned_responses (respostas padrão)');
    console.log('- ✅ bot_config (configuração do bot)');

  } catch (error) {
    console.error('❌ Erro ao recriar banco:', error);
  }
}

// Executar recriação
recriarBanco();
