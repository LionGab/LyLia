import { FunnelStructure, FunnelStep, FunnelPhase } from '../types/funnel';
import { sendContentToGemini } from './geminiService';
import { logger } from './logger';

const PHASE_STRUCTURE: Record<FunnelPhase, { name: string; description: string; order: number }> = {
  entrada: {
    name: 'Entrada',
    description: 'Fase de atração e captura de leads',
    order: 1,
  },
  relacionamento: {
    name: 'Relacionamento',
    description: 'Fase de nutrição e construção de confiança',
    order: 2,
  },
  lucro: {
    name: 'Lucro',
    description: 'Fase de conversão e monetização',
    order: 3,
  },
};

/**
 * Gera funil estruturado usando IA
 */
export const generateFunnel = async (
  product: string,
  targetAudience: string,
  profile?: 'A' | 'B'
): Promise<FunnelStructure> => {
  const prompt = `Crie um funil ERL (Entrada, Relacionamento, Lucro) completo para:

Produto: ${product}
Público-alvo: ${targetAudience}
${profile ? `Perfil: ${profile}` : ''}

Para cada fase (Entrada, Relacionamento, Lucro), gere:
- Título da etapa
- Descrição do objetivo
- 3-5 ações específicas
- 3-5 sugestões de conteúdo
- 2-3 canais recomendados

Responda em JSON com esta estrutura:
{
  "steps": [
    {
      "phase": "entrada" | "relacionamento" | "lucro",
      "title": "título",
      "description": "descrição",
      "actions": ["ação1", "ação2"],
      "contentSuggestions": ["conteúdo1", "conteúdo2"],
      "channels": ["canal1", "canal2"]
    }
  ]
}

Responda APENAS com JSON válido, sem markdown.`;

  try {
    const response = await sendContentToGemini([], prompt);
    const jsonText = response.text?.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim() || '{}';
    const parsed = JSON.parse(jsonText);

    const steps: FunnelStep[] = (parsed.steps || []).map((step: any, index: number) => ({
      id: `step-${index + 1}`,
      phase: step.phase || (index === 0 ? 'entrada' : index === 1 ? 'relacionamento' : 'lucro'),
      title: step.title || `Etapa ${index + 1}`,
      description: step.description || '',
      actions: step.actions || [],
      contentSuggestions: step.contentSuggestions || [],
      channels: step.channels || [],
      order: index + 1,
    }));

    // Garantir que temos pelo menos uma etapa de cada fase
    const phases: FunnelPhase[] = ['entrada', 'relacionamento', 'lucro'];
    phases.forEach((phase, index) => {
      if (!steps.find((s) => s.phase === phase)) {
        steps.push({
          id: `step-${steps.length + 1}`,
          phase,
          title: PHASE_STRUCTURE[phase].name,
          description: PHASE_STRUCTURE[phase].description,
          actions: [],
          contentSuggestions: [],
          channels: [],
          order: index + 1,
        });
      }
    });

    const funnel: FunnelStructure = {
      id: `funnel-${Date.now()}`,
      name: `Funil ERL - ${product}`,
      product,
      targetAudience,
      steps: steps.sort((a, b) => a.order - b.order),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return funnel;
  } catch (error) {
    logger.error('Erro ao gerar funil com IA', error);
    // Fallback para funil básico
    return createBasicFunnel(product, targetAudience);
  }
};

/**
 * Cria funil básico como fallback
 */
const createBasicFunnel = (product: string, targetAudience: string): FunnelStructure => {
  return {
    id: `funnel-${Date.now()}`,
    name: `Funil ERL - ${product}`,
    product,
    targetAudience,
    steps: [
      {
        id: 'step-1',
        phase: 'entrada',
        title: 'Atração de Leads',
        description: 'Capturar atenção do público-alvo através de conteúdo de valor',
        actions: ['Criar conteúdo educativo', 'Oferecer lead magnet', 'Usar redes sociais'],
        contentSuggestions: ['Posts educativos', 'E-book gratuito', 'Webinar'],
        channels: ['Instagram', 'Facebook', 'YouTube'],
        order: 1,
      },
      {
        id: 'step-2',
        phase: 'relacionamento',
        title: 'Nutrição e Confiança',
        description: 'Construir relacionamento e demonstrar valor',
        actions: ['Enviar sequência de emails', 'Oferecer conteúdo exclusivo', 'Interagir ativamente'],
        contentSuggestions: ['Email marketing', 'Grupo exclusivo', 'Casos de sucesso'],
        channels: ['Email', 'WhatsApp', 'Grupo privado'],
        order: 2,
      },
      {
        id: 'step-3',
        phase: 'lucro',
        title: 'Conversão',
        description: 'Apresentar oferta e converter leads em clientes',
        actions: ['Apresentar produto', 'Oferecer bônus', 'Criar urgência'],
        contentSuggestions: ['Página de vendas', 'Depoimentos', 'Oferta especial'],
        channels: ['Landing page', 'Email', 'WhatsApp'],
        order: 3,
      },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  };
};

/**
 * Salva funil
 */
export const saveFunnel = (email: string, funnel: FunnelStructure): void => {
  try {
    const funnels = loadFunnels(email);
    funnels.push(funnel);
    localStorage.setItem(`erl_lia_funnels_${email}`, JSON.stringify(funnels));
  } catch (error) {
    logger.error('Erro ao salvar funil', error);
  }
};

/**
 * Carrega funis salvos
 */
export const loadFunnels = (email: string): FunnelStructure[] => {
  try {
    const data = localStorage.getItem(`erl_lia_funnels_${email}`);
    if (!data) return [];
    return JSON.parse(data);
  } catch (error) {
    logger.error('Erro ao carregar funis', error);
    return [];
  }
};
