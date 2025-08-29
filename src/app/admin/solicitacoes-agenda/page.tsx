'use client';
import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, MessageSquare, Calendar, User, MapPin, Filter, Search, Download, CalendarDays } from 'lucide-react';

interface SolicitacaoAgenda {
  id: number;
  phone_number: string;
  nome_solicitante: string;
  municipio_solicitante: string;
  data_solicitada: string;
  horario_solicitado: string;
  tipo_agendamento: string;
  assunto: string;
  descricao: string;
  local_preferido: string;
  duracao_estimada: number;
  prioridade: string;
  observacoes: string;
  status: string;
  resposta_administrativo: string;
  data_confirmada: string;
  horario_confirmado: string;
  local_confirmado: string;
  created_at: string;
  updated_at: string;
}

interface AgendaStats {
  total_solicitacoes: number;
  pendentes: number;
  aprovadas: number;
  rejeitadas: number;
  lideres_solicitantes: number;
  municipios_solicitantes: number;
}

export default function SolicitacoesAgendaPage() {
  const [solicitacoes, setSolicitacoes] = useState<SolicitacaoAgenda[]>([]);
  const [stats, setStats] = useState<AgendaStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedSolicitacao, setSelectedSolicitacao] = useState<SolicitacaoAgenda | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('todos');

  // Form data para resposta administrativa
  const [formData, setFormData] = useState({
    resposta_administrativo: '',
    data_confirmada: '',
    horario_confirmado: '',
    local_confirmado: ''
  });

  useEffect(() => {
    loadSolicitacoes();
    loadStats();
  }, []);

  const loadSolicitacoes = async () => {
    try {
      const response = await fetch('/api/solicitacoes-agenda');
      const data = await response.json();
      setSolicitacoes(data);
    } catch (error) {
      console.error('Erro ao carregar solicitações:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await fetch('/api/solicitacoes-agenda/stats');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  const handleResponder = (solicitacao: SolicitacaoAgenda) => {
    setSelectedSolicitacao(solicitacao);
    setFormData({
      resposta_administrativo: '',
      data_confirmada: '',
      horario_confirmado: '',
      local_confirmado: ''
    });
    setShowModal(true);
  };

  const handleAprovar = async () => {
    if (!selectedSolicitacao) return;
    
    try {
      const response = await fetch(`/api/solicitacoes-agenda/${selectedSolicitacao.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'aprovada',
          resposta_administrativo: formData.resposta_administrativo,
          data_confirmada: formData.data_confirmada,
          horario_confirmado: formData.horario_confirmado,
          local_confirmado: formData.local_confirmado
        })
      });

      if (response.ok) {
        setShowModal(false);
        loadSolicitacoes();
        loadStats();
      }
    } catch (error) {
      console.error('Erro ao aprovar solicitação:', error);
    }
  };

  const handleRejeitar = async () => {
    if (!selectedSolicitacao) return;
    
    try {
      const response = await fetch(`/api/solicitacoes-agenda/${selectedSolicitacao.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'rejeitada',
          resposta_administrativo: formData.resposta_administrativo,
          data_confirmada: null,
          horario_confirmado: null,
          local_confirmado: null
        })
      });

      if (response.ok) {
        setShowModal(false);
        loadSolicitacoes();
        loadStats();
      }
    } catch (error) {
      console.error('Erro ao rejeitar solicitação:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pendente': return 'text-yellow-600 bg-yellow-100';
      case 'aprovada': return 'text-green-600 bg-green-100';
      case 'rejeitada': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pendente': return <Clock className="h-4 w-4" />;
      case 'aprovada': return <CheckCircle className="h-4 w-4" />;
      case 'rejeitada': return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const formatDate = (date: string) => {
    if (!date) return 'Não informado';
    return new Date(date).toLocaleDateString('pt-BR');
  };

  const formatTime = (time: string) => {
    if (!time) return 'Não informado';
    return time.substring(0, 5);
  };

  const filteredSolicitacoes = solicitacoes.filter(solicitacao => {
    const matchesSearch = 
      solicitacao.nome_solicitante?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      solicitacao.municipio_solicitante?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      solicitacao.assunto?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      solicitacao.tipo_agendamento?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = 
      filterStatus === 'todos' ||
      solicitacao.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  const exportToCSV = () => {
    const headers = ['Solicitante', 'Município', 'Data Solicitada', 'Assunto', 'Tipo', 'Status', 'Resposta'];
    const csvContent = [
      headers.join(','),
      ...filteredSolicitacoes.map(s => [
        `"${s.nome_solicitante || ''}"`,
        `"${s.municipio_solicitante || ''}"`,
        formatDate(s.data_solicitada),
        `"${s.assunto || ''}"`,
        s.tipo_agendamento,
        s.status,
        `"${s.resposta_administrativo || ''}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `solicitacoes_agenda_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Carregando solicitações...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Solicitações de Agenda</h1>
        <p className="text-gray-600">Gerencie as solicitações de reuniões e encontros com o deputado</p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total de Solicitações</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total_solicitacoes}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-yellow-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pendentes</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendentes}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Aprovadas</p>
                <p className="text-2xl font-bold text-gray-900">{stats.aprovadas}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <XCircle className="h-8 w-8 text-red-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Rejeitadas</p>
                <p className="text-2xl font-bold text-gray-900">{stats.rejeitadas}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters and Actions */}
      <div className="bg-white rounded-lg shadow mb-6 p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex flex-col md:flex-row gap-4 flex-1">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Buscar por solicitante, município ou assunto..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="todos">Todos os status</option>
              <option value="pendente">Pendentes</option>
              <option value="aprovada">Aprovadas</option>
              <option value="rejeitada">Rejeitadas</option>
            </select>
          </div>
          
          <button
            onClick={exportToCSV}
            className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
          >
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </button>
        </div>
      </div>

      {/* Solicitações List */}
      <div className="space-y-4">
        {filteredSolicitacoes.map((solicitacao) => (
          <div key={solicitacao.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {solicitacao.nome_solicitante || 'Solicitante não identificado'}
                  </h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(solicitacao.status)}`}>
                    {getStatusIcon(solicitacao.status)}
                    {solicitacao.status}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600">
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span>{solicitacao.municipio_solicitante || 'Município não informado'}</span>
                  </div>
                  
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>Data: {formatDate(solicitacao.data_solicitada)}</span>
                  </div>
                  
                  <div className="flex items-center">
                    <CalendarDays className="h-4 w-4 mr-2" />
                    <span>Tipo: {solicitacao.tipo_agendamento}</span>
                  </div>
                  
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2" />
                    <span>Duração: {solicitacao.duracao_estimada} min</span>
                  </div>
                </div>
              </div>
              
              {solicitacao.status === 'pendente' && (
                <button
                  onClick={() => handleResponder(solicitacao)}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Responder
                </button>
              )}
            </div>
            
            <div className="space-y-3">
              <div>
                <h4 className="font-medium text-gray-900 mb-1">Assunto:</h4>
                <p className="text-gray-700">{solicitacao.assunto}</p>
              </div>
              
              {solicitacao.descricao && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Descrição:</h4>
                  <p className="text-gray-700">{solicitacao.descricao}</p>
                </div>
              )}
              
              {solicitacao.local_preferido && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Local Preferido:</h4>
                  <p className="text-gray-700">{solicitacao.local_preferido}</p>
                </div>
              )}
              
              {solicitacao.observacoes && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Observações:</h4>
                  <p className="text-gray-700">{solicitacao.observacoes}</p>
                </div>
              )}
              
              {solicitacao.resposta_administrativo && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-1">Resposta Administrativa:</h4>
                  <p className="text-gray-700">{solicitacao.resposta_administrativo}</p>
                  
                  {solicitacao.status === 'aprovada' && (
                    <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                      <div>
                        <span className="font-medium text-gray-900">Data Confirmada:</span>
                        <p className="text-gray-700">{formatDate(solicitacao.data_confirmada)}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-900">Horário Confirmado:</span>
                        <p className="text-gray-700">{formatTime(solicitacao.horario_confirmado)}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-900">Local Confirmado:</span>
                        <p className="text-gray-700">{solicitacao.local_confirmado || 'Não informado'}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <div className="mt-4 text-xs text-gray-500">
              Solicitado em: {new Date(solicitacao.created_at).toLocaleString('pt-BR')}
            </div>
          </div>
        ))}
      </div>

      {filteredSolicitacoes.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Nenhuma solicitação encontrada</p>
        </div>
      )}

      {/* Modal de Resposta */}
      {showModal && selectedSolicitacao && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">
              Responder Solicitação de Agenda
            </h2>
            
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">Detalhes da Solicitação:</h3>
              <div className="space-y-2 text-sm">
                <p><strong>Solicitante:</strong> {selectedSolicitacao.nome_solicitante}</p>
                <p><strong>Município:</strong> {selectedSolicitacao.municipio_solicitante}</p>
                <p><strong>Assunto:</strong> {selectedSolicitacao.assunto}</p>
                <p><strong>Data Solicitada:</strong> {formatDate(selectedSolicitacao.data_solicitada)}</p>
                <p><strong>Tipo:</strong> {selectedSolicitacao.tipo_agendamento}</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Resposta Administrativa *
                </label>
                <textarea
                  required
                  value={formData.resposta_administrativo}
                  onChange={(e) => setFormData({...formData, resposta_administrativo: e.target.value})}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Digite a resposta para o solicitante..."
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Data Confirmada
                  </label>
                  <input
                    type="date"
                    value={formData.data_confirmada}
                    onChange={(e) => setFormData({...formData, data_confirmada: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Horário Confirmado
                  </label>
                  <input
                    type="time"
                    value={formData.horario_confirmado}
                    onChange={(e) => setFormData({...formData, horario_confirmado: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Local Confirmado
                  </label>
                  <input
                    type="text"
                    value={formData.local_confirmado}
                    onChange={(e) => setFormData({...formData, local_confirmado: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ex: Gabinete, Câmara dos Deputados"
                  />
                </div>
              </div>
            </div>
            
            <div className="flex gap-3 pt-6">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              
              <button
                type="button"
                onClick={handleRejeitar}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                Rejeitar
              </button>
              
              <button
                type="button"
                onClick={handleAprovar}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
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
