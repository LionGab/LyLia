import React, { useState, useRef, useEffect } from 'react';
import { Message, Sender } from '../types';
import { sendContentToGemini } from '../services/geminiService';
import { processCopywriterRequest } from '../services/copywriterService';
import { detectUserIntent, isExplicitCopywriterRequest } from '../services/modeDetectionService';
import { getCurrentUser } from '../services/authService';
import { checkAndMigrate } from '../services/migrationService';
import { initTheme } from '../services/themeService';
import { OnboardingData } from '../types/onboarding';
import { getThreadMessages, saveThreadMessages } from '../services/threadService';
import { logger } from '../services/logger';
import { 
  createMemoryConversation, 
  saveMemoryMessage, 
  loadMemoryMessages
} from '../services/memoryService';
import { getAgentConfig, type AgentId } from '../config/agents';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';
import ChatHeader from './ChatHeader';
import CopywriterResponse from './CopywriterResponse';
import ExportButton from './ExportButton';
import { CopywriterResponse as CopywriterResponseType } from '../types/copywriter';

// Utility function to convert File to Base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

interface ChatInterfaceProps {
  agentId?: string | null;
  onBack?: () => void;
  threadId?: string | null;
  onThreadChange?: (threadId: string) => void;
  onViewConversations?: () => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ agentId, onBack, threadId, onThreadChange, onViewConversations }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [copywriterMode, setCopywriterMode] = useState(false);
  const [copywriterResponse, setCopywriterResponse] = useState<CopywriterResponseType | null>(null);
  const [onboardingData, setOnboardingData] = useState<OnboardingData | undefined>(undefined);
  const [currentThreadId, setCurrentThreadId] = useState<string | null>(threadId || null);
  const [isSupabaseThread, setIsSupabaseThread] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioRecorderRef = useRef<MediaRecorder | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioPreviewUrl, setAudioPreviewUrl] = useState<string | null>(null);

  // Load history from thread or create new thread
  useEffect(() => {
    initTheme();
    checkAndMigrate();
    
    // Load onboarding data
    const user = getCurrentUser();
    if (user) {
      const savedOnboarding = localStorage.getItem(`erl_lia_onboarding_${user.email}`);
      if (savedOnboarding) {
        try {
          const parsed = JSON.parse(savedOnboarding);
          setOnboardingData(parsed);
        } catch (error) {
          logger.error('Falha ao parsear onboarding do localStorage', error);
        }
      }
    }
    
    // Load thread messages or create new thread
    const loadConversation = async () => {
      if (threadId) {
        // Tentar carregar do Supabase primeiro
        try {
          const supabaseMessages = await loadMemoryMessages(threadId, true);
          if (supabaseMessages.length > 0) {
            setMessages(supabaseMessages);
            setIsSupabaseThread(true);
            setCurrentThreadId(threadId);
            return;
          }
        } catch (error) {
          logger.warn('Falha ao carregar do Supabase, tentando localStorage', { error });
        }
        
        // Fallback: localStorage
        const threadMessages = getThreadMessages(threadId);
        if (threadMessages.length > 0) {
          setMessages(threadMessages);
          setIsSupabaseThread(false);
        } else {
          initializeWelcomeMessage(true);
        }
        setCurrentThreadId(threadId);
      } else if (!currentThreadId) {
        // Create new thread com memória
        const currentAgentId = (agentId || 'lia-erl') as AgentId;
        const { id, isSupabase } = await createMemoryConversation(currentAgentId);
        setCurrentThreadId(id);
        setIsSupabaseThread(isSupabase);
        if (onThreadChange) {
          onThreadChange(id);
        }
        initializeWelcomeMessage(true);
      }
    };
    
    loadConversation();
    
    setIsInitialized(true);
  }, [threadId]);

  // Save messages to memory (Supabase ou localStorage) whenever they change
  useEffect(() => {
    if (isInitialized && currentThreadId && messages.length > 0) {
      // Salvar última mensagem no Supabase (se aplicável)
      const lastMessage = messages[messages.length - 1];
      if (lastMessage && isSupabaseThread) {
        saveMemoryMessage(currentThreadId, lastMessage, true).catch(() => {
          // Se falhar, salvar no localStorage
          saveThreadMessages(currentThreadId, messages);
        });
      } else {
        // Fallback: localStorage
        saveThreadMessages(currentThreadId, messages);
      }
    }
  }, [messages, isInitialized, currentThreadId, isSupabaseThread]);

  const initializeWelcomeMessage = (useOnboarding: boolean = true) => {
    // Criar mensagem de boas-vindas personalizada baseada no agente e onboarding
    const currentAgentId = (agentId || 'lia-erl') as AgentId;
    const agentConfig = getAgentConfig(currentAgentId);
    const data = useOnboarding ? onboardingData : undefined;
    
    let welcomeText = `Olá! Eu sou ${agentConfig.name}, ${agentConfig.title}.\n\n`;
    welcomeText += `${agentConfig.description}\n\n`;
    
    if (data?.profissao || data?.habilidadePrincipal) {
      welcomeText += "Como posso te ajudar hoje?";
    } else {
      welcomeText += "Para começarmos, me conta: qual é a sua profissão ou habilidade principal hoje?";
    }
    
    const welcomeMessage: Message = {
      id: `welcome-${Date.now()}`,
      text: welcomeText,
      sender: Sender.AI,
      timestamp: Date.now(),
    };
    
    setMessages([welcomeMessage]);
    
    // Salvar mensagem de boas-vindas
    if (currentThreadId) {
      saveMemoryMessage(currentThreadId, welcomeMessage, isSupabaseThread).catch(() => {
        // Ignorar erro silenciosamente
      });
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, isInitialized, imagePreviewUrl]); // Added imagePreviewUrl to trigger scroll

  const handleSendMessage = async () => {
    const trimmedInputText = inputText.trim();
    if ((!trimmedInputText && !selectedImage && !audioBlob) || isLoading) return;

    // Detect intent
    const intent = detectUserIntent(trimmedInputText);
    const explicitCopywriter = isExplicitCopywriterRequest(trimmedInputText);
    const shouldUseCopywriter = copywriterMode || explicitCopywriter || intent === 'copywriter';

    const userMessage: Message = {
      id: Date.now().toString(),
      text: trimmedInputText || undefined,
      sender: Sender.User,
      timestamp: Date.now(),
      imageUrl: imagePreviewUrl || undefined,
      imageMimeType: selectedImage?.type || undefined,
      audioUrl: audioPreviewUrl || undefined,
    };

    setMessages((prev) => [...prev, userMessage]);
    
    // Salvar mensagem do usuário imediatamente
    if (currentThreadId) {
      await saveMemoryMessage(currentThreadId, userMessage, isSupabaseThread);
    }
    
    setInputText('');
    setIsLoading(true);

    // Clear previews and input after sending
    setSelectedImage(null);
    setImagePreviewUrl(null);
    setAudioBlob(null);
    setAudioPreviewUrl(null);
    if (fileInputRef.current) {
        fileInputRef.current.value = ''; 
    }

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    try {
      // Handle copywriter mode
      if (shouldUseCopywriter && trimmedInputText) {
        const copywriterResult = await processCopywriterRequest(trimmedInputText, onboardingData);
        setCopywriterResponse(copywriterResult);
        
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: `Análise completa de copywriting gerada! Veja os detalhes abaixo.`,
          sender: Sender.AI,
          timestamp: Date.now(),
        };
        setMessages((prev) => [...prev, aiMessage]);
      } else {
        // Normal ERL mode
        let base64Image: string | undefined;
        let imageMimeType: string | undefined;

        if (selectedImage) {
          base64Image = await fileToBase64(selectedImage);
          imageMimeType = selectedImage.type;
        }

        // Converter áudio para base64 se houver
        let base64Audio: string | undefined;
        let audioMimeType: string | undefined;
        if (audioBlob) {
          // Usar o tipo MIME do blob se disponível
          const mimeType = audioBlob.type || 'audio/webm';
          base64Audio = await fileToBase64(new File([audioBlob], 'audio.webm', { type: mimeType }));
          audioMimeType = mimeType;
        }

        const response = await sendContentToGemini(messages, trimmedInputText, base64Image, imageMimeType, base64Audio, audioMimeType, onboardingData, agentId || undefined);
        
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: response.text || undefined,
          sender: Sender.AI,
          timestamp: Date.now(),
          imageUrl: response.imageUrl || undefined,
          imageMimeType: response.mimeType || undefined,
        };

        setMessages((prev) => [...prev, aiMessage]);
        
        // Salvar mensagem da IA
        if (currentThreadId) {
          await saveMemoryMessage(currentThreadId, aiMessage, isSupabaseThread);
        }
        
        setCopywriterResponse(null); // Clear copywriter response in normal mode
      }
    } catch (error) {
      logger.error('Erro ao enviar mensagem', error);
      
      // Mensagem de erro amigável
      let errorText = "Poxa, tive um probleminha para processar sua mensagem agora.";
      if (error instanceof Error) {
        if (error.message.includes('timeout') || error.message.includes('demorou')) {
          errorText = "A requisição demorou muito. Tente novamente em alguns instantes.";
        } else if (error.message.includes('API') || error.message.includes('chave')) {
          errorText = "Erro de configuração. Verifique as configurações da API.";
        } else if (error.message.includes('quota') || error.message.includes('limite')) {
          errorText = "Limite de requisições atingido. Tente novamente em alguns minutos.";
        } else {
          errorText = error.message.length < 100 ? error.message : errorText;
        }
      }
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: errorText,
        sender: Sender.AI,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleInputResize = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      setImagePreviewUrl(URL.createObjectURL(file));
      // Focus textarea for prompt input
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    } else {
      setSelectedImage(null);
      setImagePreviewUrl(null);
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreviewUrl(null);
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };

  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 16000,
        } 
      });
      
      // Tentar usar codec opus se disponível, senão usar o padrão
      const options: MediaRecorderOptions = {};
      if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
        options.mimeType = 'audio/webm;codecs=opus';
      } else if (MediaRecorder.isTypeSupported('audio/webm')) {
        options.mimeType = 'audio/webm';
      } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
        options.mimeType = 'audio/mp4';
      }
      
      const recorder = new MediaRecorder(stream, options);
      const chunks: BlobPart[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      recorder.onstop = () => {
        const mimeType = recorder.mimeType || 'audio/webm';
        const blob = new Blob(chunks, { type: mimeType });
        setAudioBlob(blob);
        setAudioPreviewUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach(track => track.stop());
      };

      audioRecorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);
    } catch (error) {
      logger.error('Erro ao iniciar gravação de áudio', error);
      alert('Não foi possível acessar o microfone. Verifique as permissões.');
    }
  };

  const handleStopRecording = () => {
    if (audioRecorderRef.current && isRecording) {
      audioRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleCancelRecording = () => {
    if (audioRecorderRef.current && isRecording) {
      audioRecorderRef.current.stop();
      setIsRecording(false);
    }
    setAudioBlob(null);
    setAudioPreviewUrl(null);
  };

  const handleRemoveAudio = () => {
    setAudioBlob(null);
    setAudioPreviewUrl(null);
  };

  const handleClearThread = () => {
    if (window.confirm('Tem certeza que deseja limpar esta conversa? Esta ação não pode ser desfeita.')) {
      // Limpar estado local
      setMessages([]);
      setCopywriterResponse(null);
      setInputText('');
      setSelectedImage(null);
      setImagePreviewUrl(null);
      setAudioBlob(null);
      setAudioPreviewUrl(null);
      
      // Limpar mensagens da thread atual
      if (currentThreadId) {
        saveThreadMessages(currentThreadId, []);
      }
      
      // Inicializar mensagem de boas-vindas
      initializeWelcomeMessage(true);
    }
  };

  if (!isInitialized) return null;

  // Não precisamos mais dessa função, o App.tsx gerencia a navegação

  return (
    <div className="flex flex-col h-screen w-full bg-white dark:bg-slate-900 relative transition-colors">
      <ChatHeader onBack={onBack} onViewConversations={onViewConversations} />

      {/* Toolbar Minimalista - Mobile-first */}
      {messages.length > 0 && (
        <div className="flex-none bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 px-3 sm:px-6 py-2 transition-colors overflow-x-auto">
          <div className="flex items-center justify-between gap-2 min-w-max">
            <div className="flex items-center gap-2">
              <ExportButton messages={messages} />
            </div>
            <button
              onClick={handleClearThread}
              className="p-2 sm:p-1.5 active:bg-slate-100 dark:active:bg-slate-800 rounded-lg transition-colors text-slate-400 dark:text-slate-500 active:text-red-600 dark:active:text-red-400 touch-manipulation"
              title="Limpar conversa"
              aria-label="Limpar conversa"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 sm:w-4 sm:h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Chat Area - GPT Mobile Style */}
      <main className="flex-1 overflow-y-auto scroll-smooth bg-white dark:bg-slate-900 transition-colors overscroll-contain">
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} agentId={agentId || 'lia-erl'} />
        ))}
        
        {/* Copywriter Response - Full Width */}
        {copywriterResponse && (
          <div className="mt-4 animate-fade-in">
            <CopywriterResponse response={copywriterResponse} />
          </div>
        )}
        
        {isLoading && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </main>

      {/* Input Area - Mobile-first */}
      <footer className="flex-none bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 px-3 sm:px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] sticky bottom-0 z-10 transition-colors">
        {/* Preview de imagem */}
        {imagePreviewUrl && (
          <div className="relative mb-3 p-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800">
            <img src={imagePreviewUrl} alt="Prévia da imagem" className="max-h-40 w-auto rounded-lg mx-auto object-contain" />
            <button
              onClick={handleRemoveImage}
              className="absolute -top-2 -right-2 bg-red-500 dark:bg-red-600 text-white rounded-full p-1.5 text-xs leading-none flex items-center justify-center w-7 h-7 shadow-md hover:bg-red-600 dark:hover:bg-red-700 transition-colors z-20"
              aria-label="Remover imagem"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
        
        {/* Preview de áudio */}
        {audioPreviewUrl && !isRecording && (
          <div className="relative mb-3 p-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center gap-3">
            <audio src={audioPreviewUrl} controls className="flex-1 h-10" />
            <button
              onClick={handleRemoveAudio}
              className="flex-none p-1.5 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              aria-label="Remover áudio"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
        
        {/* Input container - estilo ChatGPT */}
        <div className="relative flex items-end gap-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl px-2 py-2 focus-within:ring-2 focus-within:ring-brand-100 dark:focus-within:ring-brand-900 focus-within:border-brand-300 dark:focus-within:border-brand-500 transition-all">
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
          />
          
          {/* Botão de anexar imagem/arquivo - Estilo GPT Mobile */}
          {!isRecording && (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex-none w-9 h-9 rounded-full flex items-center justify-center transition-colors text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-400 active:bg-slate-100 dark:active:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
              aria-label="Anexar imagem"
              disabled={isLoading}
              title="Anexar imagem"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <rect x="3" y="3" width="18" height="18" rx="2" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="8.5" cy="8.5" r="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
              </svg>
            </button>
          )}
          
          {/* Área de texto ou gravação */}
          {isRecording ? (
            <div className="flex-1 flex items-center justify-center gap-3 py-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-slate-600 dark:text-slate-400">Gravando...</span>
              </div>
              <button
                onClick={handleStopRecording}
                className="px-4 py-2.5 sm:py-1.5 bg-brand-600 dark:bg-brand-500 text-white rounded-lg text-sm font-medium active:bg-brand-700 dark:active:bg-brand-600 transition-colors touch-manipulation"
              >
                Parar
              </button>
              <button
                onClick={handleCancelRecording}
                className="px-4 py-2.5 sm:py-1.5 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg text-sm font-medium active:bg-slate-300 dark:active:bg-slate-600 transition-colors touch-manipulation"
              >
                Cancelar
              </button>
            </div>
          ) : (
            <textarea
              ref={textareaRef}
              value={inputText}
              onChange={handleInputResize}
              onKeyDown={handleKeyDown}
              placeholder={selectedImage ? "Descreva a imagem..." : audioPreviewUrl ? "Adicione uma mensagem (opcional)..." : "Mensagem para a Lyla.IA..."}
              className="flex-1 bg-transparent border-none focus:ring-0 text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 resize-none max-h-32 py-2.5 sm:py-2 px-2 text-base sm:text-base leading-relaxed"
              rows={1}
              disabled={isLoading}
            />
          )}
          
          {/* Botão de áudio ou enviar */}
          {isRecording ? null : audioPreviewUrl || inputText.trim() || selectedImage ? (
            <button
              onClick={handleSendMessage}
              disabled={isLoading}
              className={`flex-none w-11 h-11 sm:w-9 sm:h-9 rounded-full flex items-center justify-center transition-all touch-manipulation ${
                isLoading
                  ? 'bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed'
                  : 'bg-brand-600 dark:bg-brand-500 text-white active:bg-brand-700 dark:active:bg-brand-600 shadow-sm active:shadow-md active:scale-95'
              }`}
              aria-label="Enviar mensagem"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-6 h-6 sm:w-5 sm:h-5"
              >
                <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
              </svg>
            </button>
          ) : (
            <button
              onMouseDown={handleStartRecording}
              onMouseUp={handleStopRecording}
              onTouchStart={handleStartRecording}
              onTouchEnd={handleStopRecording}
              className="flex-none w-11 h-11 sm:w-9 sm:h-9 rounded-full flex items-center justify-center transition-colors text-slate-500 dark:text-slate-400 active:bg-slate-200 dark:active:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
              aria-label="Gravar áudio"
              disabled={isLoading}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 sm:w-5 sm:h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
              </svg>
            </button>
          )}
        </div>
      </footer>
    </div>
  );
};

export default ChatInterface;