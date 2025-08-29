# 📦 Sistema de Materiais de Campanha

## Visão Geral

O Sistema de Materiais de Campanha permite gerenciar o estoque de materiais utilizados nas campanhas políticas, incluindo bandeiras, santinhos, adesivos, camisetas, bonés, panfletos e outros itens. Este sistema integra-se ao bot WhatsApp para fornecer informações em tempo real sobre disponibilidade e estoque.

## 🎯 Funcionalidades Principais

### ✅ Gestão de Estoque
- **Controle de quantidade**: Estoque atual e mínimo
- **Alertas automáticos**: Notificação quando estoque está baixo
- **Valor total**: Cálculo do valor total do estoque
- **Histórico**: Registro de alterações no estoque

### ✅ Categorização
- **Categorias predefinidas**: BANDEIRAS, SANTINHOS, ADESIVOS, CAMISETAS, BONÉS, PANFLETOS, OUTROS
- **Busca por categoria**: Filtros específicos por tipo de material
- **Organização**: Interface organizada por categorias

### ✅ Informações Detalhadas
- **Dados completos**: Nome, descrição, categoria, estoque, custo
- **Fornecedor**: Registro do fornecedor de cada material
- **Observações**: Campo para informações adicionais
- **Timestamps**: Data de criação e última atualização

### ✅ Integração com Bot
- **Busca inteligente**: O bot responde a perguntas sobre materiais
- **Informações em tempo real**: Estoque atual sempre atualizado
- **Respostas personalizadas**: Diferentes formatos para diferentes tipos de consulta

## 🗄️ Estrutura do Banco de Dados

### Tabela: `materiais`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | INTEGER | Chave primária auto-incremento |
| `nome` | TEXT | Nome do material (obrigatório) |
| `categoria` | TEXT | Categoria do material (obrigatório) |
| `descricao` | TEXT | Descrição detalhada |
| `estoque_atual` | INTEGER | Quantidade atual em estoque |
| `estoque_minimo` | INTEGER | Quantidade mínima para alerta |
| `custo_unitario` | REAL | Custo por unidade |
| `fornecedor` | TEXT | Nome do fornecedor |
| `observacoes` | TEXT | Observações adicionais |
| `created_at` | DATETIME | Data de criação |
| `updated_at` | DATETIME | Data da última atualização |

## 🔧 Serviços Disponíveis

### `materiaisService`

#### Métodos Principais:

```javascript
// Buscar todos os materiais
await materiaisService.getAll()

// Buscar por ID
await materiaisService.getById(id)

// Adicionar novo material
await materiaisService.add(materialData)

// Atualizar material
await materiaisService.update(id, materialData)

// Excluir material
await materiaisService.delete(id)

// Atualizar estoque
await materiaisService.updateEstoque(id, quantidade)

// Buscar por categoria
await materiaisService.getByCategoria(categoria)

// Buscar materiais com estoque baixo
await materiaisService.getEstoqueBaixo()

// Buscar por termo
await materiaisService.search(query)

// Obter categorias disponíveis
await materiaisService.getCategorias()

// Obter estatísticas
await materiaisService.getStats()
```

## 🌐 APIs REST

### Endpoints Disponíveis:

#### `GET /api/materiais`
- **Descrição**: Lista todos os materiais
- **Resposta**: Array de objetos de materiais

#### `POST /api/materiais`
- **Descrição**: Cria um novo material
- **Body**: Objeto com dados do material
- **Resposta**: Material criado

#### `GET /api/materiais/[id]`
- **Descrição**: Busca material por ID
- **Resposta**: Objeto do material

#### `PUT /api/materiais/[id]`
- **Descrição**: Atualiza material existente
- **Body**: Objeto com dados atualizados
- **Resposta**: Material atualizado

#### `DELETE /api/materiais/[id]`
- **Descrição**: Exclui material
- **Resposta**: Confirmação de exclusão

#### `GET /api/materiais/stats`
- **Descrição**: Estatísticas gerais
- **Resposta**: Objeto com estatísticas

## 🤖 Integração com o Bot

### Detecção de Intenção

O bot detecta automaticamente perguntas sobre materiais através de palavras-chave:

- `material`, `materiais`
- `bandeira`, `bandeiras`
- `santinho`, `santinhos`
- `adesivo`, `adesivos`
- `camiseta`, `camisetas`
- `boné`, `bonés`
- `panfleto`, `panfletos`
- `estoque`

### Tipos de Resposta

#### 1. Material Específico
```
Material: Bandeira Jadyel Alencar
Categoria: BANDEIRAS
Estoque: 50 unidades
Custo: R$ 25.00
Fornecedor: Gráfica Central
```

#### 2. Múltiplos Materiais
```
Encontrei 3 materiais relacionados:

1. Bandeira Jadyel Alencar (BANDEIRAS) - Estoque: 50
2. Santinho Eleitoral (SANTINHOS) - Estoque: 2000
3. Adesivo Carro (ADESIVOS) - Estoque: 300

Para mais detalhes, especifique o material desejado.
```

