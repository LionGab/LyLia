# Funil ERL - Lyla.IA

Assistente de IA especialista no Método ERL (Entrada, Relacionamento, Lucro) para criação de produtos digitais e estratégias de vendas.

## Funcionalidades

- **Método ERL**: Múltiplos agentes especializados (Lyla.IA, MED Engine, Copywriter, etc.)
- **Agentes Inteligentes**: Cada agente com expertise específica
- **Autenticação**: Sistema simples de login por email
- **Histórico**: Busca e organização de conversas

## Configuração Rápida

### 1. Instalar Dependências

```bash
npm install
```

### 2. Configurar Chave da API Gemini

Crie um arquivo `.env.local` na raiz do projeto:

```
VITE_GEMINI_API_KEY=sua_chave_aqui
```

**Obtenha sua chave em:** https://makersuite.google.com/app/apikey

### 3. Configurar Emails Permitidos

Edite o arquivo `constants/auth.ts` e adicione os emails autorizados (máximo 10):

```typescript
export const ALLOWED_EMAILS: string[] = [
  "seu@email.com",
  // Adicione até 10 emails
];
```

### 4. Executar o Projeto

```bash
npm run dev
```

O aplicativo estará disponível em `http://localhost:5173`

## Agentes Disponíveis

- **Lyla.IA** - Mentora de Negócios (Método ERL)
- **MED Engine** - Motor de Execução Digital
- **Imersão MED** - Suporte completo para imersão
- **Copywriter** - Especialista em copywriting
- **Arquiteto de Produtos** - Criação de produtos digitais
- **Arquiteto de Campanha** - Ideias centrais de campanha
- **Arquiteto de Oferta** - Ofertas irresistíveis

## Estrutura Simplificada

```
├── components/          # Componentes React
├── services/            # Lógica de negócio
├── constants/           # Prompts e configurações
├── types/              # Definições TypeScript
└── config/             # Configuração de agentes
```

## Build para Produção

```bash
npm run build
npm run preview
```
