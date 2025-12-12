import { supabase } from './client';
import { logger } from '../logger';
import type {
  User,
  OnboardingDataDB,
  OnboardingDataInsert,
  OnboardingDataUpdate,
  Conversation,
  ConversationInsert,
  Message,
  MessageInsert,
  Deliverable,
  DeliverableInsert,
  QuestionAnswer,
  QuestionAnswerInsert,
} from './types';

// =====================================================
// USERS
// =====================================================

/**
 * Busca usuário por email
 */
export const getUserByEmail = async (email: string): Promise<User | null> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // Não encontrado
        return null;
      }
      throw error;
    }

    return data;
  } catch (error) {
    logger.error('Erro ao buscar usuário por email', { email, error });
    throw error;
  }
};

/**
 * Busca usuário por ID
 */
export const getUserById = async (userId: string): Promise<User | null> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw error;
    }

    return data;
  } catch (error) {
    logger.error('Erro ao buscar usuário por ID', { userId, error });
    throw error;
  }
};

// =====================================================
// ONBOARDING DATA
// =====================================================

/**
 * Salva ou atualiza dados de onboarding do usuário
 */
export const upsertOnboardingData = async (
  userId: string,
  data: OnboardingDataInsert
): Promise<OnboardingDataDB> => {
  try {
    const { data: result, error } = await supabase
      .from('onboarding_data')
      .upsert(
        {
          user_id: userId,
          ...data,
        },
        {
          onConflict: 'user_id',
        }
      )
      .select()
      .single();

    if (error) throw error;

    logger.debug('Dados de onboarding salvos', { userId });
    return result;
  } catch (error) {
    logger.error('Erro ao salvar onboarding', { userId, error });
    throw error;
  }
};

/**
 * Busca dados de onboarding do usuário
 */
export const getOnboardingData = async (
  userId: string
): Promise<OnboardingDataDB | null> => {
  try {
    const { data, error } = await supabase
      .from('onboarding_data')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw error;
    }

    return data;
  } catch (error) {
    logger.error('Erro ao buscar onboarding', { userId, error });
    throw error;
  }
};

/**
 * Atualiza parcialmente dados de onboarding
 */
export const updateOnboardingData = async (
  userId: string,
  updates: OnboardingDataUpdate
): Promise<OnboardingDataDB> => {
  try {
    const { data, error } = await supabase
      .from('onboarding_data')
      .update(updates)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;

    logger.debug('Onboarding atualizado', { userId, updates });
    return data;
  } catch (error) {
    logger.error('Erro ao atualizar onboarding', { userId, error });
    throw error;
  }
};

// =====================================================
// CONVERSATIONS
// =====================================================

/**
 * Cria nova conversa
 */
export const createConversation = async (
  conversationData: ConversationInsert
): Promise<Conversation> => {
  try {
    const { data, error } = await supabase
      .from('conversations')
      .insert(conversationData)
      .select()
      .single();

    if (error) throw error;

    logger.debug('Conversa criada', {
      conversationId: data.id,
      agentId: data.agent_id,
    });
    return data;
  } catch (error) {
    logger.error('Erro ao criar conversa', { conversationData, error });
    throw error;
  }
};

/**
 * Lista conversas do usuário
 */
export const getConversations = async (
  userId: string,
  limit: number = 50
): Promise<Conversation[]> => {
  try {
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return data || [];
  } catch (error) {
    logger.error('Erro ao listar conversas', { userId, error });
    throw error;
  }
};

/**
 * Busca conversa por ID
 */
export const getConversation = async (
  conversationId: string
): Promise<Conversation | null> => {
  try {
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('id', conversationId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw error;
    }

    return data;
  } catch (error) {
    logger.error('Erro ao buscar conversa', { conversationId, error });
    throw error;
  }
};

/**
 * Atualiza título da conversa
 */
export const updateConversationTitle = async (
  conversationId: string,
  title: string
): Promise<void> => {
  try {
    const { error } = await supabase
      .from('conversations')
      .update({ title })
      .eq('id', conversationId);

    if (error) throw error;

    logger.debug('Título da conversa atualizado', { conversationId, title });
  } catch (error) {
    logger.error('Erro ao atualizar título da conversa', {
      conversationId,
      error,
    });
    throw error;
  }
};

