import React, { useState } from 'react';
import { Message } from '../types';
import { exportToMarkdown, exportToJSON, exportToPDF, structureFinalData } from '../services/exportService';
import { logger } from '../services/logger';

interface ExportButtonProps {
  messages: Message[];
}

const ExportButton: React.FC<ExportButtonProps> = ({ messages }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async (format: 'markdown' | 'json' | 'pdf') => {
    setIsExporting(true);
    
    try {
      let blob: Blob;
      let filename: string;
      
      switch (format) {
        case 'markdown':
          const markdown = exportToMarkdown(messages);
          blob = new Blob([markdown], { type: 'text/markdown' });
          filename = `conversa-${Date.now()}.md`;
          break;
          
        case 'json':
          const data = structureFinalData(messages);
          const json = exportToJSON(data);
          blob = new Blob([json], { type: 'application/json' });
          filename = `conversa-${Date.now()}.json`;
          break;
          
        case 'pdf':
          const dataForPdf = structureFinalData(messages);
          blob = await exportToPDF(dataForPdf);
          filename = `conversa-${Date.now()}.txt`; // Fallback para txt já que PDF real requer biblioteca
          break;
      }
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
      
      setIsOpen(false);
    } catch (error) {
      logger.error('Erro ao exportar', error);
      alert('Erro ao exportar. Tente novamente.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={messages.length === 0}
        className="px-3 py-1.5 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-medium hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        title="Exportar conversa"
      >
        Exportar
      </button>
      
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg z-20 min-w-[180px]">
            <button
              onClick={() => handleExport('markdown')}
              disabled={isExporting}
              className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 first:rounded-t-lg last:rounded-b-lg disabled:opacity-50"
            >
              📄 Markdown
            </button>
            <button
              onClick={() => handleExport('json')}
              disabled={isExporting}
              className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 first:rounded-t-lg last:rounded-b-lg disabled:opacity-50"
            >
              📋 JSON
            </button>
            <button
              onClick={() => handleExport('pdf')}
              disabled={isExporting}
              className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 first:rounded-t-lg last:rounded-b-lg disabled:opacity-50"
            >
              📑 PDF (TXT)
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default ExportButton;

