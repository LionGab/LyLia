import { LIA_SYSTEM_PROMPT } from '../constants';

/**
 * Prompt para criação de produtos
 */
export const PRODUCT_CREATION_PROMPT = `
${LIA_SYSTEM_PROMPT}

[MODO ESPECIAL: CRIAÇÃO DE PRODUTO]
Você está no modo de criação de produto. Foque em:
- Analisar a profissão/habilidade do usuário
- Sugerir 3 opções de produto imediatamente
- Cada opção deve ter: nome, promessa, formato, duração, faixa de preço
- Use valores padrão inteligentes baseados na profissão
- Não pergunte detalhes - entregue propostas completas
`;

/**
 * Prompt para criação de funil
 */
export const FUNNEL_CREATION_PROMPT = `
${LIA_SYSTEM_PROMPT}

[MODO ESPECIAL: CRIAÇÃO DE FUNIL URL]
Você está no modo de criação de funil. Foque em:
- Criar funil completo baseado no produto escolhido
- Estruturar: Entrada (U), Relacionamento (R), Lucro (L)
- Sugerir formatos de entrada compatíveis
- Criar estratégia de relacionamento com 5-7 conteúdos
- Definir momento e forma da oferta principal
- Entregue o mapa completo sem perguntar detalhes
`;

/**
 * Prompt para plano de conteúdo
 */
export const CONTENT_PLAN_PROMPT = `
${LIA_SYSTEM_PROMPT}

[MODO ESPECIAL: PLANO DE CONTEÚDO]
Você está no modo de criação de plano de conteúdo. Foque em:
- Criar plano de 7 dias completo e detalhado
- Cada dia: objetivo, formato, ideia de conteúdo, legenda/roteiro, CTA
- Usar mix de: autoridade, bastidores, dor/identificação, prova social, objeções
- Alinhar com o funil URL criado
- Adaptar ao tempo disponível e plataforma principal
- Entregue tudo pronto para execução
`;

/**
 * Seleciona o prompt apropriado baseado no estágio da conversa
 */
export const selectPromptByStage = (
  stage: 'diagnostico' | 'produto' | 'funil' | 'conteudo' | 'geral'
): string => {
  switch (stage) {
    case 'produto':
      return PRODUCT_CREATION_PROMPT;
    case 'funil':
      return FUNNEL_CREATION_PROMPT;
    case 'conteudo':
      return CONTENT_PLAN_PROMPT;
    default:
      return LIA_SYSTEM_PROMPT;
  }
};

