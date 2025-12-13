# PROMPT DE CONTEXTO - PROJETO LYLIA (FUNIL ERL)

## 🎯 OBJETIVO DESTE DOCUMENTO
Este é o contexto completo do projeto LyLia para que qualquer agente de IA possa continuar o desenvolvimento de onde parou.

---

## 📋 INFORMAÇÕES DO PROJETO

### Identificação
- **Nome:** LyLia (Funil ERL)
- **Repositório:** `erl---lilia-lainy-ai`
- **Owner:** Lion (LionManAlpha)
- **Tipo:** Assistente de IA para criação de produtos digitais e copywriting
- **Stack:** React + TypeScript + Vite + Google Gemini 2.0

### Propósito
Plataforma web que usa IA (Google Gemini 2.0) para ajudar empreendedoras digitais a:
1. Criar produtos digitais usando o Método ERL (Entrada → Relacionamento → Lucro)
2. Desenvolver copywriting profissional com análise em 10 passos
3. Estruturar funis de venda e planos de conteúdo

---

## 🏗️ ARQUITETURA ATUAL

### Estrutura de Pastas
```
erl---lilia-lainy-ai/
├── components/               # Componentes React
│   ├── ChatInterface.tsx     # Interface principal do chat
│   ├── ConversationsList.tsx # Lista de threads/conversas
│   ├── AgentsScreen.tsx      # Tela de seleção de agentes
│   ├── LoginScreen.tsx       # Tela de autenticação
│   ├── OnboardingScreen.tsx  # Onboarding inicial do usuário
│   ├── MessageBubble.tsx     # Bolha de mensagem
│   ├── ChatHeader.tsx        # Header do chat
│   ├── CopywriterResponse.tsx # UI do modo copywriter
│   ├── AnalysisPanel.tsx     # Painel de análise da conversa
│   ├── ExportButton.tsx      # Botão de exportação
│   ├── TutorialsPanel.tsx    # Painel de tutoriais
│   ├── BusinessIdeasPanel.tsx # Painel de ideias de negócio
│   └── PersonalizationPanel.tsx # Painel de personalização
│
├── services/                 # Lógica de negócio
│   ├── geminiService.ts      # Integração com Google Gemini API
│   ├── copywriterService.ts  # Lógica do modo copywriter
│   ├── threadService.ts      # Gerenciamento de threads/conversas
│   ├── authService.ts        # Autenticação
│   ├── themeService.ts       # Gerenciamento de tema
│   ├── analysisService.ts    # Análise de conversas
│   ├── modeDetectionService.ts # Detecção de modo copywriter
│   ├── migrationService.ts   # Migração de dados antigos
│   └── logger.ts             # Sistema de logs
│
├── constants/                # Configurações e prompts
│   ├── constants.ts          # Prompt do agente Lyla.IA (ERL)
│   ├── copywriterPrompt.ts   # Prompt do modo copywriter
│   └── auth.ts               # Lista de emails autorizados (whitelist)
│
├── types/                    # Definições TypeScript
│   ├── types.ts              # Tipos principais (Message, Sender, etc)
│   ├── agents.ts             # Definição dos 5 agentes
│   ├── copywriter.ts         # Tipos do copywriter
│   ├── onboarding.ts         # Tipos do onboarding
│   └── analysis.ts           # Tipos de análise
│
├── public/images/            # Imagens e assets
│   ├── logo-main.jpg         # Logo principal
│   └── image-1.jpg até image-5.jpg
│
├── App.tsx                   # Componente raiz
├── main.tsx                  # Entry point
├── index.html                # HTML base
├── vite.config.ts            # Configuração Vite
├── tailwind.config.js        # Configuração Tailwind
├── tsconfig.json             # Configuração TypeScript
├── package.json              # Dependências
├── .env.local                # Variáveis de ambiente (NÃO commitado)
├── netlify.toml              # Configuração Netlify
├── README.md                 # Documentação principal
└── MELHORIAS_IMPLEMENTADAS.md # Changelog completo
```

