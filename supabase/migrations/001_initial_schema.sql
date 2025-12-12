-- =====================================================
-- FUNIL ERL - LYLA.IA - SCHEMA INICIAL DO SUPABASE
-- =====================================================
-- Sistema para salvar dados de 6 alunas e suas conversas

-- =====================================================
-- 1. TABELA: users (6 alunas)
-- =====================================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  nome TEXT NOT NULL,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índice para busca por email
CREATE INDEX idx_users_email ON users(email);

-- =====================================================
-- 2. TABELA: onboarding_data
-- =====================================================
CREATE TABLE IF NOT EXISTS onboarding_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Informações básicas
  profissao TEXT,
  habilidade_principal TEXT,
  oferta_atual TEXT,
  preco_atual DECIMAL(10, 2),

  -- Preferências
  tempo_disponivel TEXT,
  plataforma_principal TEXT,
  formato_preferido TEXT CHECK (formato_preferido IN ('1:1', 'grupo', 'gravado', 'híbrido')),

  -- Metas
  meta_faturamento DECIMAL(10, 2),
  prazo_meta TEXT,

  -- Contexto do negócio
  publico_alvo TEXT,
  problema_principal TEXT,
  diferencial TEXT,

  -- Personalização
  template_id TEXT,
  estilo_resposta TEXT,
  observacoes TEXT,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Garantir apenas 1 onboarding por usuário
  UNIQUE(user_id)
);

-- Índice para busca por user_id
CREATE INDEX idx_onboarding_user_id ON onboarding_data(user_id);

-- =====================================================
-- 3. TABELA: conversations (threads/sessões)
-- =====================================================
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  agent_id TEXT NOT NULL, -- 'lia-erl', 'copywriter', 'arquiteto-produto', etc.
  title TEXT NOT NULL DEFAULT 'Nova Conversa',

  -- Metadata
  is_active BOOLEAN DEFAULT true,
  message_count INTEGER DEFAULT 0,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_conversations_user_id ON conversations(user_id);
CREATE INDEX idx_conversations_agent_id ON conversations(agent_id);
CREATE INDEX idx_conversations_created_at ON conversations(created_at DESC);

-- =====================================================
-- 4. TABELA: messages (mensagens das conversas)
-- =====================================================
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,

  sender TEXT NOT NULL CHECK (sender IN ('user', 'ai')),
  text TEXT NOT NULL,

  -- Metadata opcional
  metadata JSONB DEFAULT '{}'::jsonb, -- Para salvar imagens, áudio, etc.

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);

-- =====================================================
-- 5. TABELA: deliverables (entregáveis criados)
-- =====================================================
-- Salva produtos, funis, planos de conteúdo, análises de copy
CREATE TABLE IF NOT EXISTS deliverables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  type TEXT NOT NULL CHECK (type IN ('product', 'funnel', 'content_plan', 'copywriting', 'campaign', 'offer')),

  -- Dados do entregável em JSON
  data JSONB NOT NULL,

  -- Metadata
  title TEXT,
  description TEXT,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_deliverables_user_id ON deliverables(user_id);
CREATE INDEX idx_deliverables_conversation_id ON deliverables(conversation_id);
CREATE INDEX idx_deliverables_type ON deliverables(type);
CREATE INDEX idx_deliverables_created_at ON deliverables(created_at DESC);

-- =====================================================
-- 6. TABELA: question_answers
-- =====================================================
-- Salva pares de pergunta-resposta feitos pelos agentes
CREATE TABLE IF NOT EXISTS question_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  agent_id TEXT NOT NULL,

  question TEXT NOT NULL,
  answer TEXT,
  answered_at TIMESTAMP WITH TIME ZONE,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_qa_user_id ON question_answers(user_id);
CREATE INDEX idx_qa_conversation_id ON question_answers(conversation_id);
CREATE INDEX idx_qa_agent_id ON question_answers(agent_id);

-- =====================================================
-- 7. FUNÇÕES DE TRIGGERS
-- =====================================================

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para users
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger para onboarding_data
CREATE TRIGGER update_onboarding_updated_at
  BEFORE UPDATE ON onboarding_data
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger para conversations
CREATE TRIGGER update_conversations_updated_at
  BEFORE UPDATE ON conversations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger para deliverables
CREATE TRIGGER update_deliverables_updated_at
  BEFORE UPDATE ON deliverables
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Função para incrementar message_count em conversations
CREATE OR REPLACE FUNCTION increment_conversation_message_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE conversations
  SET message_count = message_count + 1,
      updated_at = NOW()
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para incrementar contador de mensagens
CREATE TRIGGER increment_message_count
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION increment_conversation_message_count();

