import { Message } from '../types';

export interface ExportData {
  produto?: {
    nome: string;
    promessa: string;
    preco: string;
  };
  funil?: {
    entrada: string;
    relacionamento: string;
    lucro: string;
  };
  conteudo?: {
    plano: string;
  };
  mensagens: Message[];
  timestamp: number;
}

/**
 * Exporta conversa para Markdown
 */
export const exportToMarkdown = (messages: Message[]): string => {
  let markdown = '# Histórico de Conversa - Funil ERL\n\n';
  markdown += `**Data:** ${new Date().toLocaleString('pt-BR')}\n\n`;
  markdown += '---\n\n';
  
  messages.forEach((msg, index) => {
    const sender = msg.sender === 'user' ? '**Usuário**' : '**Lyla.IA**';
    const timestamp = new Date(msg.timestamp).toLocaleString('pt-BR');
    
    markdown += `## Mensagem ${index + 1}\n\n`;
    markdown += `${sender} - ${timestamp}\n\n`;
    
    if (msg.text) {
      markdown += `${msg.text}\n\n`;
    }
    
    if (msg.imageUrl) {
      markdown += `![Imagem](${msg.imageUrl})\n\n`;
    }
    
    markdown += '---\n\n';
  });
  
  return markdown;
};

/**
 * Exporta dados para JSON
 */
export const exportToJSON = (data: ExportData): string => {
  return JSON.stringify(data, null, 2);
};

/**
 * Exporta para PDF (versão simplificada - retorna Blob)
 * Nota: Em produção, usar biblioteca como jsPDF ou html2pdf
 */
export const exportToPDF = async (data: ExportData): Promise<Blob> => {
  // Implementação básica - em produção usar biblioteca adequada
  const markdown = exportToMarkdown(data.mensagens);
  return new Blob([markdown], { type: 'text/plain' });
};

/**
 * Estrutura dados finais da conversa
 */
export const structureFinalData = (messages: Message[]): ExportData => {
  const allText = messages.map(m => m.text || '').join(' ');
  
  // Extrair informações do produto
  const produtoMatch = allText.match(/produto[:\-]\s*([^\n]+)/i);
  const precoMatch = allText.match(/r\$\s*([\d.,]+)/i);
  
  const produto = produtoMatch ? {
    nome: produtoMatch[1].trim(),
    promessa: extractPromise(allText),
    preco: precoMatch ? `R$ ${precoMatch[1]}` : 'Não definido',
  } : undefined;
  
  // Extrair funil
  const funil = extractFunnel(allText);
  
  // Extrair plano de conteúdo
  const conteudo = extractContentPlan(allText);
  
  return {
    produto,
    funil,
    conteudo,
    mensagens: messages,
    timestamp: Date.now(),
  };
};

const extractPromise = (text: string): string => {
  const match = text.match(/promessa[:\-]\s*([^\n]+)/i);
  return match ? match[1].trim() : 'Não definida';
};

const extractFunnel = (text: string): ExportData['funil'] => {
  const entradaMatch = text.match(/entrada[:\-]\s*([^\n]+)/i);
  const relacionamentoMatch = text.match(/relacionamento[:\-]\s*([^\n]+)/i);
  const lucroMatch = text.match(/lucro[:\-]\s*([^\n]+)/i);
  
  if (!entradaMatch && !relacionamentoMatch && !lucroMatch) {
    return undefined;
  }
  
  return {
    entrada: entradaMatch ? entradaMatch[1].trim() : 'Não definida',
    relacionamento: relacionamentoMatch ? relacionamentoMatch[1].trim() : 'Não definido',
    lucro: lucroMatch ? lucroMatch[1].trim() : 'Não definido',
  };
};

const extractContentPlan = (text: string): ExportData['conteudo'] => {
  if (text.includes('plano de conteúdo') || text.includes('7 dias')) {
    return {
      plano: 'Plano de conteúdo de 7 dias criado',
    };
  }
  return undefined;
};

