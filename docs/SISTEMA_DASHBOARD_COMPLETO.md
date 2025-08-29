# Sistema de Dashboard Administrativo Completo

## Visão Geral

O sistema de dashboard administrativo fornece controle completo em tempo real sobre materiais de campanha, solicitações e entregas, com estatísticas detalhadas por líder e município.

## Funcionalidades Principais

### 🤖 **Bot WhatsApp**
- **Apenas registra solicitações** das lideranças
- **Não fornece informações** sobre estoque ou preços
- **Resposta automática**: "Solicitação registrada com sucesso! Sua solicitação de material foi enviada para o administrativo. Em breve entraremos em contato para confirmar a disponibilidade."

### 📊 **Dashboard Administrativo**
- **Controle total** de solicitações e aprovações
- **Estatísticas em tempo real** por líder e município
- **Gestão de valores** e custos
- **Relatórios exportáveis** em CSV

## Estrutura do Sistema

### 📋 **Tabelas do Banco de Dados**

#### 1. `solicitacoes_materiais`
```sql
- id (PRIMARY KEY)
- phone_number (TEXT)
- nome_solicitante (TEXT)
- municipio_solicitante (TEXT)
- material_solicitado (TEXT)
- quantidade (INTEGER)
- valor_unitario (REAL)
- valor_total (REAL)
- observacoes (TEXT)
- status (TEXT) -- 'pendente', 'aprovada', 'rejeitada'
- resposta_administrativo (TEXT)
- data_entrega (DATE)
- created_at (DATETIME)
- updated_at (DATETIME)
```

#### 2. `entregas_materiais`
```sql
- id (PRIMARY KEY)
- solicitacao_id (FOREIGN KEY)
- phone_number (TEXT)
- nome_solicitante (TEXT)
- municipio_solicitante (TEXT)
- material_entregue (TEXT)
- quantidade_entregue (INTEGER)
- valor_unitario (REAL)
- valor_total_entregue (REAL)
- data_entrega (DATE)
- responsavel_entrega (TEXT)
- observacoes_entrega (TEXT)
- created_at (DATETIME)
```

#### 3. `materiais`
```sql
- id (PRIMARY KEY)
- nome (TEXT)
- categoria (TEXT)
- descricao (TEXT)
- estoque_atual (INTEGER)
- estoque_minimo (INTEGER)
- custo_unitario (REAL)
- fornecedor (TEXT)
- observacoes (TEXT)
- created_at (DATETIME)
- updated_at (DATETIME)
```

## Fluxo de Funcionamento

### 1. **Solicitação da Liderança**
```
Líder → Bot WhatsApp → "Preciso de 50 bandeiras"
Bot → Registra solicitação → "Solicitação registrada com sucesso!"
```

### 2. **Gestão Administrativa**
```
Administrativo → Dashboard → Visualiza solicitação
Administrativo → Aprova/Rejeita → Define valores
Administrativo → Registra entrega → Atualiza estatísticas
```

### 3. **Controle de Valores**
- **Valor unitário**: Custo por unidade do material
- **Valor total**: Quantidade × Valor unitário
- **Valor aprovado**: Soma dos valores das solicitações aprovadas
- **Valor entregue**: Soma dos valores das entregas realizadas

## Dashboard Administrativo

### 📈 **Cards de Estatísticas Gerais**
- **Total de Solicitações**: Número total de solicitações recebidas
- **Valor Total Solicitado**: Soma de todos os valores solicitados
- **Total de Entregas**: Número de entregas realizadas
- **Valor Total Entregue**: Soma de todos os valores entregues

### 👥 **Estatísticas por Líder**
- Nome do líder e município
- Total de solicitações
- Solicitações aprovadas/rejeitadas/pendentes
- Valor total solicitado e aprovado
- Data da última solicitação

### 🏙️ **Estatísticas por Município**
- Nome do município
- Número de líderes ativos
- Total de solicitações
- Valor total solicitado e aprovado
- Valor médio por solicitação

### 📦 **Estatísticas por Material**
- Nome do material
- Total de solicitações
- Quantidade total solicitada e aprovada
- Valor total solicitado e aprovado
- Valor médio unitário

