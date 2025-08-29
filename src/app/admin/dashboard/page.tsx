'use client';

import { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Users, 
  MapPin, 
  Package, 
  DollarSign, 
  TrendingUp, 
  Calendar,
  Filter,
  Download,
  RefreshCw
} from 'lucide-react';

interface DashboardStats {
  solicitacoes: {
    total_solicitacoes: number;
    solicitacoes_pendentes: number;
    solicitacoes_aprovadas: number;
    solicitacoes_rejeitadas: number;
    valor_total_solicitado: number;
    valor_total_aprovado: number;
  };
  materiais: {
    total_materiais: number;
    total_categorias: number;
    valor_total_estoque: number;
    materiais_estoque_baixo: number;
  };
  entregas: {
    total_entregas: number;
    quantidade_total_entregue: number;
    valor_total_entregue: number;
    total_lideres_atendidos: number;
    total_municipios_atendidos: number;
    valor_medio_por_entrega: number;
  };
}

interface StatsPorLider {
  nome_solicitante: string;
  municipio_solicitante: string;
  total_solicitacoes: number;
  solicitacoes_aprovadas: number;
  solicitacoes_pendentes: number;
  solicitacoes_rejeitadas: number;
  valor_total_solicitado: number;
  valor_total_aprovado: number;
  ultima_solicitacao: string;
}

interface StatsPorMunicipio {
  municipio_solicitante: string;
  total_solicitacoes: number;
  total_lideres: number;
  solicitacoes_aprovadas: number;
  solicitacoes_pendentes: number;
  solicitacoes_rejeitadas: number;
  valor_total_solicitado: number;
  valor_total_aprovado: number;
  valor_medio_por_solicitacao: number;
}

