import React, { useState, useEffect } from 'react';
import { login } from '../services/authService';
import { initTheme } from '../services/themeService';

interface LoginScreenProps {
  onLoginSuccess: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    initTheme();
  }, []);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setError('Por favor, insira seu email.');
      return;
    }

    if (!validateEmail(trimmedEmail)) {
      setError('Por favor, insira um email válido.');
      return;
    }

    setIsLoading(true);

    // Simular pequeno delay para melhor UX
    setTimeout(() => {
      const success = login(trimmedEmail);
      
      if (success) {
        onLoginSuccess();
      } else {
        setError('Este email não está autorizado. Entre em contato com o administrador.');
      }
      
      setIsLoading(false);
    }, 300);
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 dark:from-slate-900 to-slate-200 dark:to-slate-800 flex items-center justify-center p-4 sm:p-6 transition-colors">
      <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-6 sm:p-8 transition-colors">
        <div className="text-center mb-8">
          <div className="w-24 h-24 rounded-2xl overflow-hidden bg-gradient-to-tr from-brand-500 to-purple-500 flex items-center justify-center shadow-lg mx-auto mb-4">
            <img 
              src="/images/logo-main.jpg" 
              alt="Funil ERL Logo" 
              className="w-full h-full object-cover"
              onError={(e) => {
                // Fallback se a imagem não carregar
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const parent = target.parentElement!;
                parent.className = 'w-24 h-24 rounded-2xl bg-gradient-to-tr from-brand-500 to-purple-500 flex items-center justify-center text-white font-bold text-3xl shadow-lg mx-auto mb-4';
                parent.textContent = 'F';
              }}
            />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Funil ERL</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Método ERL - Acesso Restrito</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError(null);
              }}
              placeholder="seu@email.com"
              className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-brand-500 dark:focus:ring-brand-400 focus:border-brand-500 dark:focus:border-brand-400 outline-none transition-all text-slate-800 dark:text-white bg-white dark:bg-slate-700"
              disabled={isLoading}
              autoFocus
            />
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3.5 sm:py-3 px-4 rounded-lg font-medium text-white transition-all touch-manipulation ${
              isLoading
                ? 'bg-slate-400 dark:bg-slate-600 cursor-not-allowed'
                : 'bg-brand-600 dark:bg-brand-500 active:bg-brand-700 dark:active:bg-brand-600 shadow-md active:shadow-lg active:scale-[0.98]'
            }`}
          >
            {isLoading ? 'Verificando...' : 'Entrar'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-xs text-slate-500 dark:text-slate-500">
            Apenas usuários autorizados podem acessar esta plataforma.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;

