import React from 'react';
import { Link } from 'react-router-dom';
import { CHARACTERS } from '../services/mockDatabase';
import { MessageCircle, Mic, Video } from 'lucide-react';

const CharacterList: React.FC = () => {
  return (
    <div className="space-y-6">
       <div className="text-center mb-10">
         <h1 className="text-4xl font-display font-bold mb-2">Choose Your Partner</h1>
         <p className="text-gray-400">Select a personality that matches your vibe.</p>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         {CHARACTERS.map((char) => (
           <div key={char.id} className="glass-panel rounded-2xl overflow-hidden border border-dark-border hover:border-neon-purple transition-all duration-300">
              <div className="relative h-64">
                <img src={char.avatarUrl} alt={char.name} className="w-full h-full object-cover" />
                <div className="absolute top-4 right-4 flex flex-col gap-2">
                   <div className="bg-black/60 backdrop-blur p-2 rounded-full text-neon-pink border border-white/10">
                     <MessageCircle size={16} />
                   </div>
                   <div className="bg-black/60 backdrop-blur p-2 rounded-full text-neon-blue border border-white/10">
                     <Mic size={16} />
                   </div>
                </div>
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-dark-card to-transparent p-4 pt-16">
                   <h2 className="text-2xl font-bold">{char.name}</h2>
                   <p className="text-neon-pink text-sm">{char.personality.toUpperCase()}</p>
                </div>
              </div>
              <div className="p-4 space-y-4">
                 <p className="text-gray-300 text-sm line-clamp-2">{char.description}</p>
                 
                 <div className="flex flex-wrap gap-2">
                   {char.tags.map(tag => (
                     <span key={tag} className="text-xs bg-white/5 px-2 py-1 rounded text-gray-400">{tag}</span>
                   ))}
                 </div>

                 <div className="flex gap-2 pt-2">
                   <Link to={`/chat/${char.id}`} className="flex-1">
                     <button className="w-full py-2 bg-neon-pink/20 hover:bg-neon-pink/40 text-neon-pink border border-neon-pink/50 rounded-lg font-bold transition">
                       Chat Now
                     </button>
                   </Link>
                   <button className="flex-1 py-2 bg-dark-card hover:bg-white/5 border border-white/10 rounded-lg text-gray-300 transition" disabled title="Coming soon">
                     Visit Room
                   </button>
                 </div>
              </div>
           </div>
         ))}
       </div>
    </div>
  );
};

export default CharacterList;