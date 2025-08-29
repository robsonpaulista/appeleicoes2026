'use client';

import { useState, useEffect } from 'react';

interface BotConfig {
  botPhoneNumber: string;
  botName: string;
  isActive: boolean;
  lastConnected: string;
}

export default function ConfigPage() {
  const [config, setConfig] = useState<BotConfig>({
    botPhoneNumber: '',
    botName: 'Bot Deputado',
    isActive: false,
    lastConnected: ''
  });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const response = await fetch('/api/config');
      if (response.ok) {
        const data = await response.json();
        setConfig(data);
      }
    } catch (error) {
      console.error('Erro ao carregar configuração:', error);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      });

      if (response.ok) {
        setStatus('Configurações salvas com sucesso!');
        setTimeout(() => setStatus(''), 3000);
      } else {
        setStatus('Erro ao salvar configurações');
      }
    } catch (error) {
      setStatus('Erro ao salvar configurações');
    } finally {
      setLoading(false);
    }
  };

  const handleStartBot = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/bot/start', {
        method: 'POST',
      });

      if (response.ok) {
        setStatus('Bot iniciado com sucesso!');
        await loadConfig();
      } else {
        setStatus('Erro ao iniciar bot');
      }
    } catch (error) {
      setStatus('Erro ao iniciar bot');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Configuração do Bot WhatsApp
        </h1>
        <p className="text-gray-600">
          Configure e gerencie o bot WhatsApp
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Configurações */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Configurações do Bot
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Número do Bot
              </label>
              <input
                type="tel"
                value={config.botPhoneNumber}
                onChange={(e) => setConfig({...config, botPhoneNumber: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 bg-white"
                placeholder="+5586999999999"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome do Bot
              </label>
              <input
                type="text"
                value={config.botName}
                onChange={(e) => setConfig({...config, botName: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 bg-white"
                placeholder="Nome do bot"
              />
            </div>
            
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={config.isActive}
                  onChange={(e) => setConfig({...config, isActive: e.target.checked})}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="ml-2 text-sm text-gray-700">Bot Ativo</span>
              </label>
            </div>

            {config.lastConnected && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Última Conexão
                </label>
                <p className="text-sm text-gray-600">{config.lastConnected}</p>
              </div>
            )}

            {status && (
              <div className="p-3 bg-green-100 text-green-800 rounded-md">
                {status}
              </div>
            )}

            <div className="flex gap-4">
              <button
                onClick={handleSave}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Salvando...' : 'Salvar Configurações'}
              </button>
              
              <button
                onClick={handleStartBot}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Iniciando...' : 'Iniciar Bot'}
              </button>
            </div>
          </div>
        </div>

        {/* Instruções */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Como Usar o Bot
          </h2>
          
          <div className="space-y-4 text-sm">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-medium text-blue-900 mb-2">1. Primeira Configuração</h3>
              <p className="text-blue-800">
                Na primeira execução, será necessário escanear o QR Code uma única vez:
              </p>
              <ul className="list-disc list-inside mt-2 text-blue-800">
                <li>Execute: <code>npm run start:bot</code></li>
                <li>Escaneie o QR Code no terminal</li>
                <li>A sessão será salva automaticamente</li>
              </ul>
            </div>

            <div className="p-4 bg-green-50 rounded-lg">
              <h3 className="font-medium text-green-900 mb-2">2. Execuções Seguintes</h3>
              <p className="text-green-800">
                Após a primeira configuração, o bot conecta automaticamente:
              </p>
              <ul className="list-disc list-inside mt-2 text-green-800">
                <li>Execute: <code>npm run start:bot</code></li>
                <li>Bot conecta sem QR Code</li>
                <li>Pronto para receber mensagens</li>
              </ul>
            </div>

            <div className="p-4 bg-yellow-50 rounded-lg">
              <h3 className="font-medium text-yellow-900 mb-2">3. Comandos do Bot</h3>
              <p className="text-yellow-800">
                O bot responde automaticamente a:
              </p>
              <ul className="list-disc list-inside mt-2 text-yellow-800">
                <li><strong>"oi", "olá"</strong> - Saudação</li>
                <li><strong>"menu"</strong> - Menu de opções</li>
                <li><strong>Perguntas</strong> - Busca na base de conhecimento</li>
                <li><strong>"tchau"</strong> - Despedida</li>
              </ul>
            </div>

            <div className="p-4 bg-purple-50 rounded-lg">
              <h3 className="font-medium text-purple-900 mb-2">4. Logs e Monitoramento</h3>
              <p className="text-purple-800">
                Acompanhe o funcionamento:
              </p>
              <ul className="list-disc list-inside mt-2 text-purple-800">
                <li>Logs no terminal</li>
                <li>Histórico em "Ver Logs de Conversa"</li>
                <li>Estatísticas no dashboard</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Comandos Úteis */}
      <div className="mt-8 bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Comandos Úteis
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Desenvolvimento</h3>
            <div className="space-y-2 text-sm">
              <div className="p-2 bg-gray-50 rounded">
                <code>npm run start:bot</code> - Iniciar bot (sem QR Code)
              </div>
              <div className="p-2 bg-gray-50 rounded">
                <code>npm run dev:bot</code> - Iniciar bot (com QR Code)
              </div>
              <div className="p-2 bg-gray-50 rounded">
                <code>npm run dev:next</code> - Interface web
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Gerenciamento</h3>
            <div className="space-y-2 text-sm">
              <div className="p-2 bg-gray-50 rounded">
                <code>Ctrl+C</code> - Parar bot
              </div>
              <div className="p-2 bg-gray-50 rounded">
                <code>rm -rf .wwebjs_auth</code> - Resetar sessão
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Botões de Ação */}
      <div className="mt-8 flex flex-wrap gap-4">
        <button
          onClick={() => window.location.href = '/'}
          className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          Voltar ao Dashboard
        </button>
        
        <button
          onClick={() => window.location.href = '/admin/test'}
          className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
        >
          Testar Bot
        </button>
      </div>
    </div>
  );
}
