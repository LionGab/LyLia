# Documentação do Banco de Dados - Funil ERL

## 📊 Visão Geral

Sistema de banco de dados PostgreSQL via Supabase para armazenar dados de 6 alunas e suas interações com os agentes de IA (Lyla.IA e Arquitetos).

### Características
- **6 tabelas principais** com relacionamentos
- **Row Level Security (RLS)** habilitado
- **Triggers** para atualização automática de timestamps
- **Views** para análises e relatórios
- **JSONB** para dados flexíveis
- **UUID** como chave primária
- **Cascata** em deleções (ON DELETE CASCADE)

---

## 📐 Diagrama ERD (Entity Relationship Diagram)

```
┌──────────────┐
│    users     │
│──────────────│
│ id (PK)      │
│ email        │◄─────────┐
│ nome         │          │
│ ativo        │          │
│ created_at   │          │
│ updated_at   │          │
└──────────────┘          │
       │                  │
       │ 1:1              │ 1:N
       │                  │
       ▼                  │
┌──────────────────┐      │
│ onboarding_data  │      │
│──────────────────│      │
│ id (PK)          │      │
│ user_id (FK)     │──────┘
│ profissao        │
│ habilidade...    │
│ publico_alvo     │
│ ...              │
└──────────────────┘

       ┌───────────────┐
       │ conversations │
       │───────────────│
       │ id (PK)       │◄────────┐
       │ user_id (FK)  │─────┐   │
       │ agent_id      │     │   │
       │ title         │     │   │
       │ is_active     │     │   │
       │ message_count │     │   │
       └───────────────┘     │   │
              │              │   │
              │ 1:N          │   │
              │              │   │
              ▼              │   │
       ┌───────────┐         │   │
       │  messages │         │   │
       │───────────│         │   │
       │ id (PK)   │         │   │ 1:N
       │ conv_id   │─────────┘   │
       │ sender    │             │
       │ text      │             │
       │ metadata  │             │
       └───────────┘             │
                                 │
       ┌──────────────┐          │
       │ deliverables │          │
       │──────────────│          │
       │ id (PK)      │          │
       │ conv_id (FK) │──────────┤
       │ user_id (FK) │──────────┤
       │ type         │          │
       │ data         │          │
       │ title        │          │
       └──────────────┘          │
                                 │
       ┌──────────────────┐      │
       │ question_answers │      │
       │──────────────────│      │
       │ id (PK)          │      │
       │ conv_id (FK)     │──────┤
       │ user_id (FK)     │──────┘
       │ agent_id         │
       │ question         │
       │ answer           │
       │ answered_at      │
       └──────────────────┘
```

---

## 📋 Tabelas Detalhadas

### 1. `users` - Usuárias do Sistema

**Descrição:** Cadastro das 6 alunas do sistema.

| Coluna      | Tipo      | Restrições          | Descrição                      |
|-------------|-----------|---------------------|--------------------------------|
| id          | UUID      | PRIMARY KEY         | ID único da usuária            |
| email       | TEXT      | UNIQUE, NOT NULL    | Email (usado para login)       |
| nome        | TEXT      | NOT NULL            | Nome completo                  |
| ativo       | BOOLEAN   | DEFAULT true        | Se está ativa no sistema       |
| created_at  | TIMESTAMP | DEFAULT NOW()       | Data de criação                |
| updated_at  | TIMESTAMP | DEFAULT NOW()       | Data de última atualização     |

**Índices:**
- `idx_users_email` em `email`

**RLS Policies:**
- `SELECT`: Todos podem ver todos os usuários
- `UPDATE`: Usuários podem atualizar apenas próprio perfil

**Exemplo de Inserção:**
```sql
INSERT INTO users (email, nome, ativo) VALUES
  ('maria@example.com', 'Maria Silva', true);
```

**Exemplo de Query:**
```sql
-- Buscar usuária por email
SELECT * FROM users WHERE email = 'maria@example.com';

-- Listar todas as usuárias ativas
SELECT * FROM users WHERE ativo = true ORDER BY nome;
```

---

### 2. `onboarding_data` - Dados de Perfil/Negócio

**Descrição:** Informações coletadas durante onboarding e conversas.

