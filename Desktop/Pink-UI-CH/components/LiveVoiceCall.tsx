import React, { useEffect, useRef, useState } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from "@google/genai";
import { Persona } from '../types';
import { Mic, MicOff, PhoneOff, User, Volume2, AlertTriangle } from 'lucide-react';
import { LANGUAGE_CONTROL_SYSTEM_MESSAGE, NAME_AGNOSTIC_NOTE } from '../constants';

interface LiveVoiceCallProps {
  persona: Persona;
  onClose: () => void;
}

const LiveVoiceCall: React.FC<LiveVoiceCallProps> = ({ persona, onClose }) => {
  const [isMuted, setIsMuted] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'error' | 'closed' | 'rate_limited'>('connecting');
  const [volumeLevel, setVolumeLevel] = useState(0);

  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const sessionRef = useRef<any>(null);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const nextStartTimeRef = useRef<number>(0);
  const streamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);

  useEffect(() => {
    let mounted = true;

    const startSession = async () => {
      if (!process.env.API_KEY) {
        if (mounted) setConnectionStatus('error');
        return;
      }

      try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        inputAudioContextRef.current = new AudioContextClass({ sampleRate: 16000 });
        outputAudioContextRef.current = new AudioContextClass({ sampleRate: 24000 });

        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          streamRef.current = stream;
        } catch (e) {
          console.error("Mic permission denied", e);
          if (mounted) setConnectionStatus('error');
          return;
        }

        const voiceName = persona.gender === 'female' ? 'Kore' : 'Fenrir';

        const sessionPromise = ai.live.connect({
          model: 'gemini-2.5-flash-native-audio-preview-09-2025',
          callbacks: {
            onopen: () => {
              if (!mounted) return;
              setConnectionStatus('connected');
              if (!inputAudioContextRef.current || !streamRef.current) return;
              
              const source = inputAudioContextRef.current.createMediaStreamSource(streamRef.current);
              const scriptProcessor = inputAudioContextRef.current.createScriptProcessor(4096, 1, 1);
              processorRef.current = scriptProcessor;
              
              scriptProcessor.onaudioprocess = (e) => {
                if (isMuted) return; 
                const inputData = e.inputBuffer.getChannelData(0);
                let sum = 0;
                for(let i=0; i<inputData.length; i++) sum += inputData[i] * inputData[i];
                const rms = Math.sqrt(sum / inputData.length);
                if (mounted) setVolumeLevel(Math.min(rms * 5, 1));

                const pcmBlob = createBlob(inputData);
                sessionPromise.then(session => {
                  session.sendRealtimeInput({ media: pcmBlob });
                }).catch(err => console.error("Send input error", err));
              };
              
              source.connect(scriptProcessor);
              scriptProcessor.connect(inputAudioContextRef.current.destination);
            },
            onmessage: async (message: LiveServerMessage) => {
              if (!mounted) return;
              const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
              if (base64Audio && outputAudioContextRef.current) {
                const ctx = outputAudioContextRef.current;
                nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
                try {
                    const audioBuffer = await decodeAudioData(decode(base64Audio), ctx, 24000, 1);
                    const source = ctx.createBufferSource();
                    source.buffer = audioBuffer;
                    const gainNode = ctx.createGain();
                    gainNode.gain.value = 1.0; 
                    source.connect(gainNode);
                    gainNode.connect(ctx.destination);
                    source.addEventListener('ended', () => { if (sourcesRef.current) sourcesRef.current.delete(source); });
                    source.start(nextStartTimeRef.current);
                    nextStartTimeRef.current += audioBuffer.duration;
                    if (sourcesRef.current) sourcesRef.current.add(source);
                } catch (e) { console.error("Audio decode error", e); }
              }
              if (message.serverContent?.interrupted) {
                if (sourcesRef.current) {
                    sourcesRef.current.forEach(source => { try { source.stop(); } catch(e) {} });
                    sourcesRef.current.clear();
                }
                nextStartTimeRef.current = 0;
              }
            },
            onclose: () => { if (mounted) setConnectionStatus('closed'); },
            onerror: (err) => { console.error(err); if (mounted) setConnectionStatus('error'); }
          },
          config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName } } },
            systemInstruction: `${LANGUAGE_CONTROL_SYSTEM_MESSAGE}

${NAME_AGNOSTIC_NOTE}

You are an AI voice companion. Traits: ${persona.tags.join(', ')}. Description: ${persona.description}.

GLOBAL RULES: Keep responses conversational, warm, affectionate, girlfriend-like, and natural for voice.`
          }
        });

        sessionRef.current = await sessionPromise;
      } catch (err: any) {
        console.error("Connection failed", err);
        if (mounted) {
            const errorString = JSON.stringify(err);
            if (errorString.includes('429') || err.message?.includes('429') || err.status === 429 || err.message?.includes('quota') || err.message?.includes('RESOURCE_EXHAUSTED')) {
                setConnectionStatus('rate_limited');
            } else {
                setConnectionStatus('error');
            }
        }
      }
    };

    startSession();

    return () => {
      mounted = false;
      if (processorRef.current) { try { processorRef.current.disconnect(); } catch(e) {} processorRef.current = null; }
      if (streamRef.current) { streamRef.current.getTracks().forEach(track => track.stop()); }
      if (inputAudioContextRef.current && inputAudioContextRef.current.state !== 'closed') inputAudioContextRef.current.close();
      if (outputAudioContextRef.current && outputAudioContextRef.current.state !== 'closed') outputAudioContextRef.current.close();
    };
  }, [persona]);

  function createBlob(data: Float32Array): { data: string; mimeType: string } {
    const l = data.length;
    const int16 = new Int16Array(l);
    for (let i = 0; i < l; i++) { int16[i] = data[i] * 32768; }
    return { data: encode(new Uint8Array(int16.buffer)), mimeType: 'audio/pcm;rate=16000' };
  }

  function encode(bytes: Uint8Array) {
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) { binary += String.fromCharCode(bytes[i]); }
    return btoa(binary);
  }

  function decode(base64: string) {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) { bytes[i] = binaryString.charCodeAt(i); }
    return bytes;
  }

  async function decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
    for (let channel = 0; channel < numChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < frameCount; i++) { channelData[i] = dataInt16[i * numChannels + channel] / 32768.0; }
    }
    return buffer;
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="w-full max-w-sm mx-4 aspect-[3/4] max-h-[600px] relative rounded-[32px] overflow-hidden bg-gradient-to-br from-[#FFE6F4] via-[#E6E6FA] to-[#FDF2F8] shadow-2xl border-2 border-white/70">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-[-20%] left-[-20%] w-[140%] h-[140%] bg-gradient-to-br from-[#FF9ACB]/30 to-[#B28DFF]/30 animate-pulse rounded-full mix-blend-multiply filter blur-[80px]" />
        </div>
        <div className="relative z-10 h-full flex flex-col items-center justify-between py-12 px-6">
          <div className="text-center space-y-2">
            <h2 className="text-[#5e3a58] text-sm font-bold tracking-widest uppercase opacity-70">Voice Call</h2>
            <div className={`px-3 py-1 rounded-full inline-flex items-center gap-2 ${connectionStatus === 'connected' ? 'bg-green-100 text-green-700' : (connectionStatus === 'error' || connectionStatus === 'rate_limited') ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
              {(connectionStatus === 'error' || connectionStatus === 'rate_limited') ? <AlertTriangle size={12} /> : <div className={`w-2 h-2 rounded-full ${connectionStatus === 'connected' ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`} />}
              <span className="text-xs font-medium">
                {connectionStatus === 'connecting' ? 'Connecting...' : connectionStatus === 'connected' ? 'Connected' : connectionStatus === 'rate_limited' ? 'System Busy (429)' : connectionStatus === 'error' ? 'Connection Error' : 'Ended'}
              </span>
            </div>
          </div>
          <div className="relative">
            {connectionStatus === 'connected' && (
              <>
                <div className={`absolute inset-0 bg-[#FF9ACB] rounded-full blur-xl opacity-40 transition-transform duration-100`} style={{ transform: `scale(${1 + volumeLevel})` }} />
                <div className={`absolute inset-0 bg-[#B28DFF] rounded-full blur-2xl opacity-30 transition-transform duration-150 delay-75`} style={{ transform: `scale(${1 + volumeLevel * 1.5})` }} />
              </>
            )}
            <div className="relative w-32 h-32 rounded-full bg-gradient-to-tr from-[#FF9ACB] to-[#B28DFF] p-1 shadow-[0_10px_40px_rgba(255,154,203,0.5)]">
               <div className="w-full h-full rounded-full bg-white/90 flex items-center justify-center overflow-hidden border-4 border-white">
                 <User size={48} className="text-[#5e3a58] opacity-50" />
               </div>
            </div>
            {connectionStatus === 'rate_limited' && (
              <div className="absolute top-full mt-4 left-1/2 -translate-x-1/2 w-48 text-center bg-red-50 border border-red-100 rounded-xl p-2 shadow-sm">
                <p className="text-[10px] text-red-600 leading-tight">High traffic volume. The voice service is currently unavailable.</p>
              </div>
            )}
          </div>
          <div className="text-center space-y-1">
             <h3 className="text-2xl font-serif-display text-[#4A2040]">{persona.name}</h3>
             <p className="text-[#8e6a88] text-sm">{persona.gender === 'female' ? 'Girlfriend' : 'Boyfriend'}</p>
          </div>
          <div className="flex items-center gap-6 mb-4">
             <button onClick={() => setIsMuted(!isMuted)} className={`p-4 rounded-full border border-white/50 backdrop-blur-md shadow-lg transition-all active:scale-95 ${isMuted ? 'bg-white text-gray-400' : 'bg-white/40 text-[#5e3a58]'}`}>
               {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
             </button>
             <button onClick={onClose} className="p-6 rounded-full bg-red-400 text-white shadow-[0_8px_25px_rgba(248,113,113,0.5)] hover:bg-red-500 transition-all transform hover:scale-105 active:scale-95 border-4 border-white/30">
               <PhoneOff size={32} fill="currentColor" />
             </button>
             <div className="p-4 rounded-full border border-white/50 bg-white/40 text-[#5e3a58] backdrop-blur-md shadow-lg">
                <Volume2 size={24} className={connectionStatus === 'connected' ? 'animate-pulse' : 'opacity-50'} />
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveVoiceCall;