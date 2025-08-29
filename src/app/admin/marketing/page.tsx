'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Package, DollarSign, Clock, Filter, Search, Download } from 'lucide-react';

interface ServicoMarketing {
  id: number;
  nome: string;
  categoria: string;
  descricao: string;
  tempo_estimado: string;
  custo_estimado: number;
  fornecedor: string;
  observacoes: string;
  created_at: string;
  updated_at: string;
}

export default function MarketingPage() {
  const [servicos, setServicos] = useState<ServicoMarketing[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingServico, setEditingServico] = useState<ServicoMarketing | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategoria, setFilterCategoria] = useState('');

  // Form data
  const [formData, setFormData] = useState({
    nome: '',
    categoria: '',
    descricao: '',
    tempo_estimado: '',
    custo_estimado: '',
    fornecedor: '',
    observacoes: ''
  });

  const categorias = [
    'Identidade Visual',
    'Design Gráfico',
    'Social Media',
    'Web Design',
    'Impressão',
    'Fotografia',
    'Vídeo',
    'Outros'
  ];

  useEffect(() => {
    loadServicos();
  }, []);

  const loadServicos = async () => {
    try {
      const response = await fetch('/api/marketing');
      if (response.ok) {
        const data = await response.json();
        setServicos(data);
      }
    } catch (error) {
      console.error('Erro ao carregar serviços:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = editingServico 
        ? `/api/marketing/${editingServico.id}`
        : '/api/marketing';
      
      const method = editingServico ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          custo_estimado: parseFloat(formData.custo_estimado) || 0
        })
      });

      if (response.ok) {
        setShowModal(false);
        setEditingServico(null);
        resetForm();
        loadServicos();
      }
    } catch (error) {
      console.error('Erro ao salvar serviço:', error);
    }
  };

  const handleEdit = (servico: ServicoMarketing) => {
    setEditingServico(servico);
    setFormData({
      nome: servico.nome,
      categoria: servico.categoria,
      descricao: servico.descricao || '',
      tempo_estimado: servico.tempo_estimado || '',
      custo_estimado: servico.custo_estimado.toString(),
      fornecedor: servico.fornecedor || '',
      observacoes: servico.observacoes || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir este serviço?')) return;
    
    try {
      const response = await fetch(`/api/marketing/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        loadServicos();
      }
    } catch (error) {
      console.error('Erro ao excluir serviço:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      nome: '',
      categoria: '',
      descricao: '',
      tempo_estimado: '',
      custo_estimado: '',
      fornecedor: '',
      observacoes: ''
    });
  };

  const filteredServicos = servicos.filter(servico => {
    const matchesSearch = servico.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         servico.descricao?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         servico.fornecedor?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategoria = !filterCategoria || servico.categoria === filterCategoria;
    return matchesSearch && matchesCategoria;
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const exportToCSV = () => {
    const headers = ['Nome', 'Categoria', 'Descrição', 'Tempo Estimado', 'Custo Estimado', 'Fornecedor', 'Observações'];
    const csvContent = [
      headers.join(','),
      ...filteredServicos.map(servico => [
        servico.nome,
        servico.categoria,
        servico.descricao || '',
        servico.tempo_estimado || '',
        servico.custo_estimado,
        servico.fornecedor || '',
        servico.observacoes || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'servicos_marketing.csv');
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white p-6 rounded-lg shadow">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
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
            <h1 className="text-3xl font-bold text-gray-900">Serviços de Marketing</h1>
            <p className="text-gray-600 mt-2">Gerencie os serviços de marketing disponíveis</p>
          </div>
          <button
            onClick={() => {
              setEditingServico(null);
              resetForm();
              setShowModal(true);
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus size={20} />
            Novo Serviço
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total de Serviços</p>
                <p className="text-2xl font-bold text-gray-900">{servicos.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Custo Total Estimado</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(servicos.reduce((sum, s) => sum + s.custo_estimado, 0))}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Categorias</p>
                <p className="text-2xl font-bold text-gray-900">
                  {new Set(servicos.map(s => s.categoria)).size}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <Filter className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Filtrados</p>
                <p className="text-2xl font-bold text-gray-900">{filteredServicos.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Buscar serviços..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="md:w-64">
              <select
                value={filterCategoria}
                onChange={(e) => setFilterCategoria(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Todas as categorias</option>
                {categorias.map(categoria => (
                  <option key={categoria} value={categoria}>{categoria}</option>
                ))}
              </select>
            </div>
            <button
              onClick={exportToCSV}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
            >
              <Download size={20} />
              Exportar CSV
            </button>
          </div>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServicos.map((servico) => (
            <div key={servico.id} className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{servico.nome}</h3>
                  <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full mt-1">
                    {servico.categoria}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(servico)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(servico.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              
              {servico.descricao && (
                <p className="text-gray-600 text-sm mb-3">{servico.descricao}</p>
              )}
              
              <div className="space-y-2 text-sm">
                {servico.tempo_estimado && (
                  <div className="flex items-center text-gray-600">
                    <Clock size={14} className="mr-2" />
                    {servico.tempo_estimado}
                  </div>
                )}
                
                <div className="flex items-center text-gray-600">
                  <DollarSign size={14} className="mr-2" />
                  {formatCurrency(servico.custo_estimado)}
                </div>
                
                {servico.fornecedor && (
                  <div className="flex items-center text-gray-600">
                    <Package size={14} className="mr-2" />
                    {servico.fornecedor}
                  </div>
                )}
              </div>
              
              {servico.observacoes && (
                <div className="mt-3 p-2 bg-gray-50 rounded text-xs text-gray-600">
                  {servico.observacoes}
                </div>
              )}
            </div>
          ))}
        </div>

        {filteredServicos.length === 0 && (
          <div className="text-center py-12">
            <Package className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum serviço encontrado</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || filterCategoria ? 'Tente ajustar os filtros.' : 'Comece adicionando um novo serviço.'}
            </p>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">
                {editingServico ? 'Editar Serviço' : 'Novo Serviço'}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nome do Serviço *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.nome}
                      onChange={(e) => setFormData({...formData, nome: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Categoria *
                    </label>
                    <select
                      required
                      value={formData.categoria}
                      onChange={(e) => setFormData({...formData, categoria: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Selecione uma categoria</option>
                      {categorias.map(categoria => (
                        <option key={categoria} value={categoria}>{categoria}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descrição
                  </label>
                  <textarea
                    value={formData.descricao}
                    onChange={(e) => setFormData({...formData, descricao: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tempo Estimado
                    </label>
                    <input
                      type="text"
                      value={formData.tempo_estimado}
                      onChange={(e) => setFormData({...formData, tempo_estimado: e.target.value})}
                      placeholder="Ex: 3-5 dias"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Custo Estimado (R$)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.custo_estimado}
                      onChange={(e) => setFormData({...formData, custo_estimado: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fornecedor
                    </label>
                    <input
                      type="text"
                      value={formData.fornecedor}
                      onChange={(e) => setFormData({...formData, fornecedor: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Observações
                  </label>
                  <textarea
                    value={formData.observacoes}
                    onChange={(e) => setFormData({...formData, observacoes: e.target.value})}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setEditingServico(null);
                      resetForm();
                    }}
                    className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    {editingServico ? 'Atualizar' : 'Criar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
