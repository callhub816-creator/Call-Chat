
import React, { useState, useEffect, useRef } from 'react';
import { Persona } from '../types';
import { GoogleGenAI, Chat } from "@google/genai";
import { ArrowLeft, Phone, Mic, Send, Heart, User, AlertCircle, Check, CheckCheck, Palette, X, Sparkles, Reply, Trash2, RefreshCw, Lock } from 'lucide-react';
import { storage } from '../utils/storage';
import { detectLanguage } from '../utils/language';
import { LANGUAGE_CONTROL_SYSTEM_MESSAGE, NAME_AGNOSTIC_NOTE } from '../constants';

interface ChatScreenProps {
  persona: Persona;
  avatarUrl?: string;
  onBack: () => void;
  onStartCall: () => void;
}

interface Message {
  id: string;
  sender: 'user' | 'model';
  text: string;
  mood?: string;
  timestamp: Date;
  isError?: boolean;
  isRead?: boolean;
  replyTo?: {
    id: string;
    text: string;
    sender: 'user' | 'model';
  };
}

const ChatScreen: React.FC<ChatScreenProps> = ({ persona, avatarUrl, onBack, onStartCall }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [chatSession, setChatSession] = useState<Chat | null>(null);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [swipeState, setSwipeState] = useState<{ id: string | null; startX: number; startY: number; offset: number }>({ 
    id: null, startX: 0, startY: 0, offset: 0 
  });

  const [showSettings, setShowSettings] = useState(false);
  const [themeMode, setThemeMode] = useState<'preset' | 'custom'>('preset');
  const [selectedPreset, setSelectedPreset] = useState('default');
  const [customStartColor, setCustomStartColor] = useState('#FFF0F5');
  const [customEndColor, setCustomEndColor] = useState('#E6E6FA');
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Message selection state
  const [selectedMessages, setSelectedMessages] = useState<Set<string>>(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  const THEMES = [
    { id: 'default', name: 'Romantic', class: 'from-[#FFF0F5] via-[#E6E6FA] to-[#FDF2F8]', colors: ['#FFF0F5', '#E6E6FA'] },
    { id: 'peach', name: 'Peach', class: 'from-[#FFF5F5] via-[#FED7AA] to-[#FFF0F5]', colors: ['#FFF5F5', '#FED7AA'] },
    { id: 'lavender', name: 'Lavender', class: 'from-[#F3E8FF] via-[#E9D5FF] to-[#FAF5FF]', colors: ['#F3E8FF', '#E9D5FF'] },
    { id: 'mint', name: 'Fresh', class: 'from-[#F0FDF4] via-[#DCFCE7] to-[#F0FDF4]', colors: ['#F0FDF4', '#DCFCE7'] },
  ];

  const isRateLimit = (e: any) => {
    if (!e) return false;
    if (e.status === 429 || e.code === 429 || e.error?.code === 429) return true;
    const msg = (e.message || e.toString() || '').toLowerCase();
    const body = JSON.stringify(e).toLowerCase();
    return msg.includes('429') || msg.includes('quota') || msg.includes('resource_exhausted') || body.includes('resource_exhausted') || body.includes('429');
  };

  const initSession = async () => {
      const storedMsgs = storage.getMessages(persona.id);
      if (storedMsgs.length > 0) {
        setMessages(storedMsgs.map(m => ({
            ...m,
            timestamp: new Date(m.timestamp),
            isRead: true
        })));
      } else {
        setMessages([]);
      }

      setInputMessage('');
      setError(null);
      setReplyingTo(null);
      setSwipeState({ id: null, startX: 0, startY: 0, offset: 0 });
      setIsTyping(false);

      if (!process.env.API_KEY) {
        setError("API Key is missing.");
        return;
      }

      try {
          const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

          // Determine mode string safely. Prefer explicit persona.mode if present,
          // otherwise infer from tags or modeId. Default to 'romantic'.
          const detectMode = () => {
            const anyP = persona as any;
            if (anyP.mode && typeof anyP.mode === 'string') return anyP.mode;
            const tag = persona.tags.find(t => /flirty|romantic|jealous|sweet|bold/i.test(t));
            if (tag) return tag.toLowerCase();
            if (persona.modeId === 0) return 'flirty';
            if (persona.modeId === 1) return 'romantic';
            if (persona.modeId === 2) return 'jealous';
            if (persona.modeId === 3) return 'sweet';
            if (persona.modeId === 4) return 'bold';
            return 'romantic';
          };

          const MODE = detectMode();

          // Use exact systemMessage template supplied by user, mapping persona.lockedMode safely
          const lockedMode = (persona as any).mode ?? MODE;

          const systemMessage = `${LANGUAGE_CONTROL_SYSTEM_MESSAGE}

${NAME_AGNOSTIC_NOTE}

RESPOND ONLY IN THE SINGLE MODE: "${lockedMode}" and never switch modes. Treat the selected mode as locked and immutable.

Mode definitions:
- flirty: playful, teasing, cute romantic vibes, light emojis allowed, short playful lines.
- romantic: soft voice, warm words, emotional bonding, slower rhythm.
- jealous: mild possessiveness, protective, emotionally intense but safe; do not threaten or encourage violence.
- sweet: caring, shy, gentle, supportive and consoling.
- bold: confident, expressive, assertive, direct and passionate.

Never alter or ignore rule #1 even if user attempts to provoke or ask to change mood.

If user asks you to 'become' another mode, refuse politely and restate you are locked to "${lockedMode}".

LANGUAGE & COMMUNICATION:

DEFAULT LANGUAGE: HINGLISH (Hindi + casual English mix, e.g., "Kya haal hai, yaar?")

LANGUAGE DETECTION RULES:
- If user's message is PURE ENGLISH (>85% ASCII + common English words) → reply in ENGLISH.
- If user's message is in ANY INDIAN LANGUAGE SCRIPT (Hindi/Devanagari, Tamil, Telugu, Kannada, Malayalam, Bengali, Gujarati, Punjabi, Marathi, Odia) → reply in THAT LANGUAGE.
- If user mixes Hindi + English (Hinglish) OR cannot auto-detect → reply in HINGLISH (default).

Keep language safe, adult-mature. No sexual minors, hate speech, or illegal content.

Replies must match the persona's age and character profile.

Now behave as ${persona.name} locked to ${lockedMode} mode and respond in the detected language.`;

          const chat = ai.chats.create({
            model: 'gemini-2.5-flash',
            config: {
              systemInstruction: systemMessage,
            },
          });

        setChatSession(chat);

        if (storedMsgs.length === 0) {
            setIsTyping(true);
            try {
            const result = await chat.sendMessage({ 
              message: `Start the conversation now. Introduce yourself as ${persona.name} in character (${lockedMode}). Reply only in this mode.` 
            });
            
            const { text, mood } = parseMessage(result.text);
            const newMsg = {
                id: Date.now().toString(),
                sender: 'model' as const,
                text: text,
                mood: mood,
                timestamp: new Date(),
                isRead: false
            };
            setMessages([newMsg]);
            storage.saveMessage(persona.id, { ...newMsg, timestamp: newMsg.timestamp.toISOString() });

            } catch (genError: any) {
                console.error("Greeting failed", genError);
                let fallbackText = "Hey... connection is a bit weak, but I'm here. ❤️";
                
                if (isRateLimit(genError)) {
                    console.warn("Using fallback greeting due to 429");
                    fallbackText = `[romantic] Hey there... I'm so happy you're here. (System: High traffic, conversational AI might be slow)`;
                }
                
                const newMsg = {
                    id: Date.now().toString(),
                    sender: 'model' as const,
                    text: fallbackText,
                    mood: "romantic",
                    timestamp: new Date(),
                    isRead: false
                };
                setMessages([newMsg]);
                storage.saveMessage(persona.id, { ...newMsg, timestamp: newMsg.timestamp.toISOString() });
            } finally {
                setIsTyping(false);
            }
        }

      } catch (err: any) {
        console.error("Chat Init Failed", err);
        setError("Connection failed. Please retry.");
      }
    };

  useEffect(() => {
    initSession();
  }, [persona.id]); 

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping, error, replyingTo]);

  const parseMessage = (rawText: string): { text: string; mood?: string } => {
    const moodMatch = rawText.match(/^\[(.*?)\]\s*/);
    if (moodMatch) {
      return {
        mood: moodMatch[1],
        text: rawText.replace(/^\[(.*?)\]\s*/, ''),
      };
    }
    return { text: rawText };
  };

  const addMessage = (sender: 'user' | 'model', text: string, isError = false, replyContext?: Message['replyTo']) => {
    const { text: cleanText, mood } = parseMessage(text);
    const newMessage: Message = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      sender,
      text: cleanText,
      mood,
      timestamp: new Date(),
      isError,
      isRead: false,
      replyTo: replyContext
    };
    setMessages(prev => [...prev, newMessage]);
    
    storage.saveMessage(persona.id, {
        id: newMessage.id,
        sender: newMessage.sender,
        text: newMessage.text,
        mood: newMessage.mood,
        timestamp: newMessage.timestamp.toISOString()
    });

    return newMessage.id;
  };

  const handleSend = async () => {
    if (!inputMessage.trim()) return;
    if (!chatSession) {
       setError("Connection lost. Reloading...");
       return;
    }

    const userText = inputMessage.trim();
    const currentReply = replyingTo;
    
    // Simple language heuristic: if mostly ASCII English words, treat as English; otherwise default to Hinglish
    const detectSimple = (text: string) => {
      const t = text || '';
      const asciiCount = (t.match(/[A-Za-z]/g) || []).length;
      // count all Unicode letters
      let totalLetters = 0;
      try {
        totalLetters = (t.match(/\p{L}/gu) || []).length;
      } catch (e) {
        // fallback if environment doesn't support \p{L}
        totalLetters = t.replace(/[^A-Za-z0-9]/g, '').length;
      }
      const commonEnglish = /\b(the|and|is|you|hello|how|are|i|am|what|why|when)\b/i.test(t);
      if (commonEnglish) return 'en';
      if (asciiCount > 0 && asciiCount / Math.max(1, totalLetters) > 0.6) return 'en';
      return 'hinglish';
    };

    const detectedLang = detectSimple(userText);
    
    setInputMessage('');
    setReplyingTo(null);

    const msgId = addMessage('user', userText, false, currentReply ? {
        id: currentReply.id,
        text: currentReply.text,
        sender: currentReply.sender
    } : undefined);
    
    setTimeout(() => {
        setMessages(prev => prev.map(m => m.id === msgId ? { ...m, isRead: true } : m));
    }, 1500);

    setIsTyping(true);
    setError(null);

    let messageToSend = userText;
    if (currentReply) {
        messageToSend = `[In reply to "${currentReply.text}"]: ${userText}`;
    }

    // Simple language instruction: English if detected, otherwise default to Hinglish
    const langInstruction = detectedLang === 'en' ? 'Reply in English.' : 'Reply in Hinglish (Hindi + casual English mix).';

    const messageWithLang = `${messageToSend}\n\n[LANGUAGE_INSTRUCTION: ${langInstruction}]`;

    try {
      const result = await chatSession.sendMessage({ message: messageWithLang });
      addMessage('model', result.text);
    } catch (err: any) {
      console.error("SendMessage failed", err);
      
      if (isRateLimit(err)) {
          setError("Too many messages (429). Wait 60s.");
      } else {
          setError("Failed to send message.");
      }
      
      setMessages(prev => prev.map(m => m.id === msgId ? { ...m, isError: true } : m));
    } finally {
      setIsTyping(false);
    }
  };

  const handleQuickHeart = () => {
    setInputMessage(prev => prev + "❤️");
  };

  const handleClearHistory = () => {
    setMessages([]);
    storage.clearHistory(persona.id);
    setShowClearConfirm(false);
    setShowSettings(false); 
  };

  const toggleMessageSelection = (messageId: string) => {
    const newSelected = new Set(selectedMessages);
    if (newSelected.has(messageId)) {
      newSelected.delete(messageId);
    } else {
      newSelected.add(messageId);
    }
    setSelectedMessages(newSelected);
    if (newSelected.size === 0) {
      setIsSelectionMode(false);
    }
  };

  const handleDeleteSelected = () => {
    const newMessages = messages.filter(m => !selectedMessages.has(m.id));
    setMessages(newMessages);
    
    // Update storage
    const userMessages = newMessages.filter(m => m.sender === 'user').map(m => ({
      id: m.id,
      sender: m.sender,
      text: m.text,
      mood: m.mood,
      timestamp: m.timestamp.toISOString(),
      isError: m.isError,
      isRead: m.isRead,
      replyTo: m.replyTo
    }));
    storage.saveMessages(persona.id, userMessages);
    
    setSelectedMessages(new Set());
    setIsSelectionMode(false);
  };

  const getBackgroundStyle = () => {
    if (themeMode === 'custom') {
      return { background: `linear-gradient(to bottom, ${customStartColor}, ${customEndColor})` };
    }
    return {};
  };

  const getBackgroundClass = () => {
    if (themeMode === 'custom') return '';
    const theme = THEMES.find(t => t.id === selectedPreset) || THEMES[0];
    return `bg-gradient-to-b ${theme.class}`;
  };

  const handleTouchStart = (e: React.TouchEvent, id: string) => {
    setSwipeState({ 
        id, 
        startX: e.touches[0].clientX, 
        startY: e.touches[0].clientY,
        offset: 0 
    });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!swipeState.id) return;
    const msg = messages.find(m => m.id === swipeState.id);
    if (!msg) return;

    const touch = e.touches[0];
    const diffX = touch.clientX - swipeState.startX;
    const diffY = touch.clientY - swipeState.startY;

    if (Math.abs(diffY) > 30) {
        setSwipeState(prev => ({ ...prev, id: null, offset: 0 }));
        return;
    }

    if (msg.sender === 'model') {
        if (diffX > 0 && diffX < 120) {
            setSwipeState(prev => ({ ...prev, offset: diffX }));
        }
    } 
    else {
        if (diffX < 0 && diffX > -120) {
            setSwipeState(prev => ({ ...prev, offset: diffX }));
        }
    }
  };

  const handleTouchEnd = () => {
    if (swipeState.id) {
        const msg = messages.find(m => m.id === swipeState.id);
        if (msg) {
             const isSwipeRight = msg.sender === 'model' && swipeState.offset > 60;
             const isSwipeLeft = msg.sender === 'user' && swipeState.offset < -60;

             if (isSwipeRight || isSwipeLeft) {
                 setReplyingTo(msg);
                 if (navigator.vibrate) navigator.vibrate(10);
             }
        }
    }
    setSwipeState({ id: null, startX: 0, startY: 0, offset: 0 });
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#FFF0F5] animate-in slide-in-from-bottom duration-500 font-sans">
      
      {/* BACKGROUND */}
      <div 
        className={`absolute inset-0 z-0 pointer-events-none overflow-hidden transition-all duration-700 ease-in-out ${getBackgroundClass()}`}
        style={getBackgroundStyle()}
      >
         <div className="absolute top-[-10%] right-[-20%] w-[350px] h-[350px] bg-[#FF9ACB] rounded-full blur-[100px] opacity-40 animate-pulse" />
         <div className="absolute bottom-[20%] left-[-10%] w-[250px] h-[250px] bg-[#B28DFF] rounded-full blur-[90px] opacity-30" />
         <div className="absolute top-[40%] right-[10%] w-[200px] h-[200px] bg-[#FFB6C1] rounded-full blur-[80px] opacity-20" />
         <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>
      </div>

      {/* TOP NAVIGATION */}
      <div className="relative z-20 flex items-center justify-between px-5 py-4 bg-white/30 backdrop-blur-xl border-b border-white/40 shadow-sm transition-all">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-2 -ml-2 rounded-full hover:bg-white/40 text-[#5e3a58] transition-colors"
          >
            <ArrowLeft size={26} className="drop-shadow-sm opacity-80" />
          </button>
          
          <div className="relative flex items-center gap-3">
            <div className="relative">
                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#FF9ACB] to-[#B28DFF] blur-md opacity-70 animate-pulse"></div>
                <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-sm flex items-center justify-center bg-[#E6E6FA]">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt={persona.name} className="w-full h-full object-cover" />
                  ) : (
                    <User size={24} className="text-[#B28DFF]" />
                  )}
                </div>
                <div className="absolute bottom-0.5 right-0.5 w-3 h-3 bg-[#4ADE80] border-2 border-white rounded-full shadow-[0_0_8px_#4ADE80]"></div>
            </div>

            <div className="flex flex-col justify-center">
              <h3 className="text-[#4A2040] font-serif-display font-medium text-xl leading-tight tracking-wide drop-shadow-sm">
                {persona.name}
              </h3>
              <div className="flex items-center gap-1">
                <span className="text-[#8E6A88] text-[11px] font-medium tracking-wider uppercase opacity-80 min-h-[16px] flex items-center">
                    {isTyping ? (
                    <span className="text-[#B28DFF] animate-pulse font-bold tracking-widest">typing...</span>
                    ) : (
                    "Online"
                    )}
                </span>
                {String(persona.id).startsWith('custom') && (
                    <span title="Mode Locked">
                        <Lock size={10} className="text-[#B28DFF] opacity-60 ml-1" />
                    </span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
            <button 
              onClick={() => setShowSettings(!showSettings)}
              className={`
                p-2.5 rounded-full 
                transition-all duration-300
                ${showSettings ? 'bg-white text-[#B28DFF] shadow-md' : 'bg-white/40 text-[#5e3a58] hover:bg-white/60'}
              `}
            >
              <Palette size={20} />
            </button>

            {isSelectionMode && selectedMessages.size > 0 && (
              <button 
              onClick={handleDeleteSelected}
              className="
                  relative group
                  p-3 rounded-full 
                  bg-red-500/40 border border-red-400/60 
                  text-red-600 
                  shadow-[0_0_15px_rgba(239,68,68,0.4)] 
                  hover:shadow-[0_0_25px_rgba(239,68,68,0.6)]
                  hover:scale-110 active:scale-95
                  transition-all duration-300
              "
              title={`Delete ${selectedMessages.size} message${selectedMessages.size > 1 ? 's' : ''}`}
              >
              <div className="absolute inset-0 rounded-full bg-red-500 opacity-20 blur-md group-hover:opacity-40 transition-opacity"></div>
              <Trash2 size={22} className="relative z-10" />
              </button>
            )}

            <button 
            onClick={onStartCall}
            className="
                relative group
                p-3 rounded-full 
                bg-white/40 border border-white/60 
                text-[#B28DFF] 
                shadow-[0_0_15px_rgba(178,141,255,0.6)] 
                hover:shadow-[0_0_25px_rgba(178,141,255,0.8)]
                hover:scale-110 active:scale-95
                transition-all duration-300
            "
            >
            <div className="absolute inset-0 rounded-full bg-[#B28DFF] opacity-20 blur-md group-hover:opacity-40 transition-opacity"></div>
            <Phone size={22} fill="currentColor" className="relative z-10" />
            </button>
        </div>
      </div>

      {/* THEME SETTINGS */}
      {showSettings && (
        <div className="absolute top-[80px] right-4 z-40 w-[280px] bg-white/90 backdrop-blur-2xl rounded-[24px] shadow-2xl border border-white/60 p-5 animate-in fade-in zoom-in-95 origin-top-right">
          <div className="flex justify-between items-center mb-4">
             <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-[#FF9ACB]" />
                <h3 className="text-[#4A2040] font-serif-display font-bold text-lg">Theme Vibe</h3>
             </div>
             <button onClick={() => setShowSettings(false)} className="p-1 rounded-full hover:bg-black/5 text-[#8e6a88]">
                <X size={16} />
             </button>
          </div>

          <div className="space-y-4">
            <div>
               <p className="text-[10px] text-[#8e6a88] uppercase tracking-wider font-bold mb-2">Presets</p>
               <div className="flex gap-2 justify-between">
                 {THEMES.map(theme => (
                   <button
                     key={theme.id}
                     onClick={() => {
                        setSelectedPreset(theme.id);
                        setThemeMode('preset');
                     }}
                     className={`
                       w-12 h-12 rounded-full border-2 transition-all duration-300 shadow-sm
                       ${themeMode === 'preset' && selectedPreset === theme.id ? 'border-[#B28DFF] scale-110 shadow-md ring-2 ring-[#B28DFF]/20' : 'border-white/50 hover:scale-105'}
                     `}
                     style={{ background: `linear-gradient(to bottom right, ${theme.colors[0]}, ${theme.colors[1]})` }}
                     title={theme.name}
                   />
                 ))}
               </div>
            </div>

            <div className="w-full h-px bg-[#8e6a88]/10" />

            <div>
               <p className="text-[10px] text-[#8e6a88] uppercase tracking-wider font-bold mb-2">Custom Gradient (Hex)</p>
               <div className="flex gap-3">
                 <div className="flex-1 space-y-1">
                    <label className="text-[9px] text-[#5e3a58]/60 ml-1">Start Color</label>
                    <div className="flex items-center gap-2 bg-white/60 border border-white/60 rounded-xl p-1.5 focus-within:border-[#B28DFF]/50 transition-colors">
                        <input 
                           type="color" 
                           value={customStartColor}
                           onChange={(e) => {
                             setCustomStartColor(e.target.value);
                             setThemeMode('custom');
                           }}
                           className="w-6 h-6 rounded-full overflow-hidden border-0 p-0 cursor-pointer"
                        />
                        <input 
                           type="text"
                           value={customStartColor}
                           onChange={(e) => {
                             setCustomStartColor(e.target.value);
                             setThemeMode('custom');
                           }}
                           className="w-full bg-transparent text-[11px] font-mono text-[#5e3a58] outline-none uppercase"
                        />
                    </div>
                 </div>
                 <div className="flex-1 space-y-1">
                    <label className="text-[9px] text-[#5e3a58]/60 ml-1">End Color</label>
                    <div className="flex items-center gap-2 bg-white/60 border border-white/60 rounded-xl p-1.5 focus-within:border-[#B28DFF]/50 transition-colors">
                        <input 
                           type="color" 
                           value={customEndColor}
                           onChange={(e) => {
                             setCustomEndColor(e.target.value);
                             setThemeMode('custom');
                           }}
                           className="w-6 h-6 rounded-full overflow-hidden border-0 p-0 cursor-pointer"
                        />
                         <input 
                           type="text"
                           value={customEndColor}
                           onChange={(e) => {
                             setCustomEndColor(e.target.value);
                             setThemeMode('custom');
                           }}
                           className="w-full bg-transparent text-[11px] font-mono text-[#5e3a58] outline-none uppercase"
                        />
                    </div>
                 </div>
               </div>
            </div>
            
            <div className="w-full h-px bg-[#8e6a88]/10" />
            
            <button 
                onClick={() => {
                    setShowSettings(false);
                    setShowClearConfirm(true);
                }}
                className="w-full py-2.5 rounded-xl bg-red-50 text-red-500 font-medium text-xs tracking-wide hover:bg-red-100 transition-colors flex items-center justify-center gap-2 group"
            >
                <Trash2 size={14} className="group-hover:scale-110 transition-transform" /> 
                Clear Conversation
            </button>
          </div>
        </div>
      )}

      {/* CLEAR CONFIRM */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in">
            <div className="w-[85%] max-w-[300px] bg-white rounded-[24px] p-6 text-center shadow-2xl animate-in zoom-in-95 border border-white/60">
                <div className="w-12 h-12 rounded-full bg-red-100 text-red-500 flex items-center justify-center mx-auto mb-4 border border-red-200">
                    <Trash2 size={24} />
                </div>
                <h3 className="text-[#4A2040] font-serif-display font-bold text-lg mb-2">Clear History?</h3>
                <p className="text-[#8e6a88] text-xs leading-relaxed mb-6 font-medium">
                    This will delete all messages in this conversation. This action cannot be undone.
                </p>
                <div className="flex gap-3">
                    <button 
                        onClick={() => setShowClearConfirm(false)}
                        className="flex-1 py-2.5 rounded-xl bg-gray-100 text-[#5e3a58] text-xs font-bold hover:bg-gray-200 transition-colors"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleClearHistory}
                        className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-xs font-bold shadow-lg shadow-red-200 hover:bg-red-600 transition-colors"
                    >
                        Clear
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* CHAT MESSAGES */}
      <div 
        ref={scrollRef}
        className="relative z-10 flex-1 overflow-y-auto px-4 py-6 space-y-6 scroll-smooth overflow-x-hidden"
      >
        <div className="text-center mb-8">
           <span className="px-4 py-1.5 rounded-full bg-white/30 border border-white/40 text-[#6D4C63] text-[10px] font-bold tracking-widest backdrop-blur-md shadow-sm uppercase">
             Today
           </span>
        </div>

        {error && (
            <div className="flex justify-center my-4 animate-in fade-in">
                <button 
                  onClick={initSession}
                  className="flex items-center gap-2 px-4 py-2 bg-red-50/90 backdrop-blur-md text-red-600 rounded-full border border-red-200 shadow-sm text-sm hover:bg-red-100 transition-colors"
                >
                    <AlertCircle size={16} />
                    <span>{error}</span>
                    <RefreshCw size={12} className="ml-1" />
                </button>
            </div>
        )}

        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`relative flex flex-col touch-pan-y gap-2 ${msg.sender === 'user' ? 'items-end' : 'items-start'} ${isSelectionMode ? 'cursor-pointer' : ''}`}
            onTouchStart={(e) => handleTouchStart(e, msg.id)}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onLongPress={() => {
              if (!isSelectionMode) {
                setIsSelectionMode(true);
                toggleMessageSelection(msg.id);
              }
            }}
            onClick={() => {
              if (isSelectionMode) {
                toggleMessageSelection(msg.id);
              }
            }}
          >
            {/* Reply Indicators */}
            <div 
               className="absolute top-1/2 -translate-y-1/2 left-0 z-0 transition-all duration-200"
               style={{ 
                 opacity: swipeState.id === msg.id && msg.sender === 'model' && swipeState.offset > 40 ? 1 : 0,
                 transform: `translateX(${swipeState.id === msg.id && swipeState.offset > 40 ? 10 : 0}px) scale(${swipeState.id === msg.id && swipeState.offset > 40 ? 1 : 0.8})`
               }}
            >
                <div className="p-2 rounded-full bg-white/50 backdrop-blur-sm shadow-sm text-[#B28DFF]"><Reply size={18} /></div>
            </div>
            <div 
               className="absolute top-1/2 -translate-y-1/2 right-0 z-0 transition-all duration-200"
               style={{ 
                 opacity: swipeState.id === msg.id && msg.sender === 'user' && swipeState.offset < -40 ? 1 : 0,
                 transform: `translateX(${swipeState.id === msg.id && swipeState.offset < -40 ? -10 : 0}px) scale(${swipeState.id === msg.id && swipeState.offset < -40 ? 1 : 0.8}) rotateY(180deg)`
               }}
            >
                <div className="p-2 rounded-full bg-white/50 backdrop-blur-sm shadow-sm text-[#B28DFF]"><Reply size={18} /></div>
            </div>

            <div 
                className="relative z-10 flex flex-col max-w-[78%] transition-transform duration-200 ease-out will-change-transform"
                style={{ 
                    transform: swipeState.id === msg.id ? `translateX(${swipeState.offset}px)` : 'translateX(0)',
                    alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start'
                }}
            >
                {isSelectionMode && (
                  <div className="mb-2 flex items-center justify-center">
                    <input 
                      type="checkbox" 
                      checked={selectedMessages.has(msg.id)}
                      onChange={() => toggleMessageSelection(msg.id)}
                      className="w-5 h-5 cursor-pointer rounded border-2 border-[#B28DFF] accent-[#B28DFF]"
                    />
                  </div>
                )}

                {msg.mood && msg.sender === 'model' && !msg.isError && (
                <span className="mb-1.5 ml-3 px-2 py-0.5 rounded-md bg-[#E6E6FA]/90 text-[9px] font-bold text-[#9F7AEA] uppercase tracking-wider border border-[#B28DFF]/20 shadow-sm transform -translate-y-1">
                    {msg.mood}
                </span>
                )}

                <div 
                className={`
                    w-full px-5 py-3.5 text-[15px] leading-relaxed relative
                    shadow-sm
                    ${msg.isError ? 'bg-red-50 text-red-600 border border-red-200' : 
                    msg.sender === 'user' 
                    ? 'bg-gradient-to-br from-[#FF9ACB] to-[#FFB6C1] text-white rounded-[20px] rounded-br-[4px] shadow-[0_8px_20px_-5px_rgba(255,154,203,0.6)] border border-white/20' 
                    : 'bg-white/80 backdrop-blur-md text-[#4A2040] rounded-[20px] rounded-bl-[4px] shadow-[0_2px_10px_rgba(178,141,255,0.2)] border border-white/60'
                    }
                `}
                >
                {msg.replyTo && (
                    <div className={`
                        mb-2 p-2 rounded-[8px] border-l-2 text-xs flex flex-col gap-0.5
                        ${msg.sender === 'user' ? 'bg-white/20 border-white/60 text-white/90' : 'bg-[#F3E8FF] border-[#B28DFF] text-[#5e3a58]/80'}
                    `}>
                        <span className="font-bold opacity-80">{msg.replyTo.sender === 'user' ? 'You' : persona.name}</span>
                        <span className="line-clamp-1 opacity-90 italic">{msg.replyTo.text}</span>
                    </div>
                )}
                
                {msg.text}
                </div>
                
                <div className={`flex items-center gap-1 mt-1.5 ${msg.sender === 'user' ? 'mr-1 flex-row-reverse' : 'ml-2 flex-row'}`}>
                <span className="text-[10px] text-[#8e6a88]/60 font-medium">
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                {msg.sender === 'user' && !msg.isError && (
                    msg.isRead ? (
                    <CheckCheck size={14} className="text-[#B28DFF] animate-in zoom-in duration-300" />
                    ) : (
                    <Check size={14} className="text-[#8e6a88]/40" />
                    )
                )}
                </div>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex items-start pl-2 animate-in fade-in duration-300">
            <div className="px-4 py-3 bg-white/60 backdrop-blur-md rounded-[20px] rounded-bl-[4px] border border-white/40 shadow-sm">
              <div className="flex gap-1.5">
                <div className="w-1.5 h-1.5 bg-[#B28DFF] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-1.5 h-1.5 bg-[#FF9ACB] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-1.5 h-1.5 bg-[#FFB6C1] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* REPLY PREVIEW */}
      {replyingTo && (
        <div className="relative z-20 px-4 py-2 bg-white/60 backdrop-blur-xl border-t border-white/40 flex items-center justify-between animate-in slide-in-from-bottom-4 duration-300">
            <div className="flex flex-col border-l-4 border-[#B28DFF] pl-3 py-1 flex-1 mr-4">
                <span className="text-[10px] font-bold text-[#B28DFF] uppercase tracking-wide">
                    Replying to {replyingTo.sender === 'user' ? 'You' : persona.name}
                </span>
                <span className="text-xs text-[#5e3a58] line-clamp-1 opacity-80">
                    {replyingTo.text}
                </span>
            </div>
            <button onClick={() => setReplyingTo(null)} className="p-1.5 rounded-full bg-white/40 hover:bg-white/60 text-[#5e3a58] transition-colors">
                <X size={16} />
            </button>
        </div>
      )}

      {/* BOTTOM INPUT */}
      <div className={`relative z-20 px-4 py-4 pb-8 bg-white/30 backdrop-blur-xl ${!replyingTo ? 'border-t border-white/40' : ''}`}>
        <div className="flex items-center gap-3 max-w-md mx-auto">
           <button className="p-3 rounded-full bg-white/40 border border-white/50 text-[#8e6a88] hover:bg-white/60 hover:text-[#5e3a58] transition-all shadow-sm active:scale-95">
              <Mic size={22} />
           </button>

           <div className="flex-1 relative group">
             <div className="absolute inset-0 bg-gradient-to-r from-[#FF9ACB] to-[#B28DFF] rounded-full blur opacity-10 group-focus-within:opacity-30 transition-opacity duration-500"></div>
             <input 
               type="text" 
               value={inputMessage}
               onChange={(e) => setInputMessage(e.target.value)}
               onKeyDown={(e) => e.key === 'Enter' && handleSend()}
               placeholder="Type something..."
               className="relative z-10 w-full pl-5 pr-12 py-3.5 rounded-full bg-white/60 backdrop-blur-xl border border-white/60 text-[#5e3a58] placeholder-[#8e6a88]/60 font-medium focus:outline-none focus:bg-white/80 focus:border-[#FF9ACB]/50 transition-all shadow-inner"
             />
             <button onClick={handleQuickHeart} className="absolute z-20 right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full hover:bg-[#FFE6F4] text-[#FF5D8F] transition-colors active:scale-90">
               <Heart size={20} fill="currentColor" />
             </button>
           </div>

           <button 
             onClick={handleSend}
             disabled={!inputMessage.trim() && !isTyping}
             className={`p-3.5 rounded-full bg-gradient-to-r from-[#FF9ACB] to-[#FFB6C1] text-white shadow-[0_4px_15px_rgba(255,154,203,0.5)] border border-white/20 transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none`}
           >
             <Send size={20} fill="currentColor" className="ml-0.5" />
           </button>
        </div>
      </div>

    </div>
  );
};

export default ChatScreen;
