import React, { useState } from 'react';
import { DiagnosticQuestion, DiagnosticAnswer, DiagnosticResult } from '../types/diagnostic';
import { DIAGNOSTIC_QUESTIONS, processDiagnostic, saveDiagnostic } from '../services/diagnosticService';
import { getCurrentUser } from '../services/authService';
import { logger } from '../services/logger';

interface DiagnosticFlowProps {
  onComplete: (result: DiagnosticResult) => void;
  onBack: () => void;
}

const DiagnosticFlow: React.FC<DiagnosticFlowProps> = ({ onComplete, onBack }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<DiagnosticAnswer[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DiagnosticResult | null>(null);

  const currentQuestion = DIAGNOSTIC_QUESTIONS[currentStep];
  const user = getCurrentUser();

  const handleAnswer = (answer: string | number) => {
    const newAnswers = [...answers, { questionId: currentQuestion.id, answer }];
    setAnswers(newAnswers);

    if (currentStep < DIAGNOSTIC_QUESTIONS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete(newAnswers);
    }
  };

  const handleComplete = async (finalAnswers: DiagnosticAnswer[]) => {
    setLoading(true);
    try {
      const diagnosticResult = await processDiagnostic(finalAnswers);
      setResult(diagnosticResult);
      if (user) {
        saveDiagnostic(user.email, diagnosticResult, finalAnswers);
      }
    } catch (error) {
      logger.error('Erro ao processar diagnóstico', error);
      alert('Erro ao processar diagnóstico. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleFinish = () => {
    if (result) {
      onComplete(result);
    }
  };

  if (result) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-900 p-4 sm:p-6">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={onBack}
            className="mb-6 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-2"
          >
            ← Voltar
          </button>

          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg">
            <div className="text-center mb-6">
              <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full text-3xl font-bold mb-4 ${
                result.profile === 'A' 
                  ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
                  : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
              }`}>
                {result.profile}
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                Perfil {result.profile} Identificado
              </h2>
              <p className="text-slate-600 dark:text-slate-400">
                Confiança: {result.confidence}%
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Análise</h3>
                <p className="text-slate-600 dark:text-slate-400">{result.reasoning}</p>
              </div>

              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Pontos Fortes</h3>
                <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-400">
                  {result.strengths.map((strength, i) => (
                    <li key={i}>{strength}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Recomendações</h3>
                <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-400">
                  {result.recommendations.map((rec, i) => (
                    <li key={i}>{rec}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Áreas de Crescimento</h3>
                <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-400">
                  {result.areasForGrowth.map((area, i) => (
                    <li key={i}>{area}</li>
                  ))}
                </ul>
              </div>
            </div>

            <button
              onClick={handleFinish}
              className="w-full mt-6 bg-brand-600 hover:bg-brand-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
            >
              Continuar
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600 mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Processando diagnóstico...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 p-4 sm:p-6">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={onBack}
          className="mb-6 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-2"
        >
          ← Voltar
        </button>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-500 dark:text-slate-400">
                Pergunta {currentStep + 1} de {DIAGNOSTIC_QUESTIONS.length}
              </span>
              <span className="text-sm text-slate-500 dark:text-slate-400">
                {Math.round(((currentStep + 1) / DIAGNOSTIC_QUESTIONS.length) * 100)}%
              </span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
              <div
                className="bg-brand-600 h-2 rounded-full transition-all"
                style={{ width: `${((currentStep + 1) / DIAGNOSTIC_QUESTIONS.length) * 100}%` }}
              />
            </div>
          </div>

          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
            {currentQuestion.question}
          </h2>

          <div className="space-y-3">
            {currentQuestion.type === 'multiple-choice' && currentQuestion.options ? (
              currentQuestion.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswer(option)}
                  className="w-full text-left p-4 bg-slate-50 dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 rounded-lg transition-colors border border-slate-200 dark:border-slate-600"
                >
                  {option}
                </button>
              ))
            ) : (
              <textarea
                className="w-full p-4 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg resize-none"
                rows={4}
                placeholder="Digite sua resposta..."
                onBlur={(e) => {
                  if (e.target.value.trim()) {
                    handleAnswer(e.target.value);
                  }
                }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiagnosticFlow;
