# 📋 O QUE PRECISA SER FEITO

## Análise: Estado Atual vs Requisitos

Este documento compara o estado atual do projeto LyLia com os requisitos descritos para transformá-lo em um PWA completo de assistente de negócios.

---

## ✅ O QUE JÁ EXISTE

### Funcionalidades Implementadas
1. ✅ **Sistema de Agentes**: 5 agentes especializados (Lyla.IA, Copywriter, Arquiteto de Produtos, Campanha, Oferta)
2. ✅ **Chat Multimídia**: Suporte a texto, imagem e áudio
3. ✅ **Autenticação**: Sistema de whitelist por email
4. ✅ **Onboarding**: Coleta de dados do usuário
5. ✅ **Histórico de Conversas**: Sistema de threads/conversas
6. ✅ **Modo Copywriter**: Análise completa em 10 passos
7. ✅ **Exportação**: Markdown, JSON, PDF
8. ✅ **Análise de Conversa**: Insights e progresso
9. ✅ **UI Mobile-First**: Design responsivo inspirado em ChatGPT Mobile
10. ✅ **Integração com IA**: Google Gemini 2.0 API

### Stack Técnico Atual
- ✅ Front-end: React + TypeScript + Vite
- ✅ IA: Google Gemini 2.0 API
- ✅ Banco de dados: Supabase (configurado mas não totalmente utilizado)
- ✅ Deploy: Netlify configurado

---

## ❌ O QUE FALTA IMPLEMENTAR

### 1. FUNCIONALIDADES DE NEGÓCIO

#### 1.1 Diagnóstico de Perfil Automatizado
**Status**: ⚠️ Parcialmente implementado (onboarding básico existe)

**O que falta**:
- [ ] Motor de diagnóstico que classifica usuária em **Perfil A ou B** automaticamente
- [ ] Sistema de regras de decisão ou classificador de IA para identificar persona
- [ ] Interface de chat interativo para diagnóstico (além do onboarding atual)
- [ ] Algoritmo que indica o melhor caminho baseado no perfil identificado

**Arquivos a criar/modificar**:
- `services/diagnosticService.ts` - Lógica de diagnóstico
- `components/DiagnosticFlow.tsx` - Interface de diagnóstico
- `types/diagnostic.ts` - Tipos para perfis A/B

---

#### 1.2 Recomendação de Produto/Oferta
**Status**: ❌ Não implementado

**O que falta**:
- [ ] Sistema que sugere tipo ideal de produto/serviço baseado no perfil
- [ ] Correlação entre perfis e ofertas (regras ou embeddings)
- [ ] Interface para exibir recomendações de produtos
- [ ] Integração com dados do diagnóstico

**Arquivos a criar**:
- `services/recommendationService.ts` - Lógica de recomendação
- `components/ProductRecommendation.tsx` - UI de recomendações
- `constants/productRecommendations.ts` - Regras/matriz de recomendações

---

#### 1.3 Rascunho de Funil de Vendas
**Status**: ⚠️ Parcialmente implementado (Lyla.IA cria funis, mas não estruturado)

**O que falta**:
- [ ] Geração estruturada de funil ERL adaptado
- [ ] Interface dedicada para visualizar funil gerado
- [ ] Etapas detalhadas: engajamento, relacionamento, conversão
- [ ] Sugestões de conteúdos e canais para cada fase
- [ ] Exportação do funil em formato visual (diagrama)

**Arquivos a criar/modificar**:
- `services/funnelService.ts` - Geração de funis estruturados
- `components/FunnelBuilder.tsx` - Visualizador/editor de funil
- `types/funnel.ts` - Tipos para estrutura de funil

---

#### 1.4 Geração de Conteúdo e Roteiros
**Status**: ⚠️ Parcialmente implementado (modo copywriter existe)

**O que falta**:
- [ ] Geração específica de roteiros de vídeo (Reels, YouTube, etc.)
- [ ] Criação de sequências de posts para redes sociais
- [ ] Templates de e-mails de vendas
- [ ] Ganchos criativos específicos
- [ ] Interface dedicada para cada tipo de conteúdo

