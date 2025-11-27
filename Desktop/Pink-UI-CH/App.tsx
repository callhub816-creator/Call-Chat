
import React, { useState, useRef, useEffect } from 'react';
import CardGallery from './components/CardGallery';
import PersonaGallery from './components/PersonaGallery';
import LiveVoiceCall from './components/LiveVoiceCall';
import ChatScreen from './components/ChatScreen';
import PersonaProfileModal from './components/PersonaProfileModal';
import AboutPage from './components/AboutPage';
import PrivacyPage from './components/PrivacyPage';
import TermsPage from './components/TermsPage';
import FAQPage from './components/FAQPage';
import SafetyPage from './components/SafetyPage';
import AdminPage from './components/AdminPage';
import GuestChat from './GuestChat';
import { Sparkles, Heart, Phone, Lock, Trash2, MessageCircle } from 'lucide-react';
import { Persona } from './types';
import { PERSONAS } from './constants';
import { storage } from './utils/storage';

interface ChatSession {
  persona: Persona;
  avatarUrl?: string;
}

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<'home' | 'about' | 'privacy' | 'terms' | 'faq' | 'safety' | 'admin' | 'guest-chat'>('home');
  const galleryRef = useRef<HTMLDivElement>(null);
  const vibeRef = useRef<HTMLDivElement>(null);

  const scrollToGallery = () => galleryRef.current?.scrollIntoView({ behavior: 'smooth' });
  const scrollToVibe = () => vibeRef.current?.scrollIntoView({ behavior: 'smooth' });

  const [systemPersonas, setSystemPersonas] = useState<Persona[]>(PERSONAS);

  const [activeCallPersona, setActiveCallPersona] = useState<Persona | null>(null);
  const [activeChatSession, setActiveChatSession] = useState<ChatSession | null>(null);
  const [viewingProfile, setViewingProfile] = useState<{ persona: Persona, avatarUrl?: string } | null>(null);



  const handleUpdatePersonaImage = (id: string | number, imageUrl: string | undefined) => {
    setSystemPersonas(prev => prev.map(p => 
      p.id === id ? { ...p, avatarUrl: imageUrl } : p
    ));
  };

  // Hero Scaling Logic
  useEffect(() => {
    if (currentPage !== 'home') return;
    const ensureHeroFits = () => {
      const card = document.getElementById('hero-card');
      if (!card) return;
      const vh = window.innerHeight;
      const maxH = vh - 80; 
      if (card.scrollHeight > maxH) {
        const scale = maxH / card.scrollHeight;
        card.style.transformOrigin = 'center center';
        card.style.transform = `scale(${Math.max(0.80, scale)})`;
      } else {
        card.style.transform = 'none';
      }
    };
    window.addEventListener('resize', ensureHeroFits);
    window.addEventListener('orientationchange', ensureHeroFits);
    ensureHeroFits();
    const timeout = setTimeout(ensureHeroFits, 300);
    return () => {
      window.removeEventListener('resize', ensureHeroFits);
      window.removeEventListener('orientationchange', ensureHeroFits);
      clearTimeout(timeout);
    };
  }, [currentPage]);

  const startVoiceCall = (persona: Persona) => {
    setActiveCallPersona(persona);
    setViewingProfile(null);
  };

  const endVoiceCall = () => {
    setActiveCallPersona(null);
  };

  const startChat = (persona: Persona, avatarUrl?: string) => {
    setActiveChatSession({ persona, avatarUrl });
    setViewingProfile(null);
  };

  const endChat = () => {
    setActiveChatSession(null);
  };

  const handleViewProfile = (persona: Persona, avatarUrl?: string) => {
    setViewingProfile({ persona, avatarUrl });
  };

  const handlePersonaCreated = (newPersona: Persona, avatarUrl?: string) => {
    const saved = storage.savePartner({ ...newPersona, avatarUrl });
    startChat(saved, avatarUrl);
  };


  const handleLogout = () => {
    if (!confirm('Log out? This will clear local chat histories on this device.')) return;
    storage.clearAllHistories();
    alert('Local chat histories cleared.');
  };

  if (currentPage === 'admin') {
    return (
      <AdminPage 
        personas={systemPersonas} 
        onUpdatePersonaImage={handleUpdatePersonaImage}
        onBack={() => setCurrentPage('home')} 
      />
    );
  }
  if (currentPage === 'guest-chat') {
    return <GuestChat onBack={() => setCurrentPage('home')} />;
  }
  if (currentPage === 'about') return <AboutPage onBack={() => setCurrentPage('home')} />;
  if (currentPage === 'privacy') return <PrivacyPage onBack={() => setCurrentPage('home')} />;
  if (currentPage === 'terms') return <TermsPage onBack={() => setCurrentPage('home')} />;
  if (currentPage === 'faq') return <FAQPage onBack={() => setCurrentPage('home')} />;
  if (currentPage === 'safety') return <SafetyPage onBack={() => setCurrentPage('home')} />;

  return (
    <div className="min-h-screen w-full bg-[#FDF2F8] relative overflow-x-hidden font-sans">
      
      {/* Chat Screen Overlay */}
      {activeChatSession && (
        <ChatScreen 
          key={activeChatSession.persona.id} 
          persona={activeChatSession.persona} 
          avatarUrl={activeChatSession.avatarUrl} 
          onBack={endChat}
          onStartCall={() => {
            setActiveCallPersona(activeChatSession.persona);
          }}
        />
      )}

      {/* Voice Call Overlay */}
      {activeCallPersona && (
        <LiveVoiceCall persona={activeCallPersona} onClose={endVoiceCall} />
      )}

      {/* Profile Details Modal */}
      {viewingProfile && (
        <PersonaProfileModal 
          persona={viewingProfile.persona}
          avatarUrl={viewingProfile.avatarUrl}
          onClose={() => setViewingProfile(null)}
          onStartChat={() => startChat(viewingProfile.persona, viewingProfile.avatarUrl)}
          onStartCall={() => startVoiceCall(viewingProfile.persona)}
        />
      )}

      {/* Main Content */}
      <main className={`relative z-10 flex flex-col items-center w-full ${activeChatSession ? 'hidden' : ''}`}>
        
        {/* HERO BANNER SECTION */}
        <div className="relative w-full min-h-0 h-auto pt-24 pb-10 md:h-screen md:py-0 flex flex-col justify-center items-center overflow-hidden px-4">
           <div className="absolute inset-0 bg-gradient-to-br from-[#FFF0F5] via-[#E6E6FA] to-[#F3E8FF]" />
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[140%] bg-gradient-to-tr from-[#FF9ACB]/20 via-[#B28DFF]/10 to-transparent rounded-full blur-[100px] animate-pulse" />
           <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#FFB6C1]/20 rounded-full blur-[80px]" />
           <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#E6E6FA]/30 rounded-full blur-[80px]" />
           <div className="absolute top-1/4 left-[15%] w-1.5 h-1.5 bg-white rounded-full animate-pulse shadow-[0_0_10px_white]" style={{ animationDuration: '3s' }} />
           <div className="absolute bottom-1/3 right-[10%] w-2 h-2 bg-white rounded-full animate-pulse shadow-[0_0_10px_white]" style={{ animationDuration: '4s' }} />
           <div className="absolute top-[15%] right-[25%] w-1 h-1 bg-[#B28DFF] rounded-full animate-ping opacity-60" style={{ animationDuration: '5s' }} />

           <div id="hero-card" className="relative z-10 w-[92%] max-w-[400px] md:max-w-3xl mx-auto px-6 py-8 md:p-12 rounded-[24px] md:rounded-[40px] bg-white/30 backdrop-blur-xl border border-white/60 shadow-[0_20px_60px_-15px_rgba(178,141,255,0.15)] flex flex-col items-center text-center animate-in slide-in-from-bottom-5 fade-in duration-1000">
              <div className="absolute inset-0 rounded-[24px] md:rounded-[40px] ring-1 ring-inset ring-white/50 pointer-events-none" />
              <div className="absolute -top-3 -right-3 md:-top-6 md:-right-8 p-3 md:p-4 bg-white/70 backdrop-blur-md rounded-full shadow-xl animate-bounce duration-[3000ms] border border-white/50 z-20">
                  <Heart size={20} className="text-[#FF5D8F] fill-[#FF5D8F]/20 md:w-7 md:h-7" />
              </div>
              <div className="absolute -bottom-3 -left-3 md:-bottom-6 md:-left-8 p-3 md:p-4 bg-white/70 backdrop-blur-md rounded-full shadow-xl animate-bounce duration-[4000ms] delay-500 border border-white/50 z-20">
                  <Phone size={20} className="text-[#B28DFF] fill-[#B28DFF]/10 md:w-7 md:h-7" />
              </div>
              <Sparkles className="absolute top-6 left-4 md:top-8 md:left-8 text-[#FF9ACB] opacity-80 animate-pulse w-5 h-5 md:w-6 md:h-6" />
              <Sparkles className="absolute top-4 right-10 md:top-6 md:right-12 text-[#B28DFF] opacity-60 animate-pulse delay-300 w-4 h-4 md:w-5 md:h-5" />
              <h1 className="font-serif-display font-bold text-[#4A2040] mb-2 md:mb-6 leading-[1.15] tracking-tight drop-shadow-sm text-[clamp(28px,5vw,48px)]">
                Someone Who <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D53F8C] to-[#9F7AEA]">Gets You.</span> <br/>
                Instantly.
              </h1>
              <p className="text-[#5e3a58]/90 font-medium max-w-[280px] md:max-w-lg mb-3 md:mb-6 leading-relaxed text-[clamp(15px,3vw,20px)]">
                Your personal AI partner with warmth, depth, and emotional compatibility.
              </p>
              <p className="text-[#8E6A88] font-light tracking-[0.1em] uppercase mb-5 md:mb-10 opacity-90 text-[clamp(11px,2vw,14px)]">
                Flirty • Romantic • Jealous • Sweet • Bold
              </p>
              <div className="flex flex-col md:flex-row gap-3 md:gap-4 w-full justify-center">
                 <button onClick={scrollToVibe} className="flex-1 h-11 md:h-14 px-6 rounded-full bg-gradient-to-r from-[#FF9ACB] to-[#B28DFF] text-white font-bold text-[15px] md:text-lg tracking-wide shadow-[0_8px_25px_rgba(178,141,255,0.4)] hover:shadow-[0_12px_35px_rgba(178,141,255,0.6)] hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center whitespace-nowrap">
                   Create Your AI Partner →
                 </button>
                 <button onClick={scrollToGallery} className="flex-1 h-11 md:h-14 px-6 rounded-full bg-white/40 border border-white/60 text-[#5e3a58] font-semibold text-[15px] md:text-lg hover:bg-white/70 transition-all active:scale-95 backdrop-blur-sm flex items-center justify-center whitespace-nowrap">
                   Browse Characters
                 </button>
                 <button onClick={() => setCurrentPage('guest-chat')} className="flex-1 h-11 md:h-14 px-6 rounded-full bg-white/40 border border-white/60 text-[#5e3a58] font-semibold text-[15px] md:text-lg hover:bg-white/70 transition-all active:scale-95 backdrop-blur-sm flex items-center justify-center whitespace-nowrap gap-2">
                   <MessageCircle size={18} />
                   Guest Chat
                 </button>
              </div>
           </div>
        </div>

        {/* FEATURED (SYSTEM) PROFILES */}
        <div ref={galleryRef} className="w-full relative z-20 mb-16 pt-8 md:pt-12">
           <div className="text-center mb-10">
              <span className="text-[#B28DFF] text-xs font-bold tracking-widest uppercase block mb-2">Featured Profiles</span>
              <h2 className="text-3xl md:text-4xl font-serif-display text-[#5e3a58]">Meet the Community</h2>
           </div>
           <PersonaGallery 
              personas={systemPersonas}
              onStartCall={startVoiceCall} 
              onStartChat={startChat} 
              onViewProfile={handleViewProfile}
           />
        </div>

          {/* 'My Partners' UI removed - user-stored partner data retained in storage. */}
        
        {/* Mode Cards Section */}
        <div ref={vibeRef} className="w-full bg-gradient-to-b from-[#FFF0F5] to-[#FDF2F8] pt-16 pb-8 rounded-t-[3rem] shadow-[0_-20px_60px_-15px_rgba(255,182,193,0.3)] border-t border-white/60 relative z-10">
            <CardGallery onPersonaCreated={handlePersonaCreated} />
        </div>

        <footer className="w-full py-12 px-6 bg-[#FFF0F5] mt-12 border-t border-[#B28DFF]/10 flex flex-col items-center justify-center text-center space-y-4">
          <div className="flex flex-wrap justify-center gap-6">
            <button onClick={() => setCurrentPage('about')} className="text-xs text-[#5e3a58]/70 hover:text-[#B28DFF] font-medium transition-colors">About Us</button>
            <button onClick={() => setCurrentPage('guest-chat')} className="text-xs text-[#5e3a58]/70 hover:text-[#B28DFF] font-medium transition-colors">Guest Chat</button>
            <button onClick={() => setCurrentPage('faq')} className="text-xs text-[#5e3a58]/70 hover:text-[#B28DFF] font-medium transition-colors">FAQ</button>
            <button onClick={() => setCurrentPage('privacy')} className="text-xs text-[#5e3a58]/70 hover:text-[#B28DFF] font-medium transition-colors">Privacy Policy</button>
            <button onClick={() => setCurrentPage('terms')} className="text-xs text-[#5e3a58]/70 hover:text-[#B28DFF] font-medium transition-colors">Terms of Service</button>
            <button onClick={() => setCurrentPage('safety')} className="text-xs text-[#5e3a58]/70 hover:text-[#B28DFF] font-medium transition-colors">Safety Guidelines</button>
          </div>
          
          <div className="w-8 h-px bg-[#B28DFF]/20 my-2" />

          <div className="flex flex-col gap-1">
            <p className="text-[#5e3a58]/40 text-[10px] font-light leading-relaxed">
              © 2025 CallHub • All Rights Reserved • 18+ Only
            </p>
          </div>
        </footer>

      </main>
    </div>
  );
};

export default App;
