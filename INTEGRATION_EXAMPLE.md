# Exemplo de Integração Supabase nos Componentes React

## 📝 Como Integrar o Salvamento no Supabase

Este guia mostra como modificar os componentes existentes para salvar dados no Supabase.

---

## 🎯 Fluxo de Integração

```
1. Usuária abre o chat → Criar conversa no Supabase
2. Usuária envia mensagem → Salvar mensagem
3. IA responde → Salvar resposta
4. IA faz pergunta → Salvar em question_answers
5. IA cria produto/funil → Salvar em deliverables
6. Dados coletados → Salvar em onboarding_data
```

---

## 📂 Arquivo: `components/ChatInterface.tsx`

### Modificações Necessárias

#### 1. Importar Funções do Supabase

```typescript
import {
  createConversation,
  addMessage,
  getMessages,
  getUserByEmail,
  upsertOnboardingData,
  createDeliverable,
  saveQuestion,
  updateQuestionAnswer
} from '@/services/supabase/database';
import type { Conversation, Message as DBMessage } from '@/services/supabase/types';
```

#### 2. Adicionar Estado para Conversa Atual

```typescript
const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
const [currentUser, setCurrentUser] = useState<User | null>(null);
```

#### 3. Inicializar Conversa ao Abrir Chat

```typescript
useEffect(() => {
  const initializeConversation = async () => {
    try {
      // 1. Obter usuária atual (pode vir de auth context futuramente)
      // Por enquanto, use um email fixo ou do contexto
      const userEmail = 'aluna1@example.com'; // TODO: Pegar do auth context

      const user = await getUserByEmail(userEmail);
      if (!user) {
        console.error('Usuária não encontrada');
        return;
      }
      setCurrentUser(user);

      // 2. Criar nova conversa
      const conversation = await createConversation({
        user_id: user.id,
        agent_id: selectedAgent.id, // 'lia-erl', 'arquiteto-produto', etc.
        title: `Conversa com ${selectedAgent.name}`
      });
      setCurrentConversation(conversation);

      // 3. Carregar mensagens anteriores (se for conversa existente)
      const previousMessages = await getMessages(conversation.id);
      if (previousMessages.length > 0) {
        // Converter mensagens do banco para formato do componente
        const formattedMessages = previousMessages.map(msg => ({
          id: msg.id,
          sender: msg.sender,
          text: msg.text,
          timestamp: new Date(msg.created_at)
        }));
        setMessages(formattedMessages);
      }
    } catch (error) {
      console.error('Erro ao inicializar conversa:', error);
    }
  };

  if (selectedAgent) {
    initializeConversation();
  }
}, [selectedAgent]);
```

#### 4. Salvar Mensagem da Usuária

```typescript
const handleSendMessage = async (text: string) => {
  if (!text.trim() || !currentConversation || !currentUser) return;

  try {
    // 1. Salvar mensagem da usuária no Supabase
    const userMessage = await addMessage({
      conversation_id: currentConversation.id,
      sender: 'user',
      text: text
    });

    // 2. Adicionar ao estado local (UI)
    setMessages(prev => [...prev, {
      id: userMessage.id,
      sender: 'user',
      text: text,
      timestamp: new Date()
    }]);

    // 3. Enviar para IA e aguardar resposta
    setIsTyping(true);
    const aiResponse = await sendToAI(text, currentConversation.id, currentUser.id);
    setIsTyping(false);

    // 4. Salvar resposta da IA
    const aiMessage = await addMessage({
      conversation_id: currentConversation.id,
      sender: 'ai',
      text: aiResponse
    });

    // 5. Adicionar ao estado local
    setMessages(prev => [...prev, {
      id: aiMessage.id,
      sender: 'ai',
      text: aiResponse,
      timestamp: new Date()
    }]);

    // 6. Processar resposta da IA (detectar produtos, perguntas, etc.)
    await processAIResponse(aiResponse, currentConversation.id, currentUser.id);

  } catch (error) {
    console.error('Erro ao enviar mensagem:', error);
  }
};
```

#### 5. Processar Resposta da IA (Detectar Entregáveis)

