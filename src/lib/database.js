import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Criar banco SQLite na pasta do projeto
const dbPath = path.join(__dirname, '../../data/bot_whatsapp.db');

// Garantir que a pasta data existe
const dataDir = path.dirname(dbPath);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new Database(dbPath);

// Configurar o banco para melhor performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Tabela de materiais de campanha
db.exec(`
  CREATE TABLE IF NOT EXISTS materiais (
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

// Tabela de solicitações de materiais
db.exec(`
  CREATE TABLE IF NOT EXISTS solicitacoes_materiais (
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

// Tabela de entregas realizadas
db.exec(`
  CREATE TABLE IF NOT EXISTS entregas_materiais (
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

// Tabela de serviços de marketing
db.exec(`
  CREATE TABLE IF NOT EXISTS servicos_marketing (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    categoria TEXT NOT NULL,
    descricao TEXT,
    tempo_estimado TEXT,
    custo_estimado REAL DEFAULT 0.00,
    fornecedor TEXT,
    observacoes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Tabela de solicitações de marketing
db.exec(`
  CREATE TABLE IF NOT EXISTS solicitacoes_marketing (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    phone_number TEXT NOT NULL,
    nome_solicitante TEXT,
    municipio_solicitante TEXT,
    servico_solicitado TEXT NOT NULL,
    descricao_projeto TEXT,
    prazo_desejado DATE,
    valor_estimado REAL DEFAULT 0.00,
    observacoes TEXT,
    status TEXT DEFAULT 'pendente',
    resposta_administrativo TEXT,
    data_entrega DATE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Tabela de entregas de marketing realizadas
db.exec(`
  CREATE TABLE IF NOT EXISTS entregas_marketing (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    solicitacao_id INTEGER,
    phone_number TEXT NOT NULL,
    nome_solicitante TEXT,
    municipio_solicitante TEXT,
    servico_entregue TEXT NOT NULL,
    arquivos_entregues TEXT,
    valor_final REAL,
    data_entrega DATE,
    responsavel_entrega TEXT,
    observacoes_entrega TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (solicitacao_id) REFERENCES solicitacoes_marketing(id)
  )
`);

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
