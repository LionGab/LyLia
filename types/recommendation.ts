export type ProductType = 'mentoria' | 'curso-digital' | 'comunidade-paga' | 'consultoria' | 'produto-fisico' | 'servico';

export interface ProductRecommendation {
  type: ProductType;
  name: string;
  description: string;
  whyRecommended: string[];
  priceRange: {
    min: number;
    max: number;
    suggested: number;
  };
  effort: 'baixo' | 'medio' | 'alto';
  timeToLaunch: string; // estimativa
  potentialRevenue: 'baixo' | 'medio' | 'alto';
}

export interface RecommendationResult {
  profile: 'A' | 'B';
  topRecommendations: ProductRecommendation[];
  reasoning: string;
  nextSteps: string[];
}
