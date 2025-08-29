'use client';

import { useState, useEffect } from 'react';

interface Stats {
  totalMessages: number;
  uniqueUsers: number;
  vipMessages: number;
  generalMessages: number;
}

interface VipUser {
  id: number;
  phone_number: string;
  name: string;
  role: string;
  created_at: string;
}

interface KnowledgeItem {
  id: number;
  kb_id: string;
  titulo: string;
  conteudo: string;
  resposta: string;
  fonte: string;
  tags: string[] | string;
  created_at: string;
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats>({
    totalMessages: 0,
    uniqueUsers: 0,
    vipMessages: 0,
    generalMessages: 0
  });
  const [vipUsers, setVipUsers] = useState<VipUser[]>([]);
  const [knowledgeItems, setKnowledgeItems] = useState<KnowledgeItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Carregar estatísticas
      const statsResponse = await fetch('/api/dashboard/stats');
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      }

      // Carregar usuários VIP
      const vipResponse = await fetch('/api/dashboard/vip-users');
      if (vipResponse.ok) {
        const vipData = await vipResponse.json();
        setVipUsers(vipData);
      }

      // Carregar base de conhecimento
      const kbResponse = await fetch('/api/dashboard/knowledge');
      if (kbResponse.ok) {
        const kbData = await kbResponse.json();
        setKnowledgeItems(kbData);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  // Função para tratar tags
  const getTagsArray = (tags: string[] | string): string[] => {
    if (Array.isArray(tags)) {
      return tags;
    }
    if (typeof tags === 'string') {
      try {
        return JSON.parse(tags);
      } catch {
        return tags.split(',').map(tag => tag.trim()).filter(Boolean);
      }
    }
    return [];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Dashboard - Bot WhatsApp
        </h1>
        <p className="text-gray-600">
          Sistema de gerenciamento do bot WhatsApp para o Deputado
        </p>
      </header>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Total de Mensagens</h3>
          <p className="text-3xl font-bold text-primary-600">{stats.totalMessages}</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Usuários Únicos</h3>
          <p className="text-3xl font-bold text-green-600">{stats.uniqueUsers}</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Mensagens VIP</h3>
          <p className="text-3xl font-bold text-yellow-600">{stats.vipMessages}</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Mensagens Gerais</h3>
          <p className="text-3xl font-bold text-blue-600">{stats.generalMessages}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Usuários VIP */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Lideranças (VIP)</h2>
            <p className="text-gray-600 mt-1">{vipUsers.length} usuários cadastrados</p>
          </div>
          <div className="p-6">
            {vipUsers.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Nenhum usuário VIP cadastrado</p>
            ) : (
              <div className="space-y-4">
                {vipUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{user.name}</p>
                      <p className="text-sm text-gray-600">{user.phone_number}</p>
                      <p className="text-xs text-gray-500">{user.role}</p>
                    </div>
                    <span className="text-xs text-gray-400">
                      {new Date(user.created_at).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Base de Conhecimento */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Base de Conhecimento</h2>
            <p className="text-gray-600 mt-1">{knowledgeItems.length} itens cadastrados</p>
          </div>
          <div className="p-6">
            {knowledgeItems.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Nenhum item na base de conhecimento</p>
            ) : (
              <div className="space-y-4">
                {knowledgeItems.slice(0, 5).map((item) => {
                  const tagsArray = getTagsArray(item.tags);
                  return (
                    <div key={item.id} className="p-3 bg-gray-50 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-1">{item.titulo}</h4>
                      <p className="text-sm text-gray-600 line-clamp-2">{item.conteudo}</p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {tagsArray.slice(0, 3).map((tag, index) => (
                          <span key={index} className="px-2 py-1 text-xs bg-primary-100 text-primary-800 rounded">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Botões de Ação */}
      <div className="mt-8 flex flex-wrap gap-4">
        <button 
          onClick={() => window.location.href = '/admin/connect'}
          className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          Conectar Bot WhatsApp
        </button>
        
        <button 
          onClick={() => window.location.href = '/admin/config'}
          className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          Configurar Bot WhatsApp
        </button>
        
        <button 
          onClick={() => window.location.href = '/admin/webhook'}
          className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Configurar Webhook
        </button>
        
        <button 
          onClick={() => window.location.href = '/admin/test'}
          className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
        >
          Testar Bot
        </button>
        
        <button 
          onClick={() => window.location.href = '/admin/whitelist'}
          className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          Gerenciar Lideranças
        </button>
        
        <button 
          onClick={() => window.location.href = '/admin/knowledge'}
          className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          Gerenciar Base de Conhecimento
        </button>
        
        <button 
          onClick={() => window.location.href = '/admin/logs'}
          className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          Ver Logs de Conversa
        </button>
      </div>
    </div>
  );
}
