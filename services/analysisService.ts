import { Message, Sender } from '../types';
import { ConversationAnalysis, Insights, ProgressTracker, Decision } from '../types/analysis';

/**
 * Analisa uma conversa e extrai insights
 */
export const analyzeConversation = (messages: Message[]): ConversationAnalysis => {
  const aiMessages = messages.filter(m => m.sender === Sender.AI);
  
  // Extrair produtos sugeridos
  const produtosSugeridos = extractProducts(aiMessages);
  
  // Contar funis criados
  const funisCriados = countFunnels(aiMessages);
  
  // Verificar blocos completados
  const blocosCompletados = checkCompletedBlocks(messages);
  
  // Calcular progresso
  const progresso = calculateProgress(blocosCompletados);
  
  // Gerar insights
  const insights = generateInsights(messages, blocosCompletados);
  
  // Sugerir próximos passos
  const proximosPassos = suggestNextSteps(blocosCompletados, produtosSugeridos);
  
  return {
    produtosSugeridos,
    funisCriados,
    blocosCompletados,
    proximosPassos,
    insights,
    progresso,
  };
};

/**
 * Extrai produtos mencionados nas mensagens da IA
 */
const extractProducts = (aiMessages: Message[]): string[] => {
  const produtos: string[] = [];
  const productKeywords = ['produto', 'oferta', 'mentoria', 'programa', 'curso'];
  
  aiMessages.forEach(msg => {
    if (msg.text) {
      const text = msg.text.toLowerCase();
      productKeywords.forEach(keyword => {
        if (text.includes(keyword)) {
          // Tentar extrair nome do produto
          const lines = msg.text!.split('\n');
          lines.forEach(line => {
            if (line.toLowerCase().includes('nome') || line.toLowerCase().includes('produto')) {
              const match = line.match(/[:\-]\s*(.+)/);
              if (match) {
                produtos.push(match[1].trim());
              }
            }
          });
        }
      });
    }
  });
  
  return [...new Set(produtos)].slice(0, 5);
};

/**
 * Conta quantos funis foram criados
 */
const countFunnels = (aiMessages: Message[]): number => {
  let count = 0;
  aiMessages.forEach(msg => {
    if (msg.text && (msg.text.includes('funil') || msg.text.includes('URL'))) {
      count++;
    }
  });
  return Math.min(count, 3); // Máximo 3
};

/**
 * Verifica quais blocos foram completados
 */
const checkCompletedBlocks = (messages: Message[]): ConversationAnalysis['blocosCompletados'] => {
  const allText = messages.map(m => m.text || '').join(' ').toLowerCase();
  
  return {
    diagnostico: allText.includes('resumo') || allText.includes('diagnóstico'),
    produto: allText.includes('documento do produto') || allText.includes('produto principal'),
    funil: allText.includes('mapa url') || allText.includes('funil url'),
    conteudo: allText.includes('plano de conteúdo') || allText.includes('7 dias'),
  };
};

/**
 * Calcula o progresso da conversa
 */
const calculateProgress = (blocos: ConversationAnalysis['blocosCompletados']): ProgressTracker => {
  const total = 4;
  let completos = 0;
  
  if (blocos.diagnostico) completos++;
  if (blocos.produto) completos++;
  if (blocos.funil) completos++;
  if (blocos.conteudo) completos++;
  
  const porcentagem = Math.round((completos / total) * 100);
  
  let etapaAtual = 'Início';
  if (blocos.conteudo) etapaAtual = 'Concluído';
  else if (blocos.funil) etapaAtual = 'Criando conteúdo';
  else if (blocos.produto) etapaAtual = 'Criando funil';
  else if (blocos.diagnostico) etapaAtual = 'Criando produto';
  else etapaAtual = 'Diagnóstico';
  
  const tempoEstimado = (4 - completos) * 5; // 5 min por bloco
  
  return {
    porcentagem,
    etapaAtual,
    tempoEstimado,
  };
};

/**
 * Gera insights da conversa
 */
const generateInsights = (
  messages: Message[],
  blocos: ConversationAnalysis['blocosCompletados']
): Insights => {
  const pontosFortes: string[] = [];
  const oportunidades: string[] = [];
  const alertas: string[] = [];
  const recomendacoes: string[] = [];
  
  if (blocos.diagnostico) {
    pontosFortes.push('Diagnóstico completo realizado');
  } else {
    oportunidades.push('Complete o diagnóstico para avançar');
  }
  
  if (blocos.produto) {
    pontosFortes.push('Produto principal definido');
  } else {
    alertas.push('Produto ainda não foi definido');
    recomendacoes.push('Foque em definir o produto principal');
  }
  
  if (blocos.funil) {
    pontosFortes.push('Funil URL estruturado');
  } else if (blocos.produto) {
    recomendacoes.push('Crie o funil URL para o produto definido');
  }
  
  if (blocos.conteudo) {
    pontosFortes.push('Plano de conteúdo completo');
  } else if (blocos.funil) {
    recomendacoes.push('Desenvolva o plano de conteúdo de 7 dias');
  }
  
  if (messages.length < 5) {
    alertas.push('Conversa ainda muito curta - forneça mais informações');
  }
  
  return {
    pontosFortes,
    oportunidades,
    alertas,
    recomendacoes,
  };
};

/**
 * Sugere próximos passos
 */
const suggestNextSteps = (
  blocos: ConversationAnalysis['blocosCompletados'],
  _produtos: string[]
): string[] => {
  const passos: string[] = [];
  
  if (!blocos.diagnostico) {
    passos.push('Complete o diagnóstico inicial');
  } else if (!blocos.produto) {
    passos.push('Defina seu produto principal');
  } else if (!blocos.funil) {
    passos.push('Crie o funil URL (Entrada → Relacionamento → Lucro)');
  } else if (!blocos.conteudo) {
    passos.push('Desenvolva o plano de conteúdo de 7 dias');
  } else {
    passos.push('Revise e ajuste os materiais criados');
    passos.push('Comece a executar o plano de conteúdo');
    passos.push('Monitore os resultados e ajuste conforme necessário');
  }
  
  return passos;
};

/**
 * Extrai decisões importantes da conversa
 */
export const getKeyDecisions = (messages: Message[]): Decision[] => {
  const decisions: Decision[] = [];
  const allText = messages.map(m => m.text || '').join(' ');
  
  // Detectar decisões sobre produtos
  if (allText.includes('produto') && allText.includes('escolh')) {
    decisions.push({
      tipo: 'produto',
      descricao: 'Produto principal escolhido',
      timestamp: Date.now(),
      impacto: 'alto',
    });
  }
  
  // Detectar decisões sobre preço
  if (allText.includes('preço') || allText.includes('r$')) {
    decisions.push({
      tipo: 'preco',
      descricao: 'Preço definido',
      timestamp: Date.now(),
      impacto: 'medio',
    });
  }
  
  return decisions;
};

