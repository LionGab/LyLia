import { createClient } from '@supabase/supabase-js';
import { logger } from '../logger';

/**
 * Configuração do cliente Supabase
 *
 * IMPORTANTE: Configure as variáveis de ambiente:
 * - SUPABASE_URL: URL do projeto Supabase
 * - SUPABASE_ANON_KEY: Chave pública (anon key)
 */

const getSupabaseUrl = (): string => {
  const url =
    process.env.SUPABASE_URL ||
    (typeof window !== 'undefined' && (window as any).__SUPABASE_URL__) ||
    '';

  if (!url || url === 'undefined' || url === 'null' || url.trim() === '') {
    const isProduction = typeof window !== 'undefined' &&
      window.location.hostname !== 'localhost' &&
      window.location.hostname !== '127.0.0.1';

    if (isProduction) {
      throw new Error('URL do Supabase não encontrada. Configure a variável SUPABASE_URL no Netlify Dashboard (Site settings → Environment variables).');
    } else {
      throw new Error('URL do Supabase não encontrada. Verifique o arquivo .env.local e certifique-se de que SUPABASE_URL está configurado.');
    }
  }

  return url.trim();
};

const getSupabaseAnonKey = (): string => {
  const key =
    process.env.SUPABASE_ANON_KEY ||
    (typeof window !== 'undefined' && (window as any).__SUPABASE_ANON_KEY__) ||
    '';

  if (!key || key === 'undefined' || key === 'null' || key.trim() === '') {
    const isProduction = typeof window !== 'undefined' &&
      window.location.hostname !== 'localhost' &&
      window.location.hostname !== '127.0.0.1';

    if (isProduction) {
      throw new Error('Chave do Supabase não encontrada. Configure a variável SUPABASE_ANON_KEY no Netlify Dashboard.');
    } else {
      throw new Error('Chave do Supabase não encontrada. Verifique o arquivo .env.local e certifique-se de que SUPABASE_ANON_KEY está configurado.');
    }
  }

  return key.trim();
};

// Lazy initialization - só cria o cliente quando necessário
let supabaseInstance: ReturnType<typeof createClient> | null = null;

export const getSupabase = () => {
  if (!supabaseInstance) {
    try {
      const url = getSupabaseUrl();
      const key = getSupabaseAnonKey();

      supabaseInstance = createClient(url, key, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        },
      });

      logger.debug('Cliente Supabase inicializado', { url });
    } catch (error) {
      logger.error('Erro ao inicializar Supabase', error);
      throw error;
    }
  }

  return supabaseInstance;
};

// Export do cliente padrão
export const supabase = getSupabase();
