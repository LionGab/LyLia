import { GoogleGenAI } from "@google/genai";
import { COPYWRITER_SYSTEM_PROMPT } from "../constants/copywriterPrompt";
import { CopywriterResponse, TargetAudience, CopyStructure } from "../types/copywriter";
import { OnboardingData } from "../types/onboarding";
import { AI_CONFIG } from "../constants/aiConfig";
import { logger } from "./logger";

const getApiKey = (): string => {
  const apiKey = 
    process.env.API_KEY || 
    process.env.GEMINI_API_KEY ||
    (typeof window !== 'undefined' && (window as { __GEMINI_API_KEY__?: string }).__GEMINI_API_KEY__) ||
    '';
  
  if (!apiKey || apiKey === 'undefined' || apiKey === 'null' || apiKey.trim() === '') {
    const isProduction = typeof window !== 'undefined' && 
      window.location.hostname !== 'localhost' && 
      window.location.hostname !== '127.0.0.1';
    
    if (isProduction) {
      throw new Error('Chave da API Gemini não encontrada. Configure a variável de ambiente GEMINI_API_KEY no Netlify Dashboard.');
    } else {
      throw new Error('Chave da API Gemini não encontrada. Verifique o arquivo .env.local');
    }
  }
  return apiKey.trim();
};

// Lazy initialization
let aiInstance: GoogleGenAI | null = null;
const getAI = (): GoogleGenAI => {
  if (!aiInstance) {
    try {
      aiInstance = new GoogleGenAI({ apiKey: getApiKey() });
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Erro ao inicializar cliente Gemini para copywriter');
    }
  }
  return aiInstance;
};

/**
 * Processa uma requisição de copywriter seguindo os 10 passos
 * 
 * @param userInput - Input do usuário com ideia/produto/nicho
 * @param context - Contexto do onboarding do usuário (opcional)
 * @returns Resposta estruturada do copywriter
 * @throws Error se houver falha no processamento
 */
export const processCopywriterRequest = async (
  userInput: string,
  context?: OnboardingData
): Promise<CopywriterResponse> => {
  // Validar entrada
  if (!userInput || typeof userInput !== 'string' || userInput.trim().length === 0) {
    throw new Error('Input do usuário é obrigatório e não pode estar vazio.');
  }

  try {
    // Construir prompt completo
    let fullPrompt = COPYWRITER_SYSTEM_PROMPT;
    
    if (context) {
      const contextInfo: string[] = [];
      
      // Adicionar informações básicas do negócio
      if (context.profissao) contextInfo.push(`Profissão: ${context.profissao}`);
      if (context.habilidadePrincipal) contextInfo.push(`Habilidade principal: ${context.habilidadePrincipal}`);
      if (context.ofertaAtual) contextInfo.push(`Oferta atual: ${context.ofertaAtual}`);
      if (context.publicoAlvo) contextInfo.push(`Público-alvo: ${context.publicoAlvo}`);
      if (context.problemaPrincipal) contextInfo.push(`Problema principal: ${context.problemaPrincipal}`);
      if (context.diferencial) contextInfo.push(`Diferencial: ${context.diferencial}`);
      
      // Adicionar estilo de resposta
      if (context.estiloResposta) {
        const styleMap: Record<string, string> = {
          'direto': 'Respostas curtas, diretas ao ponto, sem enrolação',
          'amigavel': 'Tom conversacional, caloroso, como um amigo experiente',
          'profissional': 'Linguagem formal, termos técnicos, foco em precisão',
          'motivacional': 'Tom energético, encorajador, foco em potencial e resultados',
          'educativo': 'Explicações detalhadas, exemplos práticos, passo a passo'
        };
        contextInfo.push(`Estilo de resposta preferido: ${styleMap[context.estiloResposta] || context.estiloResposta}`);
      }
      
      if (context.observacoes) {
        contextInfo.push(`Observações do usuário: ${context.observacoes}`);
      }
      
      if (contextInfo.length > 0) {
        fullPrompt += `\n\n[CONTEXTO ADICIONAL DO USUÁRIO]\n${contextInfo.join('\n')}`;
      }
    }

    fullPrompt += `\n\n[IDEIA/PRODUTO/NICHO FORNECIDO PELO USUÁRIO]\n${userInput}\n\nExecute TODOS os 10 passos de forma completa e detalhada.`;

    const ai = getAI();
    const response = await ai.models.generateContent({
      model: AI_CONFIG.models.pro, // Usar modelo com thinking para copywriting complexo
      contents: [
        { role: "user", parts: [{ text: fullPrompt }] },
      ],
      config: {
        systemInstruction: `Você é um copywriter profissional sênior. Siga rigorosamente os 10 passos definidos.`,
        thinkingConfig: { thinkingBudget: AI_CONFIG.thinkingBudget },
      },
    });

    const generatedText = response.candidates?.[0]?.content?.parts
      ?.map(part => part.text)
      .join('') || '';

    // Parsear a resposta estruturada
    // Como a resposta vem em texto, vamos criar uma estrutura baseada no texto
    // Em produção, seria ideal usar JSON mode ou parsing mais sofisticado
    const parsedResponse = parseCopywriterResponse(generatedText, userInput);

    return parsedResponse;
  } catch (error) {
    logger.error("Erro ao processar requisição de copywriter", error);
    
    if (error instanceof Error) {
      // Se já é um erro conhecido, propagar
      if (error.message.includes('API') || error.message.includes('chave')) {
        throw error;
      }
    }
    
    throw new Error("Falha ao processar sua solicitação de copywriting. Tente novamente.");
  }
};