| Coluna              | Tipo      | Restrições                     | Descrição                           |
|---------------------|-----------|--------------------------------|-------------------------------------|
| id                  | UUID      | PRIMARY KEY                    | ID único                            |
| user_id             | UUID      | FK users(id), UNIQUE, NOT NULL | ID da usuária (1:1)                 |
| profissao           | TEXT      | NULL                           | Profissão (ex: Nutricionista)       |
| habilidade_principal| TEXT      | NULL                           | Principal habilidade                |
| oferta_atual        | TEXT      | NULL                           | Oferta/produto atual                |
| preco_atual         | DECIMAL   | NULL                           | Preço atual da oferta               |
| tempo_disponivel    | TEXT      | NULL                           | Tempo disponível p/ negócio         |
| plataforma_principal| TEXT      | NULL                           | Instagram, Facebook, etc.           |
| formato_preferido   | TEXT      | CHECK (1:1, grupo, gravado, híbrido) | Formato de trabalho preferido |
| meta_faturamento    | DECIMAL   | NULL                           | Meta de faturamento                 |
| prazo_meta          | TEXT      | NULL                           | Prazo para atingir meta             |
| publico_alvo        | TEXT      | NULL                           | Descrição do público-alvo           |
| problema_principal  | TEXT      | NULL                           | Principal problema do público       |
| diferencial         | TEXT      | NULL                           | Diferencial único                   |
| template_id         | TEXT      | NULL                           | ID do template escolhido            |
| estilo_resposta     | TEXT      | NULL                           | Estilo de resposta preferido        |
| observacoes         | TEXT      | NULL                           | Observações gerais                  |
| created_at          | TIMESTAMP | DEFAULT NOW()                  | Data de criação                     |
| updated_at          | TIMESTAMP | DEFAULT NOW()                  | Data de atualização                 |

**Índices:**
- `idx_onboarding_user_id` em `user_id`

**RLS Policies:**
- `SELECT`, `INSERT`, `UPDATE`: Apenas próprio onboarding

**Exemplo de Uso (TypeScript):**
```typescript
import { upsertOnboardingData, getOnboardingData } from '@/services/supabase/database';

// Salvar dados de onboarding
await upsertOnboardingData(userId, {
  profissao: 'Nutricionista',
  habilidade_principal: 'Emagrecimento saudável',
  publico_alvo: 'Mulheres 30-45 anos que querem emagrecer',
  meta_faturamento: 10000,
  prazo_meta: '3 meses',
  plataforma_principal: 'Instagram',
  formato_preferido: 'grupo'
});

// Buscar dados
const onboarding = await getOnboardingData(userId);
```

---

### 3. `conversations` - Threads de Conversa

**Descrição:** Cada conversa com um agente (Lyla, Arquiteto Produto, etc.)

| Coluna        | Tipo      | Restrições            | Descrição                        |
|---------------|-----------|-----------------------|----------------------------------|
| id            | UUID      | PRIMARY KEY           | ID único da conversa             |
| user_id       | UUID      | FK users(id), NOT NULL| ID da usuária                    |
| agent_id      | TEXT      | NOT NULL              | ID do agente (lia-erl, arquiteto-produto) |
| title         | TEXT      | DEFAULT 'Nova Conversa' | Título da conversa             |
| is_active     | BOOLEAN   | DEFAULT true          | Se está ativa                    |
| message_count | INTEGER   | DEFAULT 0             | Contador de mensagens (auto)     |
| created_at    | TIMESTAMP | DEFAULT NOW()         | Data de criação                  |
| updated_at    | TIMESTAMP | DEFAULT NOW()         | Data de última mensagem          |

**Índices:**
- `idx_conversations_user_id` em `user_id`
- `idx_conversations_agent_id` em `agent_id`
- `idx_conversations_created_at` em `created_at DESC`

**RLS Policies:**
- `SELECT`, `INSERT`, `UPDATE`, `DELETE`: Apenas próprias conversas

**Agents disponíveis:**
- `lia-erl` - Lyla.IA principal
- `arquiteto-produto` - Arquiteto de Produtos
- `arquiteto-campanha` - Arquiteto de Campanhas
- `arquiteto-oferta` - Arquiteto de Ofertas 11 Estrelas

**Exemplo de Uso:**
```typescript
import { createConversation, getConversations } from '@/services/supabase/database';

// Criar nova conversa
const conversation = await createConversation({
  user_id: userId,
  agent_id: 'lia-erl',
  title: 'Criando meu primeiro produto digital'
});

// Listar conversas da usuária
const conversations = await getConversations(userId);
```

---

### 4. `messages` - Mensagens das Conversas

**Descrição:** Cada mensagem trocada entre usuária e agente.

