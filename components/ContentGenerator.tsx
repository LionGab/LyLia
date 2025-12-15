import React, { useState } from 'react';
import { ContentRequest, ContentResult, VideoScript, SocialPost, EmailContent } from '../types/content';
import { generateContent, saveContent } from '../services/contentGenerationService';
import { getCurrentUser } from '../services/authService';

interface ContentGeneratorProps {
  onBack: () => void;
}

const ContentGenerator: React.FC<ContentGeneratorProps> = ({ onBack }) => {
  const [type, setType] = useState<ContentRequest['type']>('video-script');
  const [topic, setTopic] = useState('');
  const [product, setProduct] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [platform, setPlatform] = useState('youtube');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ContentResult | null>(null);
  const user = getCurrentUser();

  const handleGenerate = async () => {
    if (!topic) {
      alert('Digite o tema do conteúdo');
      return;
    }

    setLoading(true);
    try {
      const request: ContentRequest = {
        type,
        topic,
        product: product || undefined,
        targetAudience: targetAudience || undefined,
        platform: platform as any,
      };

      const generated = await generateContent(request);
      setResult(generated);
      if (user) {
        saveContent(user.email, generated);
      }
    } catch (error) {
      alert('Erro ao gerar conteúdo');
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    if (!result) return null;

    if (result.type === 'video-script') {
      const script = result.content as VideoScript;
      return (
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Título</h3>
            <p className="text-slate-600 dark:text-slate-400">{script.title}</p>
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Gancho</h3>
            <p className="text-slate-600 dark:text-slate-400">{script.hook}</p>
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Introdução</h3>
            <p className="text-slate-600 dark:text-slate-400">{script.introduction}</p>
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Pontos Principais</h3>
            <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-400">
              {script.mainPoints.map((point, i) => (
                <li key={i}>{point}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Call to Action</h3>
            <p className="text-slate-600 dark:text-slate-400">{script.callToAction}</p>
          </div>
        </div>
      );
    }

    if (result.type === 'social-post') {
      const post = result.content as SocialPost;
      return (
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Post</h3>
            <div className="bg-slate-50 dark:bg-slate-700 p-4 rounded-lg">
              <p className="font-semibold text-slate-900 dark:text-white mb-2">{post.hook}</p>
              <p className="text-slate-600 dark:text-slate-400 mb-2">{post.caption}</p>
              <p className="text-slate-600 dark:text-slate-400 mb-2">{post.callToAction}</p>
              <div className="flex flex-wrap gap-2">
                {post.hashtags.map((tag, i) => (
                  <span key={i} className="text-blue-600 dark:text-blue-400">{tag}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (result.type === 'email') {
      const email = result.content as EmailContent;
      return (
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Assunto</h3>
            <p className="text-slate-600 dark:text-slate-400">{email.subject}</p>
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Corpo do Email</h3>
            <div className="bg-slate-50 dark:bg-slate-700 p-4 rounded-lg">
              <p className="text-slate-600 dark:text-slate-400 mb-2">{email.greeting}</p>
              {email.body.map((para, i) => (
                <p key={i} className="text-slate-600 dark:text-slate-400 mb-2">{para}</p>
              ))}
              <p className="font-semibold text-slate-900 dark:text-white mb-2">{email.callToAction}</p>
              <p className="text-slate-600 dark:text-slate-400">{email.closing}</p>
            </div>
          </div>
        </div>
      );
    }

    return <pre className="whitespace-pre-wrap text-slate-600 dark:text-slate-400">{String(result.content)}</pre>;
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={onBack}
          className="mb-6 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-2"
        >
          ← Voltar
        </button>

        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Gerador de Conteúdo</h1>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Tipo de Conteúdo
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as ContentRequest['type'])}
              className="w-full p-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg"
            >
              <option value="video-script">Roteiro de Vídeo</option>
              <option value="social-post">Post para Redes Sociais</option>
              <option value="email">Email de Vendas</option>
              <option value="hook">Ganchos Criativos</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Tema/Tópico
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Ex: Como aumentar vendas online"
              className="w-full p-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg"
            />
          </div>

          {(type === 'video-script' || type === 'social-post') && (
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Plataforma
              </label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                className="w-full p-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg"
              >
                <option value="youtube">YouTube</option>
                <option value="instagram">Instagram</option>
                <option value="tiktok">TikTok</option>
                <option value="linkedin">LinkedIn</option>
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Produto (opcional)
            </label>
            <input
              type="text"
              value={product}
              onChange={(e) => setProduct(e.target.value)}
              className="w-full p-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Público-Alvo (opcional)
            </label>
            <input
              type="text"
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
              className="w-full p-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg"
            />
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full bg-brand-600 hover:bg-brand-700 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? 'Gerando...' : 'Gerar Conteúdo'}
          </button>
        </div>

        {result && (
          <div className="mt-6 bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">Conteúdo Gerado</h2>
            {renderContent()}
          </div>
        )}
      </div>
    </div>
  );
};

export default ContentGenerator;
