'use client';

import { useState } from 'react';

interface TestMessage {
  phoneNumber: string;
  message: string;
  response: string;
  isVip: boolean;
  timestamp: string;
}

export default function TestPage() {
  const [phoneNumber, setPhoneNumber] = useState('+5586998585008');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<TestMessage[]>([]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim()) return;

    try {
      setLoading(true);
      
      const response = await fetch('/api/bot/simple', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber,
          message: message.trim()
        }),
      });

      if (response.ok) {
        const data = await response.json();
        
        const newMessage: TestMessage = {
          phoneNumber,
          message: message.trim(),
          response: data.response,
          isVip: data.isVip,
          timestamp: new Date().toLocaleString('pt-BR')
        };

        setMessages(prev => [newMessage, ...prev]);
        setMessage('');
      } else {
        alert('Erro ao enviar mensagem');
      }
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao enviar mensagem');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Teste do Bot WhatsApp
        </h1>
        <p className="text-gray-600">
          Simule mensagens e veja as respostas do bot
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Formulário de Teste */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Enviar Mensagem
          </h2>
          
          <form onSubmit={handleSendMessage} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Número de Telefone
              </label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 bg-white"
                placeholder="+5586999999999"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mensagem
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 bg-white"
                rows={3}
                placeholder="Digite sua mensagem..."
              />
            </div>
            
            <button
              type="submit"
              disabled={loading || !message.trim()}
              className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Enviando...' : 'Enviar Mensagem'}
            </button>
          </form>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-medium text-blue-900 mb-2">Sugestões de Teste:</h3>
            <div className="space-y-2">
              <button
                onClick={() => setMessage('oi')}
                className="block w-full text-left px-3 py-2 bg-blue-100 hover:bg-blue-200 rounded text-sm"
              >
                "oi" - Saudação
              </button>
              <button
                onClick={() => setMessage('menu')}
                className="block w-full text-left px-3 py-2 bg-blue-100 hover:bg-blue-200 rounded text-sm"
              >
                "menu" - Menu de opções
              </button>
              <button
                onClick={() => setMessage('projetos do deputado')}
                className="block w-full text-left px-3 py-2 bg-blue-100 hover:bg-blue-200 rounded text-sm"
              >
                "projetos do deputado" - Busca na base de conhecimento
              </button>
              <button
                onClick={() => setMessage('tchau')}
                className="block w-full text-left px-3 py-2 bg-blue-100 hover:bg-blue-200 rounded text-sm"
              >
                "tchau" - Despedida
              </button>
            </div>
          </div>
        </div>

        {/* Histórico de Mensagens */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Histórico de Conversas
          </h2>
          
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {messages.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                Nenhuma mensagem enviada ainda.
              </p>
            ) : (
              messages.map((msg, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900">
                      {msg.phoneNumber}
                    </span>
                    <span className={`px-2 py-1 text-xs rounded ${
                      msg.isVip ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {msg.isVip ? 'VIP' : 'GERAL'}
                    </span>
                  </div>
                  
                  <div className="mb-2">
                    <p className="text-sm text-gray-600 mb-1">
                      <strong>Mensagem:</strong> {msg.message}
                    </p>
                    <p className="text-sm text-green-600">
                      <strong>Resposta:</strong> {msg.response}
                    </p>
                  </div>
                  
                  <p className="text-xs text-gray-400">
                    {msg.timestamp}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Botão Voltar */}
      <div className="mt-8">
        <button
          onClick={() => window.location.href = '/'}
          className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          Voltar ao Dashboard
        </button>
      </div>
    </div>
  );
}