---

## 🤖 AGENTES DISPONÍVEIS

O sistema possui 5 agentes especializados:

### 1. Lyla.IA 🎯 (Agente Principal)
- **ID:** `lia-erl`
- **Categoria:** ERL
- **Função:** Mentora de Negócios - Método ERL
- **Prompt:** `constants/constants.ts` → `LIA_SYSTEM_PROMPT`
- **Fluxo:**
  1. Diagnóstico rápido (usa dados do onboarding)
  2. Define produto principal (3 opções)
  3. Cria funil URL (Entrada → Relacionamento → Lucro)
  4. Monta plano de conteúdo de 7 dias
- **Diferencial:** Assume valores padrão inteligentes para entregar resultados em 15-20min

### 2. Copywriter Profissional ✍️
- **ID:** `copywriter`
- **Categoria:** Copywriting
- **Função:** Análise completa de copywriting
- **Prompt:** `constants/copywriterPrompt.ts` → `COPYWRITER_SYSTEM_PROMPT`
- **10 Passos:**
  1. Público-alvo e consciência (Eugene Schwartz)
  2. Estrutura de copy (AIDA, StoryBrand, PAS)
  3. Promessa única
  4. Mecanismo único
  5. Funil de conteúdo
  6. Roteiros de vídeos virais
  7. Textos de vendas
  8. Títulos testáveis
  9. CTAs estratégicos
  10. Análise de concorrentes

### 3. Arquiteto de Produtos 📦
- **ID:** `arquiteto-produto`
- **Categoria:** Outros (Arquitetos Iniciais)
- **Função:** Criação de produtos bestseller
- **Metodologia:** Estrutura produtos digitais de alta conversão

### 4. Arquiteto de Campanha 💡
- **ID:** `arquiteto-campanha`
- **Categoria:** Outros (Arquitetos Iniciais)
- **Função:** Ideias centrais de campanha
- **Metodologia:** Cria ideias que chamam atenção do mercado

### 5. Arquiteto de Oferta 11 Estrelas ⭐
- **ID:** `arquiteto-oferta`
- **Categoria:** Outros (Arquitetos Iniciais)
- **Função:** Ofertas irresistíveis
- **Metodologia:** Cria ofertas com mecanismos únicos

---

## 🔧 FUNCIONALIDADES IMPLEMENTADAS

### ✅ Sistema de Threads/Conversas
- Múltiplas conversas separadas por agente
- Histórico independente para cada thread
- Metadados: título, última mensagem, data de criação/atualização
- Migração automática de histórico antigo
- **Arquivo:** `services/threadService.ts`

### ✅ Chat Multimídia
- **Texto:** Textarea expansível
- **Imagens:** Upload com preview (JPEG, PNG, WebP)
- **Áudio:** Gravação via MediaRecorder API com preview
- **Arquivo:** `components/ChatInterface.tsx`

### ✅ Autenticação
- Sistema de whitelist com até 10 emails
- Login simples sem senha
- Dados salvos por email no localStorage
- **Arquivo:** `services/authService.ts` + `constants/auth.ts`

### ✅ Onboarding
- Coleta: nome, profissão, objetivo, experiência
- Opcional (pode pular)
- Salva no localStorage por email
- **Arquivo:** `components/OnboardingScreen.tsx`

### ✅ Modo Copywriter
- Ativação automática por palavras-chave ou botão
- Análise em 10 passos estruturados
- UI dedicada para exibir resposta formatada
- **Arquivos:** `services/copywriterService.ts`, `components/CopywriterResponse.tsx`

### ✅ Análise de Conversa
- Insights sobre progresso
- Tópicos discutidos
- Recomendações de próximos passos
- **Arquivo:** `services/analysisService.ts`, `components/AnalysisPanel.tsx`

### ✅ Exportação
- Formatos: Markdown, JSON, PDF
- Exporta histórico completo da conversa
- **Arquivo:** `components/ExportButton.tsx`

