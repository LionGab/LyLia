import React, { useState } from 'react';
import { SalesScript, ScriptRequest, ScriptType } from '../types/salesScript';
import { generateSalesScript, saveScript } from '../services/salesScriptService';
import { getCurrentUser } from '../services/authService';

interface SalesScriptGeneratorProps {
  onBack: () => void;
}

const SalesScriptGenerator: React.FC<SalesScriptGeneratorProps> = ({ onBack }) => {
  const [product, setProduct] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [scriptType, setScriptType] = useState<ScriptType>('warm-call');
  const [context, setContext] = useState('');
  const [loading, setLoading] = useState(false);
  const [script, setScript] = useState<SalesScript | null>(null);
  const user = getCurrentUser();

  const handleGenerate = async () => {
    if (!product || !targetAudience) {
      alert('Preencha produto e público-alvo');
      return;
    }

    setLoading(true);
    try {
      const request: ScriptRequest = {
        product,
        targetAudience,
        scriptType,
        context: context || undefined,
      };

      const generated = await generateSalesScript(request);
      setScript(generated);
      if (user) {
        saveScript(user.email, generated);
      }
    } catch (error) {
      alert('Erro ao gerar script');
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

        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Gerador de Script de Vendas</h1>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Tipo de Script
            </label>
            <select
              value={scriptType}
              onChange={(e) => setScriptType(e.target.value as ScriptType)}
              className="w-full p-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg"
            >
              <option value="cold-call">Ligação Fria</option>
              <option value="warm-call">Ligação Quente</option>
              <option value="follow-up">Follow-up</option>
              <option value="closing">Fechamento</option>
              <option value="objection-handling">Tratamento de Objeções</option>
            </select>
          </div>

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

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Contexto Adicional (opcional)
            </label>
            <textarea
              value={context}
              onChange={(e) => setContext(e.target.value)}
              rows={3}
              className="w-full p-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg"
            />
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full bg-brand-600 hover:bg-brand-700 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? 'Gerando Script...' : 'Gerar Script'}
          </button>
        </div>

        {script && (
          <div className="mt-6 bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">{script.title}</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Duração estimada: {script.estimatedDuration}</p>
            </div>

            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Objetivo</h3>
              <p className="text-slate-600 dark:text-slate-400">{script.objective}</p>
            </div>

            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Abertura</h3>
              <p className="text-slate-600 dark:text-slate-400">{script.opening}</p>
            </div>

            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Proposta de Valor</h3>
              <p className="text-slate-600 dark:text-slate-400">{script.valueProposition}</p>
            </div>

            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Pontos de Dor</h3>
              <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-400">
                {script.painPoints.map((point, i) => (
                  <li key={i}>{point}</li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Benefícios</h3>
              <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-400">
                {script.benefits.map((benefit, i) => (
                  <li key={i}>{benefit}</li>
                ))}
              </ul>
            </div>

            {script.objections.length > 0 && (
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Objeções e Respostas</h3>
                <div className="space-y-3">
                  {script.objections.map((obj, i) => (
                    <div key={i} className="bg-slate-50 dark:bg-slate-700 p-4 rounded-lg">
                      <p className="font-medium text-slate-900 dark:text-white mb-1">"{obj.objection}"</p>
                      <p className="text-slate-600 dark:text-slate-400">{obj.response}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Fechamento</h3>
              <p className="text-slate-600 dark:text-slate-400">{script.closing}</p>
            </div>

            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Próximos Passos</h3>
              <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-400">
                {script.nextSteps.map((step, i) => (
                  <li key={i}>{step}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SalesScriptGenerator;
