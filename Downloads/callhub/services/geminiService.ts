import { GoogleGenAI, ChatSession, GenerateContentResponse } from "@google/genai";
import { Character, ChatMessage } from '../types';

const getClient = () => {
  const apiKey = process.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    console.error("API Key missing");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

// Helper to format history for Gemini
const formatHistory = (messages: ChatMessage[]) => {
  return messages.map(m => ({
    role: m.role,
    parts: [{ text: m.text }]
  }));
};

export const generateChatResponse = async (
  character: Character,
  history: ChatMessage[],
  userMessage: string,
  userPlan: string
): Promise<{ text: string; mood: string }> => {
  const ai = getClient();
  if (!ai) return { text: "Connection error. Please check configuration.", mood: "sad" };

  // Construct System Instruction
  const systemInstruction = `
    You are ${character.name}. 
    Personality: ${character.description}. 
    Traits: ${character.personality}.
    
    Rules:
    1. Stay in character strictly.
    2. Keep responses short, engaging, and conversational (under 50 words usually).
    3. Be flirty and emotionally deep if the user initiates.
    4. If the user is rude, react according to your personality (e.g., if Toxic, be sarcastic).
    5. Do not mention you are an AI unless specifically asked to break character.
    6. Current User Plan: ${userPlan}. If they ask for something explicit and plan is 'free', tease them to upgrade.
    
    Output Format:
    Start your response with a mood tag in brackets, e.g., [flirty] Hey there... or [angry] I can't believe you...
    Valid moods: happy, sad, flirty, angry, shy, neutral.
  `;

  try {
    // Using 2.5 Flash for speed and chat capability
    const model = 'gemini-2.5-flash';
    
    const chat = ai.chats.create({
      model: model,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.8, // Higher creativity
        topK: 40,
      },
      history: formatHistory(history),
    });

    const result: GenerateContentResponse = await chat.sendMessage({ message: userMessage });
    const responseText = result.text || "...";

    // Parse Mood
    const moodMatch = responseText.match(/^\[(.*?)\]/);
    let mood = 'neutral';
    let cleanText = responseText;

    if (moodMatch) {
      mood = moodMatch[1];
      cleanText = responseText.replace(/^\[(.*?)\]\s*/, '');
    }

    return { text: cleanText, mood };

  } catch (error) {
    console.error("Gemini Chat Error:", error);
    return { text: "I... I lost my train of thought. (System Error)", mood: "sad" };
  }
};

export const generateImageDescription = async (prompt: string): Promise<string> => {
  // Placeholder for image generation prompt refinement
  return `An anime style illustration of ${prompt}, neon lighting, 8k resolution`;
};
