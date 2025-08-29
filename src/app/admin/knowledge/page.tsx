'use client';

import { useState, useEffect } from 'react';

interface KnowledgeItem {
  id: number;
  kb_id: string;
  titulo: string;
  conteudo: string;
  resposta: string;
  fonte: string;
  tags: string;
  created_at: string;
}

export default function KnowledgePage() {
  const [items, setItems] = useState<KnowledgeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/knowledge');
      const data = await response.json();
      setItems(data);
    } catch (error) {
      console.error('Erro ao carregar base de conhecimento:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSyncCamara = async () => {
    try {
      setSyncing(true);
      const response = await fetch('/api/knowledge/sync-camara', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ force: true })
      });

      const result = await response.json();
      
      if (response.ok) {
        alert(result.message);
        loadItems();
      } else {
        alert(`Erro: ${result.error}`);
      }
    } catch (error) {
      console.error('Erro ao sincronizar projetos da Câmara:', error);
      alert('Erro ao sincronizar projetos da Câmara');
    } finally {
      setSyncing(false);
    }
  };

  const handleDelete = async (kbId: string) => {
    if (!confirm('Tem certeza que deseja remover este item?')) {
      return;
    }

    try {
      const response = await fetch(`/api/knowledge/${encodeURIComponent(kbId)}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        loadItems();
        alert('Item removido com sucesso!');
      } else {
        alert('Erro ao remover item');
      }
    } catch (error) {
      console.error('Erro ao remover item:', error);
      alert('Erro ao remover item');
    }
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
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Base de Conhecimento
          </h1>
          <p className="text-gray-600">
            Projetos do deputado Jadyel Alencar
          </p>
        </div>
        <button
          onClick={handleSyncCamara}
          disabled={syncing}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {syncing ? 'Sincronizando...' : '🔄 Sincronizar Câmara'}
        </button>
      </div>

      {/* Lista de Itens */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Projetos ({items.length} itens)
          </h2>
        </div>
        
        <div className="p-6">
          {items.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              Nenhum projeto encontrado. Clique em "Sincronizar Câmara" para buscar projetos reais.
            </p>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {item.titulo.includes('[Ver projeto](') ? (
                          <>
                            {item.titulo.split('[Ver projeto](')[0]}
                            <a 
                              href={item.titulo.split('[Ver projeto](')[1].split(')')[0]}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 underline ml-2 text-sm"
                            >
                              🔗 Ver projeto
                            </a>
                          </>
                        ) : (
                          item.titulo
                        )}
                      </h3>
                      <p className="text-sm text-gray-600">ID: {item.kb_id}</p>
                    </div>
                    <button
                      onClick={() => handleDelete(item.kb_id)}
                      className="text-red-600 hover:text-red-900 text-sm font-medium ml-4"
                    >
                      Remover
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-1">Conteúdo:</h4>
                      <p className="text-sm text-gray-600 line-clamp-3">{item.conteudo}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-1">Resposta:</h4>
                      <p className="text-sm text-gray-600 line-clamp-3">{item.resposta}</p>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center text-xs text-gray-500">
                    <span>Fonte: {item.fonte || 'Não informada'}</span>
                    <span>{new Date(item.created_at).toLocaleDateString('pt-BR')}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Botão Voltar */}
      <div className="mt-8">
        <button
          onClick={() => window.location.href = '/'}
          className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          Voltar ao Dashboard
        </button>
      </div>
    </div>
  );
}