| Coluna          | Tipo      | Restrições                        | Descrição                    |
|-----------------|-----------|-----------------------------------|------------------------------|
| id              | UUID      | PRIMARY KEY                       | ID único da mensagem         |
| conversation_id | UUID      | FK conversations(id), NOT NULL    | ID da conversa               |
| sender          | TEXT      | CHECK (user, ai), NOT NULL        | Quem enviou                  |
| text            | TEXT      | NOT NULL                          | Conteúdo da mensagem         |
| metadata        | JSONB     | DEFAULT '{}'                      | Dados extras (imagens, etc.) |
| created_at      | TIMESTAMP | DEFAULT NOW()                     | Data de envio                |

**Índices:**
- `idx_messages_conversation_id` em `conversation_id`
- `idx_messages_created_at` em `created_at DESC`

**RLS Policies:**
- `SELECT`, `INSERT`: Apenas mensagens de próprias conversas

**Trigger:**
- Incrementa `message_count` em `conversations` automaticamente

**Exemplo de Uso:**
```typescript
import { addMessage, getMessages } from '@/services/supabase/database';

// Adicionar mensagem da usuária
await addMessage({
  conversation_id: conversationId,
  sender: 'user',
  text: 'Quero criar um produto digital'
});

// Adicionar resposta da IA
await addMessage({
  conversation_id: conversationId,
  sender: 'ai',
  text: 'Perfeito! Vou te ajudar...'
});

// Buscar todas as mensagens
const messages = await getMessages(conversationId);
```

---

### 5. `deliverables` - Entregáveis Criados

**Descrição:** Produtos, funis, planos de conteúdo criados pelos agentes.

| Coluna          | Tipo      | Restrições                        | Descrição                    |
|-----------------|-----------|-----------------------------------|------------------------------|
| id              | UUID      | PRIMARY KEY                       | ID único                     |
| conversation_id | UUID      | FK conversations(id), NOT NULL    | Conversa onde foi criado     |
| user_id         | UUID      | FK users(id), NOT NULL            | Usuária dona                 |
| type            | TEXT      | CHECK (product, funnel, content_plan, copywriting, campaign, offer) | Tipo de entregável |
| data            | JSONB     | NOT NULL                          | Dados do entregável (JSON)   |
| title           | TEXT      | NULL                              | Título                       |
| description     | TEXT      | NULL                              | Descrição                    |
| created_at      | TIMESTAMP | DEFAULT NOW()                     | Data de criação              |
| updated_at      | TIMESTAMP | DEFAULT NOW()                     | Data de atualização          |

**Índices:**
- `idx_deliverables_user_id` em `user_id`
- `idx_deliverables_conversation_id` em `conversation_id`
- `idx_deliverables_type` em `type`
- `idx_deliverables_created_at` em `created_at DESC`

**Tipos de Entregáveis:**
- `product` - Produto digital
- `funnel` - Funil de vendas
- `content_plan` - Plano de conteúdo 7 dias
- `copywriting` - Copy de vendas
- `campaign` - Campanha de lançamento
- `offer` - Oferta 11 estrelas

**Exemplo de Uso:**
```typescript
import { createDeliverable, getDeliverables } from '@/services/supabase/database';

// Salvar produto criado
await createDeliverable({
  conversation_id: conversationId,
  user_id: userId,
  type: 'product',
  title: 'Desafio 21 Dias Detox',
  description: 'Programa de emagrecimento em grupo',
  data: {
    nome: 'Desafio 21 Dias Detox',
    promessa: 'Perca 3-5kg em 21 dias de forma saudável',
    formato: 'Grupo VIP 21 dias',
    preco: 297,
    publico: 'Mulheres 30-45 anos',
    entregaveis: [
      'Grupo VIP no WhatsApp',
      'Lives semanais',
      'Cardápio detox personalizado'
    ]
  }
});

// Listar todos os produtos da usuária
const produtos = await getDeliverables(userId, 'product');
```

---

### 6. `question_answers` - Perguntas e Respostas

**Descrição:** Rastreamento de perguntas feitas pelos agentes e respostas dadas.

| Coluna          | Tipo      | Restrições                        | Descrição                    |
|-----------------|-----------|-----------------------------------|------------------------------|
| id              | UUID      | PRIMARY KEY                       | ID único                     |
| conversation_id | UUID      | FK conversations(id), NOT NULL    | Conversa                     |
| user_id         | UUID      | FK users(id), NOT NULL            | Usuária                      |
| agent_id        | TEXT      | NOT NULL                          | Agente que perguntou         |
| question        | TEXT      | NOT NULL                          | Pergunta feita               |
| answer          | TEXT      | NULL                              | Resposta dada                |
| answered_at     | TIMESTAMP | NULL                              | Quando foi respondida        |
| created_at      | TIMESTAMP | DEFAULT NOW()                     | Quando foi perguntada        |

