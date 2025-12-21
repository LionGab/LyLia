import React, { useState, useEffect } from 'react';
import ChatInterface from './components/ChatInterface';
import LoginScreen from './components/LoginScreen';
import AgentsScreen from './components/AgentsScreen';
import TutorialsPanel from './components/TutorialsPanel';
import BusinessIdeasPanel from './components/BusinessIdeasPanel';
import ConversationsList from './components/ConversationsList';
import DiagnosticFlow from './components/DiagnosticFlow';
import FinancialSimulator from './components/FinancialSimulator';
import ProductRecommendation from './components/ProductRecommendation';
import FunnelBuilder from './components/FunnelBuilder';
import ContentGenerator from './components/ContentGenerator';
import SalesScriptGenerator from './components/SalesScriptGenerator';
import InstallPrompt from './components/InstallPrompt';
import { isAuthenticated } from './services/authService';
import { initTheme } from './services/themeService';
import { DiagnosticResult } from './types/diagnostic';
import { createThread } from './services/threadService';

type ViewMode = 'agents' | 'chat' | 'tutorials' | 'ideas' | 'conversations' | 'diagnostic' | 'financial' | 'recommendations' | 'funnel' | 'content' | 'sales-script';

const App: React.FC = () => {
  const [authenticated, setAuthenticated] = useState<boolean>(false);
  const [isChecking, setIsChecking] = useState<boolean>(true);
  const [currentView, setCurrentView] = useState<ViewMode>('agents');
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [currentThreadId, setCurrentThreadId] = useState<string | null>(null);

  useEffect(() => {
    // Inicializar tema
    initTheme();

    // Verificar autenticação ao carregar
    const checkAuth = () => {
      const authStatus = isAuthenticated();
      setAuthenticated(authStatus);
      setIsChecking(false);
    };

    checkAuth();
  }, []);

  const handleLoginSuccess = () => {
    setAuthenticated(true);
  };

  const handleSelectAgent = (agentId: string) => {
    setSelectedAgent(agentId);
    // Criar nova thread ao selecionar agente
    const newThread = createThread();
    setCurrentThreadId(newThread.id);
    setCurrentView('chat');
  };

  const handleBackToAgents = () => {
    setCurrentView('agents');
    setSelectedAgent(null);
    setCurrentThreadId(null);
  };

  const handleViewConversations = (threadId?: string) => {
    if (threadId) {
      setCurrentThreadId(threadId);
      setCurrentView('chat');
    } else {
      setCurrentView('conversations');
    }
  };

  const handleSelectThread = (threadId: string) => {
    setCurrentThreadId(threadId);
    setCurrentView('chat');
  };

  const handleCreateNewConversation = () => {
    const newThread = createThread();
    setCurrentThreadId(newThread.id);
    setCurrentView('chat');
  };

  const handleThreadChange = (threadId: string) => {
    setCurrentThreadId(threadId);
  };

  // TODO: Implementar handleViewHistory quando necessário
  // const handleViewHistory = (_sessionId: string) => {
  //   // Implementar visualização de histórico
  // };

  const handleViewTutorials = () => {
    setCurrentView('tutorials');
  };

  const handleViewIdeas = () => {
    setCurrentView('ideas');
  };

  const handleViewDiagnostic = () => {
    setCurrentView('diagnostic');
  };

  const handleViewFinancial = () => {
    setCurrentView('financial');
  };

  const handleViewRecommendations = () => {
    setCurrentView('recommendations');
  };

  const handleViewFunnel = () => {
    setCurrentView('funnel');
  };

  const handleViewContent = () => {
    setCurrentView('content');
  };

  const handleViewSalesScript = () => {
    setCurrentView('sales-script');
  };

  const handleDiagnosticComplete = (_result: DiagnosticResult) => {
    setCurrentView('agents');
  };

  // Mostrar loading enquanto verifica autenticação
  if (isChecking) {
    return (
      <div className="min-h-screen w-full bg-slate-50 dark:bg-slate-900 flex items-center justify-center transition-colors">
        <div className="text-slate-500 dark:text-slate-400">Carregando...</div>
      </div>
    );
  }

  // Renderizar LoginScreen ou interface baseado no estado de autenticação
  if (!authenticated) {
    return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
  }

  // Renderizar diferentes views
  if (currentView === 'tutorials') {
    return (
      <div className="min-h-screen w-full bg-slate-50 dark:bg-slate-900 transition-colors">
        <div className="h-screen w-full">
          <TutorialsPanel onBack={handleBackToAgents} />
        </div>
      </div>
    );
  }

  if (currentView === 'ideas') {
    return (
      <div className="min-h-screen w-full bg-slate-50 dark:bg-slate-900 transition-colors">
        <div className="h-screen w-full">
          <BusinessIdeasPanel onBack={handleBackToAgents} />
        </div>
      </div>
    );
  }

  if (currentView === 'diagnostic') {
    return (
      <div className="min-h-screen w-full bg-slate-50 dark:bg-slate-900 transition-colors">
        <DiagnosticFlow onComplete={handleDiagnosticComplete} onBack={handleBackToAgents} />
      </div>
    );
  }

  if (currentView === 'financial') {
    return (
      <div className="min-h-screen w-full bg-slate-50 dark:bg-slate-900 transition-colors">
        <FinancialSimulator onBack={handleBackToAgents} />
      </div>
    );
  }

  if (currentView === 'recommendations') {
    return (
      <div className="min-h-screen w-full bg-slate-50 dark:bg-slate-900 transition-colors">
        <ProductRecommendation onBack={handleBackToAgents} />
      </div>
    );
  }

  if (currentView === 'funnel') {
    return (
      <div className="min-h-screen w-full bg-slate-50 dark:bg-slate-900 transition-colors">
        <FunnelBuilder onBack={handleBackToAgents} />
      </div>
    );
  }

  if (currentView === 'content') {
    return (
      <div className="min-h-screen w-full bg-slate-50 dark:bg-slate-900 transition-colors">
        <ContentGenerator onBack={handleBackToAgents} />
      </div>
    );
  }

  if (currentView === 'sales-script') {
    return (
      <div className="min-h-screen w-full bg-slate-50 dark:bg-slate-900 transition-colors">
        <SalesScriptGenerator onBack={handleBackToAgents} />
      </div>
    );
  }

  if (currentView === 'agents') {
    return (
      <>
        <div className="w-full h-screen">
          <AgentsScreen
            onSelectAgent={handleSelectAgent}
            onViewHistory={handleViewConversations}
            onViewTutorials={handleViewTutorials}
            onViewIdeas={handleViewIdeas}
            onViewDiagnostic={handleViewDiagnostic}
            onViewFinancial={handleViewFinancial}
            onViewRecommendations={handleViewRecommendations}
            onViewFunnel={handleViewFunnel}
            onViewContent={handleViewContent}
            onViewSalesScript={handleViewSalesScript}
          />
        </div>
        <InstallPrompt />
      </>
    );
  }

  if (currentView === 'conversations') {
    return (
      <ConversationsList
        onSelectThread={handleSelectThread}
        onCreateNew={handleCreateNewConversation}
        currentThreadId={currentThreadId}
      />
    );
  }

  const handleViewConversationsFromChat = () => {
    setCurrentView('conversations');
  };

  return (
    <>
      <div className="min-h-screen w-full bg-white dark:bg-slate-900 transition-colors">
        <ChatInterface 
          agentId={selectedAgent} 
          onBack={handleBackToAgents}
          threadId={currentThreadId}
          onThreadChange={handleThreadChange}
          onViewConversations={handleViewConversationsFromChat}
        />
      </div>
      <InstallPrompt />
    </>
  );
};

export default App;