/**
 * Parseia a resposta do modelo em estrutura CopywriterResponse
 * Esta é uma versão simplificada - em produção, usar JSON mode seria ideal
 */
const parseCopywriterResponse = (
  text: string,
  _originalInput: string
): CopywriterResponse => {
  // Extrair seções do texto usando padrões
  // Esta é uma implementação básica - pode ser melhorada com parsing mais sofisticado
  
  return {
    publicoAlvo: {
      desejos: extractList(text, 'desejos'),
      dores: extractList(text, 'dores'),
      medos: extractList(text, 'medos'),
      sonhos: extractList(text, 'sonhos'),
      nivelConsciencia: extractNivelConsciencia(text),
      descricao: extractSection(text, 'público-alvo', 'análise do público'),
    },
    estruturaCopy: {
      formula: extractFormula(text),
      justificativa: extractSection(text, 'estrutura', 'fórmula'),
    },
    promessa: {
      promessa: extractSection(text, 'promessa'),
      beneficioEmocional: extractSection(text, 'benefício emocional'),
      diferencial: extractSection(text, 'diferencial'),
      mecanismo: extractSection(text, 'mecanismo'),
      credibilidade: extractSection(text, 'credibilidade'),
    },
    funilConteudo: {
      atracao: {
        tipo: 'Viral',
        estrategia: extractSection(text, 'atração', 'conteúdo viral'),
        exemplos: extractList(text, 'atração'),
      },
      aquecimento: {
        tipo: 'Educativo',
        estrategia: extractSection(text, 'aquecimento'),
        exemplos: extractList(text, 'aquecimento'),
      },
      conversao: {
        tipo: 'Vendas',
        estrategia: extractSection(text, 'conversão'),
        exemplos: extractList(text, 'conversão'),
      },
      sequencia: extractList(text, 'sequência'),
    },
    roteirosVideos: extractVideoScripts(text),
    conteudosUGC: extractUGCContent(text),
    textosVendas: extractSalesCopies(text),
    ideiasComplementares: {
      seriesVideos: extractList(text, 'séries'),
      emails: extractList(text, 'e-mails'),
      anuncios: extractList(text, 'anúncios'),
      remarketing: extractList(text, 'remarketing'),
      crossPlatform: extractList(text, 'cross-platform'),
    },
    titulosCTAs: {
      titulos: extractTitles(text),
      ctas: extractCTAs(text),
      headlines: extractHeadlines(text),
    },
    linguagemAdaptada: {
      tom: extractSection(text, 'tom'),
      vocabulario: extractList(text, 'vocabulário'),
      exemplos: extractList(text, 'exemplos de linguagem'),
      adaptacoesPorCanal: extractChannelAdaptations(text),
    },
    resumoExecutivo: extractSection(text, 'resumo', 'executivo') || text.substring(0, 500),
  };
};

