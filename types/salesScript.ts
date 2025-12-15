export type ScriptType = 'cold-call' | 'warm-call' | 'follow-up' | 'closing' | 'objection-handling';

export interface SalesScript {
  type: ScriptType;
  title: string;
  objective: string;
  opening: string;
  valueProposition: string;
  painPoints: string[];
  benefits: string[];
  objections: {
    objection: string;
    response: string;
  }[];
  closing: string;
  nextSteps: string[];
  estimatedDuration: string;
}

export interface ScriptRequest {
  product: string;
  targetAudience: string;
  scriptType: ScriptType;
  context?: string;
}
