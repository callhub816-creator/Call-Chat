
export interface ModeCardData {
  id: number;
  title: string;
  subtitle: string;
  gradientConfig: string; // Tailwind classes for specific gradients
  accentColor: string; // Hex for shadows/glows
}

export interface Persona {
  id: number | string;
  name: string;
  description: string;
  gender: 'female' | 'male';
  basePrompt: string;
  tags: string[];
  avatarUrl?: string; // For user-created or pre-generated images
  voiceId?: string;   // Identifier for specific voice tones
  modeId?: number;    // To track which mode created this
  // New optional fields for user-created personas
  mode?: string;
  createdAt?: number;
  language?: 'hinglish' | 'english';
  defaultLanguage?: string; // e.g., 'hinglish', 'hi', 'en'
}