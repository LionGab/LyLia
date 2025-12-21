import {
  LYLA_MESTRE_MED_PROMPT,
  CLAREZA_MED_PROMPT,
  PRODUTO_MED_PROMPT,
  OFERTA_MED_PROMPT,
  ROTEIROS_MED_PROMPT,
  BASTIDORES_MED_PROMPT,
  PLANO_MED_PROMPT,
  IDENTIDADE_PROMPT,
  MENTE_MILIONARIA_PROMPT,
} from '../constants/medModosPrompts';

export type AgentId =
  | 'lyla-mestre'
  | 'clareza-med'
  | 'produto-med'
  | 'oferta-med'
  | 'roteiros-med'
  | 'bastidores-med'
  | 'plano-med'
  | 'identidade'
  | 'mente-milionaria';

export type AgentCategory = 'med';
export type AgentColor = 'purple' | 'orange' | 'blue' | 'green';

export interface AgentConfig {
  id: AgentId;
  name: string;
  title: string;
  description: string;
  category: AgentCategory;
  enabled: boolean;
  systemPrompt: string;
  ui: {
    icon: string;
    color: AgentColor;
  };
}

export const AGENT_REGISTRY: Record<AgentId, AgentConfig> = {
  'lyla-mestre': {
    id: 'lyla-mestre',
    name: 'LYLA Mestre',
    title: 'Estratégia Completa A•B•C',
    description: 'Começar do zero com plano completo em 7 dias',
    category: 'med',
    enabled: true,
    systemPrompt: LYLA_MESTRE_MED_PROMPT,
    ui: {
      icon: '🎯',
      color: 'purple',
    },
  },
  'clareza-med': {
    id: 'clareza-med',
    name: 'Clareza MED',
    title: 'Desbloqueio & Direção',
    description: 'Estou perdida, não sei por onde começar',
    category: 'med',
    enabled: true,
    systemPrompt: CLAREZA_MED_PROMPT,
    ui: {
      icon: '🧠',
      color: 'purple',
    },
  },
  'produto-med': {
    id: 'produto-med',
    name: 'Produto MED',
    title: 'Criadora de Produto Simples',
    description: 'Sei pra quem, mas não sei o quê vender',
    category: 'med',
    enabled: true,
    systemPrompt: PRODUTO_MED_PROMPT,
    ui: {
      icon: '🎁',
      color: 'orange',
    },
  },
  'oferta-med': {
    id: 'oferta-med',
    name: 'Oferta MED',
    title: 'Oferta & Posicionamento',
    description: 'Tenho produto, não sei explicar/vender',
    category: 'med',
    enabled: true,
    systemPrompt: OFERTA_MED_PROMPT,
    ui: {
      icon: '💎',
      color: 'blue',
    },
  },
  'roteiros-med': {
    id: 'roteiros-med',
    name: 'Roteiros MED',
    title: 'Conteúdo ERL 2025',
    description: 'Não sei o que postar',
    category: 'med',
    enabled: true,
    systemPrompt: ROTEIROS_MED_PROMPT,
    ui: {
      icon: '🎬',
      color: 'green',
    },
  },
  'bastidores-med': {
    id: 'bastidores-med',
    name: 'Bastidores MED',
    title: 'Parcerias & Funis',
    description: 'Quero trabalhar sem aparecer',
    category: 'med',
    enabled: true,
    systemPrompt: BASTIDORES_MED_PROMPT,
    ui: {
      icon: '🤝',
      color: 'purple',
    },
  },
  'plano-med': {
    id: 'plano-med',
    name: 'Plano MED',
    title: 'Plano de 30 Dias',
    description: 'Sei o que quero, não consigo organizar',
    category: 'med',
    enabled: true,
    systemPrompt: PLANO_MED_PROMPT,
    ui: {
      icon: '📅',
      color: 'orange',
    },
  },
  'identidade': {
    id: 'identidade',
    name: 'Arquiteto de Identidade',
    title: 'Reconstrução de Identidade',
    description: 'Quero me livrar de rótulos limitantes',
    category: 'med',
    enabled: true,
    systemPrompt: IDENTIDADE_PROMPT,
    ui: {
      icon: '🦋',
      color: 'purple',
    },
  },
  'mente-milionaria': {
    id: 'mente-milionaria',
    name: 'Mente Milionária',
    title: 'Mentalidade Financeira',
    description: 'Tenho bloqueio com dinheiro',
    category: 'med',
    enabled: true,
    systemPrompt: MENTE_MILIONARIA_PROMPT,
    ui: {
      icon: '💰',
      color: 'green',
    },
  },
};

export const getAgentConfig = (id: string | undefined): AgentConfig => {
  if (!id) return AGENT_REGISTRY['clareza-med'];
  const key = id as AgentId;
  return AGENT_REGISTRY[key] ?? AGENT_REGISTRY['clareza-med'];
};

export const listEnabledAgents = (): AgentConfig[] => {
  return Object.values(AGENT_REGISTRY).filter((a) => a.enabled);
};
