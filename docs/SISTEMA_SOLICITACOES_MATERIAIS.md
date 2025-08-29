# Sistema de Solicitações de Materiais

## Visão Geral

O sistema de solicitações de materiais permite que as lideranças solicitem materiais de campanha através do bot WhatsApp, enquanto o administrativo gerencia essas solicitações através de uma interface web.

## Fluxo de Funcionamento

### 1. Solicitação da Liderança (via Bot)

Quando uma liderança envia uma mensagem ao bot solicitando materiais, o sistema:

1. **Detecta a solicitação** através de palavras-chave como:
   - "material", "materiais"
   - "bandeira", "bandeiras"
   - "santinho", "santinhos"
   - "adesivo", "adesivos"
   - "camiseta", "camisetas"
   - "boné", "bonés"
   - "panfleto", "panfletos"
   - "preciso", "quero", "solicito", "solicitação"

2. **Registra a solicitação** no banco de dados com:
   - Número do telefone da liderança
   - Nome do solicitante (se for VIP)
   - Material solicitado (texto completo da mensagem)
   - Quantidade (padrão: 1)
   - Status: "pendente"
   - Data/hora da solicitação

3. **Responde à liderança** com uma mensagem confirmando que a solicitação foi registrada e será analisada pelo administrativo.

### 2. Gestão pelo Administrativo (via Interface Web)

O administrativo acessa a página `/admin/solicitacoes` para:

1. **Visualizar todas as solicitações** com:
   - Nome e telefone do solicitante
   - Material solicitado
   - Status atual (pendente, aprovada, rejeitada)
   - Data da solicitação
   - Materiais similares disponíveis no estoque

2. **Responder às solicitações** através de um modal que permite:
   - Visualizar detalhes completos da solicitação
   - Digitar uma resposta personalizada
   - Aprovar ou rejeitar a solicitação

3. **Acompanhar estatísticas** como:
   - Total de solicitações
   - Solicitações pendentes
   - Solicitações aprovadas
   - Solicitações rejeitadas

## Estrutura do Banco de Dados

### Tabela: `solicitacoes_materiais`

```sql
CREATE TABLE solicitacoes_materiais (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  phone_number TEXT NOT NULL,
  nome_solicitante TEXT,
  material_solicitado TEXT NOT NULL,
  quantidade INTEGER DEFAULT 1,
  observacoes TEXT,
  status TEXT DEFAULT 'pendente',
  resposta_administrativo TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## APIs Disponíveis

### GET `/api/solicitacoes`
Lista todas as solicitações ordenadas por data de criação.

### PUT `/api/solicitacoes/[id]`
Atualiza o status e resposta de uma solicitação específica.

### GET `/api/solicitacoes/stats`
Retorna estatísticas das solicitações.

## Serviços

### `solicitacoesService`

- `add(solicitacaoData)`: Adiciona nova solicitação
- `getAll()`: Lista todas as solicitações
- `getById(id)`: Busca solicitação por ID
- `getByStatus(status)`: Lista solicitações por status
- `updateStatus(id, status, resposta)`: Atualiza status e resposta
- `getStats()`: Retorna estatísticas

## Interface do Administrativo

### Página: `/admin/solicitacoes`

**Funcionalidades:**
- Dashboard com estatísticas em tempo real
- Lista de todas as solicitações com filtros visuais
- Modal para responder solicitações pendentes
- Identificação automática de materiais similares no estoque
- Histórico de respostas do administrativo

**Status das Solicitações:**
- 🟠 **Pendente**: Aguardando resposta do administrativo
- 🟢 **Aprovada**: Solicitação aprovada com resposta
- 🔴 **Rejeitada**: Solicitação rejeitada com justificativa

## Exemplos de Uso

### Solicitação via Bot

**Líder:** "Preciso de 50 bandeiras para o evento de domingo"

**Bot:** "Solicitação registrada com sucesso! Sua solicitação de material foi enviada para o administrativo. Em breve entraremos em contato para confirmar a disponibilidade."

### Resposta do Administrativo

**Aprovação:** "Solicitação aprovada! Temos 50 bandeiras disponíveis. Entraremos em contato para combinar a entrega."

**Rejeição:** "Infelizmente não temos bandeiras suficientes no momento. Tentaremos repor o estoque em breve."

## Vantagens do Sistema

1. **Controle Total**: O administrativo tem controle completo sobre aprovações
2. **Rastreabilidade**: Todas as solicitações ficam registradas
3. **Eficiência**: Interface intuitiva para gestão
4. **Transparência**: Histórico completo de solicitações e respostas
5. **Flexibilidade**: Respostas personalizadas para cada situação
6. **Integração**: Funciona perfeitamente com o sistema de materiais existente

## Próximos Passos

- Implementar notificações automáticas para novas solicitações
- Adicionar sistema de prioridades para solicitações
- Integrar com sistema de entrega/logística
- Implementar relatórios detalhados de solicitações
