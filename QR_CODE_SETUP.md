# 🚀 Sistema de QR Code WhatsApp - Configuração e Uso

## 📋 Visão Geral

Este sistema permite que o bot WhatsApp seja controlado através da interface web, incluindo a exibição do QR code para conexão em tempo real.

## 🔧 Componentes do Sistema

### 1. **Sistema de Status Compartilhado** (`src/lib/bot-status.js`)
- Gerencia o status do bot através de um arquivo JSON compartilhado
- Permite comunicação entre o bot e a interface web
- Funções para atualizar status, QR code, conexão, etc.

### 2. **APIs de Controle** (`src/app/api/bot/`)
- **`/api/bot/status`**: Controla início/parada do bot
- **`/api/bot/qr-real`**: Gera QR code real a partir dos dados do bot
- **`/api/bot/qr-capture`**: Captura QR code do console (legado)

### 3. **Interface Web** (`src/app/admin/connect/page.tsx`)
- Página para conectar o bot WhatsApp
- Exibe QR code em tempo real
- Controles para iniciar/parar/resetar bot
- Logs em tempo real

### 4. **Bot WhatsApp** (`bot/index.js`)
- Implementado com `whatsapp-web.js`
- Atualiza status compartilhado automaticamente
- Emite QR codes para a interface web

## 🚀 Como Usar

### 1. **Iniciar o Sistema**

```bash
# Desenvolvimento (Next.js + Bot)
npm run dev

# Apenas o bot
npm run dev:bot

# Apenas a interface web
npm run dev:next
```

### 2. **Conectar o Bot**

1. Acesse `http://localhost:3003/admin/connect`
2. Clique em **"Iniciar Bot"**
3. Aguarde o QR code aparecer
4. Escaneie com seu WhatsApp
5. Bot conectará automaticamente

### 3. **Controles Disponíveis**

- **Iniciar Bot**: Inicia o processo do bot
- **Parar Bot**: Para o bot em execução
- **Resetar Status**: Limpa o status e QR code
- **Monitoramento**: Status em tempo real

## 🔍 Como Funciona

### Fluxo de Conexão:

```
1. Usuário clica "Iniciar Bot"
   ↓
2. API inicia processo do bot
   ↓
3. Bot whatsapp-web.js inicia
   ↓
4. Bot emite evento 'qr' com dados
   ↓
5. Sistema atualiza arquivo de status
   ↓
6. Interface web lê status e solicita QR code
   ↓
7. API gera QR code real com biblioteca qrcode
   ↓
8. Interface exibe QR code para escaneamento
   ↓
9. Usuário escaneia com WhatsApp
   ↓
10. Bot conecta e atualiza status
```

### Comunicação em Tempo Real:

- **Arquivo Compartilhado**: `bot-status.json`
- **Polling**: Interface verifica status a cada 5 segundos
- **APIs**: Comunicação via HTTP entre componentes

## 🛠️ Solução de Problemas

### QR Code Não Aparece:

1. Verifique se o bot está rodando: `npm run dev:bot`
2. Verifique logs do console
3. Use botão "Resetar Status"
4. Verifique arquivo `bot-status.json`

### Bot Não Conecta:

1. Verifique se o WhatsApp está funcionando
2. Tente desconectar e reconectar
3. Verifique logs de erro
4. Delete pasta `.wwebjs_auth` para nova sessão

### Erros de API:

1. Verifique se Next.js está rodando
2. Verifique logs do servidor
3. Verifique permissões de arquivo
4. Reinicie o servidor

## 📁 Estrutura de Arquivos

```
src/
├── lib/
│   └── bot-status.js          # Sistema de status compartilhado
├── app/
│   └── api/
│       └── bot/
│           ├── status/        # Controle do bot
│           ├── qr-real/       # QR code real
│           └── qr-capture/    # Captura QR (legado)
└── admin/
    └── connect/
        └── page.tsx           # Interface de conexão

bot/
├── index.js                   # Bot WhatsApp principal
└── config.json               # Configurações do bot

scripts/
└── start-bot.js              # Script de início controlado
```

## 🔒 Segurança

- **Arquivo de Status**: Apenas leitura/escrita local
- **APIs**: Sem autenticação (apenas localhost)
- **Sessões**: Armazenadas localmente em `.wwebjs_auth`
- **Processos**: Isolados e controlados

## 📱 Recursos do Bot

- ✅ Conexão automática via QR code
- ✅ Suporte a usuários VIP
- ✅ Base de conhecimento
- ✅ Logs de conversa
- ✅ Respostas automáticas
- ✅ Reconexão automática

## 🚀 Próximos Passos

1. **WebSocket**: Implementar comunicação real-time
2. **Autenticação**: Adicionar login para interface admin
3. **Múltiplos Bots**: Suporte a vários números
4. **Notificações**: Alertas de status via email/SMS
5. **Backup**: Sistema de backup de sessões

## 💡 Dicas

- Use `npm run dev` para desenvolvimento completo
- Monitore logs em tempo real na interface
- Use botão reset se algo der errado
- Mantenha WhatsApp atualizado no celular
- Verifique conexão com internet
