import { FinancialParameters, FinancialProjection, FinancialChartData } from '../types/financial';

/**
 * Calcula projeção financeira baseada nos parâmetros
 */
export const calculateProjection = (params: FinancialParameters): FinancialProjection => {
  const { ticketMedio, taxaConversao, investimentoMensal, custoProduto, margemLucro, periodo } = params;

  // Calcular vendas necessárias por mês para atingir ROI positivo
  const investimentoTotal = investimentoMensal * periodo;
  const vendasNecessariasMensal = Math.ceil(investimentoMensal / (ticketMedio * (taxaConversao / 100)));

  // Receita bruta mensal
  const receitaBrutaMensal = vendasNecessariasMensal * ticketMedio;
  const receitaBrutaTotal = receitaBrutaMensal * periodo;

  // Custos mensais
  const custoProdutoMensal = vendasNecessariasMensal * custoProduto;
  const custoTotal = custoProdutoMensal * periodo + investimentoTotal;

  // Receita líquida
  const receitaLiquidaTotal = receitaBrutaTotal - custoTotal;

  // Lucro
  const lucroTotal = receitaLiquidaTotal - investimentoTotal;

  // ROI
  const roi = investimentoTotal > 0 ? (lucroTotal / investimentoTotal) * 100 : 0;

  return {
    receitaBruta: receitaBrutaTotal,
    receitaLiquida: receitaLiquidaTotal,
    custos: custoTotal,
    lucro: lucroTotal,
    roi,
    ticketMedio,
    vendasNecessarias: vendasNecessariasMensal,
    investimentoTotal,
  };
};

/**
 * Gera dados para gráfico mensal
 */
export const generateChartData = (params: FinancialParameters): FinancialChartData[] => {
  const { ticketMedio, taxaConversao, investimentoMensal, custoProduto, periodo } = params;
  const vendasMensal = Math.ceil(investimentoMensal / (ticketMedio * (taxaConversao / 100)));

  const data: FinancialChartData[] = [];
  let receitaAcumulada = 0;
  let investimentoAcumulado = 0;

  for (let i = 1; i <= periodo; i++) {
    const receitaMensal = vendasMensal * ticketMedio;
    const custoMensal = vendasMensal * custoProduto;
    const lucroMensal = receitaMensal - custoMensal - investimentoMensal;

    receitaAcumulada += receitaMensal;
    investimentoAcumulado += investimentoMensal;

    data.push({
      mes: `Mês ${i}`,
      receita: receitaAcumulada,
      lucro: receitaAcumulada - (vendasMensal * custoProduto * i) - investimentoAcumulado,
      investimento: investimentoAcumulado,
    });
  }

  return data;
};

/**
 * Calcula múltiplos cenários
 */
export const calculateScenarios = (baseParams: FinancialParameters): Array<{ name: string; projection: FinancialProjection }> => {
  const scenarios = [
    {
      name: 'Conservador',
      params: {
        ...baseParams,
        taxaConversao: baseParams.taxaConversao * 0.7,
        ticketMedio: baseParams.ticketMedio * 0.9,
      },
    },
    {
      name: 'Realista',
      params: baseParams,
    },
    {
      name: 'Otimista',
      params: {
        ...baseParams,
        taxaConversao: baseParams.taxaConversao * 1.3,
        ticketMedio: baseParams.ticketMedio * 1.1,
      },
    },
  ];

  return scenarios.map((scenario) => ({
    name: scenario.name,
    projection: calculateProjection(scenario.params),
  }));
};

/**
 * Salva simulação
 */
export const saveSimulation = (email: string, params: FinancialParameters, projection: FinancialProjection): void => {
  try {
    localStorage.setItem(`erl_lia_simulation_${email}`, JSON.stringify({
      params,
      projection,
      timestamp: new Date().toISOString(),
    }));
  } catch (error) {
    console.error('Erro ao salvar simulação', error);
  }
};

/**
 * Carrega simulação salva
 */
export const loadSimulation = (email: string): { params: FinancialParameters; projection: FinancialProjection; timestamp: string } | null => {
  try {
    const data = localStorage.getItem(`erl_lia_simulation_${email}`);
    if (!data) return null;
    return JSON.parse(data);
  } catch (error) {
    console.error('Erro ao carregar simulação', error);
    return null;
  }
};
