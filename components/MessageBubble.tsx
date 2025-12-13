import React from 'react';
import { Message, Sender } from '../types';
import { getAgentConfig, type AgentId } from '../config/agents';

interface MessageBubbleProps {
  message: Message;
  agentId?: string;
}

// Function to format currency values found in text (e.g. R$ 1000 -> R$ 1.000,00)
const formatCurrencyValues = (text: string) => {
  // Regex looks for "R$" followed by optional whitespace and a number (with optional decimals)
  return text.replace(/R\$\s*(\d+(?:[.,]\d{1,2})?)(?!\d)/gi, (match, value) => {
    // Replace comma with dot for parsing if necessary
    const normalizedValue = value.replace(',', '.');
    const number = parseFloat(normalizedValue);
    
    if (isNaN(number)) return match;

    // Format to Brazilian Portuguese currency
    return number.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  });
};

// Simple formatter to handle bold text (**text**), line breaks, and apply currency formatting
const formatText = (text: string) => {
  // First apply currency formatting to the raw text
  const textWithCurrency = formatCurrencyValues(text);
  
  // Then split for bold and newlines
  const parts = textWithCurrency.split(/(\*\*.*?\*\*|\n)/g);
  
  return parts.map((part, index) => {
    if (part === '\n') {
      return <br key={index} />;
    }
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={index} className="font-bold">{part.slice(2, -2)}</strong>;
    }
    return part;
  });
};

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, agentId = 'lia-erl' }) => {
  const isAI = message.sender === Sender.AI;
  const agentConfig = getAgentConfig(agentId as AgentId);
  
  // Cores por agente (estilo GPT Mobile)
  const getAgentColorClasses = () => {
    switch (agentConfig.ui.color) {
      case 'purple':
        return {
          avatar: 'bg-purple-100 dark:bg-purple-900/30',
          bubble: 'bg-white dark:bg-slate-800',
          text: 'text-slate-800 dark:text-slate-200',
        };
      case 'orange':
        return {
          avatar: 'bg-orange-100 dark:bg-orange-900/30',
          bubble: 'bg-white dark:bg-slate-800',
          text: 'text-slate-800 dark:text-slate-200',
        };
      case 'blue':
        return {
          avatar: 'bg-blue-100 dark:bg-blue-900/30',
          bubble: 'bg-white dark:bg-slate-800',
          text: 'text-slate-800 dark:text-slate-200',
        };
      case 'green':
        return {
          avatar: 'bg-green-100 dark:bg-green-900/30',
          bubble: 'bg-white dark:bg-slate-800',
          text: 'text-slate-800 dark:text-slate-200',
        };
      default:
        return {
          avatar: 'bg-slate-100 dark:bg-slate-700',
          bubble: 'bg-white dark:bg-slate-800',
          text: 'text-slate-800 dark:text-slate-200',
        };
    }
  };
  
  const colors = getAgentColorClasses();

  return (
    <div className={`flex w-full gap-3 px-4 py-3 ${isAI ? 'justify-start' : 'justify-end'} animate-fade-in`}>
      {/* Avatar - apenas para mensagens da IA */}
      {isAI && (
        <div className={`flex-none w-8 h-8 rounded-full overflow-hidden ${colors.avatar} flex items-center justify-center mt-0.5 flex-shrink-0`}>
          <img 
            src="/images/logo-main.jpg" 
            alt="Lyla.IA" 
            className="w-full h-full object-cover"
            onError={(e) => {
              // Fallback se a imagem não carregar
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              const parent = target.parentElement!;
              parent.className = 'flex-none w-9 h-9 sm:w-8 sm:h-8 rounded-full bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center text-brand-600 dark:text-brand-400 font-semibold text-sm mt-0.5 sm:mt-1 flex-shrink-0';
              parent.textContent = 'L';
            }}
          />
        </div>
      )}
      
      {/* Mensagem - Estilo GPT Mobile */}
      <div className={`flex flex-col ${isAI ? 'items-start' : 'items-end'} max-w-[85%]`}>
        <div
          className={`rounded-2xl px-4 py-3 shadow-sm text-[15px] leading-relaxed ${
            isAI
              ? `${colors.bubble} ${colors.text} rounded-tl-none`
              : 'bg-[#0b93f6] dark:bg-[#0b93f6] text-white rounded-tr-none'
          }`}
        >
          {/* Imagem - exibir primeiro se for a única coisa */}
          {message.imageUrl && (
            <div className={`${message.text ? 'mb-3' : ''}`}>
              <img 
                src={message.imageUrl} 
                alt={isAI ? "Imagem gerada pela IA" : "Imagem enviada"} 
                className="rounded-xl max-w-full h-auto object-contain max-h-96 cursor-pointer hover:opacity-90 transition-opacity" 
                onClick={() => {
                  // Abrir imagem em tela cheia ao clicar
                  const newWindow = window.open();
                  if (newWindow) {
                    newWindow.document.write(`<img src="${message.imageUrl}" style="max-width: 100%; height: auto;" />`);
                  }
                }}
              />
            </div>
          )}
          
          {/* Áudio */}
          {message.audioUrl && (
            <div className={`${message.text || message.imageUrl ? 'mb-3' : ''}`}>
              <audio 
                src={message.audioUrl} 
                controls 
                className="w-full h-10 rounded-lg"
              />
            </div>
          )}
          
          {/* Texto */}
          {message.text && (
            <div className="whitespace-pre-wrap break-words">
              {formatText(message.text)}
            </div>
          )}
        </div>
        
        {/* Timestamp - abaixo da bolha */}
        <div className={`text-[10px] mt-1 px-1 opacity-60 ${isAI ? 'text-slate-400 dark:text-slate-500' : 'text-slate-500 dark:text-slate-400'}`}>
          {new Date(message.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
      
      {/* Avatar do usuário - apenas para mensagens do usuário */}
      {!isAI && (
        <div className="flex-none w-9 h-9 sm:w-8 sm:h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 font-semibold text-xs sm:text-xs mt-0.5 sm:mt-1">
          U
        </div>
      )}
    </div>
  );
};

export default MessageBubble;