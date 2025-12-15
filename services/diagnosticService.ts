import { DiagnosticQuestion, DiagnosticAnswer, DiagnosticResult, ProfileType } from '../types/diagnostic';
import { sendContentToGemini } from './geminiService';
import { logger } from './logger';

export const DIAGNOSTIC_QUESTIONS: DiagnosticQuestion[] = [
  {
    id: 'experience',
    question: 'Qual seu nível de experiência com negócios digitais?',
    type: 'multiple-choice',
    options: ['Iniciante (menos de 6 meses)', 'Intermediário (6 meses - 2 anos)', 'Avançado (mais de 2 anos)'],
    weight: 3,
  },
  {
    id: 'audience',
    question: 'Você já tem um público-alvo definido e engajado?',
    type: 'multiple-choice',
    options: ['Não, ainda não tenho público', 'Sim, tenho alguns seguidores', 'Sim, tenho uma audiência engajada'],
    weight: 4,
  },
  {
    id: 'resources',
    question: 'Quanto você pode investir mensalmente em marketing?',
    type: 'multiple-choice',
    options: ['Até R$ 500', 'R$ 500 - R$ 2.000', 'Acima de R$ 2.000'],
    weight: 3,
  },
  {
    id: 'time',
    question: 'Quantas horas por semana você pode dedicar ao negócio?',
    type: 'multiple-choice',
    options: ['Menos de 10 horas', '10-20 horas', 'Mais de 20 horas'],
    weight: 2,
  },
  {
    id: 'expertise',
    question: 'Você tem expertise em alguma área específica?',
    type: 'text',
    weight: 2,
  },
];

/**
 * Calcula o perfil baseado nas respostas usando regras simples
 */
const calculateProfileSimple = (answers: DiagnosticAnswer[]): ProfileType => {
  let scoreA = 0;
  let scoreB = 0;

  answers.forEach((answer) => {
    const question = DIAGNOSTIC_QUESTIONS.find((q) => q.id === answer.questionId);
    if (!question) return;

    const weight = question.weight;

    if (question.id === 'experience') {
      if (answer.answer === 'Iniciante (menos de 6 meses)') scoreA += weight * 2;
      else if (answer.answer === 'Intermediário (6 meses - 2 anos)') {
        scoreA += weight;
        scoreB += weight;
      } else scoreB += weight * 2;
    } else if (question.id === 'audience') {
      if (answer.answer === 'Não, ainda não tenho público') scoreA += weight * 2;
      else if (answer.answer === 'Sim, tenho alguns seguidores') {
        scoreA += weight;
        scoreB += weight;
      } else scoreB += weight * 2;
    } else if (question.id === 'resources') {
      if (answer.answer === 'Até R$ 500') scoreA += weight * 2;
      else if (answer.answer === 'R$ 500 - R$ 2.000') {
        scoreA += weight;
        scoreB += weight;
      } else scoreB += weight * 2;
    } else if (question.id === 'time') {
      if (answer.answer === 'Menos de 10 horas') scoreA += weight;
      else if (answer.answer === '10-20 horas') {
        scoreA += weight;
        scoreB += weight;
      } else scoreB += weight;
    }
  });

  return scoreA >= scoreB ? 'A' : 'B';
};

/**
 * Usa IA para gerar diagnóstico detalhado
 */
const generateDiagnosticWithAI = async (
  answers: DiagnosticAnswer[],
  profile: ProfileType
): Promise<DiagnosticResult> => {
  const answersText = answers
    .map((ans) => {
      const question = DIAGNOSTIC_QUESTIONS.find((q) => q.id === ans.questionId);
      return `P: ${question?.question}\nR: ${ans.answer}`;
    })
    .join('\n\n');

  const prompt = `Com base nas respostas abaixo, crie um diagnóstico detalhado para uma empreendedora digital classificada como Perfil ${profile}.

Respostas:
${answersText}

Gere um diagnóstico em formato JSON com:
- confidence: número de 0-100 representando confiança na classificação
- reasoning: explicação detalhada do porquê do perfil ${profile}
- recommendations: array com 3-5 recomendações específicas
- strengths: array com 3-5 pontos fortes identificados
- areasForGrowth: array com 3-5 áreas de crescimento

Responda APENAS com JSON válido, sem markdown.`;

  try {
    const response = await sendContentToGemini([], prompt);
    const jsonText = response.text?.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim() || '{}';
    const parsed = JSON.parse(jsonText);

    return {
      profile,
      confidence: parsed.confidence || 75,
      reasoning: parsed.reasoning || `Perfil ${profile} identificado com base nas respostas.`,
      recommendations: parsed.recommendations || [],
      strengths: parsed.strengths || [],
      areasForGrowth: parsed.areasForGrowth || [],
    };
  } catch (error) {
    logger.error('Erro ao gerar diagnóstico com IA', error);
    // Fallback para diagnóstico básico
    return {
      profile,
      confidence: 70,
      reasoning: `Perfil ${profile} identificado com base nas respostas fornecidas.`,
      recommendations: [
        `Foque em estratégias adequadas para Perfil ${profile}`,
        'Desenvolva seu público-alvo gradualmente',
        'Crie conteúdo de valor consistentemente',
      ],
      strengths: ['Iniciativa e vontade de empreender'],
      areasForGrowth: ['Desenvolvimento de audiência', 'Estratégia de conteúdo'],
    };
  }
};

/**
 * Processa diagnóstico completo
 */
export const processDiagnostic = async (
  answers: DiagnosticAnswer[]
): Promise<DiagnosticResult> => {
  // Calcular perfil usando regras simples
  const profile = calculateProfileSimple(answers);

  // Gerar diagnóstico detalhado com IA
  const result = await generateDiagnosticWithAI(answers, profile);

  return result;
};

/**
 * Salva diagnóstico no localStorage
 */
export const saveDiagnostic = (email: string, result: DiagnosticResult, answers: DiagnosticAnswer[]): void => {
  try {
    const data = {
      result,
      answers,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem(`erl_lia_diagnostic_${email}`, JSON.stringify(data));
  } catch (error) {
    logger.error('Erro ao salvar diagnóstico', error);
  }
};

/**
 * Carrega diagnóstico salvo
 */
export const loadDiagnostic = (email: string): { result: DiagnosticResult; answers: DiagnosticAnswer[]; timestamp: string } | null => {
  try {
    const data = localStorage.getItem(`erl_lia_diagnostic_${email}`);
    if (!data) return null;
    return JSON.parse(data);
  } catch (error) {
    logger.error('Erro ao carregar diagnóstico', error);
    return null;
  }
};
