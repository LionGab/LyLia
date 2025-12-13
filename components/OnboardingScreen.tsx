import React, { useState, useEffect, useRef } from 'react';
import { OnboardingData } from '../types/onboarding';
import { BUSINESS_TEMPLATES, RESPONSE_STYLES, BusinessTemplate } from '../constants/businessTemplates';
import { getCurrentUser } from '../services/authService';
import { initTheme } from '../services/themeService';
import { logger } from '../services/logger';

type SpeechRecognitionAlternativeLike = {
  transcript: string;
};

type SpeechRecognitionResultLike = {
  isFinal: boolean;
  0: SpeechRecognitionAlternativeLike;
};

type SpeechRecognitionResultListLike = {
  length: number;
  [index: number]: SpeechRecognitionResultLike;
};

type SpeechRecognitionEventLike = {
  resultIndex: number;
  results: SpeechRecognitionResultListLike;
};

type SpeechRecognitionErrorLike = {
  error: string;
};

type SpeechRecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: SpeechRecognitionErrorLike) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

interface OnboardingScreenProps {
  onComplete: (data: OnboardingData) => void;
  onSkip?: () => void;
}

const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onComplete, onSkip }) => {
  const [step, setStep] = useState(1);
  const [selectedTemplate, setSelectedTemplate] = useState<BusinessTemplate | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<string>('');
  const [formData, setFormData] = useState<OnboardingData>({});
  const [observacoes, setObservacoes] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  useEffect(() => {
    initTheme();
    
    // Carregar dados salvos se existirem
    const user = getCurrentUser();
    if (user) {
      const savedData = localStorage.getItem(`erl_lia_onboarding_${user.email}`);
      if (savedData) {
        try {
          const parsed = JSON.parse(savedData);
          setFormData(parsed);
          if (parsed.templateId) {
            const template = BUSINESS_TEMPLATES.find(t => t.id === parsed.templateId);
            if (template) setSelectedTemplate(template);
          }
          if (parsed.estiloResposta) setSelectedStyle(parsed.estiloResposta);
          if (parsed.observacoes) setObservacoes(parsed.observacoes);
        } catch (error) {
          logger.error('Erro ao carregar onboarding', error);
        }
      }
    }

    // Cleanup: parar gravação quando componente desmontar
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const handleTemplateSelect = (template: BusinessTemplate) => {
    setSelectedTemplate(template);
    if (template.id !== 'personalizado') {
      setFormData({
        ...formData,
        ...template.data,
        templateId: template.id
      });
    } else {
      setFormData({
        ...formData,
        templateId: 'personalizado'
      });
    }
  };

  const handleNext = () => {
    setErrorMessage(null);
    
    if (step === 1 && !selectedTemplate) {
      setErrorMessage('Por favor, selecione um template de negócio');
      return;
    }
    
    // Validação do step 2: só exige estilo se NÃO for personalizado
    if (step === 2 && selectedTemplate?.id !== 'personalizado' && !selectedStyle) {
      setErrorMessage('Por favor, selecione um estilo de resposta');
      return;
    }
    
    // Validação do step 3: só exige estilo se FOR personalizado
    if (step === 3 && selectedTemplate?.id === 'personalizado' && !selectedStyle) {
      setErrorMessage('Por favor, selecione um estilo de resposta');
      return;
    }
    
    if (step < 3) {
      setStep(step + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleComplete = () => {
    const finalData: OnboardingData = {
      ...formData,
      estiloResposta: selectedStyle,
      observacoes: observacoes.trim() || undefined
    };

    // Salvar no localStorage
    const user = getCurrentUser();
    if (user) {
      localStorage.setItem(`erl_lia_onboarding_${user.email}`, JSON.stringify(finalData));
    }

    onComplete(finalData);
  };

  const handleSkip = () => {
    if (onSkip) {
      onSkip();
    } else {
      onComplete({});
    }
  };

  const updateFormData = (field: keyof OnboardingData, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  // Verificar se Web Speech API está disponível
  const isSpeechRecognitionAvailable = (): boolean => {
    return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
  };

  // Iniciar transcrição de áudio
  const handleStartRecording = () => {
    if (!isSpeechRecognitionAvailable()) {
      alert('Transcrição de voz não está disponível no seu navegador. Use Chrome ou Edge.');
      return;
    }

    try {
      const win = window as unknown as {
        SpeechRecognition?: new () => SpeechRecognitionLike;
        webkitSpeechRecognition?: new () => SpeechRecognitionLike;
      };

      const SpeechRecognitionCtor = win.SpeechRecognition || win.webkitSpeechRecognition;
      if (!SpeechRecognitionCtor) {
        alert('Transcrição de voz não está disponível no seu navegador. Use Chrome ou Edge.');
        return;
      }

      const recognition = new SpeechRecognitionCtor();
      
      recognition.lang = 'pt-BR';
      recognition.continuous = true;
      recognition.interimResults = true;

      let finalTranscript = observacoes;

      recognition.onresult = (event) => {
        let interimTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          const firstAlternative = result[0];
          const transcript = (firstAlternative && typeof firstAlternative === 'object' && 'transcript' in firstAlternative) 
            ? (firstAlternative as { transcript: string }).transcript 
            : '';
          if (result.isFinal) {
            finalTranscript += transcript + ' ';
          } else {
            interimTranscript += transcript;
          }
        }
        
        setObservacoes(finalTranscript + interimTranscript);
      };

      recognition.onerror = (event) => {
        logger.error('Erro na transcrição', { error: event.error });
        if (event.error === 'no-speech') {
          // Ignorar erro de "no-speech" - usuário pode estar apenas pensando
          return;
        }
        setIsRecording(false);
        setIsTranscribing(false);
        alert(`Erro na transcrição: ${event.error}`);
      };

      recognition.onend = () => {
        setIsRecording(false);
        setIsTranscribing(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
      setIsRecording(true);
      setIsTranscribing(true);
    } catch (error) {
      logger.error('Erro ao iniciar transcrição', error);
      alert('Erro ao iniciar transcrição de voz. Verifique as permissões do microfone.');
      setIsRecording(false);
      setIsTranscribing(false);
    }
  };

  // Parar transcrição
  const handleStopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
      setIsTranscribing(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 dark:from-slate-900 to-slate-200 dark:to-slate-800 flex items-center justify-center p-3 sm:p-4 transition-colors overflow-y-auto py-6">
      <div className="w-full max-w-4xl bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-4 sm:p-6 lg:p-8 transition-colors my-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-brand-500 to-purple-500 flex items-center justify-center text-white font-bold text-2xl shadow-lg mx-auto mb-4 overflow-hidden">
            <img 
              src="/images/avatar.png" 
              alt="Avatar" 
              className="w-full h-full object-cover scale-125"
            />
          </div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">Bem-vindo ao Funil ERL</h1>
          <p className="text-slate-600 dark:text-slate-400">Vamos configurar seu perfil para personalizar sua experiência</p>
          <div className="flex justify-center gap-2 mt-4">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-2 rounded-full transition-all ${
                  s <= step
                    ? 'bg-brand-600 dark:bg-brand-500 w-8'
                    : 'bg-slate-200 dark:bg-slate-700 w-2'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Step 1: Template Selection */}
        {step === 1 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-slate-800 dark:text-white mb-4">
              Qual tipo de negócio você tem ou quer criar?
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {BUSINESS_TEMPLATES.map((template) => (
                <button
                  key={template.id}
                  onClick={() => handleTemplateSelect(template)}
                  className={`p-4 sm:p-4 rounded-xl border-2 transition-all text-left touch-manipulation ${
                    selectedTemplate?.id === template.id
                      ? 'border-brand-600 dark:border-brand-500 bg-brand-50 dark:bg-brand-900/20 shadow-lg'
                      : 'border-slate-200 dark:border-slate-700 active:border-brand-300 dark:active:border-brand-600 bg-white dark:bg-slate-900'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-3xl">{template.icon}</span>
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-800 dark:text-white mb-1">
                        {template.name}
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {template.description}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Customize (if personalizado) or Style Selection */}
        {step === 2 && (
          <div className="space-y-6">
            {selectedTemplate?.id === 'personalizado' ? (
              <>
                <h2 className="text-xl font-semibold text-slate-800 dark:text-white mb-4">
                  Conte-nos sobre seu negócio
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Profissão/Área
                    </label>
                    <input
                      type="text"
                      value={formData.profissao || ''}
                      onChange={(e) => updateFormData('profissao', e.target.value)}
                      placeholder="Ex: Nutricionista, Coach, Consultor..."
                      className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-brand-500 dark:focus:ring-brand-400 focus:border-brand-500 dark:focus:border-brand-400 outline-none transition-all text-slate-800 dark:text-white bg-white dark:bg-slate-700"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Habilidade Principal
                    </label>
                    <input
                      type="text"
                      value={formData.habilidadePrincipal || ''}
                      onChange={(e) => updateFormData('habilidadePrincipal', e.target.value)}
                      placeholder="Ex: Marketing Digital, Coaching, Nutrição..."
                      className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-brand-500 dark:focus:ring-brand-400 focus:border-brand-500 dark:focus:border-brand-400 outline-none transition-all text-slate-800 dark:text-white bg-white dark:bg-slate-700"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Oferta Atual (ou que quer criar)
                    </label>
                    <input
                      type="text"
                      value={formData.ofertaAtual || ''}
                      onChange={(e) => updateFormData('ofertaAtual', e.target.value)}
                      placeholder="Ex: Consultoria, Curso Online, Mentoria..."
                      className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-brand-500 dark:focus:ring-brand-400 focus:border-brand-500 dark:focus:border-brand-400 outline-none transition-all text-slate-800 dark:text-white bg-white dark:bg-slate-700"
                    />
                  </div>
                </div>
              </>
            ) : (
              <>
                <h2 className="text-xl font-semibold text-slate-800 dark:text-white mb-4">
                  Como você quer que eu responda você?
                </h2>
                <div className="space-y-3">
                  {RESPONSE_STYLES.map((style) => (
                    <button
                      key={style.id}
                      onClick={() => setSelectedStyle(style.id)}
                      className={`w-full p-4 sm:p-4 rounded-xl border-2 transition-all text-left touch-manipulation ${
                        selectedStyle === style.id
                          ? 'border-brand-600 dark:border-brand-500 bg-brand-50 dark:bg-brand-900/20 shadow-lg'
                          : 'border-slate-200 dark:border-slate-700 active:border-brand-300 dark:active:border-brand-600 bg-white dark:bg-slate-900'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">{style.icon}</span>
                        <div className="flex-1">
                          <h3 className="font-semibold text-slate-800 dark:text-white mb-1">
                            {style.name}
                          </h3>
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            {style.description}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Step 3: Style Selection or Final Customization */}
        {step === 3 && (
          <div className="space-y-6">
            {selectedTemplate?.id === 'personalizado' ? (
              <>
                <h2 className="text-xl font-semibold text-slate-800 dark:text-white mb-4">
                  Como você quer que eu responda você?
                </h2>
                <div className="space-y-3">
                  {RESPONSE_STYLES.map((style) => (
                    <button
                      key={style.id}
                      onClick={() => setSelectedStyle(style.id)}
                      className={`w-full p-4 sm:p-4 rounded-xl border-2 transition-all text-left touch-manipulation ${
                        selectedStyle === style.id
                          ? 'border-brand-600 dark:border-brand-500 bg-brand-50 dark:bg-brand-900/20 shadow-lg'
                          : 'border-slate-200 dark:border-slate-700 active:border-brand-300 dark:active:border-brand-600 bg-white dark:bg-slate-900'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">{style.icon}</span>
                        <div className="flex-1">
                          <h3 className="font-semibold text-slate-800 dark:text-white mb-1">
                            {style.name}
                          </h3>
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            {style.description}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
                <div className="mt-6">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Observações adicionais (opcional)
                  </label>
                  <div className="relative">
                    <textarea
                      value={observacoes}
                      onChange={(e) => setObservacoes(e.target.value)}
                      placeholder="Ex: Prefiro respostas curtas, gosto de exemplos práticos, fale como se eu fosse iniciante..."
                      rows={4}
                      className="w-full px-4 py-3 pr-12 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-brand-500 dark:focus:ring-brand-400 focus:border-brand-500 dark:focus:border-brand-400 outline-none transition-all text-slate-800 dark:text-white bg-white dark:bg-slate-700 resize-none"
                    />
                    <button
                      type="button"
                      onClick={isRecording ? handleStopRecording : handleStartRecording}
                      disabled={isTranscribing}
                      className={`absolute right-2 top-2 p-2 rounded-lg transition-all ${
                        isRecording
                          ? 'bg-red-500 text-white animate-pulse'
                          : 'bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-500'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                      aria-label={isRecording ? 'Parar gravação' : 'Gravar áudio'}
                      title={isRecording ? 'Parar gravação' : 'Gravar áudio e transcrever automaticamente'}
                    >
                      {isRecording ? (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="w-5 h-5">
                          <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
                          <path d="M19 10v1c0 3.87-3.13 7-7 7s-7-3.13-7-7v-1h2v1c0 2.76 2.24 5 5 5s5-2.24 5-5v-1h2z"/>
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
                        </svg>
                      )}
                    </button>
                  </div>
                  {isTranscribing && (
                    <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <span className="inline-block w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                      Gravando... Fale agora
                    </p>
                  )}
                </div>
              </>
            ) : (
              <>
                <h2 className="text-xl font-semibold text-slate-800 dark:text-white mb-4">
                  Observações adicionais (opcional)
                </h2>
                <div className="relative">
                  <textarea
                    value={observacoes}
                    onChange={(e) => setObservacoes(e.target.value)}
                    placeholder="Ex: Prefiro respostas curtas, gosto de exemplos práticos, fale como se eu fosse iniciante, sempre me dê números e métricas..."
                    rows={6}
                    className="w-full px-4 py-3 pr-12 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-brand-500 dark:focus:ring-brand-400 focus:border-brand-500 dark:focus:border-brand-400 outline-none transition-all text-slate-800 dark:text-white bg-white dark:bg-slate-700 resize-none"
                  />
                  <button
                    type="button"
                    onClick={isRecording ? handleStopRecording : handleStartRecording}
                    disabled={isTranscribing}
                    className={`absolute right-2 top-2 p-2 rounded-lg transition-all ${
                      isRecording
                        ? 'bg-red-500 text-white animate-pulse'
                        : 'bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-500'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                    aria-label={isRecording ? 'Parar gravação' : 'Gravar áudio'}
                    title={isRecording ? 'Parar gravação' : 'Gravar áudio e transcrever automaticamente'}
                  >
                    {isRecording ? (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="w-5 h-5">
                        <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
                        <path d="M19 10v1c0 3.87-3.13 7-7 7s-7-3.13-7-7v-1h2v1c0 2.76 2.24 5 5 5s5-2.24 5-5v-1h2z"/>
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
                      </svg>
                    )}
                  </button>
                </div>
                {isTranscribing && (
                  <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <span className="inline-block w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                    Gravando... Fale agora
                  </p>
                )}
              </>
            )}
          </div>
        )}

        {/* Mensagem de Erro */}
        {errorMessage && (
          <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center justify-between animate-slide-up">
            <p className="text-sm text-red-600 dark:text-red-400">{errorMessage}</p>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 ml-4 text-lg"
            >
              ✕
            </button>
          </div>
        )}

        {/* Footer */}
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 sm:gap-0 mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-slate-200 dark:border-slate-700">
          <button
            onClick={handleSkip}
            className="px-4 py-3 sm:py-2 text-slate-600 dark:text-slate-400 active:text-slate-800 dark:active:text-slate-200 transition-colors touch-manipulation text-left sm:text-left"
          >
            Pular
          </button>
          <div className="flex gap-3">
            {step > 1 && (
              <button
                onClick={handleBack}
                className="flex-1 sm:flex-none px-6 py-3 sm:py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg active:bg-slate-300 dark:active:bg-slate-600 transition-colors touch-manipulation"
              >
                Voltar
              </button>
            )}
            <button
              onClick={handleNext}
              className="flex-1 sm:flex-none px-6 py-3 sm:py-2 bg-brand-600 dark:bg-brand-500 text-white rounded-lg active:bg-brand-700 dark:active:bg-brand-600 shadow-md active:shadow-lg active:scale-[0.98] transition-all touch-manipulation"
            >
              {step === 3 ? 'Finalizar' : 'Continuar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingScreen;

