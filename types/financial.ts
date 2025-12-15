export interface FinancialParameters {
  ticketMedio: number;
  taxaConversao: number; // porcentagem (0-100)
  investimentoMensal: number;
  custoProduto: number;
  margemLucro: number; // porcentagem (0-100)
  periodo: number; // meses
}

export interface FinancialProjection {
  receitaBruta: number;
  receitaLiquida: number;
  custos: number;
  lucro: number;
  roi: number; // porcentagem
  ticketMedio: number;
  vendasNecessarias: number;
  investimentoTotal: number;
}

export interface FinancialScenario {
  name: string;
  parameters: FinancialParameters;
  projection: FinancialProjection;
}

export interface FinancialChartData {
  mes: string;
  receita: number;
  lucro: number;
  investimento: number;
}
