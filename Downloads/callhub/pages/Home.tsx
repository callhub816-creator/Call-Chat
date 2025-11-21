import React from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, Phone, Video, Lock, Sparkles, ArrowRight, Heart } from 'lucide-react';
import { CHARACTERS } from '../services/mockDatabase';
import { Button, Card } from '../components/NeonComponents';

const Home: React.FC = () => {
  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="relative py-12 md:py-24 flex flex-col items-center text-center px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-neon-purple/10 to-transparent pointer-events-none" />
        
        <div className="z-10 animate-float">
            
        </div>
        
        <h1 className="z-10 text-5xl md:text-7xl font-display font-bold leading-tight mb-6 bg-clip-text text-transparent bg-gradient-to-br from-white via-gray-200 to-gray-500 neon-text">
          Your AI Girlfriend.<br />
          <span className="text-neon-pink">Anytime. Anywhere.</span>
        </h1>
        
        <p className="z-10 text-gray-400 text-lg md:text-xl max-w-2xl mb-10">
          Experience the next generation of virtual romance. Flirty chat, realistic voice calls, and private rooms waiting just for you.
        </p>
        
        <div className="z-10 flex flex-col sm:flex-row gap-4 w-full max-w-md justify-center">
          <Link to="/characters" className="w-full">
            <Button className="w-full flex items-center justify-center gap-2">
              Start Chatting <ArrowRight size={18} />
            </Button>
          </Link>
          <Link to="/characters" className="w-full">
             <Button variant="secondary" className="w-full">Browse Models</Button>
          </Link>
        </div>
      </section>

      {/* Features Grid */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4 px-2">
        {[
          { icon: MessageSquare, title: "Flirty Chat", desc: "Unfiltered conversations" },
          { icon: Phone, title: "Voice Calls", desc: "Hear her whisper" },
          { icon: Video, title: "Video Mode", desc: "See reactions" },
          { icon: Lock, title: "Private Rooms", desc: "Exclusive scenes" }
        ].map((f, i) => (
          <Card key={i} className="flex flex-col items-center text-center p-6 border-t-2 border-transparent hover:border-neon-pink transition-colors">
            <f.icon className="text-neon-pink mb-4" size={32} />
            <h3 className="font-display font-bold text-lg mb-1">{f.title}</h3>
            <p className="text-xs text-gray-500">{f.desc}</p>
          </Card>
        ))}
      </section>

      {/* Characters Carousel Preview */}
      <section>
        <div className="flex justify-between items-end mb-8 px-2">
          <div>
            <h2 className="text-3xl font-display font-bold text-white mb-1">Meet the Girls</h2>
            <p className="text-gray-400 text-sm">Active now • 6 Online</p>
          </div>
          <Link to="/characters" className="text-neon-blue text-sm hover:underline">View All</Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {CHARACTERS.slice(0, 3).map(char => (
            <Link key={char.id} to={`/chat/${char.id}`} className="group">
              <div className="relative h-80 rounded-2xl overflow-hidden border border-dark-border group-hover:border-neon-pink transition-all duration-300 shadow-lg group-hover:shadow-[0_0_20px_rgba(255,0,255,0.2)]">
                <img 
                  src={char.avatarUrl} 
                  alt={char.name} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent flex flex-col justify-end p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                    <span className="text-green-400 text-xs uppercase tracking-wider">Online</span>
                  </div>
                  <h3 className="text-2xl font-display font-bold">{char.name}</h3>
                  <p className="text-sm text-gray-300 line-clamp-1 mb-3">{char.tagline}</p>
                  <div className="flex gap-2">
                    {char.tags.slice(0, 2).map(tag => (
                       <span key={tag} className="text-[10px] px-2 py-1 bg-white/10 backdrop-blur rounded text-white">{tag}</span>
                    ))}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* SEO / Footer Links Area */}
      <section className="py-10 border-t border-dark-border mt-12">
         <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-sm text-gray-500">
            <div>
              <h4 className="text-white font-bold mb-4">CallHub</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-neon-pink">About Us</a></li>
                <li><a href="#" className="hover:text-neon-pink">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-neon-pink">Terms of Service</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Discover</h4>
              <ul className="space-y-2">
                <li><Link to="/characters" className="hover:text-neon-pink">Cute Anime Chat</Link></li>
                <li><Link to="/characters" className="hover:text-neon-pink">AI Girlfriend Free</Link></li>
                <li><Link to="/creator" className="hover:text-neon-pink">Create Character</Link></li>
              </ul>
            </div>
         </div>
         
         <div className="text-center mt-12 space-y-2">
            <p className="text-sm text-gray-400">
              © 2025 CallHub • Love in pixels • <span className="text-neon-pink font-bold">18+ Only</span>
            </p>
            <p className="text-xs text-gray-600 flex items-center justify-center gap-1">
              Made with <Heart size={12} className="text-red-500 fill-red-500" /> for emotional AI experiences
            </p>
         </div>
      </section>
    </div>
  );
};

export default Home;