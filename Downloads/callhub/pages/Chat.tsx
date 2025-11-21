import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Send, Mic, Image as ImageIcon, MoreVertical, Lock, Zap } from 'lucide-react';
import { CHARACTERS, MOCK_USER } from '../services/mockDatabase';
import { generateChatResponse } from '../services/geminiService';
import { ChatMessage } from '../types';

const Chat: React.FC = () => {
  const { characterId } = useParams<{ characterId: string }>();
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);

  const character = CHARACTERS.find(c => c.id === characterId);
  
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [msgCount, setMsgCount] = useState(0);
  const [showPaywall, setShowPaywall] = useState(false);
  const [background, setBackground] = useState('bg-dark-bg');

  // Redirect if invalid char
  useEffect(() => {
    if (!character) navigate('/characters');
    else {
      // Initial greeting if empty
      if (messages.length === 0) {
         setMessages([{
           id: 'init',
           role: 'model',
           text: `Hey there! I'm ${character.name}. ${character.tagline}. What's on your mind?`,
           timestamp: Date.now(),
           mood: 'happy'
         }]);
      }
    }
  }, [character, navigate, messages.length]);

  // Auto scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim() || !character) return;

    // Paywall logic (Mock limit 10)
    if (MOCK_USER.plan === 'free' && msgCount >= 10) {
      setShowPaywall(true);
      return;
    }

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setMsgCount(prev => prev + 1);
    setIsTyping(true);

    // Call AI with updated messages array including the new user message
    const updatedMessages = [...messages, userMsg];
    const response = await generateChatResponse(character, updatedMessages, input, MOCK_USER.plan);
    
    setIsTyping(false);
    const aiMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'model',
      text: response.text,
      timestamp: Date.now(),
      mood: response.mood
    };
    setMessages(prev => [...prev, aiMsg]);
  };

  const backgrounds: {[key: string]: string} = {
    default: 'bg-dark-bg',
    rain: 'bg-[url("https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80")] bg-cover bg-center',
    cafe: 'bg-[url("https://images.unsplash.com/photo-1509042239860-f550ce710b93?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80")] bg-cover bg-center',
    neon: 'bg-[url("https://images.unsplash.com/photo-1550751827-4bd374c3f58b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80")] bg-cover bg-center'
  };

  if (!character) return null;

  return (
    <div className={`flex flex-col h-[calc(100vh-8rem)] md:h-[85vh] max-w-2xl mx-auto rounded-2xl overflow-hidden border border-dark-border relative ${backgrounds['default']}`}>
      
      {/* Background Overlay */}
      <div className={`absolute inset-0 transition-all duration-700 opacity-20 ${background}`}></div>

      {/* Chat Header */}
      <div className="relative z-10 p-4 glass-panel flex items-center justify-between border-b border-dark-border">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img src={character.avatarUrl} alt="avatar" className="w-10 h-10 rounded-full object-cover ring-2 ring-neon-pink" />
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-black animate-pulse"></div>
          </div>
          <div>
             <h3 className="font-bold text-white">{character.name}</h3>
             <div className="flex items-center gap-1">
                <span className="text-[10px] px-1.5 py-0.5 bg-neon-purple/20 text-neon-purple rounded border border-neon-purple/30 capitalize">{character.personality}</span>
                {isTyping && <span className="text-xs text-gray-400 animate-pulse">typing...</span>}
             </div>
          </div>
        </div>
        <div className="flex gap-2 text-gray-400">
           <button onClick={() => navigate('/voice')} className="p-2 hover:text-neon-blue transition"><Mic size={20}/></button>
           <button className="p-2 hover:text-neon-pink transition"><MoreVertical size={20}/></button>
        </div>
      </div>

      {/* Soundscape Toggles (Floating) */}
      <div className="absolute top-20 right-4 z-20 flex flex-col gap-2">
         {['rain', 'cafe', 'neon'].map((bg) => (
            <button 
              key={bg}
              onClick={() => setBackground(backgrounds[bg])} 
              className="w-8 h-8 rounded-full glass-panel flex items-center justify-center text-xs hover:bg-neon-blue/20 transition border border-white/10"
              title={bg}
            >
              {bg[0].toUpperCase()}
            </button>
         ))}
      </div>

      {/* Chat Area */}
      <div className="relative z-10 flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
             {msg.role === 'model' && (
               <img src={character.avatarUrl} className="w-8 h-8 rounded-full mr-2 mt-2 self-end hidden sm:block" alt="char" />
             )}
             <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed animate-in fade-in slide-in-from-bottom-2 duration-300 ${
               msg.role === 'user' 
                 ? 'bg-neon-pink text-white rounded-br-none shadow-[0_0_15px_rgba(255,0,255,0.3)]' 
                 : 'bg-dark-card border border-dark-border text-gray-200 rounded-bl-none'
             }`}>
               {msg.role === 'model' && msg.mood && msg.mood !== 'neutral' && (
                  <span className="block text-xs font-bold opacity-70 mb-1 capitalize text-neon-blue">*{msg.mood}*</span>
               )}
               {msg.text}
               <span className="text-[10px] opacity-50 block text-right mt-1">
                 {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
               </span>
             </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
             <div className="bg-dark-card border border-dark-border rounded-2xl rounded-bl-none px-4 py-3 flex gap-1">
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-75"></div>
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-150"></div>
             </div>
          </div>
        )}
        <div ref={scrollRef}></div>
      </div>

      {/* Input Area */}
      <div className="relative z-10 p-3 glass-panel border-t border-dark-border">
         <div className="flex gap-2 items-center">
            <button className="p-2 text-gray-400 hover:text-neon-blue"><ImageIcon size={20}/></button>
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Message..."
              className="flex-1 bg-black/50 border border-white/10 rounded-full px-4 py-2 text-white focus:outline-none focus:border-neon-pink focus:ring-1 focus:ring-neon-pink transition"
            />
            <button 
              onClick={handleSend}
              disabled={!input.trim()}
              className="p-2 bg-neon-pink rounded-full text-white hover:bg-neon-pink/80 disabled:opacity-50 transition shadow-[0_0_10px_rgba(255,0,255,0.5)]"
            >
              <Send size={18} />
            </button>
         </div>
      </div>

      {/* Paywall Modal */}
      {showPaywall && (
        <div className="absolute inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-6">
           <div className="bg-dark-card border border-neon-pink/50 p-6 rounded-2xl text-center max-w-sm shadow-[0_0_30px_rgba(255,0,255,0.2)]">
              <Lock className="mx-auto text-neon-pink mb-4" size={48} />
              <h2 className="text-2xl font-bold mb-2">Things are getting spicy...</h2>
              <p className="text-gray-400 mb-6">You've reached the daily free limit. Unlock unlimited intimate chats and voice calls now.</p>
              <button 
                onClick={() => navigate('/subscribe')}
                className="w-full py-3 bg-gradient-to-r from-neon-pink to-neon-purple rounded-lg font-bold text-white mb-3 flex items-center justify-center gap-2"
              >
                <Zap size={18} className="fill-white"/> Upgrade to Pro
              </button>
              <button onClick={() => setShowPaywall(false)} className="text-sm text-gray-500 hover:text-white">Not now</button>
           </div>
        </div>
      )}

    </div>
  );
};

export default Chat;