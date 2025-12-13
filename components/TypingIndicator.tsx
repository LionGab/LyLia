import React from 'react';

const TypingIndicator: React.FC = () => {
  return (
    <div className="flex justify-start mb-4 w-full">
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm flex items-center space-x-1.5 h-12">
        <div className="w-2 h-2 bg-brand-400 dark:bg-brand-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
        <div className="w-2 h-2 bg-brand-400 dark:bg-brand-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
        <div className="w-2 h-2 bg-brand-400 dark:bg-brand-500 rounded-full animate-bounce"></div>
        <span className="ml-2 text-xs text-slate-500 dark:text-slate-400 font-medium">Lyla.IA pensando...</span>
      </div>
    </div>
  );
};

export default TypingIndicator;
