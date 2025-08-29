'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, MessageSquare, Calendar, User, MapPin, DollarSign, Filter, Search, Download } from 'lucide-react';

interface SolicitacaoMarketing {
  id: number;
  phone_number: string;
  nome_solicitante: string;
  municipio_solicitante: string;
  servico_solicitado: string;
  descricao_projeto: string;
  prazo_desejado: string;
  valor_estimado: number;
  observacoes: string;
  status: string;
  resposta_administrativo: string;
  data_entrega: string;
  created_at: string;
  updated_at: string;
}

export default function SolicitacoesMarketingPage() {
  const [solicitacoes, setSolicitacoes] = useState<SolicitacaoMarketing[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedSolicitacao, setSelectedSolicitacao] = useState<SolicitacaoMarketing | null>(null);
  const [resposta, setResposta] = useState('');
  const [localColeta, setLocalColeta] = useState('');
  const [horarioColeta, setHorarioColeta] = useState('');
  const [responsavelColeta, setResponsavelColeta] = useState('');
  const [dataEntrega, setDataEntrega] = useState('');
  const [valorFinal, setValorFinal] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  useEffect(() => {
    loadSolicitacoes();
    loadStats();
  }, []);

  const loadSolicitacoes = async () => {
    try {
      const response = await fetch('/api/solicitacoes-marketing');
      if (response.ok) {
        const data = await response.json();
        setSolicitacoes(data);
      }
    } catch (error) {
      console.error('Erro ao carregar solicitações:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await fetch('/api/solicitacoes-marketing/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  const handleResponder = (solicitacao: SolicitacaoMarketing) => {
    setSelectedSolicitacao(solicitacao);
    setResposta('');
    setLocalColeta('');
    setHorarioColeta('');
    setResponsavelColeta('');
    setDataEntrega('');
    setValorFinal('');
    setShowModal(true);
  };

  const handleAprovar = async () => {
    if (!selectedSolicitacao || !resposta.trim()) return;
    
    let respostaCompleta = resposta;
    if (localColeta.trim()) { respostaCompleta += `\n\n📍 Local de Coleta: ${localColeta}`; }
    if (horarioColeta.trim()) { respostaCompleta += `\n🕐 Horário: ${horarioColeta}`; }
    if (responsavelColeta.trim()) { respostaCompleta += `\n👤 Procurar por: ${responsavelColeta}`; }
    
    try {
      const response = await fetch(`/api/solicitacoes-marketing/${selectedSolicitacao.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'aprovada',
          resposta_administrativo: respostaCompleta,
          valor_final: parseFloat(valorFinal) || selectedSolicitacao.valor_estimado,
          data_entrega: dataEntrega || null
        })
      });

      if (response.ok) {
        setShowModal(false);
        setSelectedSolicitacao(null);
        setResposta('');
        setLocalColeta('');
        setHorarioColeta('');
        setResponsavelColeta('');
        setDataEntrega('');
        setValorFinal('');
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
      const response = await fetch(`/api/solicitacoes-marketing/${selectedSolicitacao.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'rejeitada',
          resposta_administrativo: resposta
        })
      });

      if (response.ok) {
        setShowModal(false);
        setSelectedSolicitacao(null);
        setResposta('');
        setLocalColeta('');
        setHorarioColeta('');
        setResponsavelColeta('');
        setDataEntrega('');
        setValorFinal('');
        loadSolicitacoes();
        loadStats();
      }
    } catch (error) {
      console.error('Erro ao rejeitar solicitação:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'aprovada': return 'text-green-600 bg-green-100';
      case 'rejeitada': return 'text-red-600 bg-red-100';
      case 'pendente': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'aprovada': return <CheckCircle size={16} />;
      case 'rejeitada': return <XCircle size={16} />;
      case 'pendente': return <Clock size={16} />;
      default: return <Clock size={16} />;
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const filteredSolicitacoes = solicitacoes.filter(solicitacao => {
    const matchesSearch = solicitacao.nome_solicitante.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         solicitacao.servico_solicitado.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         solicitacao.municipio_solicitante.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !filterStatus || solicitacao.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const exportToCSV = () => {
    const headers = ['ID', 'Solicitante', 'Município', 'Serviço', 'Descrição', 'Prazo', 'Valor Estimado', 'Status', 'Data Criação'];
    const csvContent = [
      headers.join(','),
      ...filteredSolicitacoes.map(s => [
        s.id,
        s.nome_solicitante,
        s.municipio_solicitante,
        s.servico_solicitado,
        s.descricao_projeto || '',
        s.prazo_desejado || '',
        s.valor_estimado,
        s.status,
        formatDate(s.created_at)
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'solicitacoes_marketing.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white p-6 rounded-lg shadow">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Solicitações de Marketing</h1>
            <p className="text-gray-600 mt-2">Gerencie as solicitações de serviços de marketing</p>
          </div>
          <button
            onClick={exportToCSV}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
          >
            <Download size={20} />
            Exportar CSV
          </button>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <MessageSquare className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total de Solicitações</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total_solicitacoes}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pendentes</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.solicitacoes_pendentes}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Aprovadas</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.solicitacoes_aprovadas}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <DollarSign className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Valor Total Estimado</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(stats.valor_total_estimado || 0)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Buscar solicitações..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="md:w-48">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Todos os status</option>
                <option value="pendente">Pendente</option>
                <option value="aprovada">Aprovada</option>
                <option value="rejeitada">Rejeitada</option>
              </select>
            </div>
          </div>
        </div>

        {/* Solicitações List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Solicitante
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Serviço
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Valor
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
                {filteredSolicitacoes.map((solicitacao) => (
                  <tr key={solicitacao.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {solicitacao.nome_solicitante}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center">
                          <MapPin size={14} className="mr-1" />
                          {solicitacao.municipio_solicitante}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {solicitacao.servico_solicitado}
                        </div>
                        {solicitacao.descricao_projeto && (
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {solicitacao.descricao_projeto}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatCurrency(solicitacao.valor_estimado)}
                      </div>
                      {solicitacao.prazo_desejado && (
                        <div className="text-sm text-gray-500 flex items-center">
                          <Calendar size={14} className="mr-1" />
                          {formatDate(solicitacao.prazo_desejado)}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(solicitacao.status)}`}>
                        {getStatusIcon(solicitacao.status)}
                        <span className="ml-1 capitalize">{solicitacao.status}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(solicitacao.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {solicitacao.status === 'pendente' && (
                        <button
                          onClick={() => handleResponder(solicitacao)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Responder
                        </button>
                      )}
                      {solicitacao.status !== 'pendente' && (
                        <span className="text-gray-400">Respondido</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {filteredSolicitacoes.length === 0 && (
          <div className="text-center py-12">
            <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhuma solicitação encontrada</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || filterStatus ? 'Tente ajustar os filtros.' : 'Aguardando solicitações de marketing.'}
            </p>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && selectedSolicitacao && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Responder Solicitação</h2>
              
              {/* Detalhes da Solicitação */}
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">Detalhes da Solicitação:</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p><strong>Solicitante:</strong> {selectedSolicitacao.nome_solicitante}</p>
                    <p><strong>Município:</strong> {selectedSolicitacao.municipio_solicitante}</p>
                    <p><strong>Serviço:</strong> {selectedSolicitacao.servico_solicitado}</p>
                  </div>
                  <div>
                    <p><strong>Valor Estimado:</strong> {formatCurrency(selectedSolicitacao.valor_estimado)}</p>
                    <p><strong>Prazo Desejado:</strong> {selectedSolicitacao.prazo_desejado ? formatDate(selectedSolicitacao.prazo_desejado) : 'Não informado'}</p>
                    <p><strong>Data da Solicitação:</strong> {formatDate(selectedSolicitacao.created_at)}</p>
                  </div>
                </div>
                {selectedSolicitacao.descricao_projeto && (
                  <div className="mt-3">
                    <p><strong>Descrição do Projeto:</strong></p>
                    <p className="text-gray-600 mt-1">{selectedSolicitacao.descricao_projeto}</p>
                  </div>
                )}
              </div>

              {/* Resposta Administrativa */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Resposta Administrativa *
                </label>
                <textarea
                  value={resposta}
                  onChange={(e) => setResposta(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Digite sua resposta para o solicitante..."
                />
              </div>

              {/* Informações de Entrega (opcional) */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">Informações de Entrega (opcional):</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Local de Coleta:</label>
                    <input
                      type="text"
                      value={localColeta}
                      onChange={(e) => setLocalColeta(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Ex: Sede do partido, Rua ABC, 123"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Horário de Coleta:</label>
                    <input
                      type="text"
                      value={horarioColeta}
                      onChange={(e) => setHorarioColeta(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Ex: Segunda a sexta, 8h às 18h"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Responsável pela Entrega:</label>
                    <input
                      type="text"
                      value={responsavelColeta}
                      onChange={(e) => setResponsavelColeta(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Ex: João Silva, Maria Santos"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Data de Entrega:</label>
                    <input
                      type="date"
                      value={dataEntrega}
                      onChange={(e) => setDataEntrega(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Valor Final (R$):</label>
                    <input
                      type="number"
                      step="0.01"
                      value={valorFinal}
                      onChange={(e) => setValorFinal(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder={selectedSolicitacao.valor_estimado.toString()}
                    />
                  </div>
                </div>
                <div className="mt-3 p-3 bg-blue-50 rounded-md">
                  <p className="text-sm text-blue-800">
                    <strong>Dica:</strong> Preencha os campos acima para que o bot envie automaticamente as informações de coleta para o líder.
                  </p>
                </div>
              </div>

              {/* Botões */}
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowModal(false);
                    setSelectedSolicitacao(null);
                    setResposta('');
                    setLocalColeta('');
                    setHorarioColeta('');
                    setResponsavelColeta('');
                    setDataEntrega('');
                    setValorFinal('');
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleRejeitar}
                  disabled={!resposta.trim()}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Rejeitar
                </button>
                <button
                  onClick={handleAprovar}
                  disabled={!resposta.trim()}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Aprovar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
