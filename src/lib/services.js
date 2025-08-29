import pool from './database.js';

// Serviços para Whitelist (Lideranças)
export const whitelistService = {
  async isVip(phoneNumber) {
    const result = await pool.query(
      'SELECT * FROM whitelist WHERE phone_number = ?',
      [phoneNumber]
    );
    return result.rows.length > 0;
  },

  async addVip(phoneNumber, name, role, municipio) {
    try {
      console.log('Tentando adicionar VIP:', { phoneNumber, name, role, municipio });
      const result = await pool.query(
        'INSERT INTO whitelist (phone_number, name, role, municipio) VALUES (?, ?, ?, ?) RETURNING *',
        [phoneNumber, name, role, municipio]
      );
      console.log('VIP adicionado com sucesso:', result.rows[0]);
      return result.rows[0];
    } catch (error) {
      console.error('Erro ao adicionar VIP:', error);
      throw error;
    }
  },

  async getAllVips() {
    const result = await pool.query('SELECT * FROM whitelist ORDER BY created_at DESC');
    return result.rows;
  },

  async removeVip(phoneNumber) {
    await pool.query('DELETE FROM whitelist WHERE phone_number = ?', [phoneNumber]);
  },

  async getVipInfo(phoneNumber) {
    const result = await pool.query(
      'SELECT name, role, municipio FROM whitelist WHERE phone_number = ?',
      [phoneNumber]
    );
    return result.rows[0];
  }
};

// Serviços para Base de Conhecimento
export const knowledgeBaseService = {
  async getAll() {
    const result = await pool.query('SELECT * FROM knowledge_base ORDER BY created_at DESC');
    return result.rows;
  },

  async getById(kbId) {
    const result = await pool.query('SELECT * FROM knowledge_base WHERE kb_id = ?', [kbId]);
    return result.rows[0];
  },

  async add(kbData) {
    const { kb_id, titulo, conteudo, resposta, fonte, tags } = kbData;
    const result = await pool.query(
      'INSERT INTO knowledge_base (kb_id, titulo, conteudo, resposta, fonte, tags) VALUES (?, ?, ?, ?, ?, ?) RETURNING *',
      [kb_id, titulo, conteudo, resposta, fonte, tags]
    );
    return result.rows[0];
  },

  async update(kbId, kbData) {
    const { titulo, conteudo, resposta, fonte, tags } = kbData;
    const result = await pool.query(
      'UPDATE knowledge_base SET titulo = ?, conteudo = ?, resposta = ?, fonte = ?, tags = ?, updated_at = CURRENT_TIMESTAMP WHERE kb_id = ? RETURNING *',
      [titulo, conteudo, resposta, fonte, tags, kbId]
    );
    return result.rows[0];
  },

  async delete(kbId) {
    await pool.query('DELETE FROM knowledge_base WHERE kb_id = ?', [kbId]);
  },

  async search(query) {
    const normalizedQuery = query.toLowerCase().trim();
    
    // Busca otimizada para projetos
    let sql = '';
    let params = [];
    
    if (normalizedQuery.includes('projeto') || normalizedQuery.includes('projetos')) {
      // Busca específica para projetos - priorizar itens com tag "projetos"
      sql = `
        SELECT *, 
          CASE 
            WHEN tags LIKE '%projetos%' THEN 1
            WHEN titulo LIKE '%PL%' OR titulo LIKE '%PEC%' OR titulo LIKE '%PLP%' THEN 2
            ELSE 3
          END as priority
        FROM knowledge_base 
        WHERE (titulo LIKE ? OR conteudo LIKE ? OR tags LIKE ?)
        ORDER BY priority ASC, created_at DESC
        LIMIT 5
      `;
      params = [`%${query}%`, `%${query}%`, `%${query}%`];
    } else {
      // Busca geral
      sql = `
        SELECT * FROM knowledge_base 
        WHERE titulo LIKE ? OR conteudo LIKE ? OR tags LIKE ?
        ORDER BY created_at DESC
        LIMIT 5
      `;
      params = [`%${query}%`, `%${query}%`, `%${query}%`];
    }
    
    const result = await pool.query(sql, params);
    return result.rows;
  },

  async searchProjetos() {
    // Busca específica para todos os projetos
    const result = await pool.query(
      `SELECT * FROM knowledge_base 
       WHERE tags LIKE '%projetos%' OR titulo LIKE '%PL%' OR titulo LIKE '%PEC%' OR titulo LIKE '%PLP%'
       ORDER BY created_at DESC
       LIMIT 10`
    );
    return result.rows;
  }
};

// Serviços para Respostas Padrão
export const cannedResponseService = {
  async get(keyName) {
    const result = await pool.query(
      'SELECT response_text FROM canned_responses WHERE key_name = ?',
      [keyName]
    );
    return result.rows[0]?.response_text;
  },

  async getAll() {
    const result = await pool.query('SELECT * FROM canned_responses ORDER BY key_name');
    return result.rows;
  },

  async set(keyName, responseText) {
    const result = await pool.query(
      'INSERT INTO canned_responses (key_name, response_text) VALUES (?, ?) ON CONFLICT (key_name) DO UPDATE SET response_text = ? RETURNING *',
      [keyName, responseText, responseText]
    );
    return result.rows[0];
  }
};

