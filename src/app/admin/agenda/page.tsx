'use client';
import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Calendar, Clock, MapPin, Filter, Search, Download, CheckCircle, XCircle } from 'lucide-react';

interface AgendaDisponibilidade {
  id: number;
  data: string;
  horario_inicio: string;
  horario_fim: string;
  local: string;
  tipo_agendamento: string;
  observacoes: string;
  disponivel: boolean;
  created_at: string;
  updated_at: string;
}

interface AgendaStats {
  total_horarios: number;
  horarios_disponiveis: number;
  horarios_ocupados: number;
  dias_com_horarios: number;
}

export default function AgendaPage() {
  const [horarios, setHorarios] = useState<AgendaDisponibilidade[]>([]);
  const [stats, setStats] = useState<AgendaStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDisponivel, setFilterDisponivel] = useState<string>('todos');

  const [formData, setFormData] = useState({
    data: '',
    horario_inicio: '',
    horario_fim: '',
    local: '',
    tipo_agendamento: 'reuniao',
    observacoes: '',
    disponivel: true
  });

  const tiposAgendamento = [
    { value: 'reuniao', label: 'Reunião' },
    { value: 'visita', label: 'Visita' },
    { value: 'audiencia', label: 'Audiência' },
    { value: 'evento', label: 'Evento' },
    { value: 'consulta', label: 'Consulta' }
  ];

  useEffect(() => {
    loadHorarios();
    loadStats();
  }, []);

  const loadHorarios = async () => {
    try {
      const response = await fetch('/api/agenda');
      const data = await response.json();
      setHorarios(data);
    } catch (error) {
      console.error('Erro ao carregar horários:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await fetch('/api/agenda/stats');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = editingId ? `/api/agenda/${editingId}` : '/api/agenda';
      const method = editingId ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setShowModal(false);
        resetForm();
        loadHorarios();
        loadStats();
      }
    } catch (error) {
      console.error('Erro ao salvar horário:', error);
    }
  };

  const handleEdit = (horario: AgendaDisponibilidade) => {
    setEditingId(horario.id);
    setFormData({
      data: horario.data,
      horario_inicio: horario.horario_inicio,
      horario_fim: horario.horario_fim,
      local: horario.local || '',
      tipo_agendamento: horario.tipo_agendamento,
      observacoes: horario.observacoes || '',
      disponivel: horario.disponivel
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir este horário?')) return;
    
    try {
      const response = await fetch(`/api/agenda/${id}`, { method: 'DELETE' });
      if (response.ok) {
        loadHorarios();
        loadStats();
      }
    } catch (error) {
      console.error('Erro ao excluir horário:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      data: '',
      horario_inicio: '',
      horario_fim: '',
      local: '',
      tipo_agendamento: 'reuniao',
      observacoes: '',
      disponivel: true
    });
    setEditingId(null);
  };

  const filteredHorarios = horarios.filter(horario => {
    const matchesSearch = 
      horario.local?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      horario.observacoes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      horario.tipo_agendamento.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = 
      filterDisponivel === 'todos' ||
      (filterDisponivel === 'disponiveis' && horario.disponivel) ||
      (filterDisponivel === 'ocupados' && !horario.disponivel);
    
    return matchesSearch && matchesFilter;
  });

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR');
  };

  const formatTime = (time: string) => {
    return time.substring(0, 5);
  };

  const exportToCSV = () => {
    const headers = ['Data', 'Início', 'Fim', 'Local', 'Tipo', 'Disponível', 'Observações'];
    const csvContent = [
      headers.join(','),
      ...filteredHorarios.map(h => [
        formatDate(h.data),
        formatTime(h.horario_inicio),
        formatTime(h.horario_fim),
        `"${h.local || ''}"`,
        h.tipo_agendamento,
        h.disponivel ? 'Sim' : 'Não',
        `"${h.observacoes || ''}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `agenda_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Carregando agenda...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Agenda do Deputado</h1>
        <p className="text-gray-600">Gerencie a disponibilidade de horários para reuniões e encontros</p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total de Horários</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total_horarios}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Disponíveis</p>
                <p className="text-2xl font-bold text-gray-900">{stats.horarios_disponiveis}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <XCircle className="h-8 w-8 text-red-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Ocupados</p>
                <p className="text-2xl font-bold text-gray-900">{stats.horarios_ocupados}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-purple-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Dias com Horários</p>
                <p className="text-2xl font-bold text-gray-900">{stats.dias_com_horarios}</p>
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
                placeholder="Buscar por local, observações ou tipo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <select
              value={filterDisponivel}
              onChange={(e) => setFilterDisponivel(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="todos">Todos os horários</option>
              <option value="disponiveis">Apenas disponíveis</option>
              <option value="ocupados">Apenas ocupados</option>
            </select>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={exportToCSV}
              className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
            >
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </button>
            
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Horário
            </button>
          </div>
        </div>
      </div>

      {/* Horários Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredHorarios.map((horario) => (
          <div key={horario.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {formatDate(horario.data)}
                </h3>
                <p className="text-sm text-gray-600">
                  {formatTime(horario.horario_inicio)} - {formatTime(horario.horario_fim)}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(horario)}
                  className="p-1 text-blue-600 hover:text-blue-800"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(horario.id)}
                  className="p-1 text-red-600 hover:text-red-800"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center text-sm">
                <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                <span className="text-gray-600">{horario.local || 'Local não definido'}</span>
              </div>
              
              <div className="flex items-center text-sm">
                <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                <span className="text-gray-600 capitalize">{horario.tipo_agendamento}</span>
              </div>
              
              <div className="flex items-center text-sm">
                {horario.disponivel ? (
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500 mr-2" />
                )}
                <span className={horario.disponivel ? 'text-green-600' : 'text-red-600'}>
                  {horario.disponivel ? 'Disponível' : 'Ocupado'}
                </span>
              </div>
              
              {horario.observacoes && (
                <p className="text-sm text-gray-600 mt-2">{horario.observacoes}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredHorarios.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Nenhum horário encontrado</p>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-semibold mb-4">
              {editingId ? 'Editar Horário' : 'Adicionar Horário'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Data</label>
                <input
                  type="date"
                  required
                  value={formData.data}
                  onChange={(e) => setFormData({...formData, data: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Início</label>
                  <input
                    type="time"
                    required
                    value={formData.horario_inicio}
                    onChange={(e) => setFormData({...formData, horario_inicio: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fim</label>
                  <input
                    type="time"
                    required
                    value={formData.horario_fim}
                    onChange={(e) => setFormData({...formData, horario_fim: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Local</label>
                <input
                  type="text"
                  value={formData.local}
                  onChange={(e) => setFormData({...formData, local: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ex: Gabinete, Câmara dos Deputados"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Agendamento</label>
                <select
                  value={formData.tipo_agendamento}
                  onChange={(e) => setFormData({...formData, tipo_agendamento: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {tiposAgendamento.map(tipo => (
                    <option key={tipo.value} value={tipo.value}>{tipo.label}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
                <textarea
                  value={formData.observacoes}
                  onChange={(e) => setFormData({...formData, observacoes: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Observações adicionais..."
                />
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="disponivel"
                  checked={formData.disponivel}
                  onChange={(e) => setFormData({...formData, disponivel: e.target.checked})}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="disponivel" className="ml-2 text-sm text-gray-700">
                  Horário disponível
                </label>
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  {editingId ? 'Atualizar' : 'Adicionar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
