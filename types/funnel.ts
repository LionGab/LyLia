export type FunnelPhase = 'entrada' | 'relacionamento' | 'lucro';

export interface FunnelStep {
  id: string;
  phase: FunnelPhase;
  title: string;
  description: string;
  actions: string[];
  contentSuggestions: string[];
  channels: string[];
  order: number;
}

export interface FunnelStructure {
  id: string;
  name: string;
  product: string;
  targetAudience: string;
  steps: FunnelStep[];
  createdAt: Date;
  updatedAt: Date;
}
