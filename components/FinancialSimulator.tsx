import React, { useState, useEffect } from 'react';
import { FinancialParameters, FinancialProjection } from '../types/financial';
import { calculateProjection, generateChartData, calculateScenarios, saveSimulation } from '../services/financialSimulationService';
import { getCurrentUser } from '../services/authService';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface FinancialSimulatorProps {
  onBack: () => void;
}

const FinancialSimulator: React.FC<FinancialSimulatorProps> = ({ onBack }) => {
  const [params, setParams] = useState<FinancialParameters>({
    ticketMedio: 297,
    taxaConversao: 2,
    investimentoMensal: 1000,
    custoProduto: 50,
    margemLucro: 60,
    periodo: 6,
  });

  const [projection, setProjection] = useState<FinancialProjection | null>(null);
  const [chartData, setChartData] = useState<any[]>([]);
  const [scenarios, setScenarios] = useState<any[]>([]);
  const user = getCurrentUser();

  useEffect(() => {
    calculateResults();
  }, [params]);

  const calculateResults = () => {
    const proj = calculateProjection(params);
    setProjection(proj);
    setChartData(generateChartData(params));
    setScenarios(calculateScenarios(params));
  };

  const handleSave = () => {
    if (projection && user) {
      saveSimulation(user.email, params, projection);
      alert('Simulação salva com sucesso!');
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">
        <button
          onClick={onBack}
          className="mb-6 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-2"
        >
          ← Voltar
        </button>

        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Simulador Financeiro</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Parâmetros */}
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">Parâmetros</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Ticket Médio (R$)
                </label>
                <input
                  type="number"
                  value={params.ticketMedio}
                  onChange={(e) => setParams({ ...params, ticketMedio: Number(e.target.value) })}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Taxa de Conversão (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={params.taxaConversao}
                  onChange={(e) => setParams({ ...params, taxaConversao: Number(e.target.value) })}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Investimento Mensal (R$)
                </label>
                <input
                  type="number"
                  value={params.investimentoMensal}
                  onChange={(e) => setParams({ ...params, investimentoMensal: Number(e.target.value) })}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Custo do Produto (R$)
                </label>
                <input
                  type="number"
                  value={params.custoProduto}
                  onChange={(e) => setParams({ ...params, custoProduto: Number(e.target.value) })}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Período (meses)
                </label>
                <input
                  type="number"
                  value={params.periodo}
                  onChange={(e) => setParams({ ...params, periodo: Number(e.target.value) })}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg"
                />
              </div>

              <button
                onClick={handleSave}
                className="w-full bg-brand-600 hover:bg-brand-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
              >
                Salvar Simulação
              </button>
            </div>
          </div>

          {/* Resultados */}
          <div className="space-y-6">
            {projection && (
              <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg">
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">Projeção</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Receita Bruta</p>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                      R$ {projection.receitaBruta.toLocaleString('pt-BR')}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Lucro</p>
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      R$ {projection.lucro.toLocaleString('pt-BR')}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">ROI</p>
                    <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      {projection.roi.toFixed(1)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Vendas/Mês</p>
                    <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                      {projection.vendasNecessarias}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Cenários */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">Cenários</h2>
              <div className="space-y-3">
                {scenarios.map((scenario, i) => (
                  <div key={i} className="p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-slate-900 dark:text-white">{scenario.name}</span>
                      <span className="text-sm text-slate-600 dark:text-slate-400">
                        ROI: {scenario.projection.roi.toFixed(1)}%
                      </span>
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                      Lucro: R$ {scenario.projection.lucro.toLocaleString('pt-BR')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Gráfico */}
        {chartData.length > 0 && (
          <div className="mt-6 bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">Projeção Mensal</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="receita" stroke="#10b981" name="Receita" />
                <Line type="monotone" dataKey="lucro" stroke="#3b82f6" name="Lucro" />
                <Line type="monotone" dataKey="investimento" stroke="#ef4444" name="Investimento" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
};

export default FinancialSimulator;
