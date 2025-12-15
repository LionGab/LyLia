import { ContentRequest, ContentResult, VideoScript, SocialPost, EmailContent } from '../types/content';
import { sendContentToGemini } from './geminiService';
import { logger } from './logger';

/**
 * Gera conteúdo baseado no tipo solicitado
 */
export const generateContent = async (request: ContentRequest): Promise<ContentResult> => {
  const { type, topic, product, targetAudience, tone, length, platform } = request;

  let prompt = '';

  switch (type) {
    case 'video-script':
      prompt = generateVideoScriptPrompt(topic, product, targetAudience, tone, length, platform);
      break;
    case 'social-post':
      prompt = generateSocialPostPrompt(topic, product, targetAudience, tone, platform);
      break;
    case 'email':
      prompt = generateEmailPrompt(topic, product, targetAudience, tone, length);
      break;
    case 'hook':
      prompt = generateHookPrompt(topic, product, targetAudience);
      break;
    default:
      prompt = `Crie conteúdo sobre: ${topic}`;
  }

  try {
    const response = await sendContentToGemini([], prompt);
    const contentText = response.text || '';

    // Parse baseado no tipo
    if (type === 'video-script') {
      return parseVideoScript(contentText, platform || 'youtube');
    } else if (type === 'social-post') {
      return parseSocialPost(contentText, platform || 'instagram');
    } else if (type === 'email') {
      return parseEmail(contentText);
    } else {
      return {
        type,
        content: contentText,
        metadata: {
          wordCount: contentText.split(/\s+/).length,
        },
      };
    }
  } catch (error) {
    logger.error('Erro ao gerar conteúdo', error);
    throw error;
  }
};

const generateVideoScriptPrompt = (
  topic: string,
  product?: string,
  targetAudience?: string,
  tone?: string,
  length?: string,
  platform?: string
): string => {
  return `Crie um roteiro completo de vídeo ${platform || 'para redes sociais'} sobre: ${topic}

${product ? `Produto: ${product}` : ''}
${targetAudience ? `Público-alvo: ${targetAudience}` : ''}
${tone ? `Tom: ${tone}` : ''}
${length ? `Duração: ${length}` : 'Duração: média'}

Estrutura do roteiro:
1. Título chamativo
2. Gancho (primeiros 3 segundos)
3. Introdução (contexto)
4. 3-5 pontos principais
5. Call to action

Responda em JSON:
{
  "title": "título",
  "hook": "gancho",
  "introduction": "introdução",
  "mainPoints": ["ponto1", "ponto2"],
  "callToAction": "CTA",
  "duration": "estimativa",
  "platform": "${platform || 'youtube'}"
}`;
};

const generateSocialPostPrompt = (
  topic: string,
  product?: string,
  targetAudience?: string,
  tone?: string,
  platform?: string
): string => {
  return `Crie um post para ${platform || 'Instagram'} sobre: ${topic}

${product ? `Produto: ${product}` : ''}
${targetAudience ? `Público-alvo: ${targetAudience}` : ''}
${tone ? `Tom: ${tone}` : ''}

Responda em JSON:
{
  "caption": "texto do post",
  "hashtags": ["#hashtag1", "#hashtag2"],
  "hook": "primeira linha",
  "callToAction": "CTA",
  "platform": "${platform || 'instagram'}"
}`;
};

const generateEmailPrompt = (
  topic: string,
  product?: string,
  targetAudience?: string,
  tone?: string,
  length?: string
): string => {
  return `Crie um email de vendas sobre: ${topic}

${product ? `Produto: ${product}` : ''}
${targetAudience ? `Público-alvo: ${targetAudience}` : ''}
${tone ? `Tom: ${tone}` : ''}
${length ? `Tamanho: ${length}` : ''}

Responda em JSON:
{
  "subject": "assunto",
  "preheader": "pré-cabeçalho",
  "greeting": "saudação",
  "body": ["parágrafo1", "parágrafo2"],
  "callToAction": "CTA",
  "closing": "fechamento"
}`;
};

