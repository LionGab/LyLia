import { SalesScript, ScriptRequest, ScriptType } from '../types/salesScript';
import { sendContentToGemini } from './geminiService';
import { logger } from './logger';

const SCRIPT_TYPES: Record<ScriptType, { name: string; description: string }> = {
  'cold-call': {
    name: 'Ligação Fria',
    description: 'Script para primeira abordagem com lead desconhecido',
  },
  'warm-call': {
    name: 'Ligação Quente',
    description: 'Script para lead que já demonstrou interesse',
  },
  'follow-up': {
    name: 'Follow-up',
    description: 'Script para acompanhamento de leads',
  },
  'closing': {
    name: 'Fechamento',
    description: 'Script focado em converter a venda',
  },
  'objection-handling': {
    name: 'Tratamento de Objeções',
    description: 'Script para lidar com objeções comuns',
  },
};

/**
 * Gera script de vendas usando IA
 */
export const generateSalesScript = async (request: ScriptRequest): Promise<SalesScript> => {
  const { product, targetAudience, scriptType, context } = request;

  const prompt = `Crie um script completo de ${SCRIPT_TYPES[scriptType].name} para vender:

Produto: ${product}
Público-alvo: ${targetAudience}
${context ? `Contexto: ${context}` : ''}

Estrutura do script:
1. Objetivo da ligação
2. Abertura (primeiros 30 segundos)
3. Proposta de valor
4. Pontos de dor do cliente
5. Benefícios do produto
6. Objeções comuns e respostas
7. Fechamento
8. Próximos passos

Responda em JSON:
{
  "type": "${scriptType}",
  "title": "título",
  "objective": "objetivo",
  "opening": "abertura",
  "valueProposition": "proposta de valor",
  "painPoints": ["dor1", "dor2"],
  "benefits": ["benefício1", "benefício2"],
  "objections": [
    {
      "objection": "objeção",
      "response": "resposta"
    }
  ],
  "closing": "fechamento",
  "nextSteps": ["passo1", "passo2"],
  "estimatedDuration": "duração estimada"
}`;

  try {
    const response = await sendContentToGemini([], prompt);
    const jsonText = response.text?.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim() || '{}';
    const parsed = JSON.parse(jsonText);

    const script: SalesScript = {
      type: scriptType,
      title: parsed.title || `${SCRIPT_TYPES[scriptType].name} - ${product}`,
      objective: parsed.objective || `Apresentar ${product} para ${targetAudience}`,
      opening: parsed.opening || '',
      valueProposition: parsed.valueProposition || '',
      painPoints: parsed.painPoints || [],
      benefits: parsed.benefits || [],
      objections: parsed.objections || [],
      closing: parsed.closing || '',
      nextSteps: parsed.nextSteps || [],
      estimatedDuration: parsed.estimatedDuration || '15-20 min',
    };

    return script;
  } catch (error) {
    logger.error('Erro ao gerar script de vendas', error);
    // Fallback básico
    return createBasicScript(request);
  }
};

/**
 * Cria script básico como fallback
 */
const createBasicScript = (request: ScriptRequest): SalesScript => {
  return {
    type: request.scriptType,
    title: `${SCRIPT_TYPES[request.scriptType].name} - ${request.product}`,
    objective: `Apresentar ${request.product} para ${request.targetAudience}`,
    opening: `Olá! Meu nome é [SEU NOME] e estou entrando em contato para apresentar uma solução que pode ajudar você...`,
    valueProposition: `${request.product} foi desenvolvido especificamente para ${request.targetAudience}...`,
    painPoints: ['Falta de tempo', 'Dificuldade em resultados', 'Investimento alto'],
    benefits: ['Resultados rápidos', 'Suporte dedicado', 'ROI comprovado'],
    objections: [
      {
        objection: 'Está muito caro',
        response: 'Entendo sua preocupação. Vamos analisar o retorno sobre investimento...',
      },
      {
        objection: 'Preciso pensar',
        response: 'Claro! Que tal agendarmos uma conversa para esclarecer dúvidas?',
      },
    ],
    closing: 'Que tal começarmos hoje mesmo?',
    nextSteps: ['Agendar reunião de apresentação', 'Enviar material complementar'],
    estimatedDuration: '15-20 min',
  };
};

/**
 * Salva script
 */
export const saveScript = (email: string, script: SalesScript): void => {
  try {
    const scripts = loadScripts(email);
    scripts.push({ ...script, timestamp: new Date().toISOString() });
    localStorage.setItem(`erl_lia_scripts_${email}`, JSON.stringify(scripts));
  } catch (error) {
    logger.error('Erro ao salvar script', error);
  }
};

/**
 * Carrega scripts salvos
 */
export const loadScripts = (email: string): Array<SalesScript & { timestamp: string }> => {
  try {
    const data = localStorage.getItem(`erl_lia_scripts_${email}`);
    if (!data) return [];
    return JSON.parse(data);
  } catch (error) {
    logger.error('Erro ao carregar scripts', error);
    return [];
  }
};