```typescript
const processAIResponse = async (
  aiResponse: string,
  conversationId: string,
  userId: string
) => {
  try {
    // Detectar se a IA criou um produto
    if (aiResponse.includes('🎯 OPÇÃO 1:') || aiResponse.includes('PRODUTO:')) {
      // Extrair dados do produto (pode usar regex ou parsing)
      const productData = extractProductFromResponse(aiResponse);

      await createDeliverable({
        conversation_id: conversationId,
        user_id: userId,
        type: 'product',
        title: productData.nome,
        data: productData
      });
    }

    // Detectar se a IA criou um funil
    if (aiResponse.includes('ENTRADA') && aiResponse.includes('RELACIONAMENTO')) {
      const funnelData = extractFunnelFromResponse(aiResponse);

      await createDeliverable({
        conversation_id: conversationId,
        user_id: userId,
        type: 'funnel',
        title: 'Funil de Vendas',
        data: funnelData
      });
    }

    // Detectar se a IA fez uma pergunta
    const questions = detectQuestions(aiResponse);
    for (const question of questions) {
      await saveQuestion({
        conversation_id: conversationId,
        user_id: userId,
        agent_id: selectedAgent.id,
        question: question
      });
    }

  } catch (error) {
    console.error('Erro ao processar resposta da IA:', error);
  }
};

// Funções auxiliares de extração
const extractProductFromResponse = (response: string) => {
  // TODO: Implementar parsing do produto
  // Pode usar regex ou splitting de texto
  return {
    nome: 'Produto Extraído',
    promessa: '...',
    formato: '...',
    preco: 0
  };
};

const extractFunnelFromResponse = (response: string) => {
  // TODO: Implementar parsing do funil
  return {
    entrada: {},
    relacionamento: {},
    lucro: {}
  };
};

const detectQuestions = (response: string): string[] => {
  // Detectar perguntas (linhas que terminam com ?)
  const lines = response.split('\n');
  return lines.filter(line => line.trim().endsWith('?'));
};
```

#### 6. Salvar Dados de Onboarding Conforme Usuária Responde

```typescript
const updateOnboardingFromConversation = async (
  userId: string,
  conversationHistory: Message[]
) => {
  try {
    // Analisar histórico da conversa e extrair informações
    const onboardingUpdates: Partial<OnboardingDataInsert> = {};

    // Exemplo: detectar profissão
    const profissaoMsg = conversationHistory.find(msg =>
      msg.sender === 'user' && msg.text.toLowerCase().includes('nutricionista')
    );
    if (profissaoMsg) {
      onboardingUpdates.profissao = 'Nutricionista';
    }

    // Exemplo: detectar público-alvo
    const publicoMsg = conversationHistory.find(msg =>
      msg.sender === 'user' && msg.text.includes('mulheres')
    );
    if (publicoMsg) {
      onboardingUpdates.publico_alvo = publicoMsg.text;
    }

    // Salvar no banco
    if (Object.keys(onboardingUpdates).length > 0) {
      await upsertOnboardingData(userId, onboardingUpdates as OnboardingDataInsert);
    }
  } catch (error) {
    console.error('Erro ao atualizar onboarding:', error);
  }
};
```

---

## 📂 Arquivo: `hooks/useConversation.ts` (Novo - Opcional)

Criar um hook customizado para gerenciar conversas:

```typescript
import { useState, useEffect } from 'react';
import {
  createConversation,
  addMessage,
  getMessages,
  getConversations,
  updateConversationTitle
} from '@/services/supabase/database';
import type { Conversation, Message } from '@/services/supabase/types';

export const useConversation = (userId: string, agentId: string) => {
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Inicializar conversa
  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      try {
        // Criar nova conversa
        const newConv = await createConversation({
          user_id: userId,
          agent_id: agentId,
          title: 'Nova Conversa'
        });
        setConversation(newConv);

        // Carregar mensagens
        const msgs = await getMessages(newConv.id);
        setMessages(msgs);
      } catch (error) {
        console.error('Erro ao inicializar conversa:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (userId && agentId) {
      init();
    }
  }, [userId, agentId]);

  // Adicionar mensagem
  const sendMessage = async (sender: 'user' | 'ai', text: string) => {
    if (!conversation) return;

    try {
      const message = await addMessage({
        conversation_id: conversation.id,
        sender,
        text
      });
      setMessages(prev => [...prev, message]);
      return message;
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      throw error;
    }
  };

  // Atualizar título
  const updateTitle = async (title: string) => {
    if (!conversation) return;

    try {
      await updateConversationTitle(conversation.id, title);
      setConversation(prev => prev ? { ...prev, title } : null);
    } catch (error) {
      console.error('Erro ao atualizar título:', error);
    }
  };

  return {
    conversation,
    messages,
    isLoading,
    sendMessage,
    updateTitle
  };
};
```

### Uso do Hook:

