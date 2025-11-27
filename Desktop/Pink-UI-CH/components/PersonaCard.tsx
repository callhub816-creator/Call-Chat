import React, { useState, useEffect, useRef } from 'react';
import { Persona } from '../types';
import { GoogleGenAI } from "@google/genai";
import { Loader2, AlertTriangle, RefreshCw } from 'lucide-react';

interface PersonaCardProps {
  persona: Persona;
  onStartCall: (persona: Persona) => void;
  onStartChat: (persona: Persona, avatarUrl?: string) => void;
  onViewProfile: (persona: Persona, avatarUrl?: string) => void;
  isUserCreated?: boolean;
  daysLeft?: number; // For My Creations badge
}

const PersonaCard: React.FC<PersonaCardProps> = ({ 
  persona, 
  onStartCall, 
  onStartChat, 
  onViewProfile, 
  isUserCreated,
  daysLeft 
}) => {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [usePlaceholder, setUsePlaceholder] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const cardRef = useRef<HTMLElement>(null);
  const attemptRef = useRef(0);

  // Initialize with provided avatarUrl if available
  useEffect(() => {
    if (persona.avatarUrl) {
      setImageUrl(persona.avatarUrl);
      setStatus('success');
    }
  }, [persona.avatarUrl]);

  // AUTO-GENERATE IMAGE ON SCROLL (Lazy Load) - Only if no avatarUrl provided
  useEffect(() => {
    if (status !== 'idle' || !process.env.API_KEY || persona.avatarUrl || usePlaceholder) return;

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        const delay = Math.random() * 3000;
        setTimeout(() => {
          generateImage();
        }, delay);
        observer.disconnect();
      }
    }, { rootMargin: '200px' });

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, [status, persona.id, persona.avatarUrl, usePlaceholder]);

  const isRateLimit = (e: any) => {
    if (!e) return false;
    if (e.status === 429 || e.code === 429 || e.error?.code === 429) return true;
    const msg = (e.message || e.toString() || '').toLowerCase();
    const body = JSON.stringify(e).toLowerCase();
    return msg.includes('429') || msg.includes('quota') || msg.includes('resource_exhausted') ||
           body.includes('resource_exhausted') || body.includes('429');
  };

  const generateImage = async () => {
    if (attemptRef.current > 2) return;
    setStatus('loading');
    setErrorMsg(null);
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [{ text: persona.basePrompt }],
        },
        config: {
          imageConfig: { aspectRatio: "3:4" },
        },
      });

      let foundImage = false;
      if (response.candidates && response.candidates.length > 0) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            const base64EncodeString = part.inlineData.data;
            setImageUrl(`data:image/png;base64,${base64EncodeString}`);
            foundImage = true;
            break;
          }
        }
      }
      setStatus(foundImage ? 'success' : 'error');
      if (!foundImage) setErrorMsg("No image generated");
    } catch (error: any) {
      console.error("Generation failed", error);
      setStatus('error');
      
      if (isRateLimit(error)) {
        console.warn(`Rate limit hit for ${persona.name}, switching to placeholder.`);
        setUsePlaceholder(true);
        setStatus('success');
        return;
      } else {
        setErrorMsg("Generation Failed");
      }
      
      attemptRef.current += 1;
    }
  };

  const handleChat = (e: React.MouseEvent) => {
    e.stopPropagation();
    onStartChat(persona, imageUrl || undefined);
  };

  const handleViewProfile = (e: React.MouseEvent) => {
    e.stopPropagation();
    onViewProfile(persona, imageUrl || undefined);
  };

  const handleRetry = (e: React.MouseEvent) => {
    e.stopPropagation();
    attemptRef.current = 0;
    generateImage();
  };

  const handleUsePlaceholder = (e: React.MouseEvent) => {
    e.stopPropagation();
    setUsePlaceholder(true);
    setStatus('success');
  };

  // Generate pastel gradient based on persona name
  const getGradient = () => {
    const colors = [
      'from-pink-300 to-purple-300',
      'from-blue-300 to-cyan-300',
      'from-purple-300 to-pink-300',
      'from-green-300 to-blue-300',
      'from-yellow-300 to-orange-300',
    ];
    const index = persona.name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  return (
    <article 
      ref={cardRef}
      className="relative w-full flex flex-col bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300"
      style={{ minHeight: '420px' }}
      aria-label={`Profile of ${persona.name}`}
    >
      
      {/* IMAGE SECTION */}
      <div className="relative w-full h-56 bg-gray-100 overflow-hidden">
        
        {/* Loading State */}
        {status === 'loading' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300">
            <Loader2 className="animate-spin text-purple-500" size={32} />
            <span className="text-xs text-gray-600 font-medium mt-2">Creating portrait...</span>
          </div>
        )}

        {/* Error State */}
        {status === 'error' && !usePlaceholder && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300 text-center p-4 space-y-2">
            <AlertTriangle size={24} className="text-red-400" />
            <span className="text-xs text-gray-600">{errorMsg || "Image unavailable"}</span>
            <div className="flex gap-2">
              <button 
                onClick={handleRetry}
                className="px-3 py-1 rounded-full bg-white hover:bg-gray-50 text-xs font-semibold transition-colors"
              >
                <RefreshCw size={12} className="inline mr-1" /> Retry
              </button>
              <button 
                onClick={handleUsePlaceholder}
                className="px-3 py-1 rounded-full bg-gray-300 hover:bg-gray-400 text-xs font-semibold text-white transition-colors"
              >
                Use Placeholder
              </button>
            </div>
          </div>
        )}

        {/* Placeholder Gradient Avatar */}
        {usePlaceholder && (
          <div className={`w-full h-full bg-gradient-to-br ${getGradient()} flex items-center justify-center relative`}>
            <div className="text-5xl font-bold text-white/40">
              {persona.name[0].toUpperCase()}
            </div>
          </div>
        )}

        {/* Actual Image */}
        {!usePlaceholder && (
          <img
            src={persona.avatarUrl || imageUrl || '/personas/placeholder.png'}
            alt={`Portrait of ${persona.name}`}
            className="w-full h-full object-cover"
            loading="lazy"
            onError={(e) => {
              const img = e.currentTarget as HTMLImageElement;
              if (img.src && !img.src.includes('/personas/placeholder.png')) {
                img.src = '/personas/placeholder.png';
              }
              setUsePlaceholder(true);
              setStatus('success');
            }}
          />
        )}

        {/* Online indicator removed per design request */}

        {/* Retention Badge (Top Right) - Only for My Creations */}
        {isUserCreated && daysLeft !== undefined && (
          <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm rounded-full px-3 py-1.5 shadow-md">
            <span className="text-xs font-bold text-gray-800">📅 {daysLeft} days left</span>
          </div>
        )}
      </div>

      {/* CONTENT SECTION */}
      <div className="flex-1 flex flex-col p-4 bg-white">
        
        {/* Name */}
        <h3 className="text-lg font-bold text-gray-900 mb-1">
          {persona.name}
        </h3>

        {/* Description */}
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {persona.description}
        </p>

        {/* Mode Tag - Only for user-created */}
        {isUserCreated && (persona as any).mode && (
          <div className="inline-block mb-2">
            <span className="text-xs font-semibold text-purple-700 bg-purple-100 rounded-full px-3 py-1">
              Mode: {String((persona as any).mode).charAt(0).toUpperCase() + String((persona as any).mode).slice(1)}
            </span>
          </div>
        )}

        {/* Tags */}
        {!isUserCreated && (
          <div className="flex flex-wrap gap-2 mb-3">
            {persona.tags.slice(0, 3).map((tag, i) => (
              <span key={i} className="text-xs bg-gray-100 text-gray-700 rounded-full px-2.5 py-1 font-medium">
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Bottom Buttons */}
        <div className="flex gap-2 mt-auto">
          <button 
            onClick={handleChat}
            className="flex-1 h-11 rounded-lg bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold text-sm hover:from-pink-600 hover:to-purple-600 active:scale-95 transition-all shadow-md"
            aria-label={`Chat with ${persona.name}`}
          >
            Chat Now
          </button>
          
          <button 
            onClick={handleViewProfile}
            className="flex-1 h-11 rounded-lg bg-gray-100 border border-gray-300 text-gray-800 font-semibold text-sm hover:bg-gray-200 active:scale-95 transition-all"
            aria-label="View profile"
          >
            View Profile
          </button>
        </div>
      </div>
    </article>
  );
};

export default PersonaCard;