// Serviços para Logs de Conversa
export const conversationLogService = {
  async log(phoneNumber, isVip, messageText, responseText, intent, confidenceScore) {
    const result = await pool.query(
      'INSERT INTO conversation_logs (phone_number, is_vip, message_text, response_text, intent, confidence_score) VALUES (?, ?, ?, ?, ?, ?) RETURNING *',
      [phoneNumber, isVip, messageText, responseText, intent, confidenceScore]
    );
    return result.rows[0];
  },

  async getAll() {
    const result = await pool.query('SELECT * FROM conversation_logs ORDER BY created_at DESC');
    return result.rows;
  },

  async getByPhone(phoneNumber) {
    const result = await pool.query(
      'SELECT * FROM conversation_logs WHERE phone_number = ? ORDER BY created_at DESC',
      [phoneNumber]
    );
    return result.rows;
  },

  async getStats() {
    const result = await pool.query(`
      SELECT 
        COUNT(*) as total_messages,
        COUNT(DISTINCT phone_number) as unique_users,
        SUM(CASE WHEN is_vip = 1 THEN 1 ELSE 0 END) as vip_messages,
        SUM(CASE WHEN is_vip = 0 THEN 1 ELSE 0 END) as general_messages
      FROM conversation_logs
    `);
    return result.rows;
  }
};

// Serviços para Configuração do Bot
export const configService = {
  async get() {
    const result = await pool.query('SELECT * FROM bot_config LIMIT 1');
    if (result.rows.length > 0) {
      const config = result.rows[0];
      return {
        botPhoneNumber: config.bot_phone_number || '',
        botName: config.bot_name || 'Bot WhatsApp Deputado',
        isActive: Boolean(config.is_active),
        lastConnected: config.last_connected
      };
    }
    // Retorna configuração padrão se não existir
    return {
      botPhoneNumber: '',
      botName: 'Bot WhatsApp Deputado',
      isActive: false,
      lastConnected: null
    };
  },

  async set(configData) {
    const { botPhoneNumber, botName, isActive } = configData;
    
    // Converte boolean para número (SQLite)
    const isActiveNumber = isActive ? 1 : 0;
    
    // Verifica se já existe configuração
    const existing = await pool.query('SELECT * FROM bot_config LIMIT 1');
    
    if (existing.rows.length > 0) {
      // Atualiza configuração existente
      const result = await pool.query(
        'UPDATE bot_config SET bot_phone_number = ?, bot_name = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP RETURNING *',
        [botPhoneNumber, botName, isActiveNumber]
      );
      return result.rows[0];
    } else {
      // Cria nova configuração
      const result = await pool.query(
        'INSERT INTO bot_config (bot_phone_number, bot_name, is_active) VALUES (?, ?, ?) RETURNING *',
        [botPhoneNumber, botName, isActiveNumber]
      );
      return result.rows[0];
    }
  },

  async updateStatus(isActive, lastConnected = null) {
    const isActiveNumber = isActive ? 1 : 0;
    const result = await pool.query(
      'UPDATE bot_config SET is_active = ?, last_connected = ?, updated_at = CURRENT_TIMESTAMP RETURNING *',
      [isActiveNumber, lastConnected]
    );
    return result.rows[0];
  }
};

// Serviços para Materiais de Campanha
export const materiaisService = {
  async getAll() {
    const result = await pool.query('SELECT * FROM materiais ORDER BY categoria, nome');
    return result.rows;
  },

  async getById(id) {
    const result = await pool.query('SELECT * FROM materiais WHERE id = ?', [id]);
    return result.rows[0];
  },

  async add(materialData) {
    const { nome, categoria, descricao, estoque_atual, estoque_minimo, custo_unitario, fornecedor, observacoes } = materialData;
    const result = await pool.query(
      'INSERT INTO materiais (nome, categoria, descricao, estoque_atual, estoque_minimo, custo_unitario, fornecedor, observacoes) VALUES (?, ?, ?, ?, ?, ?, ?, ?) RETURNING *',
      [nome, categoria, descricao, estoque_atual || 0, estoque_minimo || 0, custo_unitario || 0.00, fornecedor, observacoes]
    );
    return result.rows[0];
  },

  async update(id, materialData) {
    const { nome, categoria, descricao, estoque_atual, estoque_minimo, custo_unitario, fornecedor, observacoes } = materialData;
    const result = await pool.query(
      'UPDATE materiais SET nome = ?, categoria = ?, descricao = ?, estoque_atual = ?, estoque_minimo = ?, custo_unitario = ?, fornecedor = ?, observacoes = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? RETURNING *',
      [nome, categoria, descricao, estoque_atual, estoque_minimo, custo_unitario, fornecedor, observacoes, id]
    );
    return result.rows[0];
  },

  async delete(id) {
    await pool.query('DELETE FROM materiais WHERE id = ?', [id]);
  },

  async updateEstoque(id, quantidade) {
    const result = await pool.query(
      'UPDATE materiais SET estoque_atual = estoque_atual + ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? RETURNING *',
      [quantidade, id]
    );
    return result.rows[0];
  },

  async getByCategoria(categoria) {
    const result = await pool.query(
      'SELECT * FROM materiais WHERE categoria = ? ORDER BY nome',
      [categoria]
    );
    return result.rows;
  },

  async getEstoqueBaixo() {
    const result = await pool.query(
      'SELECT * FROM materiais WHERE estoque_atual <= estoque_minimo ORDER BY estoque_atual ASC'
    );
    return result.rows;
  },

  async search(query) {
    const normalizedQuery = query.toLowerCase().trim();
    const result = await pool.query(
      'SELECT * FROM materiais WHERE nome LIKE ? OR categoria LIKE ? OR descricao LIKE ? ORDER BY categoria, nome',
      [`%${query}%`, `%${query}%`, `%${query}%`]
    );
    return result.rows;
  },

  async getCategorias() {
    const result = await pool.query('SELECT DISTINCT categoria FROM materiais ORDER BY categoria');
    return result.rows.map(row => row.categoria);
  },

  async getStats() {
    const result = await pool.query(`
      SELECT 
        COUNT(*) as total_materiais,
        COUNT(DISTINCT categoria) as total_categorias,
        SUM(estoque_atual * custo_unitario) as valor_total_estoque,
        SUM(CASE WHEN estoque_atual <= estoque_minimo THEN 1 ELSE 0 END) as materiais_estoque_baixo
      FROM materiais
    `);
    return result.rows[0];
  }
};

