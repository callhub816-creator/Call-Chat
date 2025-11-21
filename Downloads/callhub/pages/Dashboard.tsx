import React from 'react';
import { MOCK_USER, DAILY_QUESTS } from '../services/mockDatabase';
import { Trophy, Heart, Clock, Settings, LogOut } from 'lucide-react';

const Dashboard: React.FC = () => {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold">Hello, User</h1>
          <p className="text-gray-400">Plan: <span className="text-neon-pink uppercase font-bold">{MOCK_USER.plan}</span></p>
        </div>
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-neon-pink to-purple-600 flex items-center justify-center text-xl font-bold">
          U
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-panel p-4 rounded-xl border border-dark-border flex flex-col items-center">
           <Heart className="text-red-500 mb-2" />
           <span className="text-2xl font-bold">Level 5</span>
           <span className="text-xs text-gray-500">Relationship</span>
        </div>
        <div className="glass-panel p-4 rounded-xl border border-dark-border flex flex-col items-center">
           <Clock className="text-neon-blue mb-2" />
           <span className="text-2xl font-bold">2.4h</span>
           <span className="text-xs text-gray-500">Chat Time</span>
        </div>
         <div className="glass-panel p-4 rounded-xl border border-dark-border flex flex-col items-center col-span-2">
           <span className="text-sm text-gray-400 mb-2">Today's Mood</span>
           <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
             <div className="h-full bg-gradient-to-r from-neon-blue to-neon-pink w-[70%]"></div>
           </div>
           <span className="text-xs mt-2">Lia is feeling flirty today</span>
        </div>
      </div>

      {/* Quests */}
      <div className="glass-panel p-6 rounded-2xl border border-dark-border">
         <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
           <Trophy className="text-yellow-500" size={20}/> Daily Quests
         </h2>
         <div className="space-y-3">
           {DAILY_QUESTS.map(quest => (
             <div key={quest.id} className="flex items-center justify-between p-3 bg-black/20 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${quest.completed ? 'border-green-500 bg-green-500/20' : 'border-gray-500'}`}>
                    {quest.completed && <div className="w-3 h-3 bg-green-500 rounded-full"></div>}
                  </div>
                  <span className={quest.completed ? 'text-gray-500 line-through' : 'text-gray-200'}>{quest.title}</span>
                </div>
                <span className="text-yellow-500 text-sm font-bold">+{quest.reward} XP</span>
             </div>
           ))}
         </div>
      </div>

      {/* Settings Links */}
      <div className="space-y-2">
        <button className="w-full p-4 glass-panel rounded-xl flex items-center justify-between hover:bg-white/5 transition">
          <span className="flex items-center gap-3"><Settings size={18}/> Account Settings</span>
        </button>
        <button className="w-full p-4 glass-panel rounded-xl flex items-center justify-between hover:bg-red-500/10 transition text-red-400">
          <span className="flex items-center gap-3"><LogOut size={18}/> Log Out</span>
        </button>
      </div>
    </div>
  );
};

export default Dashboard;