import pool from '../src/lib/database.js';

const createTables = async () => {
  try {
    // Tabela de usuários VIP (lideranças)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS whitelist (
        id SERIAL PRIMARY KEY,
        phone_number VARCHAR(20) UNIQUE NOT NULL,
        name VARCHAR(255),
        role VARCHAR(100),
        municipio VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Adicionar coluna municipio se não existir (para tabelas já criadas)
    try {
      await pool.query(`
        ALTER TABLE whitelist ADD COLUMN IF NOT EXISTS municipio VARCHAR(100);
      `);
    } catch (error) {
      // Coluna já existe, ignorar erro
    }

    // Tabela de base de conhecimento
    await pool.query(`
      CREATE TABLE IF NOT EXISTS knowledge_base (
        id SERIAL PRIMARY KEY,
        kb_id VARCHAR(50) UNIQUE NOT NULL,
        titulo VARCHAR(255) NOT NULL,
        conteudo TEXT NOT NULL,
        resposta TEXT NOT NULL,
        fonte VARCHAR(255),
        tags TEXT[],
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Tabela de respostas padrão
    await pool.query(`
      CREATE TABLE IF NOT EXISTS canned_responses (
        id SERIAL PRIMARY KEY,
        key_name VARCHAR(100) UNIQUE NOT NULL,
        response_text TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Tabela de logs de conversas
    await pool.query(`
      CREATE TABLE IF NOT EXISTS conversation_logs (
        id SERIAL PRIMARY KEY,
        phone_number VARCHAR(20) NOT NULL,
        is_vip BOOLEAN DEFAULT FALSE,
        message_text TEXT NOT NULL,
        response_text TEXT,
        intent VARCHAR(50),
        confidence_score DECIMAL(3,2),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('✅ Tabelas criadas com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao criar tabelas:', error);
  } finally {
    await pool.end();
  }
};

createTables();