**Índices:**
- `idx_qa_user_id` em `user_id`
- `idx_qa_conversation_id` em `conversation_id`
- `idx_qa_agent_id` em `agent_id`

**Exemplo de Uso:**
```typescript
import { saveQuestion, updateQuestionAnswer, getQuestionsByConversation } from '@/services/supabase/database';

// Salvar pergunta feita pelo agente
const question = await saveQuestion({
  conversation_id: conversationId,
  user_id: userId,
  agent_id: 'lia-erl',
  question: 'Qual sua profissão?'
});

// Atualizar com a resposta
await updateQuestionAnswer(question.id, 'Sou nutricionista há 3 anos');

// Listar todas as Q&A da conversa
const qas = await getQuestionsByConversation(conversationId);
```

---

## 🔐 Row Level Security (RLS)

### Políticas Implementadas

Todas as tabelas têm RLS habilitado para garantir que usuárias vejam apenas seus próprios dados.

**Exemplo de Policy:**
```sql
-- Usuárias podem ver apenas próprias conversas
CREATE POLICY "Users podem ver apenas próprias conversas"
  ON conversations FOR SELECT
  USING (user_id = auth.uid());
```

### Desabilitar RLS (Desenvolvimento)

Se estiver testando sem autenticação:
```sql
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_data DISABLE ROW LEVEL SECURITY;
ALTER TABLE conversations DISABLE ROW LEVEL SECURITY;
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE deliverables DISABLE ROW LEVEL SECURITY;
ALTER TABLE question_answers DISABLE ROW LEVEL SECURITY;
```

**⚠️ IMPORTANTE:** Reabilite RLS em produção!

---

## 📊 Views (Relatórios)

### 1. `latest_conversations_summary`

Lista últimas conversas de cada usuária com contagem de mensagens.

```sql
SELECT * FROM latest_conversations_summary
ORDER BY updated_at DESC;
```

**Colunas:**
- `id`, `user_id`, `user_nome`, `user_email`
- `agent_id`, `title`, `message_count`, `is_active`
- `created_at`, `updated_at`

### 2. `user_stats`

Estatísticas por usuária.

```sql
SELECT * FROM user_stats
WHERE user_id = 'xxx';
```

**Colunas:**
- `user_id`, `nome`, `email`
- `total_conversations` - Total de conversas
- `total_messages` - Total de mensagens
- `total_deliverables` - Total de entregáveis
- `total_products` - Total de produtos criados
- `total_funnels` - Total de funis criados
- `total_content_plans` - Total de planos de conteúdo
- `last_activity` - Última atividade

**Exemplo:**
```sql
-- Ver estatísticas de todas as usuárias
SELECT
  nome,
  total_conversations,
  total_messages,
  total_products,
  last_activity
FROM user_stats
ORDER BY last_activity DESC;
```

---

## 🔧 Triggers

### 1. `update_updated_at_column()`

Atualiza automaticamente `updated_at` em:
- `users`
- `onboarding_data`
- `conversations`
- `deliverables`

### 2. `increment_conversation_message_count()`

Incrementa `message_count` em `conversations` quando mensagem é adicionada.

**Comportamento:**
```sql
-- Ao inserir mensagem
INSERT INTO messages (conversation_id, sender, text) VALUES (...);

-- Trigger executa automaticamente:
UPDATE conversations
SET message_count = message_count + 1,
    updated_at = NOW()
WHERE id = conversation_id;
```

---

## 📈 Queries Úteis

### Estatísticas Gerais

```sql
-- Total de usuárias ativas
SELECT COUNT(*) FROM users WHERE ativo = true;

-- Total de conversas por agente
SELECT agent_id, COUNT(*) as total
FROM conversations
GROUP BY agent_id
ORDER BY total DESC;

-- Total de mensagens por dia (últimos 7 dias)
SELECT
  DATE(created_at) as dia,
  COUNT(*) as total_mensagens
FROM messages
WHERE created_at >= NOW() - INTERVAL '7 days'
GROUP BY dia
ORDER BY dia DESC;

-- Média de mensagens por conversa
SELECT
  AVG(message_count) as media_mensagens
FROM conversations;
```

### Análises por Usuária

```sql
-- Conversas de uma usuária específica
SELECT
  c.title,
  c.agent_id,
  c.message_count,
  c.created_at
FROM conversations c
WHERE c.user_id = 'user-id-here'
ORDER BY c.updated_at DESC;

-- Entregáveis criados por uma usuária
SELECT
  type,
  title,
  created_at
FROM deliverables
WHERE user_id = 'user-id-here'
ORDER BY created_at DESC;

-- Perguntas respondidas vs não respondidas
SELECT
  COUNT(*) FILTER (WHERE answer IS NOT NULL) as respondidas,
  COUNT(*) FILTER (WHERE answer IS NULL) as pendentes
FROM question_answers
WHERE user_id = 'user-id-here';
```

