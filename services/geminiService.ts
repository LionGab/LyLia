import { GoogleGenAI, Content } from "@google/genai";
import { LIA_SYSTEM_PROMPT, APP_NAME } from "../constants";
import { getAgentConfig } from "../config/agents";
import { Message, Sender } from "../types";
import { OnboardingData } from "../types/onboarding";
import { AI_CONFIG } from "../constants/aiConfig";
import { enrichContext, optimizeContext } from "./contextService";
import { logger } from "./logger";

// Initialize the Gemini AI client
// The API key is injected automatically from the environment
const getApiKey = (): string => {
  // Tentar múltiplas formas de acessar a chave
  const apiKey = 
    process.env.API_KEY || 
    process.env.GEMINI_API_KEY ||
    (typeof window !== 'undefined' && (window as any).__GEMINI_API_KEY__) ||
    '';
  
  if (!apiKey || apiKey === 'undefined' || apiKey === 'null' || apiKey.trim() === '') {
    const isProduction = typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
    
    if (isProduction) {
      throw new Error('Chave da API Gemini não encontrada. Configure a variável de ambiente GEMINI_API_KEY no Netlify Dashboard (Site settings → Environment variables).');
    } else {
      throw new Error('Chave da API Gemini não encontrada. Verifique o arquivo .env.local e certifique-se de que GEMINI_API_KEY está configurado.');
    }
  }
  return apiKey.trim();
};

// Lazy initialization - só cria o cliente quando necessário
let aiInstance: GoogleGenAI | null = null;
const getAI = (): GoogleGenAI => {
  if (!aiInstance) {
    try {
      aiInstance = new GoogleGenAI({ apiKey: getApiKey() });
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Erro ao inicializar cliente Gemini');
    }
  }
  return aiInstance;
};

/**
 * Converte formato interno de Message para formato Content do Gemini
 * Valida e sanitiza dados antes da conversão
 */
const formatHistory = (messages: Message[]): Content[] => {
  if (!Array.isArray(messages)) {
    logger.warn('formatHistory recebeu dados inválidos', { messages });
    return [];
  }

  return messages
    .filter((msg): msg is Message => {
      if (!msg || typeof msg !== 'object') return false;
      if (!msg.sender || (msg.sender !== Sender.User && msg.sender !== Sender.AI)) return false;
      return true;
    })
    .map((msg) => ({
      role: msg.sender === Sender.User ? "user" : "model",
      parts: [{ text: String(msg.text || '').trim() }],
    }))
    .filter((content) => {
      // Remover mensagens vazias
      const hasText = content.parts.some(part => 'text' in part && part.text.length > 0);
      return hasText;
    });
};

/**
 * Retry logic com exponential backoff
 */
const sleep = (ms: number): Promise<void> => {
  if (ms < 0 || !Number.isFinite(ms)) {
    logger.warn('sleep recebeu valor inválido', { ms });
    return Promise.resolve();
  }
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Valida se uma string é um base64 válido
 */
const isValidBase64 = (str: string): boolean => {
  if (!str || typeof str !== 'string') return false;
  
  const base64Data = str.includes(',') ? str.split(',')[1] : str;
  
  // Regex para validar base64
  const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
  return base64Regex.test(base64Data) && base64Data.length > 0;
};

/**
 * Tenta fazer uma requisição com retry automático
 */
const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = AI_CONFIG.maxRetries,
  delay: number = AI_CONFIG.retryDelay
): Promise<T> => {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      // Não fazer retry em erros de validação
      if (error instanceof Error && (
        error.message.includes('Nenhum conteúdo') ||
        error.message.includes('inválido')
      )) {
        throw error;
      }

      // Se não for a última tentativa, esperar antes de tentar novamente
      if (attempt < maxRetries) {
        const waitTime = delay * Math.pow(2, attempt); // Exponential backoff
        logger.warn(`Tentativa ${attempt + 1} falhou. Tentando novamente em ${waitTime}ms...`, {
          attempt: attempt + 1,
          maxRetries,
          waitTime,
          error: lastError?.message,
        });
        await sleep(waitTime);
      }
    }
  }

  throw lastError || new Error('Falha após múltiplas tentativas');
};

export interface GeminiResponse {
  text: string | undefined;
  imageUrl: string | undefined;
  mimeType: string | undefined;
}