// Serviços para Solicitações de Materiais
export const solicitacoesService = {
  async add(solicitacaoData) {
    const { phone_number, nome_solicitante, municipio_solicitante, material_solicitado, quantidade, valor_unitario, valor_total, observacoes } = solicitacaoData;
    const result = await pool.query(
      'INSERT INTO solicitacoes_materiais (phone_number, nome_solicitante, municipio_solicitante, material_solicitado, quantidade, valor_unitario, valor_total, observacoes) VALUES (?, ?, ?, ?, ?, ?, ?, ?) RETURNING *',
      [phone_number, nome_solicitante, municipio_solicitante, material_solicitado, quantidade || 1, valor_unitario || 0.00, valor_total || 0.00, observacoes]
    );
    return result.rows[0];
  },

  async getAll() {
    const result = await pool.query('SELECT * FROM solicitacoes_materiais ORDER BY created_at DESC');
    return result.rows;
  },

  async getById(id) {
    const result = await pool.query('SELECT * FROM solicitacoes_materiais WHERE id = ?', [id]);
    return result.rows[0];
  },

  async getByStatus(status) {
    const result = await pool.query(
      'SELECT * FROM solicitacoes_materiais WHERE status = ? ORDER BY created_at DESC',
      [status]
    );
    return result.rows;
  },

  async updateStatus(id, status, resposta_administrativo, data_entrega = null) {
    const result = await pool.query(
      'UPDATE solicitacoes_materiais SET status = ?, resposta_administrativo = ?, data_entrega = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? RETURNING *',
      [status, resposta_administrativo, data_entrega, id]
    );
    return result.rows[0];
  },

  async getStats() {
    const result = await pool.query(`
      SELECT 
        COUNT(*) as total_solicitacoes,
        SUM(CASE WHEN status = 'pendente' THEN 1 ELSE 0 END) as solicitacoes_pendentes,
        SUM(CASE WHEN status = 'aprovada' THEN 1 ELSE 0 END) as solicitacoes_aprovadas,
        SUM(CASE WHEN status = 'rejeitada' THEN 1 ELSE 0 END) as solicitacoes_rejeitadas,
        SUM(valor_total) as valor_total_solicitado,
        SUM(CASE WHEN status = 'aprovada' THEN valor_total ELSE 0 END) as valor_total_aprovado
      FROM solicitacoes_materiais
    `);
    return result.rows[0];
  },

  async getStatsPorLider() {
    const result = await pool.query(`
      SELECT 
        nome_solicitante,
        municipio_solicitante,
        COUNT(*) as total_solicitacoes,
        SUM(CASE WHEN status = 'aprovada' THEN 1 ELSE 0 END) as solicitacoes_aprovadas,
        SUM(CASE WHEN status = 'pendente' THEN 1 ELSE 0 END) as solicitacoes_pendentes,
        SUM(CASE WHEN status = 'rejeitada' THEN 1 ELSE 0 END) as solicitacoes_rejeitadas,
        SUM(valor_total) as valor_total_solicitado,
        SUM(CASE WHEN status = 'aprovada' THEN valor_total ELSE 0 END) as valor_total_aprovado,
        MAX(created_at) as ultima_solicitacao
      FROM solicitacoes_materiais
      GROUP BY nome_solicitante, municipio_solicitante
      ORDER BY valor_total_aprovado DESC
    `);
    return result.rows;
  },

  async getStatsPorMunicipio() {
    const result = await pool.query(`
      SELECT 
        municipio_solicitante,
        COUNT(*) as total_solicitacoes,
        COUNT(DISTINCT nome_solicitante) as total_lideres,
        SUM(CASE WHEN status = 'aprovada' THEN 1 ELSE 0 END) as solicitacoes_aprovadas,
        SUM(CASE WHEN status = 'pendente' THEN 1 ELSE 0 END) as solicitacoes_pendentes,
        SUM(CASE WHEN status = 'rejeitada' THEN 1 ELSE 0 END) as solicitacoes_rejeitadas,
        SUM(valor_total) as valor_total_solicitado,
        SUM(CASE WHEN status = 'aprovada' THEN valor_total ELSE 0 END) as valor_total_aprovado,
        AVG(valor_total) as valor_medio_por_solicitacao
      FROM solicitacoes_materiais
      WHERE municipio_solicitante IS NOT NULL
      GROUP BY municipio_solicitante
      ORDER BY valor_total_aprovado DESC
    `);
    return result.rows;
  },

  async getStatsPorMaterial() {
    const result = await pool.query(`
      SELECT 
        material_solicitado,
        COUNT(*) as total_solicitacoes,
        SUM(quantidade) as quantidade_total_solicitada,
        SUM(CASE WHEN status = 'aprovada' THEN quantidade ELSE 0 END) as quantidade_aprovada,
        SUM(valor_total) as valor_total_solicitado,
        SUM(CASE WHEN status = 'aprovada' THEN valor_total ELSE 0 END) as valor_total_aprovado,
        AVG(valor_unitario) as valor_medio_unitario
      FROM solicitacoes_materiais
      GROUP BY material_solicitado
      ORDER BY quantidade_total_solicitada DESC
    `);
    return result.rows;
  },

  async getStatsPorPeriodo(dataInicio, dataFim) {
    const result = await pool.query(`
      SELECT 
        DATE(created_at) as data,
        COUNT(*) as total_solicitacoes,
        SUM(CASE WHEN status = 'aprovada' THEN 1 ELSE 0 END) as solicitacoes_aprovadas,
        SUM(valor_total) as valor_total_solicitado,
        SUM(CASE WHEN status = 'aprovada' THEN valor_total ELSE 0 END) as valor_total_aprovado
      FROM solicitacoes_materiais
      WHERE DATE(created_at) BETWEEN ? AND ?
      GROUP BY DATE(created_at)
      ORDER BY data
    `, [dataInicio, dataFim]);
    return result.rows;
  }
};