### Buscar Conversas com Palavras-Chave

```sql
-- Buscar conversas que mencionam "produto" nas mensagens
SELECT DISTINCT c.*
FROM conversations c
JOIN messages m ON m.conversation_id = c.id
WHERE m.text ILIKE '%produto%'
ORDER BY c.updated_at DESC;
```

---

## 🧪 Testes de Integração

### Teste Completo de Fluxo

```sql
-- 1. Criar usuária
INSERT INTO users (email, nome) VALUES ('teste@example.com', 'Teste User')
RETURNING *;

-- 2. Salvar onboarding
INSERT INTO onboarding_data (user_id, profissao, publico_alvo)
VALUES ('user-id', 'Nutricionista', 'Mulheres 30-45 anos')
RETURNING *;

-- 3. Criar conversa
INSERT INTO conversations (user_id, agent_id, title)
VALUES ('user-id', 'lia-erl', 'Minha primeira conversa')
RETURNING *;

-- 4. Adicionar mensagens
INSERT INTO messages (conversation_id, sender, text) VALUES
  ('conv-id', 'user', 'Olá, quero criar um produto'),
  ('conv-id', 'ai', 'Perfeito! Vou te ajudar...');

-- 5. Verificar contador de mensagens
SELECT message_count FROM conversations WHERE id = 'conv-id';
-- Deve ser 2

-- 6. Criar entregável
INSERT INTO deliverables (conversation_id, user_id, type, title, data)
VALUES (
  'conv-id',
  'user-id',
  'product',
  'Produto Teste',
  '{"nome": "Desafio 21 Dias", "preco": 297}'::jsonb
);

-- 7. Verificar estatísticas
SELECT * FROM user_stats WHERE user_id = 'user-id';
```

---

## 🚀 Performance

### Índices Criados

```sql
-- Usuários
CREATE INDEX idx_users_email ON users(email);

-- Onboarding
CREATE INDEX idx_onboarding_user_id ON onboarding_data(user_id);

-- Conversas
CREATE INDEX idx_conversations_user_id ON conversations(user_id);
CREATE INDEX idx_conversations_agent_id ON conversations(agent_id);
CREATE INDEX idx_conversations_created_at ON conversations(created_at DESC);

-- Mensagens
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);

-- Entregáveis
CREATE INDEX idx_deliverables_user_id ON deliverables(user_id);
CREATE INDEX idx_deliverables_conversation_id ON deliverables(conversation_id);
CREATE INDEX idx_deliverables_type ON deliverables(type);
CREATE INDEX idx_deliverables_created_at ON deliverables(created_at DESC);

-- Q&A
CREATE INDEX idx_qa_user_id ON question_answers(user_id);
CREATE INDEX idx_qa_conversation_id ON question_answers(conversation_id);
CREATE INDEX idx_qa_agent_id ON question_answers(agent_id);
```

### Otimizações

- **JSONB** para dados flexíveis (deliverables.data, messages.metadata)
- **Cascata em deleções** - ao deletar usuária, tudo é removido automaticamente
- **Triggers** para manter contadores atualizados
- **Views** pré-computadas para relatórios

---

## 📚 Próximos Passos

### Melhorias Futuras

1. **Autenticação Supabase Auth**
   - Magic Link (login sem senha)
   - Email/Senha
   - Google OAuth

2. **Full-Text Search**
   ```sql
   -- Busca em mensagens
   ALTER TABLE messages ADD COLUMN search_vector tsvector;
   CREATE INDEX idx_messages_search ON messages USING GIN(search_vector);
   ```

3. **Soft Delete**
   ```sql
   -- Adicionar deleted_at
   ALTER TABLE conversations ADD COLUMN deleted_at TIMESTAMP;
   ```

4. **Logs de Auditoria**
   ```sql
   CREATE TABLE audit_logs (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     user_id UUID REFERENCES users(id),
     action TEXT,
     table_name TEXT,
     record_id UUID,
     changes JSONB,
     created_at TIMESTAMP DEFAULT NOW()
   );
   ```

5. **Backups Automáticos**
   - Configurar no Supabase Dashboard
   - Frequência: diária
   - Retenção: 7 dias (free tier)

---

## 📞 Referências

- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [JSONB in PostgreSQL](https://www.postgresql.org/docs/current/datatype-json.html)