```typescript
function ChatInterface() {
  const currentUser = useCurrentUser(); // Hook de auth
  const selectedAgent = useSelectedAgent(); // Estado do agente atual

  const {
    conversation,
    messages,
    isLoading,
    sendMessage,
    updateTitle
  } = useConversation(currentUser?.id || '', selectedAgent?.id || '');

  const handleSendMessage = async (text: string) => {
    // Enviar mensagem da usuária
    await sendMessage('user', text);

    // Obter resposta da IA
    const aiResponse = await getAIResponse(text);

    // Enviar mensagem da IA
    await sendMessage('ai', aiResponse);
  };

  return (
    <div>
      {isLoading ? <Spinner /> : (
        <>
          <MessageList messages={messages} />
          <MessageInput onSend={handleSendMessage} />
        </>
      )}
    </div>
  );
}
```

---

## 📂 Arquivo: `contexts/AuthContext.tsx` (Futuro)

Quando implementar autenticação:

```typescript
import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/services/supabase/client';
import { getUserByEmail } from '@/services/supabase/database';
import type { User } from '@/services/supabase/types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Verificar sessão ao carregar
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user?.email) {
          const dbUser = await getUserByEmail(session.user.email);
          setUser(dbUser);
        }
      } catch (error) {
        console.error('Erro ao verificar sessão:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();

    // Listener de mudanças de auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user?.email) {
          const dbUser = await getUserByEmail(session.user.email);
          setUser(dbUser);
        } else {
          setUser(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string) => {
    // Magic Link (sem senha)
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: window.location.origin
      }
    });

    if (error) throw error;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
```

---

## 🧪 Teste Rápido

### 1. Teste Manual no Console do Navegador

Abra o console (F12) e execute:

```javascript
// Importar funções
import { getUserByEmail, createConversation, addMessage } from './services/supabase/database';

// 1. Buscar usuária
const user = await getUserByEmail('aluna1@example.com');
console.log('User:', user);

// 2. Criar conversa
const conversation = await createConversation({
  user_id: user.id,
  agent_id: 'lia-erl',
  title: 'Teste de Conversa'
});
console.log('Conversation:', conversation);

// 3. Adicionar mensagens
await addMessage({
  conversation_id: conversation.id,
  sender: 'user',
  text: 'Olá!'
});

await addMessage({
  conversation_id: conversation.id,
  sender: 'ai',
  text: 'Oi! Como posso te ajudar?'
});

console.log('Mensagens adicionadas!');

// 4. Verificar no Supabase Table Editor
// Vá em: Supabase → Table Editor → conversations / messages
```

### 2. Teste Integrado

Crie um componente de teste:

```typescript
// components/TestSupabase.tsx
import { useState } from 'react';
import { getUserByEmail, createConversation, addMessage } from '@/services/supabase/database';

export function TestSupabase() {
  const [result, setResult] = useState<string>('');

  const runTest = async () => {
    try {
      // 1. Buscar usuária
      const user = await getUserByEmail('aluna1@example.com');
      if (!user) {
        setResult('❌ Usuária não encontrada');
        return;
      }

      // 2. Criar conversa
      const conversation = await createConversation({
        user_id: user.id,
        agent_id: 'lia-erl',
        title: 'Teste de Integração'
      });

      // 3. Adicionar mensagens
      await addMessage({
        conversation_id: conversation.id,
        sender: 'user',
        text: 'Teste de mensagem'
      });

      await addMessage({
        conversation_id: conversation.id,
        sender: 'ai',
        text: 'Resposta da IA'
      });

      setResult(`✅ Sucesso! Conversa ID: ${conversation.id}`);
    } catch (error) {
      setResult(`❌ Erro: ${error.message}`);
    }
  };

  return (
    <div className="p-4">
      <h2>Teste de Integração Supabase</h2>
      <button onClick={runTest} className="btn">Executar Teste</button>
      {result && <pre className="mt-4">{result}</pre>}
    </div>
  );
}
```

---

## ✅ Checklist de Integração

- [ ] Importar funções do Supabase no componente
- [ ] Adicionar estado para conversa atual
- [ ] Inicializar conversa ao abrir chat
- [ ] Salvar mensagem da usuária
- [ ] Salvar resposta da IA
- [ ] Detectar e salvar produtos criados
- [ ] Detectar e salvar funis criados
- [ ] Detectar e salvar perguntas
- [ ] Atualizar onboarding_data conforme conversa
- [ ] Testar localmente (console do navegador)
- [ ] Testar no Table Editor do Supabase
- [ ] Deploy e teste em produção

---

## 🚀 Próximos Passos

1. Implementar autenticação (AuthContext)
2. Criar dashboard de conversas
3. Permitir retomar conversas antigas
4. Exportar entregáveis (PDF, JSON)
5. Adicionar busca em conversas
6. Implementar notificações em tempo real (Supabase Realtime)

---

## 📚 Referências

- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)
- [React Query + Supabase](https://supabase.com/docs/guides/getting-started/tutorials/with-react)
- [Supabase Realtime](https://supabase.com/docs/guides/realtime)
