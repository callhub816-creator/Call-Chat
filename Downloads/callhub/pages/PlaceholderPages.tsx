import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Video as VideoIcon, VideoOff, PhoneOff, Heart, Smile, Frown, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { LOTTIE_EMOTIONS, getRandomEmotion, getRandomReactionTime } from '../services/lottieAssets';

// TypeScript definition for the web component to avoid TS errors
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'dotlottie-player': any;
    }
  }
}

const CallControls: React.FC<{
  isMuted: boolean;
  toggleMute: () => void;
  isVideoEnabled?: boolean;
  toggleVideo?: () => void;
  onEndCall: () => void;
}> = ({ isMuted, toggleMute, isVideoEnabled, toggleVideo, onEndCall }) => (
  <div className="flex items-center justify-center gap-6 mt-8">
    <button 
      onClick={toggleMute}
      className={`p-4 rounded-full transition-all duration-200 ${isMuted ? 'bg-white text-black' : 'bg-white/10 text-white hover:bg-white/20'}`}
    >
      {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
    </button>

    <button 
      onClick={onEndCall}
      className="p-6 rounded-full bg-red-500 hover:bg-red-600 text-white shadow-[0_0_20px_rgba(239,68,68,0.5)] transform hover:scale-110 transition-all"
    >
      <PhoneOff size={32} fill="currentColor" />
    </button>

    {toggleVideo && (
      <button 
        onClick={toggleVideo}
        className={`p-4 rounded-full transition-all duration-200 ${!isVideoEnabled ? 'bg-white text-black' : 'bg-white/10 text-white hover:bg-white/20'}`}
      >
        {!isVideoEnabled ? <VideoOff size={24} /> : <VideoIcon size={24} />}
      </button>
    )}
  </div>
);

const EmotionSelector: React.FC<{ onSelect: (emotion: string) => void }> = ({ onSelect }) => (
  <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex flex-col gap-3 bg-black/40 backdrop-blur p-2 rounded-full border border-white/10">
    <button onClick={() => onSelect(LOTTIE_EMOTIONS.FLIRTY)} className="p-3 hover:bg-neon-pink/20 rounded-full text-neon-pink transition tooltip" title="Flirt">
      <Heart size={20} fill="currentColor" />
    </button>
    <button onClick={() => onSelect(LOTTIE_EMOTIONS.HAPPY)} className="p-3 hover:bg-yellow-500/20 rounded-full text-yellow-400 transition" title="Happy">
      <Smile size={20} />
    </button>
    <button onClick={() => onSelect(LOTTIE_EMOTIONS.ANGRY)} className="p-3 hover:bg-red-500/20 rounded-full text-red-400 transition" title="Upset">
      <Frown size={20} />
    </button>
    <button onClick={() => onSelect(LOTTIE_EMOTIONS.SHY)} className="p-3 hover:bg-purple-500/20 rounded-full text-purple-400 transition" title="Shy">
      <Sparkles size={20} />
    </button>
  </div>
);

export const VoiceCall: React.FC = () => {
  const navigate = useNavigate();
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [currentEmotion, setCurrentEmotion] = useState(LOTTIE_EMOTIONS.NEUTRAL);

  useEffect(() => {
    const timer = setInterval(() => setDuration(d => d + 1), 1000);
    
    // Randomly change emotion to simulate conversation flow
    const emotionTimer = setInterval(() => {
      if (Math.random() > 0.7) {
        setCurrentEmotion(getRandomEmotion());
      }
    }, getRandomReactionTime());

    return () => {
      clearInterval(timer);
      clearInterval(emotionTimer);
    };
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="relative flex flex-col items-center justify-center h-[85vh] overflow-hidden bg-dark-bg">
      {/* Background Pulse */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
         <div className="w-64 h-64 bg-neon-pink/10 rounded-full blur-3xl animate-pulse"></div>
         <div className="w-96 h-96 bg-neon-blue/5 rounded-full blur-3xl animate-pulse delay-75 absolute"></div>
      </div>

      {/* Avatar / Lottie Area */}
      <div className="relative z-10 mb-12">
        <div className="w-64 h-64 md:w-80 md:h-80 relative">
          {/* Ring Animation */}
          <div className="absolute inset-0 border-2 border-neon-pink/30 rounded-full animate-[ping_3s_linear_infinite]"></div>
          <div className="absolute inset-4 border-2 border-neon-blue/20 rounded-full animate-[ping_3s_linear_infinite_1.5s]"></div>
          
          {/* Lottie Player */}
          <div className="absolute inset-0 flex items-center justify-center drop-shadow-[0_0_15px_rgba(255,0,255,0.6)]">
             <dotlottie-player
                src={currentEmotion}
                background="transparent"
                speed="1"
                loop
                autoplay
                style={{ width: '100%', height: '100%' }}
             ></dotlottie-player>
          </div>
        </div>
      </div>

      {/* Call Info */}
      <div className="text-center z-10 space-y-2">
        <h2 className="text-3xl font-display font-bold text-white tracking-wider">Lia</h2>
        <p className="text-neon-blue font-mono text-lg">{formatTime(duration)}</p>
        <p className="text-gray-500 text-sm">High Fidelity Neural Audio</p>
      </div>

      {/* Controls */}
      <div className="z-10 w-full max-w-md px-4">
        <CallControls 
          isMuted={isMuted} 
          toggleMute={() => setIsMuted(!isMuted)}
          onEndCall={() => navigate(-1)}
        />
      </div>
      
      {/* Emotion Triggers (Hidden features for user to influence call) */}
      <EmotionSelector onSelect={setCurrentEmotion} />
    </div>
  );
};

export const VideoCall: React.FC = () => {
  const navigate = useNavigate();
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [currentEmotion, setCurrentEmotion] = useState(LOTTIE_EMOTIONS.FLIRTY);
  const userVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    let stream: MediaStream | null = null;

    const startCamera = async () => {
      try {
        if (isVideoEnabled) {
          stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
          if (userVideoRef.current) {
            userVideoRef.current.srcObject = stream;
          }
        }
      } catch (err) {
        console.error("Camera access denied", err);
        setIsVideoEnabled(false);
      }
    };

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isVideoEnabled]);

  return (
    <div className="relative h-[85vh] bg-gray-900 rounded-2xl overflow-hidden flex flex-col">
      {/* Main AI View (Full Screen Lottie) */}
      <div className="absolute inset-0 flex items-center justify-center bg-[url('https://images.unsplash.com/photo-1550684848-fac1c5b4e853?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80')] bg-cover bg-center">
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
        
        <div className="relative z-10 w-full h-full flex items-center justify-center">
           <dotlottie-player
              src={currentEmotion}
              background="transparent"
              speed="1"
              loop
              autoplay
              style={{ width: '120%', height: '120%', transform: 'scale(1.2)' }}
           ></dotlottie-player>
        </div>

        {/* AI Name Badge */}
        <div className="absolute top-6 left-6 z-20 glass-panel px-4 py-2 rounded-full flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="font-bold">Lia (AI)</span>
        </div>
      </div>

      {/* User "Selfie" View (PIP) */}
      <div className="absolute top-6 right-6 z-30 w-32 h-48 bg-black rounded-xl overflow-hidden border-2 border-white/10 shadow-2xl">
        {isVideoEnabled ? (
          <video 
            ref={userVideoRef} 
            autoPlay 
            muted 
            playsInline 
            className="w-full h-full object-cover transform scale-x-[-1]" 
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-800 text-gray-500">
            <VideoOff size={24} />
          </div>
        )}
      </div>

      {/* Bottom Controls Overlay */}
      <div className="mt-auto z-30 p-6 bg-gradient-to-t from-black/90 via-black/50 to-transparent pt-20">
        <CallControls 
          isMuted={isMuted}
          toggleMute={() => setIsMuted(!isMuted)}
          isVideoEnabled={isVideoEnabled}
          toggleVideo={() => setIsVideoEnabled(!isVideoEnabled)}
          onEndCall={() => navigate(-1)}
        />
      </div>

      {/* Interactive Reactions */}
      <EmotionSelector onSelect={setCurrentEmotion} />
    </div>
  );
};