## APIs Disponíveis

### **Solicitações**
- `GET /api/solicitacoes` - Listar todas as solicitações
- `POST /api/solicitacoes` - Criar nova solicitação
- `PUT /api/solicitacoes/[id]` - Atualizar solicitação
- `GET /api/solicitacoes/stats` - Estatísticas gerais
- `GET /api/solicitacoes/stats/lideres` - Estatísticas por líder
- `GET /api/solicitacoes/stats/municipios` - Estatísticas por município
- `GET /api/solicitacoes/stats/materiais` - Estatísticas por material

### **Entregas**
- `GET /api/entregas` - Listar todas as entregas
- `POST /api/entregas` - Registrar nova entrega
- `GET /api/entregas/stats` - Estatísticas de entregas

### **Materiais**
- `GET /api/materiais` - Listar todos os materiais
- `POST /api/materiais` - Adicionar material
- `PUT /api/materiais/[id]` - Atualizar material
- `DELETE /api/materiais/[id]` - Remover material
- `GET /api/materiais/stats` - Estatísticas de materiais

## Páginas Administrativas

### 1. **Dashboard** (`/admin/dashboard`)
- Visão geral com estatísticas em tempo real
- Filtros por período e município
- Exportação de relatórios em CSV

### 2. **Solicitações** (`/admin/solicitacoes`)
- Lista todas as solicitações
- Aprovação/rejeição com resposta personalizada
- Definição de valores e datas de entrega

### 3. **Materiais** (`/admin/materiais`)
- Gestão de estoque
- Cadastro de novos materiais
- Controle de custos e fornecedores

## Funcionalidades de Exportação

### 📊 **Relatórios CSV**
- **Estatísticas por Líder**: Dados completos de cada líder
- **Estatísticas por Município**: Resumo por município
- **Estatísticas por Material**: Análise por tipo de material

### 📈 **Filtros Disponíveis**
- **Período**: 7, 30, 90 dias ou 1 ano
- **Município**: Filtro específico por município
- **Status**: Pendente, aprovada, rejeitada

## Exemplo de Uso

### **Cenário 1: Líder solicita materiais**
```
1. João Silva (São Paulo) envia: "Preciso de 50 bandeiras"
2. Bot registra: Solicitação #123 - João Silva - 50 bandeiras
3. Administrativo vê no dashboard
4. Administrativo aprova: "Aprovado! R$ 15,00 cada = R$ 750,00"
5. Entrega é registrada: "Entregue em 15/01/2024"
```

### **Cenário 2: Relatório mensal**
```
1. Administrativo acessa dashboard
2. Filtra por "Últimos 30 dias"
3. Exporta relatório CSV
4. Analisa: "São Paulo lidera com R$ 2.500 em solicitações"
```

## Benefícios do Sistema

### 🎯 **Para o Administrativo**
- **Controle total** de solicitações e aprovações
- **Visibilidade completa** de custos e valores
- **Relatórios detalhados** para tomada de decisão
- **Rastreabilidade** de todas as operações

### 🤖 **Para o Bot**
- **Simplicidade** na interação com lideranças
- **Foco** apenas no registro de solicitações
- **Sem responsabilidade** sobre estoque ou preços

### 👥 **Para as Lideranças**
- **Facilidade** na solicitação via WhatsApp
- **Confirmação imediata** do registro
- **Acompanhamento** via contato administrativo

## Tecnologias Utilizadas

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS
- **Backend**: Node.js, SQLite (better-sqlite3)
- **Bot**: whatsapp-web.js
- **APIs**: RESTful com Next.js API Routes
- **Banco**: SQLite com estrutura relacional completa

## Segurança e Controle

- **Acesso restrito** apenas ao administrativo
- **Logs completos** de todas as operações
- **Validação** de dados em todas as APIs
- **Backup automático** do banco SQLite

## Próximos Passos

1. **Implementar autenticação** para o dashboard
2. **Adicionar notificações** por email/SMS
3. **Criar relatórios gráficos** com charts
4. **Implementar backup automático** na nuvem
5. **Adicionar filtros avançados** por período personalizado