### ✅ UI Mobile-First
- Design inspirado em ChatGPT Mobile
- Layout responsivo
- Avatares para usuário e IA
- Bolhas de mensagem modernas
- **Arquivos:** `components/MessageBubble.tsx`, `components/ChatHeader.tsx`

---

## 🔑 CONFIGURAÇÕES NECESSÁRIAS

### 1. API Key do Google Gemini
**Arquivo:** `.env.local` (criar na raiz)
```env
GEMINI_API_KEY=sua_chave_aqui
```

**Modelos usados:**
- `gemini-2.0-flash-exp` - Modelo padrão (1M tokens de contexto)
- `gemini-2.0-flash-thinking-exp` - Para tarefas complexas (copywriting)

### 2. Emails Autorizados
**Arquivo:** `constants/auth.ts`
```typescript
export const ALLOWED_EMAILS: string[] = [
  "usuario1@exemplo.com",
  "usuario2@exemplo.com",
  // Máximo 10 emails
];
```

---

## 📦 DEPENDÊNCIAS PRINCIPAIS

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "@google/generative-ai": "^0.21.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.43",
    "@types/react-dom": "^18.2.17",
    "@vitejs/plugin-react": "^4.2.1",
    "typescript": "^5.2.2",
    "vite": "^5.0.8",
    "tailwindcss": "^3.4.0",
    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.32"
  }
}
```

---

## 🚀 COMANDOS

```bash
# Instalar dependências
npm install

# Rodar localmente
npm run dev
# → http://localhost:5173

# Build para produção
npm run build

# Preview da build
npm run preview

# Deploy (Netlify)
# Está configurado para deploy automático via GitHub
```

---

## 🎨 DESIGN SYSTEM

### Cores Principais
- **Roxo (Purple):** Agente principal (Lyla.IA)
- **Laranja (Orange):** Copywriter, Arquiteto de Produtos, Campanha
- **Azul (Blue):** Arquiteto de Oferta
- **Verde (Green):** Futuro uso

### Tipografia
- **Font:** System UI (padrão do sistema)
- **Tamanhos:** Responsivos via Tailwind

### Layout
- **Mobile-first:** Otimizado para celular
- **Responsivo:** Funciona em desktop
- **Safe areas:** Suporte para notch

---

## 📝 FLUXO DE USO

```
1. Login
   ↓
2. Onboarding (opcional)
   ↓
3. Seleção de Agente
   ├─→ Lyla.IA → Método ERL
   ├─→ Copywriter → Análise de copy
   ├─→ Arquiteto Produtos → Estrutura produto
   ├─→ Arquiteto Campanha → Ideia central
   └─→ Arquiteto Oferta → Oferta irresistível
   ↓
4. Conversa com IA
   ├─ Texto
   ├─ Imagem
   └─ Áudio
   ↓
5. Resultados
   ├─ Produto definido
   ├─ Funil criado
   ├─ Plano de conteúdo
   └─ Exportação (MD/JSON/PDF)
