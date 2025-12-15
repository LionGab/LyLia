import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');

    // API Keys (Vite expõe automaticamente variáveis com prefixo VITE_)
    const geminiApiKey = env.VITE_GEMINI_API_KEY || '';

    // Supabase
    const supabaseUrl = env.VITE_SUPABASE_URL || '';
    const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY || '';

    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [
        react(),
        VitePWA({
          registerType: 'autoUpdate',
          includeAssets: ['favicon.ico', 'images/**/*'],
          manifest: {
            name: 'Funil ERL - Assistente de Negócios',
            short_name: 'Funil ERL',
            description: 'Assistente de IA especialista no Método ERL',
            theme_color: '#db2777',
            background_color: '#ffffff',
            display: 'standalone',
            orientation: 'portrait',
            scope: '/',
            start_url: '/',
            icons: [
              {
                src: '/images/logo-main.jpg',
                sizes: '192x192',
                type: 'image/jpeg',
              },
              {
                src: '/images/logo-main.jpg',
                sizes: '512x512',
                type: 'image/jpeg',
              },
            ],
          },
          workbox: {
            globPatterns: ['**/*.{js,css,html,ico,png,svg,jpg}'],
            runtimeCaching: [
              {
                urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
                handler: 'CacheFirst',
                options: {
                  cacheName: 'google-fonts-cache',
                  expiration: {
                    maxEntries: 10,
                    maxAgeSeconds: 60 * 60 * 24 * 365, // 1 ano
                  },
                  cacheableResponse: {
                    statuses: [0, 200],
                  },
                },
              },
            ],
          },
        }),
      ],
      define: {
        // Gemini API
        'process.env.API_KEY': JSON.stringify(geminiApiKey),
        'process.env.GEMINI_API_KEY': JSON.stringify(geminiApiKey),
        'window.__GEMINI_API_KEY__': JSON.stringify(geminiApiKey),

        // Supabase
        'process.env.SUPABASE_URL': JSON.stringify(supabaseUrl),
        'process.env.SUPABASE_ANON_KEY': JSON.stringify(supabaseAnonKey),
        'window.__SUPABASE_URL__': JSON.stringify(supabaseUrl),
        'window.__SUPABASE_ANON_KEY__': JSON.stringify(supabaseAnonKey),
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