// Serviços para Entregas de Materiais
export const entregasService = {
  async add(entregaData) {
    const { solicitacao_id, phone_number, nome_solicitante, municipio_solicitante, material_entregue, quantidade_entregue, valor_unitario, valor_total_entregue, data_entrega, responsavel_entrega, observacoes_entrega } = entregaData;
    const result = await pool.query(
      'INSERT INTO entregas_materiais (solicitacao_id, phone_number, nome_solicitante, municipio_solicitante, material_entregue, quantidade_entregue, valor_unitario, valor_total_entregue, data_entrega, responsavel_entrega, observacoes_entrega) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING *',
      [solicitacao_id, phone_number, nome_solicitante, municipio_solicitante, material_entregue, quantidade_entregue, valor_unitario, valor_total_entregue, data_entrega, responsavel_entrega, observacoes_entrega]
    );
    return result.rows[0];
  },

  async getAll() {
    const result = await pool.query('SELECT * FROM entregas_materiais ORDER BY data_entrega DESC');
    return result.rows;
  },

  async getByLider(nome_solicitante) {
    const result = await pool.query(
      'SELECT * FROM entregas_materiais WHERE nome_solicitante = ? ORDER BY data_entrega DESC',
      [nome_solicitante]
    );
    return result.rows;
  },

  async getByMunicipio(municipio) {
    const result = await pool.query(
      'SELECT * FROM entregas_materiais WHERE municipio_solicitante = ? ORDER BY data_entrega DESC',
      [municipio]
    );
    return result.rows;
  },

  async getStats() {
    const result = await pool.query(`
      SELECT 
        COUNT(*) as total_entregas,
        SUM(quantidade_entregue) as quantidade_total_entregue,
        SUM(valor_total_entregue) as valor_total_entregue,
        COUNT(DISTINCT nome_solicitante) as total_lideres_atendidos,
        COUNT(DISTINCT municipio_solicitante) as total_municipios_atendidos,
        AVG(valor_total_entregue) as valor_medio_por_entrega
      FROM entregas_materiais
    `);
    return result.rows[0];
  },

  async getStatsPorLider() {
    const result = await pool.query(`
      SELECT 
        nome_solicitante,
        municipio_solicitante,
        COUNT(*) as total_entregas,
        SUM(quantidade_entregue) as quantidade_total_entregue,
        SUM(valor_total_entregue) as valor_total_entregue,
        AVG(valor_total_entregue) as valor_medio_por_entrega,
        MAX(data_entrega) as ultima_entrega
      FROM entregas_materiais
      GROUP BY nome_solicitante, municipio_solicitante
      ORDER BY valor_total_entregue DESC
    `);
    return result.rows;
  },

  async getStatsPorMunicipio() {
    const result = await pool.query(`
      SELECT 
        municipio_solicitante,
        COUNT(*) as total_entregas,
        COUNT(DISTINCT nome_solicitante) as total_lideres_atendidos,
        SUM(quantidade_entregue) as quantidade_total_entregue,
        SUM(valor_total_entregue) as valor_total_entregue,
        AVG(valor_total_entregue) as valor_medio_por_entrega
      FROM entregas_materiais
      GROUP BY municipio_solicitante
      ORDER BY valor_total_entregue DESC
    `);
    return result.rows;
  },

  async getStatsPorPeriodo(dataInicio, dataFim) {
    const result = await pool.query(`
      SELECT 
        DATE(data_entrega) as data,
        COUNT(*) as total_entregas,
        SUM(quantidade_entregue) as quantidade_total_entregue,
        SUM(valor_total_entregue) as valor_total_entregue
      FROM entregas_materiais
      WHERE DATE(data_entrega) BETWEEN ? AND ?
      GROUP BY DATE(data_entrega)
      ORDER BY data
    `, [dataInicio, dataFim]);
    return result.rows;
  }
};

