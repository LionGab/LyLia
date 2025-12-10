import React, { useState, useEffect } from 'react';
import { Thread, getAllThreads, deleteThread, migrateOldHistory } from '../services/threadService';
import { getCurrentUser } from '../services/authService';

interface ConversationsListProps {
  onSelectThread: (threadId: string) => void;
  onCreateNew: () => void;
  currentThreadId?: string | null;
}

const ConversationsList: React.FC<ConversationsListProps> = ({ 
  onSelectThread, 
  onCreateNew,
  currentThreadId 
}) => {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Migrar histórico antigo na primeira vez
    const migratedThreadId = migrateOldHistory();
    
    // Carregar threads
    loadThreads();
  }, []);

  const loadThreads = () => {
    const allThreads = getAllThreads();
    setThreads(allThreads);
    setIsLoading(false);
  };

  const handleDeleteThread = (e: React.MouseEvent, threadId: string) => {
    e.stopPropagation();
    if (window.confirm('Tem certeza que deseja excluir esta conversa?')) {
      deleteThread(threadId);
      loadThreads();
      // Se era a thread atual, criar nova
      if (threadId === currentThreadId) {
        onCreateNew();
      }
    }
  };

  const formatTime = (timestamp: number): string => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Agora';
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    if (days < 7) return `${days}d`;
    
    return new Date(timestamp).toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: '2-digit' 
    });
  };

  const user = getCurrentUser();

  return (
    <div className="flex flex-col h-screen bg-white dark:bg-slate-900 transition-colors">
      {/* Header */}
      <header className="flex-none bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 px-4 py-3 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-slate-900 dark:text-white">Conversas</h1>
        <button
          onClick={onCreateNew}
          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-slate-600 dark:text-slate-400"
          title="Nova conversa"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
        </button>
      </header>

      {/* Lista de conversas */}
      <main className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-slate-400 dark:text-slate-500">Carregando...</div>
          </div>
        ) : threads.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full px-4 text-center">
            <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-slate-400">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
              Nenhuma conversa ainda
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
              Comece uma nova conversa para começar a usar a LIA
            </p>
            <button
              onClick={onCreateNew}
              className="px-4 py-2 bg-brand-600 dark:bg-brand-500 text-white rounded-lg font-medium hover:bg-brand-700 dark:hover:bg-brand-600 transition-colors"
            >
              Nova conversa
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {threads.map((thread) => (
              <div
                key={thread.id}
                onClick={() => onSelectThread(thread.id)}
                className={`px-4 py-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group ${
                  currentThreadId === thread.id ? 'bg-brand-50 dark:bg-brand-900/20' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Avatar */}
                  <div className="flex-none w-10 h-10 rounded-full bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center text-brand-600 dark:text-brand-400 font-semibold text-sm">
                    L
                  </div>
                  
                  {/* Conteúdo */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="font-medium text-slate-900 dark:text-white text-sm truncate">
                        {thread.title}
                      </h3>
                      <span className="flex-none text-xs text-slate-400 dark:text-slate-500">
                        {formatTime(thread.lastMessageTime)}
                      </span>
                    </div>
                    {thread.lastMessage && (
                      <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
                        {thread.lastMessage}
                      </p>
                    )}
                  </div>
                  
                  {/* Botão deletar */}
                  <button
                    onClick={(e) => handleDeleteThread(e, thread.id)}
                    className="flex-none opacity-0 group-hover:opacity-100 p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-opacity text-slate-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400"
                    title="Excluir conversa"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Footer com info do usuário */}
      {user && (
        <footer className="flex-none border-t border-slate-100 dark:border-slate-800 px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-400 flex items-center justify-center text-xs font-semibold">
              {user.email.substring(0, 2).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate">
                {user.email}
              </p>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
};

export default ConversationsList;
