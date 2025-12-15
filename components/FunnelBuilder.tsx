import React, { useState } from 'react';
import { FunnelStructure, FunnelStep } from '../types/funnel';
import { generateFunnel, saveFunnel } from '../services/funnelService';
import { getCurrentUser } from '../services/authService';
import { loadDiagnostic } from '../services/diagnosticService';

interface FunnelBuilderProps {
  onBack: () => void;
}

const FunnelBuilder: React.FC<FunnelBuilderProps> = ({ onBack }) => {
  const [product, setProduct] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [loading, setLoading] = useState(false);
  const [funnel, setFunnel] = useState<FunnelStructure | null>(null);
  const user = getCurrentUser();

  const handleGenerate = async () => {
    if (!product || !targetAudience) {
      alert('Preencha produto e público-alvo');
      return;
    }

    setLoading(true);
    try {
      const diagnostic = user ? loadDiagnostic(user.email) : null;
      const profile = diagnostic?.result.profile;
      const generated = await generateFunnel(product, targetAudience, profile);
      setFunnel(generated);
      if (user) {
        saveFunnel(user.email, generated);
      }
    } catch (error) {
      alert('Erro ao gerar funil');
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

        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Gerador de Funil ERL</h1>

        {!funnel && (
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Produto/Serviço
              </label>
              <input
                type="text"
                value={product}
                onChange={(e) => setProduct(e.target.value)}
                placeholder="Ex: Curso de Marketing Digital"
                className="w-full p-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Público-Alvo
              </label>
              <input
                type="text"
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                placeholder="Ex: Empreendedoras iniciantes"
                className="w-full p-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg"
              />
            </div>

            <button
              onClick={handleGenerate}
              disabled={loading}
              className="w-full bg-brand-600 hover:bg-brand-700 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? 'Gerando Funil...' : 'Gerar Funil ERL'}
            </button>
          </div>
        )}

        {funnel && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">{funnel.name}</h2>
              <p className="text-slate-600 dark:text-slate-400">Público: {funnel.targetAudience}</p>
            </div>

            {funnel.steps.map((step, i) => (
              <div key={i} className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                    step.phase === 'entrada' ? 'bg-green-500' :
                    step.phase === 'relacionamento' ? 'bg-blue-500' :
                    'bg-purple-500'
                  }`}>
                    {i + 1}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{step.title}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 uppercase">{step.phase}</p>
                  </div>
                </div>

                <p className="text-slate-600 dark:text-slate-400 mb-4">{step.description}</p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <h4 className="font-medium text-slate-900 dark:text-white mb-2">Ações</h4>
                    <ul className="list-disc list-inside text-sm text-slate-600 dark:text-slate-400 space-y-1">
                      {step.actions.map((action, j) => (
                        <li key={j}>{action}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium text-slate-900 dark:text-white mb-2">Conteúdos</h4>
                    <ul className="list-disc list-inside text-sm text-slate-600 dark:text-slate-400 space-y-1">
                      {step.contentSuggestions.map((content, j) => (
                        <li key={j}>{content}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium text-slate-900 dark:text-white mb-2">Canais</h4>
                    <ul className="list-disc list-inside text-sm text-slate-600 dark:text-slate-400 space-y-1">
                      {step.channels.map((channel, j) => (
                        <li key={j}>{channel}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FunnelBuilder;
