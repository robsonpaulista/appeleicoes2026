'use client';

import { useState, useEffect, useRef } from 'react';

interface BotStatus {
  status: 'disconnected' | 'connecting' | 'connected' | 'error';
  message: string;
  qrCode?: string;
  qrData?: string;
}

export default function ConnectPage() {
  const [botStatus, setBotStatus] = useState<BotStatus>({
    status: 'disconnected',
    message: 'Bot não conectado'
  });
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [isPolling, setIsPolling] = useState(false);
  const qrCodeRef = useRef<HTMLDivElement>(null);

  // Função para adicionar logs
  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString('pt-BR');
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
  };

  // Função para verificar status do bot
  const checkBotStatus = async () => {
    try {
      const response = await fetch('/api/bot/status');
      if (response.ok) {
        const status = await response.json();
        setBotStatus(prev => ({
          ...prev,
          status: status.status,
          message: status.message
        }));
      }
    } catch (error) {
      console.error('Erro ao verificar status:', error);
    }
  };

  // Função para obter QR code real
  const getRealQRCode = async () => {
    try {
      addLog('🔍 Solicitando QR Code real do bot...');
      
      const response = await fetch('/api/bot/qr-real');
      if (response.ok) {
        const data = await response.json();
        
        if (data.success && data.qrCode) {
          setBotStatus(prev => ({
            ...prev,
            status: 'connecting',
            message: 'QR Code disponível! Escaneie com seu WhatsApp',
            qrCode: data.qrCode,
            qrData: data.qrData
          }));
          
          addLog('✅ QR Code real obtido com sucesso!');
          addLog(`📱 Dados do QR: ${data.qrData?.substring(0, 30)}...`);
          
          // Exibir QR code
          displayQRCode(data.qrCode);
        }
      } else {
        throw new Error('Falha ao obter QR Code');
      }
    } catch (error) {
      console.error('Erro ao obter QR Code real:', error);
      addLog('❌ Erro ao obter QR Code real');
      setBotStatus(prev => ({
        ...prev,
        status: 'error',
        message: 'Erro ao obter QR Code'
      }));
    }
  };

  // Função para exibir QR code
  const displayQRCode = (qrCodeUrl: string) => {
    if (qrCodeRef.current) {
      qrCodeRef.current.innerHTML = `
        <img src="${qrCodeUrl}" alt="QR Code WhatsApp" 
             class="w-64 h-64 border-2 border-gray-300 rounded-lg" />
      `;
    }
  };

  // Função para iniciar bot
  const startBot = async () => {
    try {
      setLoading(true);
      addLog('🚀 Iniciando bot WhatsApp...');
      
      setBotStatus({
        status: 'connecting',
        message: 'Iniciando bot...'
      });

      // Iniciar bot via API
      const response = await fetch('/api/bot/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'start' })
      });

      if (response.ok) {
        const data = await response.json();
        addLog(`✅ ${data.message}`);
        
        // Gerar QR code imediatamente para teste
        addLog('📱 Gerando QR Code de teste...');
        getRealQRCode();
        
        // Iniciar polling para verificar status
        startStatusPolling();
      } else {
        throw new Error('Falha ao iniciar bot');
      }

    } catch (error) {
      console.error('Erro ao iniciar bot:', error);
      addLog('❌ Erro ao iniciar bot');
      setBotStatus({
        status: 'error',
        message: 'Erro ao iniciar bot'
      });
    } finally {
      setLoading(false);
    }
  };

  // Função para parar bot
  const stopBot = async () => {
    try {
      addLog('🛑 Parando bot WhatsApp...');
      
      const response = await fetch('/api/bot/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'stop' })
      });

      if (response.ok) {
        const data = await response.json();
        addLog(`✅ ${data.message}`);
        
        setBotStatus({
          status: 'disconnected',
          message: 'Bot parado'
        });
        
        // Parar polling
        stopStatusPolling();
        
        // Limpar QR code
        if (qrCodeRef.current) {
          qrCodeRef.current.innerHTML = '';
        }
      }
    } catch (error) {
      console.error('Erro ao parar bot:', error);
      addLog('❌ Erro ao parar bot');
    }
  };

  // Função para iniciar polling de status
  const startStatusPolling = () => {
    setIsPolling(true);
    addLog('🔄 Iniciando monitoramento de status...');
  };

  // Função para parar polling de status
  const stopStatusPolling = () => {
    setIsPolling(false);
    addLog('⏹️ Monitoramento de status parado');
  };

  // Polling de status
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isPolling) {
      interval = setInterval(() => {
        checkBotStatus();
      }, 5000); // Verificar a cada 5 segundos
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isPolling]);

  // Carregar status inicial
  useEffect(() => {
    checkBotStatus();
    addLog('🤖 Sistema de conexão WhatsApp iniciado');
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'bg-green-500';
      case 'connecting': return 'bg-yellow-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'connected': return 'Conectado';
      case 'connecting': return 'Conectando...';
      case 'error': return 'Erro';
      default: return 'Desconectado';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Conectar Bot WhatsApp
        </h1>
        <p className="text-gray-600">
          Escaneie o QR Code para conectar o bot ao WhatsApp
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Status e Controles */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Status do Bot
          </h2>
          
          <div className="space-y-4">
            {/* Status */}
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${getStatusColor(botStatus.status)}`}></div>
              <span className="font-medium">{getStatusText(botStatus.status)}</span>
            </div>
            
            {/* Mensagem */}
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-700">{botStatus.message}</p>
            </div>

            {/* Botões de Ação */}
            <div className="flex gap-2">
              <button
                onClick={startBot}
                disabled={loading || botStatus.status === 'connected'}
                className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Iniciando...' : 'Iniciar Bot'}
              </button>

              {botStatus.status === 'connecting' && (
                <button
                  onClick={stopBot}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Parar Bot
                </button>
              )}
            </div>

            {/* Botão de Reset */}
            <button
              onClick={async () => {
                try {
                  addLog('🔄 Resetando status do bot...');
                  
                  const response = await fetch('/api/bot/status', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: 'reset' })
                  });

                  if (response.ok) {
                    const data = await response.json();
                    addLog(`✅ ${data.message}`);
                    
                    // Recarregar status
                    checkBotStatus();
                    
                    // Limpar QR code
                    if (qrCodeRef.current) {
                      qrCodeRef.current.innerHTML = '';
                    }
                  } else {
                    throw new Error('Falha ao resetar status');
                  }
                } catch (error) {
                  console.error('Erro ao resetar status:', error);
                  addLog('❌ Erro ao resetar status');
                }
              }}
              className="w-full px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Resetar Status
            </button>

            {/* Instruções */}
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-medium text-blue-900 mb-2">Como Conectar:</h3>
              <ol className="list-decimal list-inside text-sm text-blue-800 space-y-1">
                <li>Clique em "Iniciar Bot"</li>
                <li>Aguarde o QR Code aparecer</li>
                <li>Abra o WhatsApp no seu celular</li>
                <li>Vá em Configurações → WhatsApp Web</li>
                <li>Escaneie o QR Code</li>
                <li>Bot conectará automaticamente</li>
              </ol>
            </div>
          </div>
        </div>

        {/* QR Code */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            QR Code
          </h2>
          
          <div className="flex flex-col items-center">
            {botStatus.qrCode ? (
              <div ref={qrCodeRef} className="w-64 h-64 flex items-center justify-center">
                {/* QR Code será exibido aqui */}
              </div>
            ) : (
              <div className="w-64 h-64 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <div className="text-4xl mb-2">⏳</div>
                  <p className="text-sm text-gray-600">Aguardando QR Code</p>
                  <p className="text-xs text-gray-500 mt-1">Clique em "Iniciar Bot"</p>
                </div>
              </div>
            )}
            
            {botStatus.qrCode && (
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-600 mb-2">
                  Escaneie este QR Code com seu WhatsApp
                </p>
                <div className="text-xs text-gray-500">
                  Status: {botStatus.status === 'connecting' ? 'Aguardando conexão...' : 'Conectado!'}
                </div>
                {botStatus.qrData && (
                  <div className="text-xs text-gray-400 mt-1">
                    Dados: {botStatus.qrData.substring(0, 30)}...
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Logs do Bot */}
      <div className="mt-8 bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Logs do Bot
        </h2>
        
        <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm h-64 overflow-y-auto">
          {logs.length === 0 ? (
            <div className="text-gray-500">Nenhum log disponível</div>
          ) : (
            logs.map((log, index) => (
              <div key={index} className="mb-1">
                {log}
              </div>
            ))
          )}
        </div>
        
        <div className="mt-4 text-sm text-gray-600">
          <p>💡 Dica: Os logs mostram o status em tempo real do bot</p>
          <p>🔄 Status: {isPolling ? 'Monitorando' : 'Parado'}</p>
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