// Serviços para Marketing
export const marketingService = {
  async getAll() {
    const result = await pool.query('SELECT * FROM servicos_marketing ORDER BY categoria, nome');
    return result.rows;
  },

  async getById(id) {
    const result = await pool.query('SELECT * FROM servicos_marketing WHERE id = ?', [id]);
    return result.rows[0];
  },

  async add(servicoData) {
    const { nome, categoria, descricao, tempo_estimado, custo_estimado, fornecedor, observacoes } = servicoData;
    const result = await pool.query(
      'INSERT INTO servicos_marketing (nome, categoria, descricao, tempo_estimado, custo_estimado, fornecedor, observacoes) VALUES (?, ?, ?, ?, ?, ?, ?) RETURNING *',
      [nome, categoria, descricao, tempo_estimado, custo_estimado || 0.00, fornecedor, observacoes]
    );
    return result.rows[0];
  },

  async update(id, servicoData) {
    const { nome, categoria, descricao, tempo_estimado, custo_estimado, fornecedor, observacoes } = servicoData;
    const result = await pool.query(
      'UPDATE servicos_marketing SET nome = ?, categoria = ?, descricao = ?, tempo_estimado = ?, custo_estimado = ?, fornecedor = ?, observacoes = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? RETURNING *',
      [nome, categoria, descricao, tempo_estimado, custo_estimado, fornecedor, observacoes, id]
    );
    return result.rows[0];
  },

  async delete(id) {
    await pool.query('DELETE FROM servicos_marketing WHERE id = ?', [id]);
  },

  async getByCategoria(categoria) {
    const result = await pool.query(
      'SELECT * FROM servicos_marketing WHERE categoria = ? ORDER BY nome',
      [categoria]
    );
    return result.rows;
  },

  async getStats() {
    const result = await pool.query(`
      SELECT 
        COUNT(*) as total_servicos,
        COUNT(DISTINCT categoria) as total_categorias,
        AVG(custo_estimado) as custo_medio_estimado,
        SUM(custo_estimado) as custo_total_estimado
      FROM servicos_marketing
    `);
    return result.rows[0];
  }
};

