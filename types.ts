export enum Sender {
  User = 'user',
  AI = 'ai'
}

export interface Message {
  id: string;
  text?: string; // Make text optional as some AI responses might only be images
  sender: Sender;
  timestamp: number;
  imageUrl?: string; // Optional image URL for displaying images
  imageMimeType?: string; // Optional image MIME type
  audioUrl?: string; // Optional audio URL for audio messages
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
}