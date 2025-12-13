import React, { useState, useEffect } from 'react';
import { getTheme, toggleTheme, initTheme } from '../services/themeService';

const ThemeToggle: React.FC = () => {
  const [currentTheme, setCurrentTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    // Inicializar tema
    initTheme();
    setCurrentTheme(getTheme());

    // Observar mudanças no tema
    const observer = new MutationObserver(() => {
      setCurrentTheme(getTheme());
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, []);

  const handleToggle = () => {
    const newTheme = toggleTheme();
    setCurrentTheme(newTheme);
  };

  return (
    <button
      onClick={handleToggle}
      className="p-2 sm:p-1.5 active:bg-slate-100 dark:active:bg-slate-800 rounded-lg transition-colors touch-manipulation"
      title={currentTheme === 'light' ? 'Ativar tema escuro' : 'Ativar tema claro'}
      aria-label={currentTheme === 'light' ? 'Ativar tema escuro' : 'Ativar tema claro'}
    >
      {currentTheme === 'light' ? (
        <span className="text-xl sm:text-lg">🌙</span>
      ) : (
        <span className="text-xl sm:text-lg">☀️</span>
      )}
    </button>
  );
};

export default ThemeToggle;