// Funções auxiliares de parsing (implementação básica)
const extractList = (text: string, keyword: string): string[] => {
  if (!text || typeof text !== 'string' || !keyword || typeof keyword !== 'string') {
    return [];
  }

  try {
    const regex = new RegExp(`${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[\\s:]*([\\s\\S]*?)(?=\\n\\n|$)`, 'i');
    const match = text.match(regex);
    if (!match || !match[1]) return [];
    
    return match[1]
      .split('\n')
      .map(line => line.replace(/^[-•*]\s*/, '').trim())
      .filter(line => line.length > 0)
      .slice(0, 10);
  } catch (error) {
    logger.warn('Erro ao extrair lista', { keyword, error });
    return [];
  }
};

const extractSection = (text: string, ...keywords: string[]): string => {
  if (!text || typeof text !== 'string' || keywords.length === 0) {
    return '';
  }

  try {
    for (const keyword of keywords) {
      if (!keyword || typeof keyword !== 'string') continue;
      
      const escapedKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`${escapedKeyword}[\\s:]*([\\s\\S]*?)(?=\\n##|\\n###|$)`, 'i');
      const match = text.match(regex);
      if (match && match[1]) {
        return match[1].trim();
      }
    }
  } catch (error) {
    logger.warn('Erro ao extrair seção', { keywords, error });
  }
  
  return '';
};

const extractNivelConsciencia = (text: string): TargetAudience['nivelConsciencia'] => {
  const lowerText = text.toLowerCase();
  if (lowerText.includes('inconsciente')) return 'inconsciente';
  if (lowerText.includes('consciente do produto')) return 'consciente_produto';
  if (lowerText.includes('consciente da solução')) return 'consciente_solucao';
  return 'consciente_problema';
};

const extractFormula = (text: string): CopyStructure['formula'] => {
  const lowerText = text.toLowerCase();
  if (lowerText.includes('aida')) return 'AIDA';
  if (lowerText.includes('storybrand')) return 'StoryBrand';
  if (lowerText.includes('big idea')) return 'Big Idea';
  if (lowerText.includes('hero\'s journey')) return 'Hero\'s Journey';
  if (lowerText.includes('pas')) return 'PAS';
  if (lowerText.includes('slap')) return 'SLAP';
  if (lowerText.includes('4ps')) return '4Ps';
  return 'Custom';
};

const extractVideoScripts = (text: string) => {
  // Implementação simplificada - em produção seria mais sofisticado
  return [{
    titulo: extractSection(text, 'título do vídeo'),
    gancho: extractSection(text, 'gancho'),
    contexto: extractSection(text, 'contexto'),
    desenvolvimento: extractSection(text, 'desenvolvimento'),
    quebraPadrao: extractSection(text, 'quebra', 'revelação'),
    cta: extractSection(text, 'cta', 'chamada'),
    duracaoEstimada: '15-60s',
    plataforma: 'Instagram/TikTok',
    tags: [],
  }];
};

const extractUGCContent = (text: string) => {
  return [{
    tipo: 'UGC',
    descricao: extractSection(text, 'ugc'),
    objetivo: 'Prova social',
    elementos: extractList(text, 'ugc'),
    exemplo: extractSection(text, 'exemplo ugc'),
  }];
};

const extractSalesCopies = (text: string): any[] => {
  return [{
    tipo: 'Landing Page',
    headline: extractSection(text, 'headline'),
    subheadline: extractSection(text, 'subheadline'),
    introducao: extractSection(text, 'introdução'),
    problema: extractSection(text, 'problema'),
    solucao: extractSection(text, 'solução'),
    beneficios: extractList(text, 'benefícios'),
    provaSocial: extractList(text, 'prova social'),
    objecoes: [],
    cta: extractSection(text, 'cta'),
    textoCompleto: text,
  }];
};

const extractTitles = (text: string) => {
  return extractList(text, 'títulos').map(titulo => ({
    titulo,
    angulo: 'Conversão',
  }));
};

const extractCTAs = (text: string) => {
  return extractList(text, 'cta').map(cta => ({
    cta,
    urgencia: 'Média',
  }));
};

const extractHeadlines = (text: string) => {
  return extractList(text, 'headline').map(headline => ({
    headline,
    gatilho: 'Curiosidade',
  }));
};

const extractChannelAdaptations = (text: string): Record<string, string> => {
  return {
    instagram: extractSection(text, 'instagram'),
    tiktok: extractSection(text, 'tiktok'),
    youtube: extractSection(text, 'youtube'),
  };
};

