import React, { useState } from 'react';
import { saveUserPersona } from "../src/utils/storage";
import { GoogleGenAI } from "@google/genai";
import { ModeCardData, Persona } from '../types';
import { MODE_CONFIGS } from '../constants';
import { X, Upload, Sparkles, Wand2, Loader2, AlertTriangle, ArrowRight, Lock, Shield } from 'lucide-react';

interface PersonaCreationModalProps {
  mode: ModeCardData;
  onClose: () => void;
  onCreated: (persona: Persona, avatarUrl?: string) => void;
}

const PersonaCreationModal: React.FC<PersonaCreationModalProps> = ({ mode, onClose, onCreated }) => {
  const [step, setStep] = useState<'form' | 'creating'>('form');
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    gender: 'female' as 'female' | 'male',
    photoMethod: 'generate' as 'generate' | 'upload',
    photoStyle: 'Aesthetic Model',
    uploadedFile: null as File | null,
    voiceTone: 'Warm'
  });
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const PHOTO_STYLES = [
    "Aesthetic Model", "Cute & Soft", "Realistic Indian", "Minimal Anime", "Premium Portrait"
  ];
  
  const VOICE_TONES = ["Soft", "Warm", "Playful", "Deep"];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFormData({ ...formData, uploadedFile: file });
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const generateSystemImage = async (personaName: string, gender: string, style: string, vibe: string) => {
    if (!process.env.API_KEY) throw new Error("API Key Missing");
    
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `Portrait of a ${gender} named ${personaName}. Style: ${style}. Vibe: ${vibe}. High quality, 1:1 aspect ratio, soft lighting, romantic aesthetic. No text.`;
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ text: prompt }] },
      config: { imageConfig: { aspectRatio: "1:1" } },
    });

    if (response.candidates && response.candidates[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            return `data:image/png;base64,${part.inlineData.data}`;
          }
      }
    }
    throw new Error("No image generated");
  };

  const isRateLimit = (e: any) => {
    if (!e) return false;
    // Check for status code in various places
    if (e.status === 429 || e.code === 429 || e.error?.code === 429) return true;
    
    // Check strings
    const msg = (e.message || e.toString() || '').toLowerCase();
    const body = JSON.stringify(e).toLowerCase();
    
    return msg.includes('429') || 
           msg.includes('quota') || 
           msg.includes('resource_exhausted') ||
           body.includes('resource_exhausted') ||
           body.includes('429');
  };

  function handleCreate(skipImage = false) {
    const newPersona = {
      id: `custom-${Date.now()}`,
      name: formData.name,
      description: formData.name,
      gender: formData.gender,
      mode: mode.title.toLowerCase().includes('flirty') ? 'flirty' : mode.title.toLowerCase().includes('romantic') ? 'romantic' : mode.title.toLowerCase().includes('jealous') ? 'jealous' : mode.title.toLowerCase().includes('bold') ? 'bold' : 'sweet',
      avatarUrl: previewUrl || '/personas/placeholder.png',
      tags: [],
      createdAt: Date.now(),
      expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
      isUserCreated: true,
      defaultLanguage: 'hinglish',
    } as any;

    // Save to user storage
    try {
      saveUserPersona(newPersona);
    } catch (e) {
      console.error('Failed to save persona', e);
    }

    onCreated?.(newPersona, newPersona.avatarUrl);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="
        w-full max-w-md bg-[#FFF0F5] sm:rounded-[32px] rounded-t-[32px] 
        shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-300
        max-h-[90vh] overflow-y-auto
      ">
        
        {/* Header with Gradient matching Mode */}
        <div className={`relative p-6 bg-gradient-to-r ${mode.gradientConfig} text-white`}>
           <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-black/10 hover:bg-black/20 rounded-full transition-colors">
              <X size={20} />
           </button>
           <div className="space-y-1">
             <span className="text-[10px] uppercase tracking-widest font-bold opacity-80 flex items-center gap-1">
               <Lock size={10} /> MODE LOCKED
             </span>
             <h2 className="text-2xl font-serif-display font-medium">{mode.title}</h2>
             <p className="text-white/90 text-sm font-light">{mode.subtitle}</p>
           </div>
        </div>

        {step === 'creating' ? (
          <div className="p-12 flex flex-col items-center justify-center text-center space-y-4 min-h-[300px]">
             <div className="relative">
                <div className="absolute inset-0 bg-[#FF9ACB] rounded-full blur-xl opacity-50 animate-pulse" />
                <Loader2 size={48} className="relative z-10 text-[#B28DFF] animate-spin" />
             </div>
             <h3 className="text-xl font-serif-display text-[#4A2040]">Creating your Partner...</h3>
             <p className="text-[#8e6a88] text-sm">Finalizing the {mode.title.toLowerCase()} personality.</p>
          </div>
        ) : (
          <div className="p-6 space-y-6">
            
            {/* Error Banner */}
            {error && (
              <div className="bg-red-50 border border-red-100 rounded-xl p-4 flex flex-col gap-2 animate-in slide-in-from-top-2">
                <div className="flex items-center gap-2 text-red-600 font-bold text-sm">
                   <AlertTriangle size={16} />
                   <span>{error === 'High Traffic (429)' ? 'System Busy' : 'Creation Failed'}</span>
                </div>
                <p className="text-xs text-red-500/80">
                  {error === 'High Traffic (429)' 
                    ? 'We are experiencing high traffic. Try again or skip the photo.' 
                    : 'Could not generate. Try again or upload.'}
                </p>
                <div className="flex gap-2 mt-1">
                   <button onClick={() => handleCreate(false)} className="px-3 py-1.5 bg-red-100 text-red-700 text-xs font-bold rounded-lg">Try Again</button>
                   <button onClick={() => handleCreate(true)} className="px-3 py-1.5 bg-white border border-red-200 text-red-600 text-xs font-medium rounded-lg flex items-center gap-1">Skip Photo <ArrowRight size={12}/></button>
                </div>
              </div>
            )}

            {/* Privacy Notice - Local Storage */}
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 flex gap-3 items-start">
                <Shield size={16} className="text-blue-500 mt-0.5 flex-shrink-0" />
                <div className="text-xs text-blue-800">
                   <p className="font-bold mb-0.5">Private & Local Only</p>
                   <p className="opacity-80 leading-relaxed">
                     Your partner and chat history are stored <strong>locally on this device</strong> for 7 days. They are not uploaded to our servers.
                   </p>
                </div>
            </div>

            {/* Gender Selection */}
            <div>
               <label className="block text-xs font-bold text-[#8e6a88] uppercase tracking-wider mb-3">I want a</label>
               <div className="flex bg-white rounded-xl p-1 border border-[#B28DFF]/20 shadow-sm">
                  {['female', 'male'].map((g) => (
                    <button
                      key={g}
                      onClick={() => setFormData({...formData, gender: g as any})}
                      className={`
                        flex-1 py-2.5 rounded-lg text-sm font-medium transition-all
                        ${formData.gender === g ? 'bg-[#B28DFF] text-white shadow-md' : 'text-[#5e3a58] hover:bg-[#F3E8FF]'}
                      `}
                    >
                      {g === 'female' ? 'Girlfriend' : 'Boyfriend'}
                    </button>
                  ))}
               </div>
            </div>

            {/* Name Input */}
            <div>
               <label className="block text-xs font-bold text-[#8e6a88] uppercase tracking-wider mb-2">Name</label>
               <input 
                 type="text" 
                 value={formData.name}
                 onChange={(e) => setFormData({...formData, name: e.target.value})}
                 placeholder="e.g. Aara, Vihaan..."
                 className="w-full px-4 py-3 rounded-xl bg-white border border-[#B28DFF]/20 focus:border-[#B28DFF] focus:ring-2 focus:ring-[#B28DFF]/20 outline-none text-[#4A2040] placeholder-[#8e6a88]/40 shadow-sm"
               />
            </div>

            {/* Photo Choice */}
            <div>
               <label className="block text-xs font-bold text-[#8e6a88] uppercase tracking-wider mb-3">Profile Photo</label>
               
               <div className="flex gap-4 mb-4">
                  <button 
                    onClick={() => setFormData({...formData, photoMethod: 'generate'})}
                    className={`flex-1 flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${formData.photoMethod === 'generate' ? 'border-[#B28DFF] bg-[#F3E8FF]' : 'border-transparent bg-white'}`}
                  >
                    <Wand2 size={20} className={formData.photoMethod === 'generate' ? 'text-[#B28DFF]' : 'text-[#8e6a88]'} />
                    <span className="text-xs font-bold text-[#5e3a58]">AI Generate</span>
                  </button>
                  <button 
                    onClick={() => setFormData({...formData, photoMethod: 'upload'})}
                    className={`flex-1 flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${formData.photoMethod === 'upload' ? 'border-[#B28DFF] bg-[#F3E8FF]' : 'border-transparent bg-white'}`}
                  >
                    <Upload size={20} className={formData.photoMethod === 'upload' ? 'text-[#B28DFF]' : 'text-[#8e6a88]'} />
                    <span className="text-xs font-bold text-[#5e3a58]">Upload</span>
                  </button>
               </div>

               {formData.photoMethod === 'generate' ? (
                 <div className="grid grid-cols-2 gap-2">
                    {PHOTO_STYLES.map(style => (
                      <button 
                        key={style}
                        onClick={() => setFormData({...formData, photoStyle: style})}
                        className={`
                          py-2 px-3 rounded-lg text-xs border text-left truncate transition-all
                          ${formData.photoStyle === style ? 'border-[#B28DFF] bg-white text-[#B28DFF] font-bold shadow-sm' : 'border-transparent bg-white/50 text-[#8e6a88]'}
                        `}
                      >
                        {style}
                      </button>
                    ))}
                 </div>
               ) : (
                 <div className="relative group w-full h-32 bg-white border-2 border-dashed border-[#B28DFF]/30 rounded-xl flex items-center justify-center overflow-hidden">
                    {previewUrl ? (
                      <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xs text-[#8e6a88]">Click to upload</span>
                    )}
                    <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                 </div>
               )}
            </div>

            {/* Voice Tone */}
            <div>
               <label className="block text-xs font-bold text-[#8e6a88] uppercase tracking-wider mb-3">Voice Tone</label>
               <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                  {VOICE_TONES.map(tone => (
                    <button
                      key={tone}
                      onClick={() => setFormData({...formData, voiceTone: tone})}
                      className={`
                        flex-shrink-0 px-4 py-2 rounded-full text-xs font-medium border transition-all
                        ${formData.voiceTone === tone ? 'bg-[#4A2040] text-white border-[#4A2040]' : 'bg-white border-[#B28DFF]/20 text-[#5e3a58]'}
                      `}
                    >
                      {tone}
                    </button>
                  ))}
               </div>
            </div>

            {/* Create CTA */}
            <div className="pt-4 flex gap-3">
               <button onClick={onClose} className="flex-1 py-3.5 rounded-xl border border-[#B28DFF]/30 text-[#8e6a88] font-bold text-sm hover:bg-white/50">
                 Cancel
               </button>
               <button 
                 onClick={() => handleCreate(false)}
                 disabled={!formData.name}
                 className="
                   flex-[2] py-3.5 rounded-xl 
                   bg-gradient-to-r from-[#FF9ACB] to-[#B28DFF] 
                   text-white font-bold text-sm shadow-lg shadow-[#B28DFF]/20 
                   disabled:opacity-50 disabled:cursor-not-allowed
                   flex items-center justify-center gap-2
                 "
               >
                 <Sparkles size={16} fill="currentColor" />
                 Create Partner
               </button>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};

export default PersonaCreationModal;