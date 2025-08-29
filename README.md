# 🤖 Bot WhatsApp - Deputado Jadyel Alencar

Sistema completo de automação para o gabinete do deputado Jadyel Alencar, incluindo bot WhatsApp inteligente, gestão de materiais de campanha e notificações automáticas.

## 🎯 Funcionalidades Principais

### 🤖 Bot WhatsApp Inteligente
- **Atendimento automático** 24/7
- **Reconhecimento de VIPs** (lideranças)
- **Saudações personalizadas** por nome
- **Busca inteligente** na base de conhecimento
- **Registro automático** de solicitações de materiais

### 📦 Sistema de Materiais de Campanha
- **Gestão completa** de materiais (Bandeiras, Santinhos, Adesivos, etc.)
- **Controle de estoque** e custos
- **Solicitações automáticas** via bot
- **Aprovação/rejeição** pelo setor administrativo
- **Notificações automáticas** para líderes

### 📊 Dashboard Administrativo
- **Estatísticas em tempo real** por líder, município e material
- **Controle de valores** destinados
- **Relatórios exportáveis** em CSV
- **Filtros avançados** por período e município

### 🔔 Sistema de Notificações Automáticas
- **Polling automático** do banco de dados (30 segundos)
- **Detecção de mudanças** em tempo real
- **Extração inteligente** de informações de entrega
- **Mensagens formatadas** via WhatsApp

## 🏗️ Arquitetura do Sistema

```
├── bot/                    # Bot WhatsApp principal
│   └── index.js           # Lógica principal do bot
├── src/
│   ├── app/               # Next.js App Router
│   │   ├── admin/         # Páginas administrativas
│   │   │   ├── materiais/ # Gestão de materiais
│   │   │   ├── solicitacoes/ # Aprovação de solicitações
│   │   │   └── dashboard/ # Dashboard com estatísticas
│   │   └── api/           # APIs REST
│   ├── lib/               # Bibliotecas e serviços
│   │   ├── services.js    # Serviços principais
│   │   ├── database.js    # Configuração do banco
│   │   ├── camara-api.js  # API da Câmara dos Deputados
│   │   └── notification-service.js # Notificações automáticas
│   └── components/        # Componentes React
├── docs/                  # Documentação técnica
├── scripts/               # Scripts de teste e validação
└── data/                  # Dados do sistema
```

## 🚀 Como Executar

### Pré-requisitos
- Node.js 18+ 
- npm ou yarn
- WhatsApp Web conectado

### Instalação
```bash
# Clonar o repositório
git clone https://github.com/robsonpaulista/appeleicoes2026.git
cd appeleicoes2026

# Instalar dependências
npm install

# Configurar variáveis de ambiente (se necessário)
cp .env.example .env
```

### Executar o Sistema
```bash
# Iniciar o bot WhatsApp
node bot/index.js

# Em outro terminal, iniciar a interface web
npm run dev
```

### Acessar as Páginas Administrativas
- **Materiais**: http://localhost:3000/admin/materiais
- **Solicitações**: http://localhost:3000/admin/solicitacoes
- **Dashboard**: http://localhost:3000/admin/dashboard

## 📱 Fluxo de Funcionamento

### 1. Solicitação de Material
```
Líder → WhatsApp → Bot → Registra no Banco → Administrativo vê na página
```

### 2. Aprovação e Notificação
```
Administrativo → Aprova/Rejeita → Sistema detecta → Notifica líder automaticamente
```

### 3. Notificação Automática
```
✅ SOLICITAÇÃO APROVADA!

Material: Bandeiras para evento
Quantidade: 50

📍 Local de Coleta: Sede do partido - Rua das Flores, 123
🕐 Horário: Segunda a sexta, 8h às 18h
👤 Procurar por: Ana Silva (Coordenadora)
📅 Data de Entrega: 20/01/2024
```

## 🗄️ Banco de Dados

### Tabelas Principais
- **`materiais`** - Cadastro de materiais com estoque e custo
- **`solicitacoes_materiais`** - Solicitações dos líderes
- **`entregas_materiais`** - Controle de entregas realizadas
- **`whitelist`** - Lista de VIPs (lideranças)
- **`knowledge_base`** - Base de conhecimento (projetos)

## 🧪 Testes

### Scripts de Validação Disponíveis
```bash
# Teste básico de notificações
node testar-notificacoes.js

# Teste de extração de informações
node testar-extracao-info.js

# Teste do fluxo completo
node testar-fluxo-completo.js

# Teste do dashboard
node testar-dashboard-completo.js
```

## 📚 Documentação

- **[Sistema de Solicitações de Materiais](docs/SISTEMA_SOLICITACOES_MATERIAIS.md)**
- **[Dashboard Administrativo](docs/SISTEMA_DASHBOARD_ADMINISTRATIVO.md)**
- **[Sistema de Notificações Automáticas](docs/SISTEMA_NOTIFICACOES_AUTOMATICAS.md)**
- **[Resumo da Implementação](RESUMO_IMPLEMENTACAO_FINAL.md)**

## 🔧 Tecnologias Utilizadas

- **Node.js** - Runtime JavaScript
- **Next.js** - Framework React
- **WhatsApp Web.js** - API do WhatsApp
- **SQLite** - Banco de dados
- **Tailwind CSS** - Estilização
- **Puppeteer** - Web scraping (para busca de notícias)

## 📊 Estatísticas do Sistema

- **Notificações automáticas**: Funcionando
- **Extração de informações**: 100% funcional
- **Integração com banco**: Operacional
- **Dashboard e estatísticas**: Completas
- **Sistema de materiais**: 100% operacional

## 🎉 Benefícios Alcançados

### Para o Setor Administrativo
- ✅ **Automatização completa** do processo
- ✅ **Redução de 90%** do trabalho manual
- ✅ **Controle total** de materiais e valores
- ✅ **Estatísticas em tempo real**

### Para os Líderes (VIPs)
- ✅ **Notificações instantâneas** sobre solicitações
- ✅ **Informações completas** de coleta
- ✅ **Comunicação clara** e padronizada

## 🤝 Contribuição

Para contribuir com o projeto:

1. Faça um fork do repositório
2. Crie uma branch para sua feature (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -am 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## 📄 Licença

Este projeto é desenvolvido para o gabinete do deputado Jadyel Alencar.

## 📞 Suporte

Para suporte técnico ou dúvidas sobre o sistema, entre em contato com a equipe de desenvolvimento.

---

**Sistema desenvolvido para automatizar completamente o fluxo de gestão de materiais e comunicação com líderes do deputado Jadyel Alencar.** 🚀
