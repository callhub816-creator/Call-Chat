
import React, { useState } from 'react';
import { MODE_CARDS } from '../constants';
import { ModeCardData, Persona } from '../types';
import ModeCard from './ModeCard';
import PersonaCreationModal from './PersonaCreationModal';

interface CardGalleryProps {
  onPersonaCreated: (persona: Persona, avatarUrl?: string) => void;
}

const CardGallery: React.FC<CardGalleryProps> = ({ onPersonaCreated }) => {
  const [selectedMode, setSelectedMode] = useState<ModeCardData | null>(null);

  const handleCreate = (persona: Persona, avatarUrl?: string) => {
    onPersonaCreated(persona, avatarUrl);
    setSelectedMode(null);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-6 py-12">
      <div className="text-center mb-16 space-y-3">
        <h1 className="text-5xl md:text-6xl font-serif-display text-gray-900 mb-2">
          Build Your Perfect AI Partner
        </h1>
        <p className="text-gray-600 text-lg font-light tracking-wide max-w-2xl mx-auto">
          Choose the vibe, looks, and personality that matches your heart.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8 justify-items-center">
        {MODE_CARDS.map((card) => (
          <ModeCard 
            key={card.id} 
            data={card} 
            onClick={() => setSelectedMode(card)}
          />
        ))}
      </div>

      {selectedMode && (
        <PersonaCreationModal 
          mode={selectedMode} 
          onClose={() => setSelectedMode(null)} 
          onCreated={handleCreate}
        />
      )}
    </div>
  );
};

export default CardGallery;