-- =====================================================
-- 8. ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE deliverables ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_answers ENABLE ROW LEVEL SECURITY;

-- Políticas para users (SELECT público, INSERT/UPDATE/DELETE apenas para o próprio usuário)
CREATE POLICY "Users podem ver todos os usuários"
  ON users FOR SELECT
  USING (true);

CREATE POLICY "Users podem atualizar apenas próprio perfil"
  ON users FOR UPDATE
  USING (auth.uid() = id);

-- Políticas para onboarding_data
CREATE POLICY "Users podem ver apenas próprio onboarding"
  ON onboarding_data FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users podem inserir próprio onboarding"
  ON onboarding_data FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users podem atualizar próprio onboarding"
  ON onboarding_data FOR UPDATE
  USING (user_id = auth.uid());

-- Políticas para conversations
CREATE POLICY "Users podem ver apenas próprias conversas"
  ON conversations FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users podem criar próprias conversas"
  ON conversations FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users podem atualizar próprias conversas"
  ON conversations FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users podem deletar próprias conversas"
  ON conversations FOR DELETE
  USING (user_id = auth.uid());

-- Políticas para messages
CREATE POLICY "Users podem ver mensagens de próprias conversas"
  ON messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
      AND conversations.user_id = auth.uid()
    )
  );

CREATE POLICY "Users podem criar mensagens em próprias conversas"
  ON messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = conversation_id
      AND conversations.user_id = auth.uid()
    )
  );

-- Políticas para deliverables
CREATE POLICY "Users podem ver próprios entregáveis"
  ON deliverables FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users podem criar próprios entregáveis"
  ON deliverables FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users podem atualizar próprios entregáveis"
  ON deliverables FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users podem deletar próprios entregáveis"
  ON deliverables FOR DELETE
  USING (user_id = auth.uid());

-- Políticas para question_answers
CREATE POLICY "Users podem ver próprias Q&A"
  ON question_answers FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users podem criar próprias Q&A"
  ON question_answers FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- =====================================================
-- 9. VIEWS ÚTEIS
-- =====================================================

-- View: Últimas conversas de cada usuário com contagem de mensagens
CREATE OR REPLACE VIEW latest_conversations_summary AS
SELECT
  c.id,
  c.user_id,
  u.nome as user_nome,
  u.email as user_email,
  c.agent_id,
  c.title,
  c.message_count,
  c.is_active,
  c.created_at,
  c.updated_at
FROM conversations c
JOIN users u ON u.id = c.user_id
ORDER BY c.updated_at DESC;

-- View: Estatísticas por usuário
CREATE OR REPLACE VIEW user_stats AS
SELECT
  u.id as user_id,
  u.nome,
  u.email,
  COUNT(DISTINCT c.id) as total_conversations,
  COUNT(DISTINCT m.id) as total_messages,
  COUNT(DISTINCT d.id) as total_deliverables,
  COUNT(DISTINCT CASE WHEN d.type = 'product' THEN d.id END) as total_products,
  COUNT(DISTINCT CASE WHEN d.type = 'funnel' THEN d.id END) as total_funnels,
  COUNT(DISTINCT CASE WHEN d.type = 'content_plan' THEN d.id END) as total_content_plans,
  MAX(c.updated_at) as last_activity
FROM users u
LEFT JOIN conversations c ON c.user_id = u.id
LEFT JOIN messages m ON m.conversation_id = c.id
LEFT JOIN deliverables d ON d.user_id = u.id
GROUP BY u.id, u.nome, u.email;

-- =====================================================
-- 10. SEED DATA (6 ALUNAS - EXEMPLO)
-- =====================================================
-- IMPORTANTE: Substituir pelos emails reais das 6 alunas

-- Nota: Esses são dados de exemplo.
-- O usuário deve fornecer os emails reais das 6 alunas.

/*
INSERT INTO users (email, nome, ativo) VALUES
  ('aluna1@example.com', 'Aluna 1', true),
  ('aluna2@example.com', 'Aluna 2', true),
  ('aluna3@example.com', 'Aluna 3', true),
  ('aluna4@example.com', 'Aluna 4', true),
  ('aluna5@example.com', 'Aluna 5', true),
  ('aluna6@example.com', 'Aluna 6', true);
*/

-- =====================================================
-- FIM DO SCHEMA
-- =====================================================
