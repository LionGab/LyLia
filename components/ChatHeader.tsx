import React from 'react';
import { getCurrentUser, logout } from '../services/authService';
import ThemeToggle from './ThemeToggle';

interface ChatHeaderProps {
  onBack?: () => void;
  onViewConversations?: () => void;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ onBack, onViewConversations }) => {
  const user = getCurrentUser();

  const handleLogout = () => {
    logout();
    window.location.reload();
  };

  return (
    <header className="flex-none bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 px-4 py-3 flex items-center justify-between z-10 sticky top-0">
      <div className="flex items-center gap-3">
        {onBack && (
          <button
            onClick={onBack}
            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-slate-600 dark:text-slate-400"
            title="Voltar"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>
        )}
        <div className="w-8 h-8 rounded-lg bg-brand-600 dark:bg-brand-500 flex items-center justify-center text-white font-semibold text-sm">
          L
        </div>
        <div>
          <h1 className="font-semibold text-slate-900 dark:text-white text-base leading-tight">LIA</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">Mentora de Negócios</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {onViewConversations && (
          <button
            onClick={onViewConversations}
            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-slate-600 dark:text-slate-400"
            title="Ver conversas"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
            </svg>
          </button>
        )}
        <ThemeToggle />
        <button
          onClick={handleLogout}
          className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-slate-600 dark:text-slate-400"
          title="Sair"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
          </svg>
        </button>
      </div>
    </header>
  );
};

export default ChatHeader;