// Serviços para Solicitações de Marketing
export const solicitacoesMarketingService = {
  async getAll() {
    const result = await pool.query('SELECT * FROM solicitacoes_marketing ORDER BY created_at DESC');
    return result.rows;
  },

  async getById(id) {
    const result = await pool.query('SELECT * FROM solicitacoes_marketing WHERE id = ?', [id]);
    return result.rows[0];
  },

  async add(solicitacaoData) {
    const { phone_number, nome_solicitante, municipio_solicitante, servico_solicitado, descricao_projeto, prazo_desejado, valor_estimado, observacoes } = solicitacaoData;
    const result = await pool.query(
      'INSERT INTO solicitacoes_marketing (phone_number, nome_solicitante, municipio_solicitante, servico_solicitado, descricao_projeto, prazo_desejado, valor_estimado, observacoes) VALUES (?, ?, ?, ?, ?, ?, ?, ?) RETURNING *',
      [phone_number, nome_solicitante, municipio_solicitante, servico_solicitado, descricao_projeto, prazo_desejado, valor_estimado || 0.00, observacoes]
    );
    return result.rows[0];
  },

  async updateStatus(id, status, resposta_administrativo, valor_final, data_entrega) {
    const result = await pool.query(
      `UPDATE solicitacoes_marketing SET
         status = ?, resposta_administrativo = ?, valor_final = ?, data_entrega = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ? RETURNING *`,
      [status, resposta_administrativo, valor_final, data_entrega, id]
    );
    return result.rows[0];
  },

  async getByStatus(status) {
    const result = await pool.query(
      'SELECT * FROM solicitacoes_marketing WHERE status = ? ORDER BY created_at DESC',
      [status]
    );
    return result.rows;
  },

  async getByLider(nome_solicitante) {
    const result = await pool.query(
      'SELECT * FROM solicitacoes_marketing WHERE nome_solicitante = ? ORDER BY created_at DESC',
      [nome_solicitante]
    );
    return result.rows;
  },

  async getByMunicipio(municipio) {
    const result = await pool.query(
      'SELECT * FROM solicitacoes_marketing WHERE municipio_solicitante = ? ORDER BY created_at DESC',
      [municipio]
    );
    return result.rows;
  },

  async getStats() {
    const result = await pool.query(`
      SELECT 
        COUNT(*) as total_solicitacoes,
        COUNT(CASE WHEN status = 'pendente' THEN 1 END) as solicitacoes_pendentes,
        COUNT(CASE WHEN status = 'aprovada' THEN 1 END) as solicitacoes_aprovadas,
        COUNT(CASE WHEN status = 'rejeitada' THEN 1 END) as solicitacoes_rejeitadas,
        SUM(valor_estimado) as valor_total_estimado,
        SUM(CASE WHEN status = 'aprovada' THEN valor_estimado ELSE 0 END) as valor_total_aprovado,
        AVG(valor_estimado) as valor_medio_estimado
      FROM solicitacoes_marketing
    `);
    return result.rows[0];
  },

  async getStatsPorLider() {
    const result = await pool.query(`
      SELECT 
        nome_solicitante,
        municipio_solicitante,
        COUNT(*) as total_solicitacoes,
        COUNT(CASE WHEN status = 'aprovada' THEN 1 END) as solicitacoes_aprovadas,
        COUNT(CASE WHEN status = 'rejeitada' THEN 1 END) as solicitacoes_rejeitadas,
        SUM(valor_estimado) as valor_total_estimado,
        SUM(CASE WHEN status = 'aprovada' THEN valor_estimado ELSE 0 END) as valor_total_aprovado,
        AVG(valor_estimado) as valor_medio_estimado
      FROM solicitacoes_marketing
      GROUP BY nome_solicitante, municipio_solicitante
      ORDER BY total_solicitacoes DESC
    `);
    return result.rows;
  },

  async getStatsPorMunicipio() {
    const result = await pool.query(`
      SELECT 
        municipio_solicitante,
        COUNT(*) as total_solicitacoes,
        COUNT(DISTINCT nome_solicitante) as total_lideres,
        COUNT(CASE WHEN status = 'aprovada' THEN 1 END) as solicitacoes_aprovadas,
        COUNT(CASE WHEN status = 'rejeitada' THEN 1 END) as solicitacoes_rejeitadas,
        SUM(valor_estimado) as valor_total_estimado,
        SUM(CASE WHEN status = 'aprovada' THEN valor_estimado ELSE 0 END) as valor_total_aprovado,
        AVG(valor_estimado) as valor_medio_estimado
      FROM solicitacoes_marketing
      GROUP BY municipio_solicitante
      ORDER BY total_solicitacoes DESC
    `);
    return result.rows;
  },

  async getStatsPorServico() {
    const result = await pool.query(`
      SELECT 
        servico_solicitado,
        COUNT(*) as total_solicitacoes,
        COUNT(CASE WHEN status = 'aprovada' THEN 1 END) as solicitacoes_aprovadas,
        COUNT(CASE WHEN status = 'rejeitada' THEN 1 END) as solicitacoes_rejeitadas,
        SUM(valor_estimado) as valor_total_estimado,
        SUM(CASE WHEN status = 'aprovada' THEN valor_estimado ELSE 0 END) as valor_total_aprovado,
        AVG(valor_estimado) as valor_medio_estimado
      FROM solicitacoes_marketing
      GROUP BY servico_solicitado
      ORDER BY total_solicitacoes DESC
    `);
    return result.rows;
  }
};

// Serviços para Entregas de Marketing
export const entregasMarketingService = {
  async add(entregaData) {
    const {
      solicitacao_id, phone_number, nome_solicitante, municipio_solicitante,
      servico_entregue, arquivos_entregues, valor_final, data_entrega,
      responsavel_entrega, observacoes_entrega
    } = entregaData;

    const result = await pool.query(
      `INSERT INTO entregas_marketing 
       (solicitacao_id, phone_number, nome_solicitante, municipio_solicitante, 
        servico_entregue, arquivos_entregues, valor_final, data_entrega, 
        responsavel_entrega, observacoes_entrega) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING *`,
      [solicitacao_id, phone_number, nome_solicitante, municipio_solicitante,
       servico_entregue, arquivos_entregues, valor_final, data_entrega,
       responsavel_entrega, observacoes_entrega]
    );
    return result.rows[0];
  },

  async getAll() {
    const result = await pool.query('SELECT * FROM entregas_marketing ORDER BY created_at DESC');
    return result.rows;
  },

  async getByLider(nome_solicitante) {
    const result = await pool.query(
      'SELECT * FROM entregas_marketing WHERE nome_solicitante = ? ORDER BY created_at DESC',
      [nome_solicitante]
    );
    return result.rows;
  },

  async getByMunicipio(municipio) {
    const result = await pool.query(
      'SELECT * FROM entregas_marketing WHERE municipio_solicitante = ? ORDER BY created_at DESC',
      [municipio]
    );
    return result.rows;
  },

  async getStats() {
    const result = await pool.query(`
      SELECT 
        COUNT(*) as total_entregas,
        SUM(valor_final) as valor_total,
        COUNT(DISTINCT nome_solicitante) as lideres_beneficiados,
        COUNT(DISTINCT municipio_solicitante) as municipios_beneficiados
      FROM entregas_marketing
    `);
    return result.rows[0];
  },

  async getStatsPorLider() {
    const result = await pool.query(`
      SELECT 
        nome_solicitante,
        COUNT(*) as total_entregas,
        SUM(valor_final) as valor_total
      FROM entregas_marketing 
      GROUP BY nome_solicitante 
      ORDER BY valor_total DESC
    `);
    return result.rows;
  },

  async getStatsPorMunicipio() {
    const result = await pool.query(`
      SELECT 
        municipio_solicitante,
        COUNT(*) as total_entregas,
        SUM(valor_final) as valor_total
      FROM entregas_marketing 
      GROUP BY municipio_solicitante 
      ORDER BY valor_total DESC
    `);
    return result.rows;
  }
};

