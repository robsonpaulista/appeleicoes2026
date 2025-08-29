'use client';

import { useState } from 'react';

export default function WebhookPage() {
  const [webhookUrl, setWebhookUrl] = useState('');
  const [verifyToken, setVerifyToken] = useState('bot_deputado_2024');
  const [status, setStatus] = useState('');

  const generateWebhookUrl = () => {
    const baseUrl = window.location.origin;
    const url = `${baseUrl}/api/webhook/whatsapp`;
    setWebhookUrl(url);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(webhookUrl);
      setStatus('URL copiada para a área de transferência!');
      setTimeout(() => setStatus(''), 3000);
    } catch (error) {
      setStatus('Erro ao copiar URL');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Configuração do Webhook WhatsApp
        </h1>
        <p className="text-gray-600">
          Configure o webhook para receber mensagens reais do WhatsApp
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Configuração do Webhook */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Configurações do Webhook
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                URL do Webhook
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={webhookUrl}
                  readOnly
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-900"
                  placeholder="Clique em 'Gerar URL' para criar"
                />
                <button
                  onClick={generateWebhookUrl}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Gerar URL
                </button>
                {webhookUrl && (
                  <button
                    onClick={copyToClipboard}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                  >
                    Copiar
                  </button>
                )}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Token de Verificação
              </label>
              <input
                type="text"
                value={verifyToken}
                onChange={(e) => setVerifyToken(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 bg-white"
                placeholder="Token para verificar o webhook"
              />
            </div>

            {status && (
              <div className="p-3 bg-green-100 text-green-800 rounded-md">
                {status}
              </div>
            )}
          </div>
        </div>

        {/* Instruções */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Como Configurar
          </h2>
          
          <div className="space-y-4 text-sm">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-medium text-blue-900 mb-2">1. WhatsApp Business API</h3>
              <p className="text-blue-800">
                Você precisa ter uma conta no WhatsApp Business API ou usar um provedor como:
              </p>
              <ul className="list-disc list-inside mt-2 text-blue-800">
                <li>Meta WhatsApp Business API</li>
                <li>Twilio WhatsApp</li>
                <li>MessageBird</li>
                <li>Outros provedores</li>
              </ul>
            </div>

            <div className="p-4 bg-yellow-50 rounded-lg">
              <h3 className="font-medium text-yellow-900 mb-2">2. Configurar Webhook</h3>
              <p className="text-yellow-800">
                No painel do seu provedor, configure:
              </p>
              <ul className="list-disc list-inside mt-2 text-yellow-800">
                <li><strong>URL:</strong> {webhookUrl || 'Sua URL do webhook'}</li>
                <li><strong>Token:</strong> {verifyToken}</li>
                <li><strong>Eventos:</strong> messages, message_status</li>
              </ul>
            </div>

            <div className="p-4 bg-green-50 rounded-lg">
              <h3 className="font-medium text-green-900 mb-2">3. Testar</h3>
              <p className="text-green-800">
                Após configurar, envie uma mensagem para o número do bot e verifique os logs no terminal.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Informações Técnicas */}
      <div className="mt-8 bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Informações Técnicas
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Endpoints Disponíveis</h3>
            <div className="space-y-2 text-sm">
              <div className="p-2 bg-gray-50 rounded">
                <strong>GET</strong> /api/webhook/whatsapp - Verificação do webhook
              </div>
              <div className="p-2 bg-gray-50 rounded">
                <strong>POST</strong> /api/webhook/whatsapp - Receber mensagens
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Variáveis de Ambiente</h3>
            <div className="space-y-2 text-sm">
              <div className="p-2 bg-gray-50 rounded">
                <code>WHATSAPP_VERIFY_TOKEN</code> - Token de verificação
              </div>
              <div className="p-2 bg-gray-50 rounded">
                <code>WHATSAPP_ACCESS_TOKEN</code> - Token de acesso (futuro)
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
          Testar Simulação
        </button>
      </div>
    </div>
  );
}
