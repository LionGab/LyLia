export type ProfileType = 'A' | 'B';

export interface DiagnosticQuestion {
  id: string;
  question: string;
  type: 'multiple-choice' | 'text' | 'scale';
  options?: string[];
  weight: number; // Peso da pergunta no diagnóstico
}

export interface DiagnosticAnswer {
  questionId: string;
  answer: string | number;
}

export interface DiagnosticResult {
  profile: ProfileType;
  confidence: number; // 0-100
  reasoning: string;
  recommendations: string[];
  strengths: string[];
  areasForGrowth: string[];
}

export interface DiagnosticData {
  answers: DiagnosticAnswer[];
  result: DiagnosticResult;
  timestamp: Date;
}
