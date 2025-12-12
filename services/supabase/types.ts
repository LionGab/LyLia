/**
 * Tipos do banco de dados Supabase
 * Baseados no schema criado em supabase/migrations/001_initial_schema.sql
 */

export interface User {
  id: string;
  email: string;
  nome: string;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export interface OnboardingDataDB {
  id: string;
  user_id: string;

  // Informações básicas
  profissao?: string;
  habilidade_principal?: string;
  oferta_atual?: string;
  preco_atual?: number;

  // Preferências
  tempo_disponivel?: string;
  plataforma_principal?: string;
  formato_preferido?: '1:1' | 'grupo' | 'gravado' | 'híbrido';

  // Metas
  meta_faturamento?: number;
  prazo_meta?: string;

  // Contexto do negócio
  publico_alvo?: string;
  problema_principal?: string;
  diferencial?: string;

  // Personalização
  template_id?: string;
  estilo_resposta?: string;
  observacoes?: string;

  created_at: string;
  updated_at: string;
}

export interface Conversation {
  id: string;
  user_id: string;
  agent_id: string;
  title: string;
  is_active: boolean;
  message_count: number;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender: 'user' | 'ai';
  text: string;
  metadata?: Record<string, any>;
  created_at: string;
}

export type DeliverableType =
  | 'product'
  | 'funnel'
  | 'content_plan'
  | 'copywriting'
  | 'campaign'
  | 'offer';

export interface Deliverable {
  id: string;
  conversation_id: string;
  user_id: string;
  type: DeliverableType;
  data: Record<string, any>;
  title?: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface QuestionAnswer {
  id: string;
  conversation_id: string;
  user_id: string;
  agent_id: string;
  question: string;
  answer?: string;
  answered_at?: string;
  created_at: string;
}

// =====================================================
// TIPOS PARA INSERÇÃO (sem campos gerados automaticamente)
// =====================================================

export type UserInsert = Omit<User, 'id' | 'created_at' | 'updated_at'>;

export type OnboardingDataInsert = Omit<
  OnboardingDataDB,
  'id' | 'created_at' | 'updated_at'
>;

export type OnboardingDataUpdate = Partial<OnboardingDataInsert>;

export type ConversationInsert = Omit<
  Conversation,
  'id' | 'created_at' | 'updated_at' | 'is_active' | 'message_count'
> & {
  is_active?: boolean;
};

export type MessageInsert = Omit<Message, 'id' | 'created_at'>;

export type DeliverableInsert = Omit<Deliverable, 'id' | 'created_at' | 'updated_at'>;

export type QuestionAnswerInsert = Omit<QuestionAnswer, 'id' | 'created_at'>;
