import React, { useState, useEffect } from 'react';
import { AGENTS, CATEGORIES, Agent } from '../types/agents';
import { getCurrentUser } from '../services/authService';
import { groupConversationsBySession } from '../services/historyService';
import { Message } from '../types';
import { initTheme } from '../services/themeService';
import ThemeToggle from './ThemeToggle';

interface AgentsScreenProps {
  onSelectAgent: (agentId: string) => void;
  onViewHistory: (sessionId: string) => void;
  onViewTutorials?: () => void;
  onViewIdeas?: () => void;
  onViewPersonalization?: () => void;
}

const AgentsScreen: React.FC<AgentsScreenProps> = ({ onSelectAgent, onViewHistory, onViewTutorials, onViewIdeas, onViewPersonalization }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');
  // Mobile-first: sidebar fechado por padrão no mobile, aberto no desktop
  const [showSidebar, setShowSidebar] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 768; // md breakpoint
    }
    return false;
  });
  const user = getCurrentUser();

  useEffect(() => {
    initTheme();
    
    // Ajustar sidebar quando redimensionar
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setShowSidebar(true);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Carregar histórico do localStorage
  const loadHistory = (): Message[] => {
    if (!user) return [];
    const storageKey = `erl_lia_chat_history_${user.email}`;
    const savedHistory = localStorage.getItem(storageKey);
    if (savedHistory) {
      try {
        return JSON.parse(savedHistory);
      } catch {
        return [];
      }
    }
    return [];
  };

  const messages = loadHistory();
  const sessions = groupConversationsBySession(messages);

  const filteredAgents = selectedCategory === 'todos'
    ? AGENTS.filter(a => a.enabled)
    : selectedCategory === 'arquitetos'
    ? AGENTS.filter(a => a.enabled && a.category === 'outros')
    : AGENTS.filter(a => a.enabled && a.category === selectedCategory);

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
      
      {/* Sidebar - Mobile drawer */}
      <aside className={`fixed md:static inset-y-0 left-0 w-72 sm:w-64 bg-slate-50 dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex flex-col transition-transform duration-300 ease-in-out z-50 md:z-auto flex-shrink-0 ${showSidebar ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
          {/* Logo */}
          <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-700 flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg overflow-hidden flex-shrink-0">
              <img 
                src="/images/logo-main.jpg" 
                alt="Funil ERL Logo" 
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
            </div>
            <h1 className="text-lg sm:text-xl font-bold">
              <span className="text-slate-900 dark:text-white">Funil</span>
              <span className="text-brand-600 dark:text-brand-400"> ERL</span>
            </h1>
            {/* Botão fechar mobile */}
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
          <nav className="p-2 sm:p-3 space-y-1">
            <button className="w-full flex items-center gap-3 px-3 py-3 sm:py-2 bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-400 rounded-lg text-left active:bg-brand-100 dark:active:bg-brand-900/30 transition-colors touch-manipulation min-h-[44px]">
              <span className="text-base sm:text-sm">🤖</span>
              <span className="text-sm font-medium">Agentes</span>
            </button>
            <button 
              onClick={onViewPersonalization}
              className="w-full flex items-center gap-3 px-3 py-3 sm:py-2 text-slate-600 dark:text-slate-400 active:bg-slate-100 dark:active:bg-slate-700 rounded-lg text-left transition-colors touch-manipulation min-h-[44px]"
            >
              <span className="text-base sm:text-sm">⚙️</span>
              <span className="text-sm">Personalização</span>
            </button>
            <button 
              onClick={onViewTutorials}
              className="w-full flex items-center gap-3 px-3 py-3 sm:py-2 text-slate-600 dark:text-slate-400 active:bg-slate-100 dark:active:bg-slate-700 rounded-lg text-left transition-colors touch-manipulation min-h-[44px]"
            >
              <span className="text-base sm:text-sm">🎓</span>
              <span className="text-sm">Tutoriais</span>
            </button>
            <button 
              onClick={onViewIdeas}
              className="w-full flex items-center gap-3 px-3 py-3 sm:py-2 text-slate-600 dark:text-slate-400 active:bg-slate-100 dark:active:bg-slate-700 rounded-lg text-left transition-colors touch-manipulation min-h-[44px]"
            >
              <span className="text-base sm:text-sm">👥</span>
              <span className="text-sm">Indicações</span>
            </button>
          </nav>

          {/* History */}
          <div className="flex-1 overflow-y-auto p-3 border-t border-slate-200 dark:border-slate-700 min-h-0">
            <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 px-2 uppercase tracking-wide">Histórico</h3>
            <div className="space-y-1">
              {sessions.length === 0 ? (
                <p className="text-xs text-slate-400 dark:text-slate-500 px-2 py-4 text-center">
                  Nenhuma conversa ainda
                </p>
              ) : (
                <>
                  {sessions.slice(0, 8).map((session) => (
                    <div
                      key={session.id}
                      className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer transition-colors group"
                      onClick={() => onViewHistory(session.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-slate-700 dark:text-slate-300 truncate">{session.summary}</p>
                          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{session.date}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                  {sessions.length > 8 && (
                    <button className="w-full text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 text-center py-2">
                      Carregar mais →
                    </button>
                  )}
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
            <h2 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-white">Todos os Agentes</h2>
          </div>
          <ThemeToggle />
        </header>

        {/* Filters */}
        <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-3 sm:px-6 py-3 transition-colors overflow-x-auto">
          <div className="flex gap-2 flex-nowrap sm:flex-wrap min-w-max sm:min-w-0">
            {CATEGORIES.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-3 py-2.5 sm:py-1.5 rounded-lg text-xs font-medium transition-colors touch-manipulation whitespace-nowrap ${
                  selectedCategory === category.id
                    ? 'bg-brand-600 dark:bg-brand-500 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 active:bg-slate-200 dark:active:bg-slate-700'
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>

        {/* Agents Grid */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-6 bg-slate-50 dark:bg-slate-900 transition-colors overscroll-contain min-h-0">
          {filteredAgents.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-slate-500 dark:text-slate-400">Nenhum agente encontrado</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 max-w-7xl mx-auto w-full">
            {filteredAgents.map((agent) => (
              <button
                key={agent.id}
                type="button"
                className="w-full bg-white dark:bg-slate-800 rounded-xl p-4 sm:p-5 border border-slate-200 dark:border-slate-700 active:border-brand-300 dark:active:border-brand-500 active:shadow-lg dark:active:shadow-xl transition-all text-left touch-manipulation min-h-[44px]"
                onClick={() => onSelectAgent(agent.id)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl ${getAgentColorClass(agent.color)} flex items-center justify-center text-xl sm:text-2xl shadow-sm flex-shrink-0`}>
                    {agent.icon}
                  </div>
                </div>

                <div>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {agent.tags.map((tag, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-xs text-slate-600 dark:text-slate-300 rounded-md"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-1">{agent.name}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">{agent.title}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{agent.description}</p>
                </div>
              </button>
            ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AgentsScreen;

