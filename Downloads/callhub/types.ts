export interface User {
  id: string;
  email: string;
  plan: 'free' | 'basic' | 'plus' | 'pro' | 'ultra';
  coins: number;
}

export interface Character {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  avatarUrl: string;
  personality: 'cute' | 'dominant' | 'romantic' | 'toxic' | 'calm' | 'passionate';
  tags: string[];
  systemPrompt: string;
  voiceId?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
  mood?: string; // For AI emotional state
}

export interface ChatSession {
  id: string;
  characterId: string;
  messages: ChatMessage[];
  background: 'default' | 'rain' | 'cafe' | 'bedroom' | 'neon';
  lastMood: string;
}

export interface Quest {
  id: string;
  title: string;
  reward: number;
  completed: boolean;
}

export const MOODS = {
  NEUTRAL: 'neutral',
  HAPPY: 'happy',
  FLIRTY: 'flirty',
  ANGRY: 'angry',
  SAD: 'sad',
  SHY: 'shy',
};