// Serviços para Agenda do Deputado
export const agendaService = {
  async getAll() {
    const result = await pool.query('SELECT * FROM agenda_disponibilidade ORDER BY data ASC, horario_inicio ASC');
    return result.rows;
  },

  async getById(id) {
    const result = await pool.query('SELECT * FROM agenda_disponibilidade WHERE id = ?', [id]);
    return result.rows[0];
  },

  async add(agendaData) {
    const {
      data, horario_inicio, horario_fim, local, tipo_agendamento, observacoes, disponivel
    } = agendaData;

    const result = await pool.query(
      `INSERT INTO agenda_disponibilidade 
       (data, horario_inicio, horario_fim, local, tipo_agendamento, observacoes, disponivel) 
       VALUES (?, ?, ?, ?, ?, ?, ?) RETURNING *`,
      [data, horario_inicio, horario_fim, local, tipo_agendamento, observacoes, disponivel ? 1 : 0]
    );
    return result.rows[0];
  },

  async update(id, agendaData) {
    const {
      data, horario_inicio, horario_fim, local, tipo_agendamento, observacoes, disponivel
    } = agendaData;

    const result = await pool.query(
      `UPDATE agenda_disponibilidade SET 
       data = ?, horario_inicio = ?, horario_fim = ?, local = ?, 
       tipo_agendamento = ?, observacoes = ?, disponivel = ?, updated_at = CURRENT_TIMESTAMP 
       WHERE id = ? RETURNING *`,
      [data, horario_inicio, horario_fim, local, tipo_agendamento, observacoes, disponivel ? 1 : 0, id]
    );
    return result.rows[0];
  },

  async delete(id) {
    await pool.query('DELETE FROM agenda_disponibilidade WHERE id = ?', [id]);
  },

  async getByData(data) {
    const result = await pool.query(
      'SELECT * FROM agenda_disponibilidade WHERE data = ? ORDER BY horario_inicio ASC',
      [data]
    );
    return result.rows;
  },

  async getDisponiveis() {
    const result = await pool.query(
      'SELECT * FROM agenda_disponibilidade WHERE disponivel = 1 ORDER BY data ASC, horario_inicio ASC'
    );
    return result.rows;
  },

  async getStats() {
    const result = await pool.query(`
      SELECT 
        COUNT(*) as total_horarios,
        COUNT(CASE WHEN disponivel = 1 THEN 1 END) as horarios_disponiveis,
        COUNT(CASE WHEN disponivel = 0 THEN 1 END) as horarios_ocupados,
        COUNT(DISTINCT data) as dias_com_horarios
      FROM agenda_disponibilidade
    `);
    return result.rows[0];
  }
};

