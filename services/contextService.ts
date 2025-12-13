import { Message } from '../types';
import { OnboardingData } from '../types/onboarding';

/**
 * Enriquece o contexto com informações relevantes do histórico e dados do usuário
 */
export const enrichContext = (
  messages: Message[],
  userData?: OnboardingData
): string => {
  const contextParts: string[] = [];

  // Adicionar contexto do onboarding se disponível
  if (userData) {
    const userInfo: string[] = [];
    
    if (userData.profissao) userInfo.push(`Profissão: ${userData.profissao}`);
    if (userData.habilidadePrincipal) userInfo.push(`Habilidade principal: ${userData.habilidadePrincipal}`);
    if (userData.ofertaAtual) userInfo.push(`Oferta atual: ${userData.ofertaAtual}`);
    if (userData.precoAtual) userInfo.push(`Preço atual: R$ ${userData.precoAtual}`);
    if (userData.tempoDisponivel) userInfo.push(`Tempo disponível: ${userData.tempoDisponivel}`);
    if (userData.plataformaPrincipal) userInfo.push(`Plataforma principal: ${userData.plataformaPrincipal}`);
    if (userData.formatoPreferido) userInfo.push(`Formato preferido: ${userData.formatoPreferido}`);
    if (userData.metaFaturamento) userInfo.push(`Meta de faturamento: R$ ${userData.metaFaturamento}`);
    if (userData.publicoAlvo) userInfo.push(`Público-alvo: ${userData.publicoAlvo}`);
    if (userData.problemaPrincipal) userInfo.push(`Problema principal: ${userData.problemaPrincipal}`);
    if (userData.diferencial) userInfo.push(`Diferencial: ${userData.diferencial}`);
    
    // Adicionar preferências de estilo de resposta
    if (userData.estiloResposta) {
      const styleMap: Record<string, string> = {
        'direto': 'Respostas curtas, diretas ao ponto, sem enrolação',
        'amigavel': 'Tom conversacional, caloroso, como um amigo experiente',
        'profissional': 'Linguagem formal, termos técnicos, foco em precisão',
        'motivacional': 'Tom energético, encorajador, foco em potencial e resultados',
        'educativo': 'Explicações detalhadas, exemplos práticos, passo a passo'
      };
      userInfo.push(`Estilo de resposta preferido: ${styleMap[userData.estiloResposta] || userData.estiloResposta}`);
    }
    
    if (userData.observacoes) {
      userInfo.push(`Observações do usuário sobre como quer ser respondido: ${userData.observacoes}`);
    }

    if (userInfo.length > 0) {
      contextParts.push(`[CONTEXTO DO USUÁRIO]\n${userInfo.join('\n')}`);
    }
  }

  // Extrair informações relevantes do histórico recente (últimas 5 mensagens)
  const recentMessages = messages.slice(-5);
  if (recentMessages.length > 0) {
    const keyInfo: string[] = [];
    
    recentMessages.forEach((msg) => {
      if (msg.sender === 'user' && msg.text) {
        // Extrair informações importantes das mensagens do usuário
        const text = msg.text.toLowerCase();
        
        // Detectar menções a produtos, preços, formatos, etc.
        if (text.includes('produto') || text.includes('oferta')) {
          keyInfo.push(`Mencionou produto/oferta: ${msg.text.substring(0, 100)}`);
        }
        if (text.includes('preço') || text.includes('valor') || text.includes('r$')) {
          keyInfo.push(`Mencionou preço: ${msg.text.substring(0, 100)}`);
        }
        if (text.includes('funil') || text.includes('venda')) {
          keyInfo.push(`Mencionou funil/vendas: ${msg.text.substring(0, 100)}`);
        }
      }
    });

    if (keyInfo.length > 0) {
      contextParts.push(`[INFORMAÇÕES RECENTES DA CONVERSA]\n${keyInfo.join('\n')}`);
    }
  }

  return contextParts.join('\n\n');
};

/**
 * Reduz o tamanho do contexto quando necessário (para evitar limites de tokens)
 */
export const optimizeContext = (context: string, maxLength: number = 2000): string => {
  if (context.length <= maxLength) {
    return context;
  }

  // Truncar mantendo as partes mais importantes
  const lines = context.split('\n');
  const importantLines: string[] = [];
  let currentLength = 0;

  // Priorizar linhas com informações do usuário
  for (const line of lines) {
    if (line.includes('[CONTEXTO DO USUÁRIO]') || line.includes('[INFORMAÇÕES RECENTES')) {
      importantLines.push(line);
      currentLength += line.length;
    }
  }

  // Adicionar outras linhas até o limite
  for (const line of lines) {
    if (!importantLines.includes(line) && currentLength + line.length < maxLength) {
      importantLines.push(line);
      currentLength += line.length;
    }
  }

  return importantLines.join('\n');
};

