'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Calendar, Clock, MapPin, Users, Camera, Filter, Search, Download, CheckCircle, XCircle, Eye } from 'lucide-react';

interface RegistroEvento {
  id: number;
  phone_number: string;
  nome_organizador: string;
  municipio: string;
  data_evento: string;
  horario_evento: string;
  local_evento: string;
  tipo_evento: string;
  titulo_evento: string;
  descricao_evento: string;
  quantidade_participantes: number;
  foto1_base64: string | null;
  foto2_base64: string | null;
  foto3_base64: string | null;
  observacoes: string;
  status: string;
  resposta_administrativo: string;
  aprovado: boolean;
  created_at: string;
}

interface EventosStats {
  total: number;
  pendentes: number;
  aprovados: number;
  rejeitados: number;
  total_participantes: number;
  ultimos_30_dias: number;
  ultimos_7_dias: number;
}

export default function EventosPage() {
  const [eventos, setEventos] = useState<RegistroEvento[]>([]);
  const [stats, setStats] = useState<EventosStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [selectedEvento, setSelectedEvento] = useState<RegistroEvento | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');

  const [formData, setFormData] = useState({
    nome_organizador: '',
    municipio: '',
    data_evento: '',
    horario_evento: '',
    local_evento: '',
    tipo_evento: 'reuniao',
    titulo_evento: '',
    descricao_evento: '',
    quantidade_participantes: 0,
    observacoes: ''
  });

  const tiposEvento = [
    { value: 'reuniao', label: 'Reunião' },
    { value: 'evento', label: 'Evento' },
    { value: 'palestra', label: 'Palestra' },
    { value: 'encontro', label: 'Encontro' },
    { value: 'comemoracao', label: 'Comemoração' },
    { value: 'outro', label: 'Outro' }
  ];

  useEffect(() => {
    loadEventos();
    loadStats();
  }, []);

  const loadEventos = async () => {
    try {
      const response = await fetch('/api/eventos');
      const data = await response.json();
      setEventos(data);
    } catch (error) {
      console.error('Erro ao carregar eventos:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await fetch('/api/eventos/stats');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingId ? `/api/eventos/${editingId}` : '/api/eventos';
      const method = editingId ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setModal(false);
        resetForm();
        loadEventos();
        loadStats();
      }
    } catch (error) {
      console.error('Erro ao salvar evento:', error);
    }
  };

  const handleEdit = (evento: RegistroEvento) => {
    setEditingId(evento.id);
    setFormData({
      nome_organizador: evento.nome_organizador,
      municipio: evento.municipio,
      data_evento: evento.data_evento,
      horario_evento: evento.horario_evento || '',
      local_evento: evento.local_evento,
      tipo_evento: evento.tipo_evento,
      titulo_evento: evento.titulo_evento,
      descricao_evento: evento.descricao_evento || '',
      quantidade_participantes: evento.quantidade_participantes,
      observacoes: evento.observacoes || ''
    });
    setModal(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Tem certeza que deseja excluir este evento?')) {
      try {
        const response = await fetch(`/api/eventos/${id}`, { method: 'DELETE' });
        if (response.ok) {
          loadEventos();
          loadStats();
        }
      } catch (error) {
        console.error('Erro ao excluir evento:', error);
      }
    }
  };

  const handleView = (evento: RegistroEvento) => {
    setSelectedEvento(evento);
    setModal(true);
  };

  const handleAprovar = async (id: number) => {
    try {
      const response = await fetch(`/api/eventos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'aprovado',
          resposta_administrativo: 'Evento aprovado com sucesso!',
          aprovado: true
        })
      });
      if (response.ok) {
        loadEventos();
        loadStats();
      }
    } catch (error) {
      console.error('Erro ao aprovar evento:', error);
    }
  };

  const handleRejeitar = async (id: number) => {
    try {
      const response = await fetch(`/api/eventos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'rejeitado',
          resposta_administrativo: 'Evento rejeitado.',
          aprovado: false
        })
      });
      if (response.ok) {
        loadEventos();
        loadStats();
      }
    } catch (error) {
      console.error('Erro ao rejeitar evento:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      nome_organizador: '',
      municipio: '',
      data_evento: '',
      horario_evento: '',
      local_evento: '',
      tipo_evento: 'reuniao',
      titulo_evento: '',
      descricao_evento: '',
      quantidade_participantes: 0,
      observacoes: ''
    });
    setEditingId(null);
    setSelectedEvento(null);
  };

  const filteredEventos = eventos.filter(evento => {
    const matchesSearch = evento.nome_organizador.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         evento.municipio.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         evento.titulo_evento.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'todos' || evento.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR');
  };

  const formatTime = (time: string) => {
    return time || 'Não informado';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'aprovado': return 'text-green-600 bg-green-100';
      case 'rejeitado': return 'text-red-600 bg-red-100';
      case 'pendente': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'aprovado': return <CheckCircle className="w-4 h-4" />;
      case 'rejeitado': return <XCircle className="w-4 h-4" />;
      case 'pendente': return <Clock className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const exportToCSV = () => {
    const headers = ['ID', 'Organizador', 'Município', 'Data', 'Horário', 'Local', 'Tipo', 'Título', 'Participantes', 'Status'];
    const csvContent = [
      headers.join(','),
      ...filteredEventos.map(evento => [
        evento.id,
        evento.nome_organizador,
        evento.municipio,
        evento.data_evento,
        evento.horario_evento,
        evento.local_evento,
        evento.tipo_evento,
        evento.titulo_evento,
        evento.quantidade_participantes,
        evento.status
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `eventos_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando eventos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Registros de Eventos</h1>
        <p className="text-gray-600">Gerencie os registros de eventos e reuniões realizados pelas lideranças</p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total de Eventos</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pendentes</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendentes}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Participantes</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total_participantes}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Calendar className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Últimos 30 dias</p>
                <p className="text-2xl font-bold text-gray-900">{stats.ultimos_30_dias}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters and Actions */}
      <div className="bg-white rounded-lg shadow mb-6 p-6">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex flex-col md:flex-row gap-4 flex-1">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar por organizador, município ou título..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="todos">Todos os status</option>
              <option value="pendente">Pendentes</option>
              <option value="aprovado">Aprovados</option>
              <option value="rejeitado">Rejeitados</option>
            </select>
          </div>

          <div className="flex gap-2">
            <button
              onClick={exportToCSV}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              Exportar CSV
            </button>

            <button
              onClick={() => setModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Novo Evento
            </button>
          </div>
        </div>
      </div>

      {/* Eventos Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredEventos.map((evento) => (
          <div key={evento.id} className="bg-white rounded-lg shadow overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-gray-900 truncate">{evento.titulo_evento}</h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(evento.status)}`}>
                  {getStatusIcon(evento.status)}
                  {evento.status}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-2">{evento.nome_organizador} • {evento.municipio}</p>
              <p className="text-sm text-gray-500">{formatDate(evento.data_evento)} às {formatTime(evento.horario_evento)}</p>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span className="truncate">{evento.local_evento}</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Users className="w-4 h-4" />
                  <span>{evento.quantidade_participantes} participantes</span>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span className="capitalize">{evento.tipo_evento}</span>
                </div>

                {evento.foto1_base64 && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Camera className="w-4 h-4" />
                    <span>Fotos anexadas</span>
                  </div>
                )}
              </div>

              {evento.descricao_evento && (
                <p className="mt-3 text-sm text-gray-700 line-clamp-2">{evento.descricao_evento}</p>
              )}
            </div>

            {/* Actions */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  <button
                    onClick={() => handleView(evento)}
                    className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Visualizar"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  
                  <button
                    onClick={() => handleEdit(evento)}
                    className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                    title="Editar"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  
                  <button
                    onClick={() => handleDelete(evento.id)}
                    className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Excluir"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {evento.status === 'pendente' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAprovar(evento.id)}
                      className="px-3 py-1 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Aprovar
                    </button>
                    <button
                      onClick={() => handleRejeitar(evento.id)}
                      className="px-3 py-1 bg-red-600 text-white text-xs rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Rejeitar
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredEventos.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum evento encontrado</h3>
          <p className="text-gray-600">Não há eventos que correspondam aos filtros aplicados.</p>
        </div>
      )}

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                {selectedEvento ? 'Visualizar Evento' : editingId ? 'Editar Evento' : 'Novo Evento'}
              </h2>
            </div>

            {selectedEvento ? (
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Organizador</label>
                    <p className="text-gray-900">{selectedEvento.nome_organizador}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Município</label>
                    <p className="text-gray-900">{selectedEvento.municipio}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Data</label>
                    <p className="text-gray-900">{formatDate(selectedEvento.data_evento)}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Horário</label>
                    <p className="text-gray-900">{formatTime(selectedEvento.horario_evento)}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Local</label>
                    <p className="text-gray-900">{selectedEvento.local_evento}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tipo</label>
                    <p className="text-gray-900 capitalize">{selectedEvento.tipo_evento}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Participantes</label>
                    <p className="text-gray-900">{selectedEvento.quantidade_participantes}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedEvento.status)}`}>
                      {selectedEvento.status}
                    </span>
                  </div>
                </div>
                
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Título</label>
                  <p className="text-gray-900">{selectedEvento.titulo_evento}</p>
                </div>
                
                {selectedEvento.descricao_evento && (
                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Descrição</label>
                    <p className="text-gray-900">{selectedEvento.descricao_evento}</p>
                  </div>
                )}
                
                {selectedEvento.observacoes && (
                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Observações</label>
                    <p className="text-gray-900">{selectedEvento.observacoes}</p>
                  </div>
                )}

                {/* Fotos */}
                {(selectedEvento.foto1_base64 || selectedEvento.foto2_base64 || selectedEvento.foto3_base64) && (
                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Fotos do Evento</label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {selectedEvento.foto1_base64 && (
                        <img 
                          src={`data:image/jpeg;base64,${selectedEvento.foto1_base64}`} 
                          alt="Foto 1" 
                          className="w-full h-32 object-cover rounded-lg"
                        />
                      )}
                      {selectedEvento.foto2_base64 && (
                        <img 
                          src={`data:image/jpeg;base64,${selectedEvento.foto2_base64}`} 
                          alt="Foto 2" 
                          className="w-full h-32 object-cover rounded-lg"
                        />
                      )}
                      {selectedEvento.foto3_base64 && (
                        <img 
                          src={`data:image/jpeg;base64,${selectedEvento.foto3_base64}`} 
                          alt="Foto 3" 
                          className="w-full h-32 object-cover rounded-lg"
                        />
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Organizador *</label>
                    <input
                      type="text"
                      required
                      value={formData.nome_organizador}
                      onChange={(e) => setFormData({...formData, nome_organizador: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Município *</label>
                    <input
                      type="text"
                      required
                      value={formData.municipio}
                      onChange={(e) => setFormData({...formData, municipio: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Data *</label>
                    <input
                      type="date"
                      required
                      value={formData.data_evento}
                      onChange={(e) => setFormData({...formData, data_evento: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Horário *</label>
                    <input
                      type="time"
                      required
                      value={formData.horario_evento}
                      onChange={(e) => setFormData({...formData, horario_evento: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Local *</label>
                    <input
                      type="text"
                      required
                      value={formData.local_evento}
                      onChange={(e) => setFormData({...formData, local_evento: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tipo *</label>
                    <select
                      required
                      value={formData.tipo_evento}
                      onChange={(e) => setFormData({...formData, tipo_evento: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {tiposEvento.map(tipo => (
                        <option key={tipo.value} value={tipo.value}>{tipo.label}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Participantes</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.quantidade_participantes}
                      onChange={(e) => setFormData({...formData, quantidade_participantes: parseInt(e.target.value) || 0})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Título *</label>
                  <input
                    type="text"
                    required
                    value={formData.titulo_evento}
                    onChange={(e) => setFormData({...formData, titulo_evento: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Descrição</label>
                  <textarea
                    rows={3}
                    value={formData.descricao_evento}
                    onChange={(e) => setFormData({...formData, descricao_evento: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Observações</label>
                  <textarea
                    rows={3}
                    value={formData.observacoes}
                    onChange={(e) => setFormData({...formData, observacoes: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </form>
            )}

            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => {
                  setModal(false);
                  resetForm();
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                {selectedEvento ? 'Fechar' : 'Cancelar'}
              </button>
              
              {!selectedEvento && (
                <button
                  onClick={handleSubmit}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingId ? 'Atualizar' : 'Criar'} Evento
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
