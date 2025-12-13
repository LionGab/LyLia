import React, { useState } from 'react';
import { BUSINESS_IDEAS, BUSINESS_TIPS, BusinessIdea } from '../constants/businessIdeas';

interface BusinessIdeasPanelProps {
  onBack?: () => void;
}

const BusinessIdeasPanel: React.FC<BusinessIdeasPanelProps> = ({ onBack }) => {
  const [selectedIdea, setSelectedIdea] = useState<BusinessIdea | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('todas');

  const categories = ['todas', ...Array.from(new Set(BUSINESS_IDEAS.map(idea => idea.category)))];
  const filteredIdeas = selectedCategory === 'todas' 
    ? BUSINESS_IDEAS 
    : BUSINESS_IDEAS.filter(idea => idea.category === selectedCategory);

  if (selectedIdea) {
    return (
      <div className="h-full flex flex-col bg-white dark:bg-slate-900">
        <div className="flex-none border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex items-center gap-3">
          <button
            onClick={() => {
              if (selectedIdea) {
                setSelectedIdea(null);
              } else if (onBack) {
                onBack();
              }
            }}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <span className="text-lg">←</span>
          </button>
          <div className="flex items-center gap-3">
            <span className="text-3xl">{selectedIdea.icon}</span>
            <div>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                {selectedIdea.title}
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">{selectedIdea.category}</p>
            </div>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-3xl mx-auto space-y-6">
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Descrição</h3>
              <p className="text-slate-700 dark:text-slate-300">{selectedIdea.description}</p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
              <h3 className="font-semibold text-slate-900 dark:text-white mb-3">Modelo de Negócio</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Público-Alvo:</p>
                  <p className="text-slate-700 dark:text-slate-300">{selectedIdea.targetAudience}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Modelo de Receita:</p>
                  <p className="text-slate-700 dark:text-slate-300">{selectedIdea.revenueModel}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Ponto de Entrada:</p>
                  <p className="text-slate-700 dark:text-slate-300">{selectedIdea.entryPoint}</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-3">Dicas de Implementação</h3>
              <ul className="space-y-2">
                {selectedIdea.tips.map((tip, index) => (
                  <li key={index} className="flex items-start gap-2 text-slate-700 dark:text-slate-300">
                    <span className="text-brand-600 dark:text-brand-400 mt-1">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white dark:bg-slate-900">
      <div className="flex-none border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex items-center gap-3">
        {onBack && (
          <button
            onClick={onBack}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <span className="text-lg">←</span>
          </button>
        )}
        <div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Indicações</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Ideias de negócios e dicas para empreender
          </p>
        </div>
      </div>

      <div className="flex-none border-b border-slate-200 dark:border-slate-800 px-6 py-3">
        <div className="flex gap-2 flex-wrap">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                selectedCategory === category
                  ? 'bg-brand-600 dark:bg-brand-500 text-white'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700'
              }`}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-5xl mx-auto space-y-8">
          {/* Ideias de Negócio */}
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              💡 Ideias de Negócio
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredIdeas.map((idea) => (
                <button
                  key={idea.id}
                  onClick={() => setSelectedIdea(idea)}
                  className="p-5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:border-brand-300 dark:hover:border-brand-500 hover:shadow-lg transition-all text-left"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-3xl">{idea.icon}</span>
                    <div className="flex-1">
                      <h4 className="font-semibold text-slate-900 dark:text-white mb-1">
                        {idea.title}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                        {idea.category}
                      </p>
                      <p className="text-sm text-slate-700 dark:text-slate-300 line-clamp-2">
                        {idea.description}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Dicas Gerais */}
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              💼 Dicas e Estratégias
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {BUSINESS_TIPS.map((tipCategory, index) => (
                <div
                  key={index}
                  className="p-5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700"
                >
                  <h4 className="font-semibold text-slate-900 dark:text-white mb-3">
                    {tipCategory.category}
                  </h4>
                  <ul className="space-y-2">
                    {tipCategory.tips.map((tip, tipIndex) => (
                      <li key={tipIndex} className="text-sm text-slate-700 dark:text-slate-300 flex items-start gap-2">
                        <span className="text-brand-600 dark:text-brand-400 mt-1">•</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessIdeasPanel;

