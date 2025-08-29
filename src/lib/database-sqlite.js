import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Criar banco SQLite na pasta do projeto
const dbPath = path.join(__dirname, '../../data/bot_whatsapp.db');

// Garantir que a pasta data existe
import fs from 'fs';
const dataDir = path.dirname(dbPath);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new Database(dbPath);

// Configurar o banco para melhor performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Função para executar queries (similar ao pg)
const query = (sql, params = []) => {
  try {
    if (sql.trim().toLowerCase().startsWith('select')) {
      const stmt = db.prepare(sql);
      return { rows: stmt.all(params) };
    } else {
      const stmt = db.prepare(sql);
      const result = stmt.run(params);
      return { rows: [{ id: result.lastInsertRowid }] };
    }
  } catch (error) {
    console.error('Erro na query SQLite:', error);
    throw error;
  }
};

// Função para fechar conexão
const end = () => {
  db.close();
};

export default { query, end };
