import { ProductRecommendation, RecommendationResult, ProductType } from '../types/recommendation';
import { ProfileType } from '../types/diagnostic';
import { sendContentToGemini } from './geminiService';
import { logger } from './logger';

const PRODUCT_RECOMMENDATIONS_MATRIX: Record<ProfileType, ProductType[]> = {
  A: ['curso-digital', 'comunidade-paga', 'mentoria'],
  B: ['mentoria', 'consultoria', 'produto-fisico'],
};

const PRODUCT_DETAILS: Record<ProductType, Omit<ProductRecommendation, 'type'>> = {
  'curso-digital': {
    name: 'Curso Digital',
    description: 'Produto digital escalável que pode ser vendido repetidamente sem custo adicional de produção.',
    whyRecommended: ['Baixo investimento inicial', 'Escalável', 'Pode ser automatizado'],
    priceRange: { min: 97, max: 997, suggested: 297 },
    effort: 'medio',
    timeToLaunch: '4-8 semanas',
    potentialRevenue: 'alto',
  },
  'comunidade-paga': {
    name: 'Comunidade Paga',
    description: 'Grupo exclusivo com acesso a conteúdo, networking e suporte contínuo.',
    whyRecommended: ['Receita recorrente', 'Alto engajamento', 'Crescimento orgânico'],
    priceRange: { min: 47, max: 297, suggested: 97 },
    effort: 'medio',
    timeToLaunch: '2-4 semanas',
    potentialRevenue: 'medio',
  },
  'mentoria': {
    name: 'Mentoria Individual',
    description: 'Acompanhamento personalizado para desenvolvimento específico do negócio.',
    whyRecommended: ['Alto valor agregado', 'Personalizado', 'Alto ticket médio'],
    priceRange: { min: 500, max: 5000, suggested: 1500 },
    effort: 'alto',
    timeToLaunch: '1-2 semanas',
    potentialRevenue: 'alto',
  },
  'consultoria': {
    name: 'Consultoria',
    description: 'Serviço especializado para resolver problemas específicos do negócio.',
    whyRecommended: ['Alto valor', 'Especializado', 'Resultados rápidos'],
    priceRange: { min: 1000, max: 10000, suggested: 3000 },
    effort: 'alto',
    timeToLaunch: '1 semana',
    potentialRevenue: 'alto',
  },
  'produto-fisico': {
    name: 'Produto Físico',
    description: 'Produto tangível com marca própria ou dropshipping.',
    whyRecommended: ['Alto ticket médio', 'Demanda real', 'Escalável'],
    priceRange: { min: 50, max: 500, suggested: 150 },
    effort: 'alto',
    timeToLaunch: '8-12 semanas',
    potentialRevenue: 'medio',
  },
  'servico': {
    name: 'Serviço Profissional',
    description: 'Prestação de serviços especializados (design, copywriting, etc.).',
    whyRecommended: ['Baixa barreira de entrada', 'Demanda constante', 'Flexível'],
    priceRange: { min: 200, max: 2000, suggested: 500 },
    effort: 'medio',
    timeToLaunch: '1-2 semanas',
    potentialRevenue: 'medio',
  },
};

/**
 * Gera recomendações baseadas no perfil
 */
export const generateRecommendations = async (
  profile: ProfileType,
  context?: string
): Promise<RecommendationResult> => {
  const productTypes = PRODUCT_RECOMMENDATIONS_MATRIX[profile];

  const recommendations: ProductRecommendation[] = productTypes.map((type) => ({
    type,
    ...PRODUCT_DETAILS[type],
  }));

  // Usar IA para personalizar recomendações
  try {
    const prompt = `Uma empreendedora digital foi classificada como Perfil ${profile}.

${context ? `Contexto adicional: ${context}` : ''}

Produtos recomendados para este perfil:
${recommendations.map((r) => `- ${r.name}: ${r.description}`).join('\n')}

Gere uma análise em JSON com:
- reasoning: explicação detalhada do porquê essas recomendações são ideais para Perfil ${profile}
- nextSteps: array com 3-5 próximos passos práticos e acionáveis

Responda APENAS com JSON válido, sem markdown.`;

    const response = await sendContentToGemini([], prompt);
    const jsonText = response.text?.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim() || '{}';
    const parsed = JSON.parse(jsonText);

    return {
      profile,
      topRecommendations: recommendations,
      reasoning: parsed.reasoning || `Produtos ideais para Perfil ${profile} baseados em escalabilidade e investimento.`,
      nextSteps: parsed.nextSteps || [
        'Escolha um produto que ressoe com você',
        'Valide a ideia com seu público',
        'Crie um MVP (produto mínimo viável)',
      ],
    };
  } catch (error) {
    logger.error('Erro ao gerar recomendações com IA', error);
    return {
      profile,
      topRecommendations: recommendations,
      reasoning: `Produtos ideais para Perfil ${profile} baseados em escalabilidade e investimento.`,
      nextSteps: [
        'Escolha um produto que ressoe com você',
        'Valide a ideia com seu público',
        'Crie um MVP (produto mínimo viável)',
      ],
    };
  }
};

/**
 * Salva recomendações
 */
export const saveRecommendations = (email: string, recommendations: RecommendationResult): void => {
  try {
    localStorage.setItem(`erl_lia_recommendations_${email}`, JSON.stringify({
      ...recommendations,
      timestamp: new Date().toISOString(),
    }));
  } catch (error) {
    logger.error('Erro ao salvar recomendações', error);
  }
};

/**
 * Carrega recomendações salvas
 */
export const loadRecommendations = (email: string): RecommendationResult | null => {
  try {
    const data = localStorage.getItem(`erl_lia_recommendations_${email}`);
    if (!data) return null;
    return JSON.parse(data);
  } catch (error) {
    logger.error('Erro ao carregar recomendações', error);
    return null;
  }
};
