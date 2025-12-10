import { Message } from '../types';
import { getCurrentUser } from './authService';

export interface Thread {
  id: string;
  title: string;
  lastMessage: string;
  lastMessageTime: number;
  messageCount: number;
  createdAt: number;
  messages: Message[];
}

/**
 * Gera um título para a thread baseado nas primeiras mensagens
 */
const generateThreadTitle = (messages: Message[]): string => {
  const firstUserMessage = messages.find(m => m.sender === 'user');
  if (firstUserMessage?.text) {
    const text = firstUserMessage.text.trim();
    // Pegar primeiras palavras (máximo 50 caracteres)
    if (text.length <= 50) return text;
    return text.substring(0, 47) + '...';
  }
  return 'Nova conversa';
};

/**
 * Obtém a chave de storage para threads do usuário
 */
const getThreadsStorageKey = (): string => {
  const user = getCurrentUser();
  return user ? `erl_lia_threads_${user.email}` : 'erl_lia_threads_v1';
};

/**
 * Obtém a chave de storage para uma thread específica
 */
const getThreadStorageKey = (threadId: string): string => {
  const user = getCurrentUser();
  return user ? `erl_lia_thread_${threadId}_${user.email}` : `erl_lia_thread_${threadId}_v1`;
};

/**
 * Obtém todas as threads do usuário
 */
export const getAllThreads = (): Thread[] => {
  const storageKey = getThreadsStorageKey();
  const saved = localStorage.getItem(storageKey);
  if (!saved) return [];
  
  try {
    const threads: Thread[] = JSON.parse(saved);
    // Carregar mensagens de cada thread
    return threads.map(thread => ({
      ...thread,
      messages: getThreadMessages(thread.id),
    }));
  } catch {
    return [];
  }
};

/**
 * Obtém mensagens de uma thread específica
 */
export const getThreadMessages = (threadId: string): Message[] => {
  const storageKey = getThreadStorageKey(threadId);
  const saved = localStorage.getItem(storageKey);
  if (!saved) return [];
  
  try {
    return JSON.parse(saved);
  } catch {
    return [];
  }
};

/**
 * Salva mensagens de uma thread
 */
export const saveThreadMessages = (threadId: string, messages: Message[]): void => {
  const storageKey = getThreadStorageKey(threadId);
  localStorage.setItem(storageKey, JSON.stringify(messages));
  
  // Atualizar metadados da thread
  updateThreadMetadata(threadId, messages);
};

/**
 * Atualiza metadados da thread (título, última mensagem, etc)
 */
const updateThreadMetadata = (threadId: string, messages: Message[]): void => {
  const threads = getAllThreads();
  const existingIndex = threads.findIndex(t => t.id === threadId);
  
  const lastMessage = messages[messages.length - 1];
  const threadData: Thread = {
    id: threadId,
    title: generateThreadTitle(messages),
    lastMessage: lastMessage?.text?.substring(0, 100) || '',
    lastMessageTime: lastMessage?.timestamp || Date.now(),
    messageCount: messages.length,
    createdAt: existingIndex >= 0 ? threads[existingIndex].createdAt : Date.now(),
    messages: [],
  };
  
  if (existingIndex >= 0) {
    threads[existingIndex] = threadData;
  } else {
    threads.unshift(threadData);
  }
  
  // Ordenar por última mensagem (mais recente primeiro)
  threads.sort((a, b) => b.lastMessageTime - a.lastMessageTime);
  
  // Salvar apenas metadados (sem mensagens completas)
  const threadsMetadata = threads.map(t => ({
    id: t.id,
    title: t.title,
    lastMessage: t.lastMessage,
    lastMessageTime: t.lastMessageTime,
    messageCount: t.messageCount,
    createdAt: t.createdAt,
  }));
  
  const storageKey = getThreadsStorageKey();
  localStorage.setItem(storageKey, JSON.stringify(threadsMetadata));
};

/**
 * Cria uma nova thread
 */
export const createThread = (): Thread => {
  const threadId = `thread_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const thread: Thread = {
    id: threadId,
    title: 'Nova conversa',
    lastMessage: '',
    lastMessageTime: Date.now(),
    messageCount: 0,
    createdAt: Date.now(),
    messages: [],
  };
  
  updateThreadMetadata(threadId, []);
  return thread;
};

/**
 * Deleta uma thread
 */
export const deleteThread = (threadId: string): void => {
  // Remover mensagens
  const storageKey = getThreadStorageKey(threadId);
  localStorage.removeItem(storageKey);
  
  // Remover dos metadados
  const threads = getAllThreads();
  const filtered = threads.filter(t => t.id !== threadId);
  
  const threadsMetadata = filtered.map(t => ({
    id: t.id,
    title: t.title,
    lastMessage: t.lastMessage,
    lastMessageTime: t.lastMessageTime,
    messageCount: t.messageCount,
    createdAt: t.createdAt,
  }));
  
  const storageKeyMeta = getThreadsStorageKey();
  localStorage.setItem(storageKeyMeta, JSON.stringify(threadsMetadata));
};

/**
 * Migra histórico antigo para o novo sistema de threads
 */
export const migrateOldHistory = (): string | null => {
  const user = getCurrentUser();
  const oldStorageKey = user ? `erl_lia_chat_history_${user.email}` : 'erl_lia_chat_history_v1';
  const oldHistory = localStorage.getItem(oldStorageKey);
  
  if (!oldHistory) return null;
  
  try {
    const messages: Message[] = JSON.parse(oldHistory);
    if (messages.length === 0) return null;
    
    // Criar thread com histórico antigo
    const threadId = `thread_migrated_${Date.now()}`;
    saveThreadMessages(threadId, messages);
    
    // Limpar histórico antigo
    localStorage.removeItem(oldStorageKey);
    
    return threadId;
  } catch {
    return null;
  }
};