#### 3. Sem Resultados
```
Não encontrei materiais específicos. Posso ajudar com informações sobre projetos, realizações ou bandeiras.
```

## 📱 Interface Administrativa

### Página: `/admin/materiais`

#### Funcionalidades da Interface:

- **Dashboard com estatísticas**: Total de materiais, categorias, valor total, estoque baixo
- **Tabela responsiva**: Lista todos os materiais com informações principais
- **Busca em tempo real**: Filtro por nome, categoria ou descrição
- **Modal de criação/edição**: Formulário completo para gerenciar materiais
- **Indicadores visuais**: Cores diferentes para status do estoque
- **Ações rápidas**: Editar e excluir materiais

#### Campos do Formulário:

- **Nome** (obrigatório): Nome do material
- **Categoria** (obrigatório): Seleção de categoria predefinida
- **Descrição**: Descrição detalhada
- **Estoque Atual**: Quantidade disponível
- **Estoque Mínimo**: Quantidade para alerta
- **Custo Unitário**: Preço por unidade
- **Fornecedor**: Nome do fornecedor
- **Observações**: Informações adicionais

## 📊 Estatísticas Disponíveis

### Métricas Principais:

- **Total de Materiais**: Número total de itens cadastrados
- **Total de Categorias**: Número de categorias utilizadas
- **Valor Total do Estoque**: Soma do valor de todos os materiais
- **Materiais com Estoque Baixo**: Itens abaixo do estoque mínimo

### Cálculos Automáticos:

```javascript
// Valor total do estoque
valor_total_estoque = SUM(estoque_atual * custo_unitario)

// Materiais com estoque baixo
materiais_estoque_baixo = COUNT(WHERE estoque_atual <= estoque_minimo)
```

## 🚀 Como Usar

### 1. Acessar a Interface

Navegue para `/admin/materiais` no sistema administrativo.

### 2. Adicionar Material

1. Clique em "Novo Material"
2. Preencha os campos obrigatórios (Nome e Categoria)
3. Adicione informações opcionais
4. Clique em "Criar"

### 3. Gerenciar Estoque

1. Localize o material na tabela
2. Clique no ícone de edição
3. Atualize a quantidade em "Estoque Atual"
4. Salve as alterações

### 4. Consultar via Bot

Os usuários podem perguntar ao bot:
- "Tem bandeiras disponíveis?"
- "Quero saber sobre santinhos"
- "Preciso de adesivos"
- "Qual o estoque de materiais?"

## 🔍 Exemplos de Uso

### Cenário 1: Líder solicita bandeiras

**Líder**: "Preciso de bandeiras para o evento"

**Bot**: 
```
Material: Bandeira Jadyel Alencar
Categoria: BANDEIRAS
Estoque: 50 unidades
Custo: R$ 25.00
Fornecedor: Gráfica Central
```

### Cenário 2: Verificação de estoque

**Líder**: "Quais materiais estão disponíveis?"

**Bot**:
```
Encontrei 4 materiais relacionados:

1. Bandeira Jadyel Alencar (BANDEIRAS) - Estoque: 50
2. Santinho Eleitoral (SANTINHOS) - Estoque: 2000
3. Adesivo Carro (ADESIVOS) - Estoque: 300
4. Camiseta Campanha (CAMISETAS) - Estoque: 100

Para mais detalhes, especifique o material desejado.
```

### Cenário 3: Material não disponível

**Líder**: "Preciso de bonés"

**Bot**: "Não encontrei materiais específicos. Posso ajudar com informações sobre projetos, realizações ou bandeiras."

## 🛠️ Manutenção

### Backup de Dados

O sistema utiliza SQLite, localizado em `src/data/bot_whatsapp.db`. Faça backup regular deste arquivo.

### Atualizações

Para adicionar novas categorias, edite o array `CATEGORIAS_PREDEFINIDAS` em `src/app/admin/materiais/page.tsx`.

### Monitoramento

- Verifique regularmente os materiais com estoque baixo
- Monitore o valor total do estoque
- Revise as observações dos fornecedores

## 📈 Benefícios

1. **Controle Total**: Gestão completa do estoque de campanha
2. **Informação em Tempo Real**: Dados sempre atualizados
3. **Integração Automática**: Bot responde automaticamente sobre materiais
4. **Interface Intuitiva**: Fácil de usar para administradores
5. **Relatórios**: Estatísticas detalhadas do estoque
6. **Alertas**: Notificações de estoque baixo
7. **Histórico**: Rastreamento de alterações

## 🔮 Próximas Funcionalidades

- [ ] Relatórios em PDF
- [ ] Notificações automáticas de estoque baixo
- [ ] Integração com fornecedores
- [ ] Histórico de movimentações
- [ ] Previsão de demanda
- [ ] Dashboard com gráficos
- [ ] Exportação de dados
- [ ] Múltiplos usuários com permissões

---

**Sistema de Materiais de Campanha** - Versão 1.0  
Desenvolvido para o Gabinete do Deputado Jadyel Alencar