**Arquivos a criar/modificar**:
- `services/contentGenerationService.ts` - Geração de conteúdos específicos
- `components/ContentGenerator.tsx` - UI para gerar conteúdos
- `components/VideoScriptGenerator.tsx` - Gerador de roteiros de vídeo
- `components/SocialMediaSequence.tsx` - Sequências de posts
- `constants/contentTemplates.ts` - Templates de conteúdo

---

#### 1.5 Simulação de Resultados Financeiros
**Status**: ❌ Não implementado

**O que falta**:
- [ ] Módulo de simulação de lucro
- [ ] Formulário para inserir parâmetros (preço, conversão, investimento)
- [ ] Cálculo de projeções de faturamento e ROI
- [ ] Visualização com gráficos (receita, ROI, cenários)
- [ ] Análise preditiva de resultados de negócio

**Arquivos a criar**:
- `services/financialSimulationService.ts` - Lógica de simulação
- `components/FinancialSimulator.tsx` - Interface de simulação
- `components/FinancialCharts.tsx` - Gráficos de projeção
- `types/financial.ts` - Tipos para simulação financeira

---

#### 1.6 Roteiro de Vendas / Script para Call
**Status**: ⚠️ Parcialmente implementado (modo copywriter gera scripts)

**O que falta**:
- [ ] Geração específica de scripts de atendimento/call
- [ ] Argumentos de venda personalizados por produto/perfil
- [ ] Suporte a síntese de voz (text-to-speech)
- [ ] Interface dedicada para scripts de venda
- [ ] Templates de scripts por tipo de call

**Arquivos a criar/modificar**:
- `services/salesScriptService.ts` - Geração de scripts de venda
- `components/SalesScriptGenerator.tsx` - UI para scripts
- `services/textToSpeechService.ts` - Síntese de voz (opcional)
- `constants/salesScriptTemplates.ts` - Templates de scripts

---

### 2. ARQUITETURA PWA

#### 2.1 Service Worker e Cache Offline
**Status**: ❌ Não implementado

**O que falta**:
- [ ] Service Worker configurado
- [ ] Estratégia de cache para assets estáticos
- [ ] Cache de dados do usuário (conversas, histórico)
- [ ] Funcionalidade offline básica
- [ ] Sincronização quando voltar online

**Arquivos a criar**:
- `public/sw.js` ou `public/service-worker.js` - Service Worker
- `public/manifest.json` - Manifest do PWA (já parcialmente no HTML)
- `services/offlineService.ts` - Gerenciamento offline
- Modificar `vite.config.ts` para registrar service worker

---

#### 2.2 Manifest PWA Completo
**Status**: ⚠️ Parcialmente implementado (meta tags no HTML)

**O que falta**:
- [ ] Arquivo `manifest.json` completo
- [ ] Ícones PWA em múltiplos tamanhos (192x192, 512x512)
- [ ] Configuração de display mode (standalone, fullscreen)
- [ ] Configuração de orientação
- [ ] Splash screens para iOS/Android

**Arquivos a criar/modificar**:
- `public/manifest.json` - Manifest completo
- `public/icons/` - Pasta com ícones em múltiplos tamanhos
- Modificar `index.html` para referenciar manifest

---

#### 2.3 Instalação e Notificações
**Status**: ❌ Não implementado

**O que falta**:
- [ ] Botão "Instalar App" na interface
- [ ] Handler de evento `beforeinstallprompt`
- [ ] Sistema de notificações push (opcional)
- [ ] Feedback visual quando app é instalável

**Arquivos a criar/modificar**:
- `services/installService.ts` - Lógica de instalação
- `components/InstallPrompt.tsx` - Botão de instalação
- Modificar `App.tsx` para incluir prompt de instalação

---

### 3. INTEGRAÇÃO DE IA AVANÇADA

#### 3.1 RAG (Retrieval-Augmented Generation)
**Status**: ❌ Não implementado