interface StatsPorMaterial {
  material_solicitado: string;
  total_solicitacoes: number;
  quantidade_total_solicitada: number;
  quantidade_aprovada: number;
  valor_total_solicitado: number;
  valor_total_aprovado: number;
  valor_medio_unitario: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [statsPorLider, setStatsPorLider] = useState<StatsPorLider[]>([]);
  const [statsPorMunicipio, setStatsPorMunicipio] = useState<StatsPorMunicipio[]>([]);
  const [statsPorMaterial, setStatsPorMaterial] = useState<StatsPorMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterPeriod, setFilterPeriod] = useState('30'); // dias
  const [filterMunicipio, setFilterMunicipio] = useState('');

  useEffect(() => {
    loadDashboardData();
  }, [filterPeriod, filterMunicipio]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Carregar estatísticas gerais
      const [solicitacoesRes, materiaisRes, entregasRes] = await Promise.all([
        fetch('/api/solicitacoes/stats'),
        fetch('/api/materiais/stats'),
        fetch('/api/entregas/stats')
      ]);

      const [solicitacoesStats, materiaisStats, entregasStats] = await Promise.all([
        solicitacoesRes.json(),
        materiaisRes.json(),
        entregasRes.json()
      ]);

      setStats({
        solicitacoes: solicitacoesStats,
        materiais: materiaisStats,
        entregas: entregasStats
      });

      // Carregar estatísticas por líder
      const lideresRes = await fetch('/api/solicitacoes/stats/lideres');
      const lideresStats = await lideresRes.json();
      setStatsPorLider(lideresStats);

      // Carregar estatísticas por município
      const municipiosRes = await fetch('/api/solicitacoes/stats/municipios');
      const municipiosStats = await municipiosRes.json();
      setStatsPorMunicipio(municipiosStats);

      // Carregar estatísticas por material
      const materiaisDetalhadoRes = await fetch('/api/solicitacoes/stats/materiais');
      const materiaisDetalhadoStats = await materiaisDetalhadoRes.json();
      setStatsPorMaterial(materiaisDetalhadoStats);

    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
    } finally {
      setLoading(false);
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

  const exportToCSV = (data: any[], filename: string) => {
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(row => Object.values(row).join(','));
    const csv = [headers, ...rows].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
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
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Administrativo</h1>
          <p className="text-gray-600 mt-2">Controle completo de materiais e solicitações</p>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={loadDashboardData}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <RefreshCw size={16} className="mr-2" />
            Atualizar
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white p-4 rounded-lg shadow mb-8">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Filter size={16} />
            <span className="text-sm font-medium">Filtros:</span>
          </div>
          <select
            value={filterPeriod}
            onChange={(e) => setFilterPeriod(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm"
          >
            <option value="7">Últimos 7 dias</option>
            <option value="30">Últimos 30 dias</option>
            <option value="90">Últimos 90 dias</option>
            <option value="365">Último ano</option>
          </select>
          <select
            value={filterMunicipio}
            onChange={(e) => setFilterMunicipio(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm"
          >
            <option value="">Todos os municípios</option>
            {statsPorMunicipio.map(municipio => (
              <option key={municipio.municipio_solicitante} value={municipio.municipio_solicitante}>
                {municipio.municipio_solicitante}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Cards de Estatísticas Gerais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Solicitações */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total de Solicitações</p>
              <p className="text-2xl font-bold">{stats?.solicitacoes.total_solicitacoes || 0}</p>
              <p className="text-xs text-gray-500 mt-1">
                {stats?.solicitacoes.solicitacoes_pendentes || 0} pendentes
              </p>
            </div>
            <Package className="text-blue-600" size={24} />
          </div>
        </div>

        {/* Valor Total Solicitado */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Valor Total Solicitado</p>
              <p className="text-2xl font-bold">{formatCurrency(stats?.solicitacoes.valor_total_solicitado || 0)}</p>
              <p className="text-xs text-gray-500 mt-1">
                {formatCurrency(stats?.solicitacoes.valor_total_aprovado || 0)} aprovado
              </p>
            </div>
            <DollarSign className="text-green-600" size={24} />
          </div>
        </div>

        {/* Entregas */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total de Entregas</p>
              <p className="text-2xl font-bold">{stats?.entregas.total_entregas || 0}</p>
              <p className="text-xs text-gray-500 mt-1">
                {stats?.entregas.total_lideres_atendidos || 0} líderes atendidos
              </p>
            </div>
            <TrendingUp className="text-purple-600" size={24} />
          </div>
        </div>

        {/* Valor Total Entregue */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Valor Total Entregue</p>
              <p className="text-2xl font-bold">{formatCurrency(stats?.entregas.valor_total_entregue || 0)}</p>
              <p className="text-xs text-gray-500 mt-1">
                Média: {formatCurrency(stats?.entregas.valor_medio_por_entrega || 0)}
              </p>
            </div>
            <DollarSign className="text-orange-600" size={24} />
          </div>
        </div>
      </div>

      {/* Estatísticas por Líder */}
      <div className="bg-white rounded-lg shadow mb-8">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">Estatísticas por Líder</h2>
            <button
              onClick={() => exportToCSV(statsPorLider, 'estatisticas_por_lider')}
              className="flex items-center px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
            >
              <Download size={14} className="mr-1" />
              Exportar
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Líder</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Município</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Solicitações</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aprovadas</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Valor Solicitado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Valor Aprovado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Última Solicitação</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {statsPorLider.map((lider, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {lider.nome_solicitante}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {lider.municipio_solicitante}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {lider.total_solicitacoes}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {lider.solicitacoes_aprovadas}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(lider.valor_total_solicitado)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(lider.valor_total_aprovado)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(lider.ultima_solicitacao)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Estatísticas por Município */}
      <div className="bg-white rounded-lg shadow mb-8">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">Estatísticas por Município</h2>
            <button
              onClick={() => exportToCSV(statsPorMunicipio, 'estatisticas_por_municipio')}
              className="flex items-center px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
            >
              <Download size={14} className="mr-1" />
              Exportar
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Município</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Líderes</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Solicitações</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aprovadas</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Valor Solicitado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Valor Aprovado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Valor Médio</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {statsPorMunicipio.map((municipio, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {municipio.municipio_solicitante}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {municipio.total_lideres}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {municipio.total_solicitacoes}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {municipio.solicitacoes_aprovadas}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(municipio.valor_total_solicitado)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(municipio.valor_total_aprovado)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(municipio.valor_medio_por_solicitacao)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Estatísticas por Material */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">Estatísticas por Material</h2>
            <button
              onClick={() => exportToCSV(statsPorMaterial, 'estatisticas_por_material')}
              className="flex items-center px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
            >
              <Download size={14} className="mr-1" />
              Exportar
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Material</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Solicitações</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Qtd. Solicitada</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Qtd. Aprovada</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Valor Solicitado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Valor Aprovado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Valor Médio Unit.</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {statsPorMaterial.map((material, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {material.material_solicitado}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {material.total_solicitacoes}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {material.quantidade_total_solicitada}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {material.quantidade_aprovada}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(material.valor_total_solicitado)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(material.valor_total_aprovado)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(material.valor_medio_unitario)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
