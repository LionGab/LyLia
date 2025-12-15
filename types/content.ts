export type ContentType = 'video-script' | 'social-post' | 'email' | 'blog-post' | 'hook';

export interface ContentRequest {
  type: ContentType;
  topic: string;
  product?: string;
  targetAudience?: string;
  tone?: 'profissional' | 'casual' | 'motivacional' | 'educativo';
  length?: 'curto' | 'medio' | 'longo';
  platform?: 'instagram' | 'youtube' | 'tiktok' | 'linkedin' | 'email';
}

export interface VideoScript {
  title: string;
  hook: string;
  introduction: string;
  mainPoints: string[];
  callToAction: string;
  duration: string; // estimativa
  platform: string;
}

export interface SocialPost {
  caption: string;
  hashtags: string[];
  hook: string;
  callToAction: string;
  platform: string;
}

export interface EmailContent {
  subject: string;
  preheader: string;
  greeting: string;
  body: string[];
  callToAction: string;
  closing: string;
}

export interface ContentResult {
  type: ContentType;
  content: VideoScript | SocialPost | EmailContent | string;
  metadata: {
    wordCount: number;
    estimatedTime?: string;
    platform?: string;
  };
}
