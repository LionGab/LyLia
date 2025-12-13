/**
 * Logger centralizado para o projeto
 * Substitui console.log/error/warn por uma implementação controlada
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  data?: unknown;
  timestamp: number;
}

class Logger {
  private isDevelopment: boolean;
  private logs: LogEntry[] = [];
  private maxLogs = 100;

  constructor() {
    this.isDevelopment = 
      typeof window !== 'undefined' && 
      (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
  }

  private log(level: LogLevel, message: string, data?: unknown): void {
    const entry: LogEntry = {
      level,
      message,
      data,
      timestamp: Date.now(),
    };

    // Armazenar logs em memória (útil para debug)
    this.logs.push(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    // Em desenvolvimento, logar no console
    if (this.isDevelopment) {
      const prefix = `[${level.toUpperCase()}]`;
      switch (level) {
        case 'debug':
        case 'info':
          if (data) {
            console.log(prefix, message, data);
          } else {
            console.log(prefix, message);
          }
          break;
        case 'warn':
          if (data) {
            console.warn(prefix, message, data);
          } else {
            console.warn(prefix, message);
          }
          break;
        case 'error':
          if (data) {
            console.error(prefix, message, data);
          } else {
            console.error(prefix, message);
          }
          break;
      }
    }

    // Em produção, enviar erros críticos para serviço de monitoramento
    if (level === 'error' && !this.isDevelopment) {
      // TODO: Integrar com serviço de monitoramento (Sentry, LogRocket, etc)
      this.sendToMonitoring(entry);
    }
  }

  private sendToMonitoring(_entry: LogEntry): void {
    // Implementação futura para envio de logs críticos
    // Por enquanto, apenas armazena em memória
  }

  debug(message: string, data?: unknown): void {
    this.log('debug', message, data);
  }

  info(message: string, data?: unknown): void {
    this.log('info', message, data);
  }

  warn(message: string, data?: unknown): void {
    this.log('warn', message, data);
  }

  error(message: string, error?: Error | unknown): void {
    if (error instanceof Error) {
      this.log('error', message, {
        name: error.name,
        message: error.message,
        stack: error.stack,
      });
    } else {
      this.log('error', message, error);
    }
  }

  getLogs(level?: LogLevel): LogEntry[] {
    if (level) {
      return this.logs.filter(log => log.level === level);
    }
    return [...this.logs];
  }

  clearLogs(): void {
    this.logs = [];
  }
}

export const logger = new Logger();
