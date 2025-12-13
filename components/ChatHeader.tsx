import React from 'react';
import { getCurrentUser, logout } from '../services/authService';
import ThemeToggle from './ThemeToggle';

interface ChatHeaderProps {
  onBack?: () => void;
  onViewConversations?: () => void;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ onBack, onViewConversations }) => {
  // User info disponível via getCurrentUser() quando necessário
  void getCurrentUser();

  const handleLogout = () => {
    logout();
    window.location.reload();
  };

  return (
    <header className="flex-none bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 px-3 sm:px-4 py-3 pt-[calc(0.75rem+env(safe-area-inset-top))] flex items-center justify-between z-10 sticky top-0">
      <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
        {onBack && (
          <button
            onClick={onBack}
            className="p-2 sm:p-1.5 active:bg-slate-100 dark:active:bg-slate-800 rounded-lg transition-colors text-slate-700 dark:text-slate-300 touch-manipulation flex-shrink-0"
            title="Voltar"
            aria-label="Voltar"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 sm:w-5 sm:h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>
        )}
        <div className="w-10 h-10 sm:w-10 sm:h-10 rounded-lg overflow-hidden flex items-center justify-center bg-white dark:bg-slate-800 flex-shrink-0">
          <img 
            src="/images/logo-main.jpg" 
            alt="Lyla.IA Logo" 
            className="w-full h-full object-cover"
            onError={(e) => {
              // Fallback se a imagem não carregar
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              target.parentElement!.innerHTML = '<div class="w-full h-full bg-brand-600 dark:bg-brand-500 flex items-center justify-center text-white font-semibold text-sm">L</div>';
            }}
          />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="font-semibold text-slate-900 dark:text-white text-sm sm:text-base leading-tight truncate">Lyla.IA</h1>
          <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 truncate">Mentora de Negócios</p>
        </div>
      </div>
      <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
        {onViewConversations && (
          <button
            onClick={onViewConversations}
            className="p-2 sm:p-1.5 active:bg-slate-100 dark:active:bg-slate-800 rounded-lg transition-colors text-slate-700 dark:text-slate-300 touch-manipulation"
            title="Ver conversas"
            aria-label="Ver conversas"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 sm:w-5 sm:h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
            </svg>
          </button>
        )}
        <ThemeToggle />
        <button
          onClick={handleLogout}
          className="p-2 sm:p-1.5 active:bg-slate-100 dark:active:bg-slate-800 rounded-lg transition-colors text-slate-700 dark:text-slate-300 touch-manipulation"
          title="Sair"
          aria-label="Sair"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 sm:w-5 sm:h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
          </svg>
        </button>
      </div>
    </header>
  );
};

export default ChatHeader;