**O que falta**:
- [ ] Banco de dados vetorial (Supabase Vector ou Pinecone)
- [ ] Sistema de embeddings para conteúdo das aulas
- [ ] Indexação de documentos do curso
- [ ] Busca semântica antes de gerar respostas
- [ ] Enriquecimento de prompts com contexto das aulas

**Arquivos a criar**:
- `services/ragService.ts` - Lógica de RAG
- `services/embeddingService.ts` - Geração de embeddings
- `services/vectorStore.ts` - Interface com banco vetorial
- `scripts/indexContent.ts` - Script para indexar conteúdo inicial

---

#### 3.2 Aprendizado Contínuo
**Status**: ❌ Não implementado

**O que falta**:
- [ ] Armazenamento de feedback das usuárias
- [ ] Sistema de ajuste de prompts baseado em feedback
- [ ] Melhoria iterativa do modelo de perfilagem
- [ ] Analytics de uso para otimização

**Arquivos a criar**:
- `services/feedbackService.ts` - Coleta de feedback
- `services/learningService.ts` - Ajuste de prompts
- `services/analyticsService.ts` - Métricas de uso

---

#### 3.3 Transcrição de Áudio Avançada
**Status**: ⚠️ Parcialmente implementado (áudio é enviado, mas não transcrito localmente)

**O que falta**:
- [ ] Integração com Whisper API ou similar para transcrição
- [ ] Melhoria na transcrição com contexto
- [ ] Processamento de áudio antes de enviar para IA

**Arquivos a criar/modificar**:
- `services/transcriptionService.ts` - Transcrição de áudio
- Modificar `components/ChatInterface.tsx` para usar transcrição

---

### 4. BACK-END E INFRAESTRUTURA

#### 4.1 API Backend (Opcional mas Recomendado)
**Status**: ⚠️ Atualmente tudo é client-side

**O que falta** (se optar por backend):
- [ ] API REST (FastAPI/Python ou Node.js/Express)
- [ ] Endpoints para processar requisições de IA
- [ ] Job queue para processamento assíncrono
- [ ] Controle de rate limiting
- [ ] Segurança de API keys no servidor

**Arquivos a criar** (se implementar backend):
- `backend/` - Pasta com código do backend
- `backend/api/` - Endpoints da API
- `backend/workers/` - Workers para processamento assíncrono

---

#### 4.2 Banco de Dados Completo
**Status**: ⚠️ Supabase configurado mas pouco utilizado

**O que falta**:
- [ ] Migrações completas do Supabase
- [ ] Tabelas para usuários, conversas, diagnósticos, simulações
- [ ] Sincronização de dados do localStorage para Supabase
- [ ] Backup e recuperação de dados

**Arquivos a criar/modificar**:
- `supabase/migrations/` - Migrações completas
- `services/syncService.ts` - Sincronização localStorage ↔ Supabase
- Modificar serviços existentes para usar Supabase

---

### 5. INTERFACE E UX

#### 5.1 Wizard de Fluxo Completo
**Status**: ⚠️ Existe onboarding, mas não wizard completo

**O que falta**:
- [ ] Wizard que guia usuária do diagnóstico até simulação
- [ ] Navegação entre etapas (diagnóstico → produto → funil → conteúdo → simulação)
- [ ] Indicador de progresso
- [ ] Possibilidade de voltar/avançar entre etapas

**Arquivos a criar/modificar**:
- `components/BusinessWizard.tsx` - Wizard completo
- `components/WizardStep.tsx` - Componente de etapa
- Modificar `App.tsx` para incluir wizard

---

#### 5.2 Visualizações e Gráficos
**Status**: ❌ Não implementado

**O que falta**:
- [ ] Gráficos de simulação financeira
- [ ] Visualização de funil (diagrama)
- [ ] Dashboard com métricas
- [ ] Bibliotecas de visualização (Chart.js, Recharts, etc.)

**Arquivos a criar**:
- `components/Charts/` - Componentes de gráficos
- `services/chartService.ts` - Lógica de gráficos
- Adicionar dependências de gráficos no `package.json`

