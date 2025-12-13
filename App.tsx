import React, { useState, useEffect } from 'react';
import ChatInterface from './components/ChatInterface';
import LoginScreen from './components/LoginScreen';
import AgentsScreen from './components/AgentsScreen';
import OnboardingScreen from './components/OnboardingScreen';
import TutorialsPanel from './components/TutorialsPanel';
import BusinessIdeasPanel from './components/BusinessIdeasPanel';
import PersonalizationPanel from './components/PersonalizationPanel';
import ConversationsList from './components/ConversationsList';
import { isAuthenticated, getCurrentUser } from './services/authService';
import { initTheme } from './services/themeService';
import { OnboardingData } from './types/onboarding';
import { createThread } from './services/threadService';

type ViewMode = 'agents' | 'chat' | 'tutorials' | 'ideas' | 'personalization' | 'conversations';

const App: React.FC = () => {
  const [authenticated, setAuthenticated] = useState<boolean>(false);
  const [isChecking, setIsChecking] = useState<boolean>(true);
  const [currentView, setCurrentView] = useState<ViewMode>('agents');
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [showOnboarding, setShowOnboarding] = useState<boolean>(false);
  const [currentThreadId, setCurrentThreadId] = useState<string | null>(null);

  useEffect(() => {
    // Inicializar tema
    initTheme();
    
    // Verificar autenticação ao carregar
    const checkAuth = () => {
      const authStatus = isAuthenticated();
      setAuthenticated(authStatus);
      
      if (authStatus) {
        // Verificar se já tem onboarding completo
        const user = getCurrentUser();
        if (user) {
          const onboardingData = localStorage.getItem(`erl_lia_onboarding_${user.email}`);
          setShowOnboarding(!onboardingData);
        }
      }
      
      setIsChecking(false);
    };

    checkAuth();
  }, []);

  const handleLoginSuccess = () => {
    setAuthenticated(true);
    // Verificar se precisa de onboarding
    const user = getCurrentUser();
    if (user) {
      const onboardingData = localStorage.getItem(`erl_lia_onboarding_${user.email}`);
      setShowOnboarding(!onboardingData);
    }
  };

  const handleOnboardingComplete = (_data: OnboardingData) => {
    setShowOnboarding(false);
    // Dados já foram salvos no OnboardingScreen
  };

  const handleOnboardingSkip = () => {
    setShowOnboarding(false);
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

  const handleViewConversations = () => {
    setCurrentView('conversations');
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

  const handleViewPersonalization = () => {
    setCurrentView('personalization');
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

  // Mostrar onboarding se necessário
  if (showOnboarding) {
    return <OnboardingScreen onComplete={handleOnboardingComplete} onSkip={handleOnboardingSkip} />;
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

  if (currentView === 'personalization') {
    return (
      <div className="min-h-screen w-full bg-slate-50 dark:bg-slate-900 transition-colors">
        <div className="h-screen w-full">
          <PersonalizationPanel onBack={handleBackToAgents} />
        </div>
      </div>
    );
  }

  if (currentView === 'agents') {
    return (
      <div className="w-full h-screen">
        <AgentsScreen 
          onSelectAgent={handleSelectAgent} 
          onViewHistory={handleViewConversations}
          onViewTutorials={handleViewTutorials}
          onViewIdeas={handleViewIdeas}
          onViewPersonalization={handleViewPersonalization}
        />
      </div>
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
    <div className="min-h-screen w-full bg-white dark:bg-slate-900 transition-colors">
      <ChatInterface 
        agentId={selectedAgent} 
        onBack={handleBackToAgents}
        threadId={currentThreadId}
        onThreadChange={handleThreadChange}
        onViewConversations={handleViewConversationsFromChat}
      />
    </div>
  );
};

export default App;
