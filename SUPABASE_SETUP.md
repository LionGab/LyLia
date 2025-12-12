# Guia de Setup do Supabase - Funil ERL

## 📋 Índice
1. [Criar Projeto no Supabase](#1-criar-projeto-no-supabase)
2. [Executar Migration](#2-executar-migration)
3. [Configurar Variáveis de Ambiente](#3-configurar-variáveis-de-ambiente)
4. [Cadastrar as 6 Alunas](#4-cadastrar-as-6-alunas)
5. [Testar Integração](#5-testar-integração)
6. [Deploy no Netlify](#6-deploy-no-netlify)

---

## 1. Criar Projeto no Supabase

### 1.1 Acesse o Supabase
1. Vá para [https://supabase.com](https://supabase.com)
2. Faça login ou crie uma conta gratuita
3. Clique em **"New Project"**

### 1.2 Configuração do Projeto
- **Organization**: Crie ou selecione uma organização
- **Project Name**: `funil-erl` ou `lyla-ia`
- **Database Password**: **ANOTE BEM** essa senha! Você vai precisar.
- **Region**: Escolha `South America (São Paulo)` para menor latência
- **Pricing Plan**: **Free** (suficiente para 6 alunas)

### 1.3 Aguarde a Criação
- O projeto leva ~2 minutos para ser provisionado
- Você verá uma tela de "Setting up your project..."

---

## 2. Executar Migration

### 2.1 Acessar o SQL Editor
1. No dashboard do Supabase, vá em **"SQL Editor"** (ícone </>)
2. Clique em **"New query"**

### 2.2 Executar o Schema
1. Abra o arquivo `supabase/migrations/001_initial_schema.sql` deste projeto
2. **Copie TODO o conteúdo** do arquivo
3. **Cole** no SQL Editor do Supabase
4. Clique em **"Run"** (ou pressione Ctrl+Enter)

### 2.3 Verificar Sucesso
Você deve ver mensagens de sucesso como:
```
Success. No rows returned
```

### 2.4 Verificar Tabelas Criadas
1. Vá em **"Table Editor"** no menu lateral
2. Você deve ver 6 tabelas:
   - `users`
   - `onboarding_data`
   - `conversations`
   - `messages`
   - `deliverables`
   - `question_answers`

---

## 3. Configurar Variáveis de Ambiente

### 3.1 Obter as Credenciais do Supabase
1. No dashboard do Supabase, vá em **"Settings"** (ícone ⚙️)
2. Clique em **"API"** no menu lateral
3. Você verá:
   - **Project URL**: `https://xxx.supabase.co`
   - **anon public key**: `eyJhbG...` (uma chave longa)

### 3.2 Criar Arquivo `.env.local`
Na raiz do projeto, crie um arquivo `.env.local`:

```bash
# Supabase Configuration
SUPABASE_URL=https://SEU_PROJECT_ID.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Gemini API (já existente)
VITE_GEMINI_API_KEY=sua_chave_gemini
```

**⚠️ IMPORTANTE:**
- **NUNCA** commite o `.env.local` no Git
- Já está no `.gitignore`
- Cole as credenciais EXATAMENTE como aparecem no Supabase

### 3.3 Verificar `.env.example`
O arquivo `.env.example` deve conter (sem valores reais):

```bash
# Supabase
SUPABASE_URL=
SUPABASE_ANON_KEY=

# Gemini
VITE_GEMINI_API_KEY=
```

---

## 4. Cadastrar as 6 Alunas

### 4.1 Acessar Table Editor
1. No Supabase, vá em **"Table Editor"**
2. Clique na tabela **"users"**

### 4.2 Inserir Manualmente (Opção 1)
Clique em **"Insert row"** e preencha:

**Aluna 1:**
- `id`: (deixe em branco - será gerado automaticamente)
- `email`: `aluna1@example.com`
- `nome`: `Nome Aluna 1`
- `ativo`: ✅ `true`
- `created_at`: (deixe em branco - automático)
- `updated_at`: (deixe em branco - automático)

Repita para as 6 alunas.

### 4.3 Inserir via SQL (Opção 2 - Mais Rápido)
1. Vá em **"SQL Editor"**
2. Execute:

```sql
INSERT INTO users (email, nome, ativo) VALUES
  ('aluna1@example.com', 'Maria Silva', true),
  ('aluna2@example.com', 'Ana Santos', true),
  ('aluna3@example.com', 'Julia Oliveira', true),
  ('aluna4@example.com', 'Beatriz Costa', true),
  ('aluna5@example.com', 'Camila Souza', true),
  ('aluna6@example.com', 'Larissa Pereira', true);
```

3. Clique em **"Run"**

### 4.4 Verificar Inserção
1. Vá em **"Table Editor"** → **"users"**
2. Você deve ver as 6 alunas listadas

**⚠️ IMPORTANTE:** Substitua os emails de exemplo pelos emails REAIS das alunas!

---

## 5. Testar Integração

### 5.1 Instalar Dependências
```bash
npm install
```

### 5.2 Rodar Localmente
```bash
npm run dev
```

### 5.3 Testar Conexão
1. Abra o console do navegador (F12)
2. Verifique se há erros de conexão do Supabase
3. Se aparecer erro de URL ou KEY:
   - Verifique o `.env.local`
   - Reinicie o servidor `npm run dev`

### 5.4 Testar Salvamento (Manual)
Você pode testar via console do navegador:

```javascript
// Importar funções de database
import { getUserByEmail, upsertOnboardingData } from './services/supabase/database';

// Buscar usuária
const user = await getUserByEmail('aluna1@example.com');
console.log('User:', user);

// Salvar onboarding
if (user) {
  const onboarding = await upsertOnboardingData(user.id, {
    profissao: 'Nutricionista',
    habilidade_principal: 'Emagrecimento',
    publico_alvo: 'Mulheres 30-45 anos'
  });
  console.log('Onboarding saved:', onboarding);
}
```

---

## 6. Deploy no Netlify

### 6.1 Adicionar Variáveis de Ambiente
1. Acesse [app.netlify.com](https://app.netlify.com)
2. Selecione seu site
3. Vá em **"Site settings"** → **"Environment variables"**
4. Clique em **"Add a variable"**

Adicione:
- **Key**: `SUPABASE_URL`
- **Value**: `https://SEU_PROJECT_ID.supabase.co`

Adicione:
- **Key**: `SUPABASE_ANON_KEY`
- **Value**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### 6.2 Deploy
1. Faça commit e push do código:
```bash
git add .
git commit -m "feat: integra Supabase para salvar dados das 6 alunas"
git push origin main
```

2. Netlify detectará o push e fará deploy automaticamente

### 6.3 Verificar Deploy
1. Aguarde o deploy finalizar (~2 minutos)
2. Acesse o site em produção
3. Teste a funcionalidade

---

## 📊 Estrutura do Banco de Dados

### Tabelas Criadas

#### 1. `users` (6 alunas)
- `id` (UUID, PK)
- `email` (TEXT, UNIQUE)
- `nome` (TEXT)
- `ativo` (BOOLEAN)
- `created_at`, `updated_at`

#### 2. `onboarding_data` (dados de perfil)
- `id` (UUID, PK)
- `user_id` (UUID, FK → users)
- Campos de negócio: `profissao`, `habilidade_principal`, `oferta_atual`, etc.

#### 3. `conversations` (threads de chat)
- `id` (UUID, PK)
- `user_id` (UUID, FK → users)
- `agent_id` (TEXT)
- `title`, `is_active`, `message_count`

#### 4. `messages` (mensagens)
- `id` (UUID, PK)
- `conversation_id` (UUID, FK → conversations)
- `sender` ('user' | 'ai')
- `text`, `metadata`

#### 5. `deliverables` (entregáveis criados)
- `id` (UUID, PK)
- `conversation_id`, `user_id`
- `type` ('product' | 'funnel' | 'content_plan' | etc.)
- `data` (JSONB)

#### 6. `question_answers` (perguntas e respostas)
- `id` (UUID, PK)
- `conversation_id`, `user_id`, `agent_id`
- `question`, `answer`, `answered_at`

---

## 🔐 Segurança (RLS)

### Row Level Security Habilitado
Todas as tabelas possuem RLS (Row Level Security) ativado.

### Políticas Principais
- **SELECT**: Usuários podem ver apenas seus próprios dados
- **INSERT**: Usuários podem criar apenas seus próprios registros
- **UPDATE**: Usuários podem atualizar apenas seus próprios dados
- **DELETE**: Usuários podem deletar apenas suas próprias conversas

**⚠️ IMPORTANTE:** No modo anon (sem autenticação), as policies não funcionam 100%. Para produção com autenticação real, ajuste as policies para usar `auth.uid()`.

---

## 🔍 Troubleshooting

### Erro: "URL do Supabase não encontrada"
**Solução:**
1. Verifique se o `.env.local` existe
2. Verifique se `SUPABASE_URL` está preenchido corretamente
3. Reinicie o servidor `npm run dev`

### Erro: "fetch failed"
**Solução:**
1. Verifique sua conexão com internet
2. Verifique se o projeto Supabase está ativo (não pausado)
3. Verifique se a URL está correta

### Erro: "Row Level Security"
**Solução:**
1. Se estiver testando sem auth, desabilite RLS temporariamente:
```sql
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_data DISABLE ROW LEVEL SECURITY;
-- ... para todas as tabelas
```

### Tabelas não aparecem no Table Editor
**Solução:**
1. Execute a migration novamente
2. Verifique erros no SQL Editor
3. Certifique-se de estar no projeto correto

---

## ✅ Checklist Final

Antes de ir para produção:

- [ ] Projeto Supabase criado
- [ ] Migration `001_initial_schema.sql` executada
- [ ] 6 tabelas visíveis no Table Editor
- [ ] 6 alunas cadastradas na tabela `users`
- [ ] `.env.local` configurado localmente
- [ ] Variáveis de ambiente no Netlify configuradas
- [ ] Teste local funcionando (`npm run dev`)
- [ ] Deploy no Netlify funcionando
- [ ] Emails das alunas substituídos pelos REAIS

---

## 📚 Próximos Passos

Após o setup completo:

1. **Integrar salvamento** nos componentes React
2. **Configurar autenticação** (email/senha ou magic link)
3. **Criar dashboard** para visualizar dados salvos
4. **Configurar backups** automáticos (Supabase faz isso)
5. **Monitorar uso** do banco (Dashboard → Reports)

---

## 📞 Suporte

**Documentação Oficial:** https://supabase.com/docs

**Problemas comuns:** https://supabase.com/docs/guides/troubleshooting

**Community:** https://github.com/supabase/supabase/discussions