---

#### 5.3 Melhorias de Performance
**Status**: ⚠️ Básico implementado

**O que falta**:
- [ ] Code splitting por rota/agente
- [ ] Lazy loading de componentes pesados
- [ ] Otimização de imagens
- [ ] Preload de recursos críticos

**Arquivos a modificar**:
- `vite.config.ts` - Configuração de code splitting
- Componentes para lazy loading

---

### 6. FUNCIONALIDADES ADICIONAIS

#### 6.1 Busca e Filtros
**Status**: ⚠️ Básico implementado

**O que falta**:
- [ ] Busca avançada nas conversas
- [ ] Filtros por agente, data, tipo de conteúdo
- [ ] Tags e categorização de conversas

**Arquivos a criar/modificar**:
- `components/SearchBar.tsx` - Busca avançada
- `services/searchService.ts` - Lógica de busca
- Modificar `ConversationsList.tsx` para incluir filtros

---

#### 6.2 Colaboração (Opcional)
**Status**: ❌ Não implementado

**O que falta** (se necessário):
- [ ] Compartilhamento de conversas/funis
- [ ] Comentários e anotações
- [ ] Versões de documentos

---

## 📊 PRIORIZAÇÃO SUGERIDA

### Fase 1: Essencial (MVP Completo)
1. ✅ Diagnóstico de Perfil A/B automatizado
2. ✅ Recomendação de Produto/Oferta
3. ✅ Rascunho de Funil estruturado
4. ✅ Service Worker e Manifest PWA básico
5. ✅ Simulação Financeira básica

### Fase 2: Melhorias (1-2 semanas)
1. ✅ Geração de conteúdo específico (roteiros, posts)
2. ✅ RAG básico com conteúdo do curso
3. ✅ Visualizações e gráficos
4. ✅ Wizard de fluxo completo
5. ✅ Instalação PWA

### Fase 3: Avançado (1 mês+)
1. ✅ Backend completo (se necessário)
2. ✅ Aprendizado contínuo
3. ✅ Notificações push
4. ✅ Sincronização multi-dispositivo
5. ✅ Analytics avançado

---

## 🛠️ STACK RECOMENDADO PARA COMPLETAR

### Dependências a Adicionar
```json
{
  "dependencies": {
    // PWA
    "workbox-precaching": "^7.0.0",
    "workbox-routing": "^7.0.0",
    "workbox-strategies": "^7.0.0",
    
    // Gráficos
    "recharts": "^2.10.0",
    
    // RAG (se usar Supabase Vector)
    "@supabase/supabase-js": "^2.87.1", // já existe
    
    // Utilitários
    "date-fns": "^3.0.0",
    "lodash": "^4.17.21"
  },
  "devDependencies": {
    // PWA Build
    "vite-plugin-pwa": "^0.17.0",
    
    // Types
    "@types/lodash": "^4.14.202"
  }
}
```

---

## 📝 NOTAS IMPORTANTES

1. **Mobile-First**: Todas as novas interfaces devem seguir o design mobile-first já estabelecido
2. **TypeScript Strict**: Nunca usar `any`, sempre tipar corretamente
3. **Acessibilidade**: Garantir WCAG AAA (contraste, touch targets, etc.)
4. **Performance**: Manter app leve e rápido (<3s carregamento)
5. **Offline**: Service Worker deve permitir uso básico offline

---

## 🎯 PRÓXIMOS PASSOS IMEDIATOS

1. **Criar Service Worker e Manifest PWA** (base para PWA completo)
2. **Implementar Diagnóstico de Perfil A/B** (funcionalidade core)
3. **Criar Simulador Financeiro** (diferencial importante)
4. **Estruturar Geração de Funil** (melhorar o que já existe)
5. **Adicionar RAG básico** (melhorar qualidade das respostas)

---

**Última atualização**: Dezembro 2024
**Status do Projeto**: ~40% completo em relação aos requisitos