// =====================================================
// MESSAGES
// =====================================================

/**
 * Adiciona mensagem à conversa
 */
export const addMessage = async (
  messageData: MessageInsert
): Promise<Message> => {
  try {
    const { data, error } = await supabase
      .from('messages')
      .insert(messageData)
      .select()
      .single();

    if (error) throw error;

    logger.debug('Mensagem adicionada', {
      conversationId: data.conversation_id,
      sender: data.sender,
    });
    return data;
  } catch (error) {
    logger.error('Erro ao adicionar mensagem', { messageData, error });
    throw error;
  }
};

/**
 * Lista mensagens de uma conversa
 */
export const getMessages = async (
  conversationId: string,
  limit: number = 100
): Promise<Message[]> => {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })
      .limit(limit);

    if (error) throw error;

    return data || [];
  } catch (error) {
    logger.error('Erro ao listar mensagens', { conversationId, error });
    throw error;
  }
};

// =====================================================
// DELIVERABLES
// =====================================================

/**
 * Cria um entregável (produto, funil, plano de conteúdo, etc.)
 */
export const createDeliverable = async (
  deliverableData: DeliverableInsert
): Promise<Deliverable> => {
  try {
    const { data, error } = await supabase
      .from('deliverables')
      .insert(deliverableData)
      .select()
      .single();

    if (error) throw error;

    logger.debug('Entregável criado', {
      deliverableId: data.id,
      type: data.type,
    });
    return data;
  } catch (error) {
    logger.error('Erro ao criar entregável', { deliverableData, error });
    throw error;
  }
};

/**
 * Lista entregáveis do usuário
 */
export const getDeliverables = async (
  userId: string,
  type?: string,
  limit: number = 50
): Promise<Deliverable[]> => {
  try {
    let query = supabase
      .from('deliverables')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (type) {
      query = query.eq('type', type);
    }

    const { data, error } = await query;

    if (error) throw error;

    return data || [];
  } catch (error) {
    logger.error('Erro ao listar entregáveis', { userId, type, error });
    throw error;
  }
};

/**
 * Busca entregável por ID
 */
export const getDeliverable = async (
  deliverableId: string
): Promise<Deliverable | null> => {
  try {
    const { data, error } = await supabase
      .from('deliverables')
      .select('*')
      .eq('id', deliverableId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw error;
    }

    return data;
  } catch (error) {
    logger.error('Erro ao buscar entregável', { deliverableId, error });
    throw error;
  }
};

// =====================================================
// QUESTION ANSWERS
// =====================================================

/**
 * Salva pergunta feita pelo agente
 */
export const saveQuestion = async (
  questionData: QuestionAnswerInsert
): Promise<QuestionAnswer> => {
  try {
    const { data, error } = await supabase
      .from('question_answers')
      .insert(questionData)
      .select()
      .single();

    if (error) throw error;

    logger.debug('Pergunta salva', { questionId: data.id });
    return data;
  } catch (error) {
    logger.error('Erro ao salvar pergunta', { questionData, error });
    throw error;
  }
};

/**
 * Atualiza resposta do usuário a uma pergunta
 */
export const updateQuestionAnswer = async (
  questionId: string,
  answer: string
): Promise<void> => {
  try {
    const { error } = await supabase
      .from('question_answers')
      .update({
        answer,
        answered_at: new Date().toISOString(),
      })
      .eq('id', questionId);

    if (error) throw error;

    logger.debug('Resposta atualizada', { questionId });
  } catch (error) {
    logger.error('Erro ao atualizar resposta', { questionId, error });
    throw error;
  }
};

/**
 * Lista perguntas de uma conversa
 */
export const getQuestionsByConversation = async (
  conversationId: string
): Promise<QuestionAnswer[]> => {
  try {
    const { data, error } = await supabase
      .from('question_answers')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) throw error;

    return data || [];
  } catch (error) {
    logger.error('Erro ao listar perguntas', { conversationId, error });
    throw error;
  }
};
