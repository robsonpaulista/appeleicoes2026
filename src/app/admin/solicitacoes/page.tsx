'use client';

import { useState, useEffect } from 'react';
import { Check, X, Clock, Package, User, Phone } from 'lucide-react';

interface Solicitacao {
  id: number;
  phone_number: string;
  nome_solicitante: string;
  material_solicitado: string;
  quantidade: number;
  observacoes: string;
  status: string;
  resposta_administrativo: string;
  created_at: string;
  updated_at: string;
}

interface Material {
  id: number;
  nome: string;
  categoria: string;
  estoque_atual: number;
  estoque_minimo: number;
  custo_unitario: number;
  fornecedor: string;
}

export default function SolicitacoesPage() {
  const [solicitacoes, setSolicitacoes] = useState<Solicitacao[]>([]);
  const [materiais, setMateriais] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedSolicitacao, setSelectedSolicitacao] = useState<Solicitacao | null>(null);
  const [resposta, setResposta] = useState('');
  const [localColeta, setLocalColeta] = useState('');
  const [horarioColeta, setHorarioColeta] = useState('');
  const [responsavelColeta, setResponsavelColeta] = useState('');
  const [dataEntrega, setDataEntrega] = useState('');
  const [stats, setStats] = useState({
    total_solicitacoes: 0,
    solicitacoes_pendentes: 0,
    solicitacoes_aprovadas: 0,
    solicitacoes_rejeitadas: 0
  });

  useEffect(() => {
    loadSolicitacoes();
    loadMateriais();
    loadStats();
  }, []);

  const loadSolicitacoes = async () => {
    try {
      const response = await fetch('/api/solicitacoes');
      const data = await response.json();
      setSolicitacoes(data);
    } catch (error) {
      console.error('Erro ao carregar solicitações:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMateriais = async () => {
    try {
      const response = await fetch('/api/materiais');
      const data = await response.json();
      setMateriais(data);
    } catch (error) {
      console.error('Erro ao carregar materiais:', error);
    }
  };

  const loadStats = async () => {
    try {
      const response = await fetch('/api/solicitacoes/stats');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  const handleResponder = (solicitacao: Solicitacao) => {
    setSelectedSolicitacao(solicitacao);
    setResposta('');
    setLocalColeta('');
    setHorarioColeta('');
    setResponsavelColeta('');
    setDataEntrega('');
    setShowModal(true);
  };

  const handleAprovar = async () => {
    if (!selectedSolicitacao || !resposta.trim()) return;

    // Construir resposta completa com informações de entrega
    let respostaCompleta = resposta;
    
    if (localColeta.trim()) {
      respostaCompleta += `\n\n📍 Local de Coleta: ${localColeta}`;
    }
    
    if (horarioColeta.trim()) {
      respostaCompleta += `\n🕐 Horário: ${horarioColeta}`;
    }
    
    if (responsavelColeta.trim()) {
      respostaCompleta += `\n👤 Procurar por: ${responsavelColeta}`;
    }

    try {
      const response = await fetch(`/api/solicitacoes/${selectedSolicitacao.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'aprovada',
          resposta_administrativo: respostaCompleta,
          data_entrega: dataEntrega || null
        }),
      });

      if (response.ok) {
        setShowModal(false);
        setSelectedSolicitacao(null);
        setResposta('');
        setLocalColeta('');
        setHorarioColeta('');
        setResponsavelColeta('');
        setDataEntrega('');
        loadSolicitacoes();
        loadStats();
      }
    } catch (error) {
      console.error('Erro ao aprovar solicitação:', error);
    }
  };

  const handleRejeitar = async () => {
    if (!selectedSolicitacao || !resposta.trim()) return;

    try {
      const response = await fetch(`/api/solicitacoes/${selectedSolicitacao.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'rejeitada',
          resposta_administrativo: resposta
        }),
      });

      if (response.ok) {
        setShowModal(false);
        setSelectedSolicitacao(null);
        setResposta('');
        loadSolicitacoes();
        loadStats();
      }
    } catch (error) {
      console.error('Erro ao rejeitar solicitação:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pendente': return 'text-orange-600 bg-orange-100';
      case 'aprovada': return 'text-green-600 bg-green-100';
      case 'rejeitada': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pendente': return <Clock size={16} />;
      case 'aprovada': return <Check size={16} />;
      case 'rejeitada': return <X size={16} />;
      default: return <Clock size={16} />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  const buscarMaterialSimilar = (materialSolicitado: string) => {
    const normalizedSolicitado = materialSolicitado.toLowerCase();
    return materiais.filter(material => 
      material.nome.toLowerCase().includes(normalizedSolicitado) ||
      material.categoria.toLowerCase().includes(normalizedSolicitado)
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Solicitações de Materiais</h1>
          <p className="text-gray-600 mt-2">Gerencie as solicitações das lideranças</p>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <Package className="text-blue-600" size={24} />
            <div className="ml-4">
              <p className="text-sm text-gray-600">Total de Solicitações</p>
              <p className="text-2xl font-bold">{stats.total_solicitacoes}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <Clock className="text-orange-600" size={24} />
            <div className="ml-4">
              <p className="text-sm text-gray-600">Pendentes</p>
              <p className="text-2xl font-bold">{stats.solicitacoes_pendentes}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <Check className="text-green-600" size={24} />
            <div className="ml-4">
              <p className="text-sm text-gray-600">Aprovadas</p>
              <p className="text-2xl font-bold">{stats.solicitacoes_aprovadas}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <X className="text-red-600" size={24} />
            <div className="ml-4">
              <p className="text-sm text-gray-600">Rejeitadas</p>
              <p className="text-2xl font-bold">{stats.solicitacoes_rejeitadas}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Solicitações */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Solicitante
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Material Solicitado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {solicitacoes.map((solicitacao) => {
                const materiaisSimilares = buscarMaterialSimilar(solicitacao.material_solicitado);
                
                return (
                  <tr key={solicitacao.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <User className="text-gray-400 mr-2" size={16} />
                        <div>
                          <div className="text-sm font-medium text-gray-900">{solicitacao.nome_solicitante}</div>
                          <div className="text-sm text-gray-500 flex items-center">
                            <Phone size={12} className="mr-1" />
                            {solicitacao.phone_number}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{solicitacao.material_solicitado}</div>
                        {materiaisSimilares.length > 0 && (
                          <div className="text-xs text-blue-600 mt-1">
                            Materiais similares: {materiaisSimilares.map(m => m.nome).join(', ')}
                          </div>
                        )}
                        {solicitacao.observacoes && (
                          <div className="text-xs text-gray-500 mt-1">{solicitacao.observacoes}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(solicitacao.status)}`}>
                        {getStatusIcon(solicitacao.status)}
                        <span className="ml-1 capitalize">{solicitacao.status}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(solicitacao.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {solicitacao.status === 'pendente' && (
                        <button
                          onClick={() => handleResponder(solicitacao)}
                          className="text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-md"
                        >
                          Responder
                        </button>
                      )}
                      {solicitacao.status !== 'pendente' && solicitacao.resposta_administrativo && (
                        <div className="text-xs text-gray-600 max-w-xs truncate">
                          {solicitacao.resposta_administrativo}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Resposta */}
      {showModal && selectedSolicitacao && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <h2 className="text-2xl font-bold mb-4">Responder Solicitação</h2>
            
            <div className="mb-4">
              <h3 className="font-semibold text-gray-900">Detalhes da Solicitação:</h3>
              <div className="bg-gray-50 p-3 rounded-md mt-2">
                <p><strong>Solicitante:</strong> {selectedSolicitacao.nome_solicitante}</p>
                <p><strong>Material:</strong> {selectedSolicitacao.material_solicitado}</p>
                <p><strong>Quantidade:</strong> {selectedSolicitacao.quantidade}</p>
                {selectedSolicitacao.observacoes && (
                  <p><strong>Observações:</strong> {selectedSolicitacao.observacoes}</p>
                )}
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Resposta para o solicitante:
              </label>
              <textarea
                value={resposta}
                onChange={(e) => setResposta(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Digite sua resposta para o solicitante..."
              />
            </div>

            {/* Campos para informações de entrega (apenas para aprovação) */}
            <div className="mb-4">
              <h3 className="font-semibold text-gray-900 mb-3">Informações de Entrega (opcional):</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Local de Coleta:
                  </label>
                  <input
                    type="text"
                    value={localColeta}
                    onChange={(e) => setLocalColeta(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ex: Sede do partido, Rua ABC, 123"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Horário de Coleta:
                  </label>
                  <input
                    type="text"
                    value={horarioColeta}
                    onChange={(e) => setHorarioColeta(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ex: Segunda a sexta, 8h às 18h"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Responsável pela Entrega:
                  </label>
                  <input
                    type="text"
                    value={responsavelColeta}
                    onChange={(e) => setResponsavelColeta(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ex: João Silva, Maria Santos"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Data de Entrega:
                  </label>
                  <input
                    type="date"
                    value={dataEntrega}
                    onChange={(e) => setDataEntrega(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div className="mt-3 p-3 bg-blue-50 rounded-md">
                <p className="text-sm text-blue-800">
                  <strong>Dica:</strong> Preencha os campos acima para que o bot envie automaticamente as informações de coleta para o líder.
                </p>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedSolicitacao(null);
                  setResposta('');
                  setLocalColeta('');
                  setHorarioColeta('');
                  setResponsavelColeta('');
                  setDataEntrega('');
                }}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
              >
                Cancelar
              </button>
              <button
                onClick={handleRejeitar}
                disabled={!resposta.trim()}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
              >
                Rejeitar
              </button>
              <button
                onClick={handleAprovar}
                disabled={!resposta.trim()}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
              >
                Aprovar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