/**
 * Envia conteúdo para o Gemini AI e retorna resposta formatada
 * 
 * @param currentHistory - Histórico de mensagens da conversa
 * @param newMessage - Nova mensagem de texto do usuário
 * @param base64Image - Dados de imagem em base64 (opcional)
 * @param imageMimeType - Tipo MIME da imagem (opcional)
 * @param base64Audio - Dados de áudio em base64 (opcional)
 * @param audioMimeType - Tipo MIME do áudio (opcional)
 * @param onboardingContext - Contexto do onboarding do usuário (opcional)
 * @returns Resposta do Gemini com texto, imagem e tipo MIME
 * @throws Error se nenhum conteúdo for fornecido ou se houver erro na API
 */
export const sendContentToGemini = async (
  currentHistory: Message[],
  newMessage: string,
  base64Image?: string,
  imageMimeType?: string,
  base64Audio?: string,
  audioMimeType?: string,
  onboardingContext?: OnboardingData,
  agentId?: string,
): Promise<GeminiResponse> => {
  // Validar entrada
  if (!newMessage && !base64Image && !base64Audio) {
    throw new Error("Nenhum conteúdo (texto, imagem ou áudio) fornecido para o Gemini.");
  }

  // Validar tipos de dados
  if (base64Image && !imageMimeType) {
    throw new Error("Tipo MIME da imagem é obrigatório quando imagem é fornecida.");
  }

  if (base64Audio && !audioMimeType) {
    throw new Error("Tipo MIME do áudio é obrigatório quando áudio é fornecido.");
  }

  // Validar formato base64
  if (base64Image && !isValidBase64(base64Image)) {
    throw new Error("Formato de imagem base64 inválido.");
  }

  if (base64Audio && !isValidBase64(base64Audio)) {
    throw new Error("Formato de áudio base64 inválido.");
  }

  // Usar modelo apropriado baseado no contexto
  // API 2.0: gemini-2.0-flash-exp é o modelo mais recente e eficiente
  const modelToUse = base64Image || base64Audio
    ? AI_CONFIG.models.image 
    : AI_CONFIG.models.default;

  // Construir partes da mensagem com tipagem adequada
  type MessagePart = 
    | { text: string }
    | { inlineData: { mimeType: string; data: string } };

  const parts: MessagePart[] = [];

  if (base64Image && imageMimeType) {
    const base64Data = base64Image.includes(',') 
      ? base64Image.split(',')[1] 
      : base64Image;
    
    parts.push({
      inlineData: {
        mimeType: imageMimeType,
        data: base64Data,
      },
    });
  }

  if (base64Audio && audioMimeType) {
    const base64Data = base64Audio.includes(',') 
      ? base64Audio.split(',')[1] 
      : base64Audio;
    
    parts.push({
      inlineData: {
        mimeType: audioMimeType,
        data: base64Data,
      },
    });
  }

  if (newMessage) {
    parts.push({ text: newMessage });
  }

  // Construir contexto enriquecido
  const enrichedContext = enrichContext(currentHistory, onboardingContext);
  
  // Resolver agente via registry (fonte única)
  const agentConfig = getAgentConfig(agentId);
  if (agentId && agentConfig.id !== agentId) {
    logger.warn('Agente não encontrado no registry. Usando fallback.', {
      agentId,
      fallbackAgentId: agentConfig.id,
    });
  }

  let basePrompt = agentConfig.systemPrompt || LIA_SYSTEM_PROMPT;
  
  let contextPrompt = basePrompt;
  
  // Adicionar instruções de estilo de resposta se disponível
  // Nota: aplica apenas se o agente suportar
  if (onboardingContext?.estiloResposta && agentConfig.capabilities.supportsUserStyle) {
    const styleInstructions: Record<string, string> = {
      'direto': 'IMPORTANTE: Seja direto e objetivo. Respostas curtas, sem enrolação. Vá direto ao ponto.',
      'amigavel': 'IMPORTANTE: Use tom amigável e próximo. Fale como um amigo experiente, caloroso e acessível.',
      'profissional': 'IMPORTANTE: Use linguagem profissional e técnica. Seja preciso, formal e detalhado.',
      'motivacional': 'IMPORTANTE: Use tom energético e encorajador. Foque no potencial e resultados positivos.',
      'educativo': 'IMPORTANTE: Seja didático e educativo. Explique detalhadamente, dê exemplos práticos e passo a passo.'
    };
    
    const styleInstruction = styleInstructions[onboardingContext.estiloResposta];
    if (styleInstruction) {
      contextPrompt = `${basePrompt}\n\n[ESTILO DE RESPOSTA PREFERIDO PELO USUÁRIO]\n${styleInstruction}`;
    }
  }
  
  if (enrichedContext) {
    const optimizedContext = optimizeContext(enrichedContext);
    contextPrompt = `${contextPrompt}\n\n${optimizedContext}`;
  }
  
  // Adicionar observações específicas do usuário se houver
  if (onboardingContext?.observacoes && agentConfig.capabilities.supportsUserNotes) {
    contextPrompt = `${contextPrompt}\n\n[OBSERVAÇÕES ESPECÍFICAS DO USUÁRIO]\n${onboardingContext.observacoes}\n\nSiga essas observações ao responder.`;
  }

  // Fazer requisição com retry
  return retryWithBackoff(async () => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), AI_CONFIG.timeout);

    try {
      // Validar chave da API antes de fazer a requisição
      const apiKey = getApiKey();
      if (!apiKey) {
        throw new Error('Chave da API não configurada');
      }

      const history = formatHistory(currentHistory);
      
      // Log da requisição
      logger.debug('Enviando requisição para Gemini', {
        model: modelToUse,
        hasHistory: history.length > 0,
        historyLength: history.length,
        hasImage: !!base64Image,
        hasAudio: !!base64Audio,
        hasText: !!newMessage,
      });
      
      const ai = getAI();
      const response = await ai.models.generateContent({
        model: modelToUse,
        contents: [
          ...history,
          { role: "user", parts: parts },
        ],
        config: {
          systemInstruction: `CONTEXTO DO APP: ${APP_NAME}\n\n${contextPrompt}`,
          // API 2.0: thinkingConfig disponível para modelos thinking
          thinkingConfig: modelToUse.includes('thinking') 
            ? { thinkingBudget: AI_CONFIG.thinkingBudget } 
            : undefined,
        },
      });

      clearTimeout(timeoutId);

      let generatedText: string | undefined;
      let generatedImageUrl: string | undefined;
      let generatedImageMimeType: string | undefined;

      // Iterate through all parts to find text and image outputs
      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.text) {
          generatedText = (generatedText || '') + part.text;
        } else if (part.inlineData) {
          generatedImageUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
          generatedImageMimeType = part.inlineData.mimeType;
        }
      }

      // Default message if no content is returned
      if (!generatedText && !generatedImageUrl) {
        generatedText = "Desculpe, não consegui processar sua resposta no momento. Podemos tentar novamente?";
      }

      return { text: generatedText, imageUrl: generatedImageUrl, mimeType: generatedImageMimeType };
    } catch (error) {
      clearTimeout(timeoutId);
      
      // Tratamento específico de erros
      if (error instanceof Error) {
        const errorMessage = error.message.toLowerCase();
        const errorString = JSON.stringify(error);
        
        // Log detalhado para debug
        logger.error('Erro detalhado da API Gemini', {
          message: error.message,
          name: error.name,
          errorString: errorString.substring(0, 500),
        });
        
        if (error.name === 'AbortError' || errorMessage.includes('timeout') || errorMessage.includes('aborted')) {
          throw new Error("A requisição demorou muito. Tente novamente.");
        }
        if (errorMessage.includes('api_key') || errorMessage.includes('authentication') || errorMessage.includes('401') || errorMessage.includes('403')) {
          throw new Error("Erro de autenticação. Verifique se a chave da API está correta no arquivo .env.local");
        }
        if (errorMessage.includes('400') || errorString.includes('400')) {
          // Erro 400 pode ser por vários motivos
          if (errorString.includes('invalid') || errorString.includes('malformed')) {
            throw new Error("Requisição inválida. Verifique o formato dos dados enviados.");
          }
          if (errorString.includes('model') || errorString.includes('not found')) {
            throw new Error("Modelo não encontrado. Verifique se o modelo está disponível na sua conta.");
          }
          throw new Error("Erro na requisição (400). Verifique os logs do console para mais detalhes.");
        }
        if (errorMessage.includes('quota') || errorMessage.includes('rate limit') || errorMessage.includes('429')) {
          throw new Error("Limite de requisições atingido. Tente novamente em alguns minutos.");
        }
        if (errorMessage.includes('500') || errorString.includes('500')) {
          throw new Error("Erro interno do servidor. Tente novamente em alguns instantes.");
        }
      }
      
      throw error;
    }
  }).catch((error) => {
    logger.error("Erro ao comunicar com Gemini", error);
    
    // Mensagem amigável para o usuário
    if (error instanceof Error) {
      throw error;
    }
    
    throw new Error("Falha ao conectar com a Lyla.IA. Verifique sua conexão ou tente novamente.");
  });
};