```

---

## ⚠️ PONTOS DE ATENÇÃO

### Limitações Conhecidas
1. **localStorage:** Dados não sincronizam entre dispositivos
2. **Áudio:** Gravação requer HTTPS em produção (funciona em localhost)
3. **Autenticação:** Sistema simples, não tem senha
4. **Limite de usuários:** Máximo 10 emails
5. **Sem backend:** Tudo client-side

### Segurança
- API Key está no `.env.local` (não commitada)
- Lista de emails hardcoded em `constants/auth.ts`
- Sem criptografia de dados no localStorage

---

## 🔄 PRÓXIMOS PASSOS SUGERIDOS

### Curto Prazo (1-2 dias)
- [ ] Testar localmente todos os 5 agentes
- [ ] Configurar API Key válida
- [ ] Definir emails autorizados
- [ ] Fazer primeiro deploy no Netlify
- [ ] Testar em produção

### Médio Prazo (1 semana)
- [ ] Adicionar busca nas conversas
- [ ] Implementar arquivamento de threads
- [ ] Melhorar transcrição de áudio (usar API Gemini)
- [ ] Adicionar suporte a múltiplos modelos de IA
- [ ] Implementar streaming de respostas

### Longo Prazo (1 mês+)
- [ ] Backend real (substituir localStorage)
- [ ] Autenticação robusta (OAuth, JWT)
- [ ] Sincronização entre dispositivos
- [ ] Sistema de assinaturas/pagamentos
- [ ] Analytics e métricas de uso
- [ ] Novos agentes especializados

---

## 🐛 TROUBLESHOOTING

### Erro: "API Key não configurada"
**Solução:** Criar `.env.local` com `GEMINI_API_KEY=sua_chave`

### Erro: "Email não autorizado"
**Solução:** Adicionar email em `constants/auth.ts` → `ALLOWED_EMAILS`

### Erro: "Histórico não carrega"
**Solução:** Verificar se está logado com o mesmo email (histórico é por usuário)

### Erro: "Áudio não grava"
**Solução:** Usar HTTPS ou localhost (MediaRecorder API requer contexto seguro)

### Erro: "Build falha"
**Solução:** Rodar `npm install` novamente e verificar versões do Node

---

## 📚 DOCUMENTOS DE REFERÊNCIA

### Dentro do Repositório
- `README.md` - Documentação principal
- `MELHORIAS_IMPLEMENTADAS.md` - Changelog completo
- `DEPLOY_NETLIFY.md` - Guia de deploy
- `CONFIGURAR_API_KEY.md` - Como configurar API
- `NOTEBOOKLM_PROMPT.md` - Prompt para NotebookLM

### Externos
- [Google Gemini API Docs](https://ai.google.dev/docs)
- [React Docs](https://react.dev)
- [Vite Docs](https://vitejs.dev)
- [Tailwind CSS Docs](https://tailwindcss.com)

---

## 🎯 COMO USAR ESTE PROMPT

### Para Continuar Desenvolvimento:
```
"Contexto: [cole este documento]

Tarefa: [descreva o que precisa fazer]

Exemplo:
- Adicionar novo agente chamado 'Estrategista de Lançamento'
- Corrigir bug no upload de imagens
- Melhorar UI do modo copywriter
- Fazer deploy no Netlify
"
```

### Para Debug:
```
"Contexto: [cole este documento]

Erro: [descreva o erro]

Logs: [cole logs do console]

O que tentei: [descreva o que já tentou]
"
```

### Para Novas Features:
```
"Contexto: [cole este documento]

Feature: [descreva a feature]

Requisitos:
- [liste requisitos]
- [comportamento esperado]
- [referências/exemplos]
"
```

---

## ✅ CHECKLIST DE VALIDAÇÃO

Antes de considerar o projeto "completo", verificar:

### Funcional
- [ ] Todos os 5 agentes respondem corretamente
- [ ] Sistema de threads salva/carrega histórico
- [ ] Upload de imagem funciona
- [ ] Gravação de áudio funciona
- [ ] Modo copywriter ativa corretamente
- [ ] Exportação gera arquivos válidos
- [ ] Análise de conversa mostra insights

### Técnico
- [ ] API Key configurada e válida
- [ ] Build roda sem erros (`npm run build`)
- [ ] Sem warnings críticos no console
- [ ] Responsivo em mobile/desktop
- [ ] Performance aceitável (<3s carregamento)

### Deploy
- [ ] Deploy no Netlify funcionando
- [ ] Domínio configurado (se houver)
- [ ] HTTPS funcionando
- [ ] Todas as features funcionam em produção

---

**VERSÃO:** 1.0
**ÚLTIMA ATUALIZAÇÃO:** Dezembro 2024
**AUTOR:** Lion (LionManAlpha)
**PROJETO:** LyLia (Funil ERL)
