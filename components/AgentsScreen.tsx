import React, { useState, useEffect } from 'react';
import { AGENTS, Agent } from '../types/agents';
import { getCurrentUser } from '../services/authService';
import { getAllThreads } from '../services/threadService';
import { initTheme } from '../services/themeService';
import ThemeToggle from './ThemeToggle';

interface AgentsScreenProps {
  onSelectAgent: (agentId: string) => void;
  onViewHistory: (sessionId: string) => void;
  onViewTutorials?: () => void;
  onViewIdeas?: () => void;
  onViewPersonalization?: () => void;
  onViewDiagnostic?: () => void;
  onViewFinancial?: () => void;
  onViewRecommendations?: () => void;
  onViewFunnel?: () => void;
  onViewContent?: () => void;
  onViewSalesScript?: () => void;
}

const AgentsScreen: React.FC<AgentsScreenProps> = ({
  onSelectAgent,
  onViewHistory,
  onViewTutorials,
  onViewIdeas,
  onViewPersonalization,
  onViewDiagnostic,
  onViewFinancial,
  onViewRecommendations,
  onViewFunnel,
  onViewContent,
  onViewSalesScript,
}) => {
  const [threads, setThreads] = useState<ReturnType<typeof getAllThreads>>([]);
  const [showSidebar, setShowSidebar] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 768;
    }
    return false;
  });
  const user = getCurrentUser();

  useEffect(() => {
    initTheme();

    const loadThreads = () => {
      setThreads(getAllThreads());
    };

    loadThreads();

    const interval = setInterval(loadThreads, 2000);
    const handleFocus = () => loadThreads();
    window.addEventListener('focus', handleFocus);

    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setShowSidebar(true);
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const getAgentColorClass = (color: Agent['color']) => {
    switch (color) {
      case 'orange':
        return 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400';
      case 'blue':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400';
      case 'purple':
        return 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400';
      case 'green':
        return 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400';
      default:
        return 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300';
    }
  };

  return (
    <div className="flex h-screen w-full bg-white dark:bg-slate-900 text-slate-900 dark:text-white overflow-hidden transition-colors">
      {/* Overlay mobile */}
      {showSidebar && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity"
          onClick={() => setShowSidebar(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed md:static inset-y-0 left-0 w-72 sm:w-64 bg-slate-50 dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex flex-col transition-transform duration-300 ease-in-out z-50 md:z-auto flex-shrink-0 ${showSidebar ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
          {/* Logo */}
          <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-700 flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg overflow-hidden flex-shrink-0">
              <img
                src="/images/logo-main.jpg"
                alt="Lyla MED Logo"
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
            </div>
            <h1 className="text-lg sm:text-xl font-bold">
              <span className="text-slate-900 dark:text-white">Lyla</span>
              <span className="text-brand-600 dark:text-brand-400"> MED</span>
            </h1>
            <button
              onClick={() => setShowSidebar(false)}
              className="ml-auto md:hidden p-2 active:bg-slate-200 dark:active:bg-slate-700 rounded-lg transition-colors touch-manipulation"
              aria-label="Fechar menu"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Navigation */}
          <nav className="p-2 sm:p-3 space-y-1 overflow-y-auto">
            <button className="w-full flex items-center gap-3 px-3 py-3 sm:py-2 bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-400 rounded-lg text-left active:bg-brand-100 dark:active:bg-brand-900/30 transition-colors touch-manipulation min-h-[44px]">
              <span className="text-base sm:text-sm">🤖</span>
              <span className="text-sm font-medium">Modos MED</span>
            </button>

            {/* Menu */}
            <div className="pt-2 border-t border-slate-200 dark:border-slate-700 mt-2">
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 px-3 uppercase tracking-wide">Menu</p>
              {onViewPersonalization && (
                <button
                  onClick={onViewPersonalization}
                  className="w-full flex items-center gap-3 px-3 py-3 sm:py-2 text-slate-600 dark:text-slate-400 active:bg-slate-100 dark:active:bg-slate-700 rounded-lg text-left transition-colors touch-manipulation min-h-[44px]"
                >
                  <span className="text-base sm:text-sm">⚙️</span>
                  <span className="text-sm">Personalização</span>
                </button>
              )}
              {onViewTutorials && (
                <button
                  onClick={onViewTutorials}
                  className="w-full flex items-center gap-3 px-3 py-3 sm:py-2 text-slate-600 dark:text-slate-400 active:bg-slate-100 dark:active:bg-slate-700 rounded-lg text-left transition-colors touch-manipulation min-h-[44px]"
                >
                  <span className="text-base sm:text-sm">🎓</span>
                  <span className="text-sm">Tutoriais</span>
                </button>
              )}
            </div>
          </nav>

          {/* History */}
          <div className="flex-1 overflow-y-auto p-3 border-t border-slate-200 dark:border-slate-700 min-h-0">
            <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 px-2 uppercase tracking-wide">Histórico</h3>
            <div className="space-y-1">
              {threads.length === 0 ? (
                <p className="text-xs text-slate-400 dark:text-slate-500 px-2 py-4 text-center">
                  Nenhuma conversa ainda
                </p>
              ) : (
                <>
                  {threads.slice(0, 8).map((thread) => {
                    const date = new Date(thread.lastMessageTime).toLocaleDateString('pt-BR');
                    return (
                      <div
                        key={thread.id}
                        className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer transition-colors group"
                        onClick={() => onViewHistory(thread.id)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-slate-700 dark:text-slate-300 truncate">{thread.title}</p>
                            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{date}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </>
              )}
            </div>
          </div>

          {/* User Info */}
          {user && (
            <div className="p-3 border-t border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-400 flex items-center justify-center text-xs font-semibold">
                  {user.email.substring(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate">{user.email}</p>
                </div>
              </div>
            </div>
          )}
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden bg-white dark:bg-slate-900 transition-colors min-w-0">
        {/* Header */}
        <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-3 sm:px-6 py-3 sm:py-4 flex items-center justify-between transition-colors">
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className="p-3 sm:p-2 active:bg-slate-100 dark:active:bg-slate-800 rounded-lg transition-colors touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label={showSidebar ? 'Fechar menu' : 'Abrir menu'}
            >
              <span className="text-xl sm:text-lg text-slate-600 dark:text-slate-400">☰</span>
            </button>
            <h2 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-white">Escolha seu Modo</h2>
          </div>
          <ThemeToggle />
        </header>

        {/* Agents Grid */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-6 bg-slate-50 dark:bg-slate-900 transition-colors overscroll-contain min-h-0">
          <div className="max-w-4xl mx-auto w-full">
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 text-center">
              Escolha o modo que resolve seu travamento agora
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {AGENTS.map((agent) => (
                <button
                  key={agent.id}
                  type="button"
                  className="w-full bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 hover:border-brand-300 dark:hover:border-brand-500 hover:shadow-lg transition-all text-left touch-manipulation"
                  onClick={() => onSelectAgent(agent.id)}
                >
                  <div className="flex items-center gap-4 mb-3">
                    <div className={`w-12 h-12 rounded-xl ${getAgentColorClass(agent.color)} flex items-center justify-center text-2xl flex-shrink-0`}>
                      {agent.icon}
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-slate-900 dark:text-white">{agent.name}</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{agent.title}</p>
                    </div>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-300 italic">"{agent.description}"</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AgentsScreen;
