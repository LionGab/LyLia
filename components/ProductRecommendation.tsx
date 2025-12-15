import React, { useState, useEffect } from 'react';
import { RecommendationResult, ProductRecommendation } from '../types/recommendation';
import { generateRecommendations, saveRecommendations, loadRecommendations } from '../services/recommendationService';
import { loadDiagnostic } from '../services/diagnosticService';
import { getCurrentUser } from '../services/authService';

interface ProductRecommendationProps {
  onBack: () => void;
}

const ProductRecommendation: React.FC<ProductRecommendationProps> = ({ onBack }) => {
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<RecommendationResult | null>(null);
  const user = getCurrentUser();

  useEffect(() => {
    loadSavedRecommendations();
  }, []);

  const loadSavedRecommendations = () => {
    if (user) {
      const saved = loadRecommendations(user.email);
      if (saved) {
        setRecommendations(saved);
      }
    }
  };

  const handleGenerate = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const diagnostic = loadDiagnostic(user.email);
      const profile = diagnostic?.result.profile || 'A';
      const result = await generateRecommendations(profile, diagnostic?.result.reasoning);
      setRecommendations(result);
      saveRecommendations(user.email, result);
    } catch (error) {
      alert('Erro ao gerar recomendações. Faça o diagnóstico primeiro.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={onBack}
          className="mb-6 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-2"
        >
          ← Voltar
        </button>

        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Recomendações de Produto</h1>

        {!recommendations && (
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg text-center">
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              Faça o diagnóstico primeiro para receber recomendações personalizadas.
            </p>
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="bg-brand-600 hover:bg-brand-700 text-white font-medium py-3 px-6 rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? 'Gerando...' : 'Gerar Recomendações'}
            </button>
          </div>
        )}

        {recommendations && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">Análise</h2>
              <p className="text-slate-600 dark:text-slate-400 mb-4">{recommendations.reasoning}</p>
              <div>
                <h3 className="font-medium text-slate-900 dark:text-white mb-2">Próximos Passos</h3>
                <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-400">
                  {recommendations.nextSteps.map((step, i) => (
                    <li key={i}>{step}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recommendations.topRecommendations.map((product, i) => (
                <div key={i} className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">{product.name}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">{product.description}</p>
                  <div className="space-y-2 mb-4">
                    <p className="text-sm">
                      <span className="font-medium">Investimento:</span> R$ {product.priceRange.suggested.toLocaleString('pt-BR')}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Tempo para lançar:</span> {product.timeToLaunch}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Potencial:</span> {product.potentialRevenue}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-white mb-1">Por que recomendar:</p>
                    <ul className="list-disc list-inside text-sm text-slate-600 dark:text-slate-400">
                      {product.whyRecommended.map((reason, j) => (
                        <li key={j}>{reason}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductRecommendation;