// Serviços para Solicitações de Agenda
export const solicitacoesAgendaService = {
  async getAll() {
    const result = await pool.query('SELECT * FROM solicitacoes_agenda ORDER BY created_at DESC');
    return result.rows;
  },

  async getById(id) {
    const result = await pool.query('SELECT * FROM solicitacoes_agenda WHERE id = ?', [id]);
    return result.rows[0];
  },

  async add(solicitacaoData) {
    const {
      phone_number, nome_solicitante, municipio_solicitante, data_solicitada,
      horario_solicitado, tipo_agendamento, assunto, descricao, local_preferido,
      duracao_estimada, prioridade, observacoes
    } = solicitacaoData;

    const result = await pool.query(
      `INSERT INTO solicitacoes_agenda 
       (phone_number, nome_solicitante, municipio_solicitante, data_solicitada,
        horario_solicitado, tipo_agendamento, assunto, descricao, local_preferido,
        duracao_estimada, prioridade, observacoes) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING *`,
      [phone_number, nome_solicitante, municipio_solicitante, data_solicitada,
       horario_solicitado, tipo_agendamento, assunto, descricao, local_preferido,
       duracao_estimada, prioridade, observacoes]
    );
    return result.rows[0];
  },

  async updateStatus(id, status, resposta_administrativo, data_confirmada, horario_confirmado, local_confirmado) {
    const result = await pool.query(
      `UPDATE solicitacoes_agenda SET
       status = ?, resposta_administrativo = ?, data_confirmada = ?, 
       horario_confirmado = ?, local_confirmado = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ? RETURNING *`,
      [status, resposta_administrativo, data_confirmada, horario_confirmado, local_confirmado, id]
    );
    return result.rows[0];
  },

  async getByStatus(status) {
    const result = await pool.query(
      'SELECT * FROM solicitacoes_agenda WHERE status = ? ORDER BY created_at DESC',
      [status]
    );
    return result.rows;
  },

  async getByLider(nome_solicitante) {
    const result = await pool.query(
      'SELECT * FROM solicitacoes_agenda WHERE nome_solicitante = ? ORDER BY created_at DESC',
      [nome_solicitante]
    );
    return result.rows;
  },

  async getByMunicipio(municipio) {
    const result = await pool.query(
      'SELECT * FROM solicitacoes_agenda WHERE municipio_solicitante = ? ORDER BY created_at DESC',
      [municipio]
    );
    return result.rows;
  },

  async getStats() {
    const result = await pool.query(`
      SELECT 
        COUNT(*) as total_solicitacoes,
        COUNT(CASE WHEN status = 'pendente' THEN 1 END) as pendentes,
        COUNT(CASE WHEN status = 'aprovada' THEN 1 END) as aprovadas,
        COUNT(CASE WHEN status = 'rejeitada' THEN 1 END) as rejeitadas,
        COUNT(DISTINCT nome_solicitante) as lideres_solicitantes,
        COUNT(DISTINCT municipio_solicitante) as municipios_solicitantes
      FROM solicitacoes_agenda
    `);
    return result.rows[0];
  },

  async getStatsPorLider() {
    const result = await pool.query(`
      SELECT 
        nome_solicitante,
        COUNT(*) as total_solicitacoes,
        COUNT(CASE WHEN status = 'aprovada' THEN 1 END) as aprovadas,
        COUNT(CASE WHEN status = 'rejeitada' THEN 1 END) as rejeitadas
      FROM solicitacoes_agenda 
      GROUP BY nome_solicitante 
      ORDER BY total_solicitacoes DESC
    `);
    return result.rows;
  },

  async getStatsPorMunicipio() {
    const result = await pool.query(`
      SELECT 
        municipio_solicitante,
        COUNT(*) as total_solicitacoes,
        COUNT(CASE WHEN status = 'aprovada' THEN 1 END) as aprovadas,
        COUNT(CASE WHEN status = 'rejeitada' THEN 1 END) as rejeitadas
      FROM solicitacoes_agenda 
      GROUP BY municipio_solicitante 
      ORDER BY total_solicitacoes DESC
    `);
    return result.rows;
  },

  async getStatsPorTipo() {
    const result = await pool.query(`
      SELECT 
        tipo_agendamento,
        COUNT(*) as total_solicitacoes,
        COUNT(CASE WHEN status = 'aprovada' THEN 1 END) as aprovadas
      FROM solicitacoes_agenda 
      GROUP BY tipo_agendamento 
      ORDER BY total_solicitacoes DESC
    `);
    return result.rows;
  }
};

// Serviços para Confirmações de Agenda
export const confirmacoesAgendaService = {
  async add(confirmacaoData) {
    const {
      solicitacao_id, phone_number, nome_solicitante, municipio_solicitante,
      data_agendada, horario_agendado, local_agendado, tipo_agendamento,
      assunto, duracao_agendada, responsavel_agendamento, observacoes_agendamento
    } = confirmacaoData;

    const result = await pool.query(
      `INSERT INTO confirmacoes_agenda 
       (solicitacao_id, phone_number, nome_solicitante, municipio_solicitante,
        data_agendada, horario_agendado, local_agendado, tipo_agendamento,
        assunto, duracao_agendada, responsavel_agendamento, observacoes_agendamento) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING *`,
      [solicitacao_id, phone_number, nome_solicitante, municipio_solicitante,
       data_agendada, horario_agendado, local_agendado, tipo_agendamento,
       assunto, duracao_agendada, responsavel_agendamento, observacoes_agendamento]
    );
    return result.rows[0];
  },

  async getAll() {
    const result = await pool.query('SELECT * FROM confirmacoes_agenda ORDER BY created_at DESC');
    return result.rows;
  },

  async getByLider(nome_solicitante) {
    const result = await pool.query(
      'SELECT * FROM confirmacoes_agenda WHERE nome_solicitante = ? ORDER BY created_at DESC',
      [nome_solicitante]
    );
    return result.rows;
  },

  async getByMunicipio(municipio) {
    const result = await pool.query(
      'SELECT * FROM confirmacoes_agenda WHERE municipio_solicitante = ? ORDER BY created_at DESC',
      [municipio]
    );
    return result.rows;
  },

  async getStats() {
    const result = await pool.query(`
      SELECT 
        COUNT(*) as total_agendamentos,
        COUNT(DISTINCT nome_solicitante) as lideres_agendados,
        COUNT(DISTINCT municipio_solicitante) as municipios_agendados,
        COUNT(DISTINCT data_agendada) as dias_com_agendamentos
      FROM confirmacoes_agenda
    `);
    return result.rows[0];
  },

  async getStatsPorLider() {
    const result = await pool.query(`
      SELECT 
        nome_solicitante,
        COUNT(*) as total_agendamentos,
        COUNT(DISTINCT data_agendada) as dias_agendados
      FROM confirmacoes_agenda 
      GROUP BY nome_solicitante 
      ORDER BY total_agendamentos DESC
    `);
    return result.rows;
  },

  async getStatsPorMunicipio() {
    const result = await pool.query(`
      SELECT 
        municipio_solicitante,
        COUNT(*) as total_agendamentos,
        COUNT(DISTINCT data_agendada) as dias_agendados
      FROM confirmacoes_agenda 
      GROUP BY municipio_solicitante 
      ORDER BY total_agendamentos DESC
    `);
    return result.rows;
  }
};
