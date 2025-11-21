import React, { useState } from 'react';
import { Camera, Sparkles, Save } from 'lucide-react';

const Creator: React.FC = () => {
  const [personality, setPersonality] = useState(50);
  const [toxicity, setToxicity] = useState(20);

  return (
    <div className="max-w-3xl mx-auto">
      <div className="glass-panel p-8 rounded-2xl border border-neon-pink/30 relative overflow-hidden">
        {/* Decorative glow */}
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-neon-pink/20 blur-3xl rounded-full pointer-events-none"></div>

        <h1 className="text-3xl font-display font-bold mb-8 flex items-center gap-2">
          <Sparkles className="text-neon-blue" /> Creator Mode
        </h1>

        <form className="space-y-8">
          {/* Avatar Upload */}
          <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-dark-border rounded-xl hover:border-neon-pink transition bg-black/20">
            <div className="w-24 h-24 bg-dark-card rounded-full flex items-center justify-center mb-4 shadow-inner">
              <Camera size={32} className="text-gray-500" />
            </div>
            <p className="text-gray-300 font-bold">Upload Portrait</p>
            <p className="text-xs text-gray-500 mt-1">AI will anime-fy this image</p>
            <input type="file" className="hidden" id="avatar-upload" />
            <label htmlFor="avatar-upload" className="absolute inset-0 cursor-pointer"></label>
          </div>

          {/* Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Name</label>
              <input type="text" placeholder="e.g. Sakura" className="w-full bg-dark-card border border-dark-border rounded-lg px-4 py-3 focus:border-neon-pink outline-none text-white" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Role</label>
              <select className="w-full bg-dark-card border border-dark-border rounded-lg px-4 py-3 focus:border-neon-pink outline-none text-white">
                <option>Girlfriend</option>
                <option>Stepsister</option>
                <option>Boss</option>
                <option>Enemy</option>
              </select>
            </div>
          </div>

          {/* Sliders */}
          <div className="space-y-6">
             <div>
               <div className="flex justify-between mb-2 text-sm">
                 <span>Shy</span>
                 <span className="text-neon-pink font-bold">Personality</span>
                 <span>Bold</span>
               </div>
               <input 
                 type="range" 
                 min="0" max="100" 
                 value={personality} 
                 onChange={(e) => setPersonality(Number(e.target.value))}
                 className="w-full h-2 bg-dark-card rounded-lg appearance-none cursor-pointer accent-neon-pink" 
               />
             </div>

             <div>
               <div className="flex justify-between mb-2 text-sm">
                 <span>Wholesome</span>
                 <span className="text-red-500 font-bold">Toxicity Level</span>
                 <span>Toxic</span>
               </div>
               <input 
                 type="range" 
                 min="0" max="100" 
                 value={toxicity} 
                 onChange={(e) => setToxicity(Number(e.target.value))}
                 className="w-full h-2 bg-dark-card rounded-lg appearance-none cursor-pointer accent-red-500" 
               />
             </div>
          </div>

          {/* Room Selection */}
          <div>
            <label className="block text-sm text-gray-400 mb-3">Starting Room</label>
            <div className="grid grid-cols-3 gap-3">
              {['Bedroom', 'Dungeon', 'Park'].map(room => (
                <button type="button" key={room} className="py-2 bg-dark-card border border-dark-border hover:border-neon-blue rounded-lg text-sm">{room}</button>
              ))}
            </div>
          </div>

          <button className="w-full py-4 bg-gradient-to-r from-neon-pink to-neon-purple rounded-xl font-bold text-white shadow-[0_0_20px_rgba(255,0,255,0.3)] hover:scale-[1.02] transition flex items-center justify-center gap-2">
            <Save size={20} /> Create AI Girlfriend (Ultra Only)
          </button>
        </form>
      </div>
    </div>
  );
};

export default Creator;