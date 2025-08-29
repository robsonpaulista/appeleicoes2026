import pool from '../src/lib/database.js';

const createTables = async () => {
  try {
    // Tabela de usuários VIP (lideranças)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS whitelist (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        phone_number TEXT UNIQUE NOT NULL,
        name TEXT,
        role TEXT,
        municipio TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Adicionar coluna municipio se não existir (para tabelas já criadas)
    try {
      await pool.query(`
        ALTER TABLE whitelist ADD COLUMN municipio TEXT;
      `);
    } catch (error) {
      // Coluna já existe, ignorar erro
    }

    // Tabela de configuração do bot
    await pool.query(`
      CREATE TABLE IF NOT EXISTS bot_config (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        bot_phone_number TEXT,
        bot_name TEXT DEFAULT 'Bot WhatsApp Deputado',
        is_active BOOLEAN DEFAULT 0,
        last_connected DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Tabela de base de conhecimento
    await pool.query(`
      CREATE TABLE IF NOT EXISTS knowledge_base (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        kb_id TEXT UNIQUE NOT NULL,
        titulo TEXT NOT NULL,
        conteudo TEXT NOT NULL,
        resposta TEXT NOT NULL,
        fonte TEXT,
        tags TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Tabela de respostas padrão
    await pool.query(`
      CREATE TABLE IF NOT EXISTS canned_responses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        key_name TEXT UNIQUE NOT NULL,
        response_text TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Tabela de logs de conversas
    await pool.query(`
      CREATE TABLE IF NOT EXISTS conversation_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        phone_number TEXT NOT NULL,
        is_vip BOOLEAN DEFAULT 0,
        message_text TEXT NOT NULL,
        response_text TEXT,
        intent TEXT,
        confidence_score REAL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('✅ Tabelas criadas com sucesso no SQLite!');
  } catch (error) {
    console.error('❌ Erro ao criar tabelas:', error);
  } finally {
    await pool.end();
  }
};

createTables();