const generateHookPrompt = (topic: string, product?: string, targetAudience?: string): string => {
  return `Crie 5 ganchos criativos e chamativos sobre: ${topic}

${product ? `Produto: ${product}` : ''}
${targetAudience ? `Público-alvo: ${targetAudience}` : ''}

Responda apenas com uma lista numerada de ganchos, um por linha.`;
};

const parseVideoScript = (text: string, platform: string): ContentResult => {
  try {
    const jsonText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const parsed = JSON.parse(jsonText);

    const script: VideoScript = {
      title: parsed.title || 'Roteiro de Vídeo',
      hook: parsed.hook || '',
      introduction: parsed.introduction || '',
      mainPoints: parsed.mainPoints || [],
      callToAction: parsed.callToAction || '',
      duration: parsed.duration || '3-5 min',
      platform,
    };

    return {
      type: 'video-script',
      content: script,
      metadata: {
        wordCount: JSON.stringify(script).split(/\s+/).length,
        estimatedTime: script.duration,
        platform,
      },
    };
  } catch (error) {
    // Fallback se não conseguir parsear JSON
    return {
      type: 'video-script',
      content: {
        title: 'Roteiro de Vídeo',
        hook: text.split('\n')[0] || '',
        introduction: text.split('\n').slice(1, 3).join('\n') || '',
        mainPoints: text.split('\n').slice(3, -1) || [],
        callToAction: text.split('\n').slice(-1)[0] || '',
        duration: '3-5 min',
        platform,
      },
      metadata: {
        wordCount: text.split(/\s+/).length,
        estimatedTime: '3-5 min',
        platform,
      },
    };
  }
};

const parseSocialPost = (text: string, platform: string): ContentResult => {
  try {
    const jsonText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const parsed = JSON.parse(jsonText);

    const post: SocialPost = {
      caption: parsed.caption || text,
      hashtags: parsed.hashtags || [],
      hook: parsed.hook || text.split('\n')[0] || '',
      callToAction: parsed.callToAction || '',
      platform,
    };

    return {
      type: 'social-post',
      content: post,
      metadata: {
        wordCount: post.caption.split(/\s+/).length,
        platform,
      },
    };
  } catch (error) {
    return {
      type: 'social-post',
      content: {
        caption: text,
        hashtags: [],
        hook: text.split('\n')[0] || '',
        callToAction: '',
        platform,
      },
      metadata: {
        wordCount: text.split(/\s+/).length,
        platform,
      },
    };
  }
};

const parseEmail = (text: string): ContentResult => {
  try {
    const jsonText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const parsed = JSON.parse(jsonText);

    const email: EmailContent = {
      subject: parsed.subject || 'Assunto do Email',
      preheader: parsed.preheader || '',
      greeting: parsed.greeting || 'Olá!',
      body: parsed.body || [text],
      callToAction: parsed.callToAction || '',
      closing: parsed.closing || 'Atenciosamente',
    };

    return {
      type: 'email',
      content: email,
      metadata: {
        wordCount: email.body.join(' ').split(/\s+/).length,
      },
    };
  } catch (error) {
    return {
      type: 'email',
      content: {
        subject: 'Assunto do Email',
        preheader: '',
        greeting: 'Olá!',
        body: [text],
        callToAction: '',
        closing: 'Atenciosamente',
      },
      metadata: {
        wordCount: text.split(/\s+/).length,
      },
    };
  }
};

/**
 * Salva conteúdo gerado
 */
export const saveContent = (email: string, content: ContentResult): void => {
  try {
    const contents = loadContents(email);
    contents.push({ ...content, timestamp: new Date().toISOString() });
    localStorage.setItem(`erl_lia_contents_${email}`, JSON.stringify(contents));
  } catch (error) {
    logger.error('Erro ao salvar conteúdo', error);
  }
};

/**
 * Carrega conteúdos salvos
 */
export const loadContents = (email: string): Array<ContentResult & { timestamp: string }> => {
  try {
    const data = localStorage.getItem(`erl_lia_contents_${email}`);
    if (!data) return [];
    return JSON.parse(data);
  } catch (error) {
    logger.error('Erro ao carregar conteúdos', error);
    return [];
  }
};
