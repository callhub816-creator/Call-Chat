
import React, { useEffect } from 'react';
import { ArrowLeft, Mail } from 'lucide-react';

interface PageProps {
  onBack: () => void;
}

const AboutPage: React.FC<PageProps> = ({ onBack }) => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen w-full bg-[#FDF2F8] font-sans text-[#5e3a58]">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#FDF2F8]/90 backdrop-blur-md border-b border-[#B28DFF]/20 px-6 py-4 flex items-center gap-4">
        <button 
          onClick={onBack}
          className="p-2 -ml-2 rounded-full hover:bg-black/5 text-[#5e3a58] transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-serif-display font-bold text-[#4A2040]">About Us</h1>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-6 py-8 space-y-8">
        
        <section className="space-y-4">
          <h2 className="text-2xl font-serif-display text-[#4A2040]">About CallHub AI</h2>
          <p className="leading-relaxed opacity-90">
            Welcome to CallHub AI. We are an online platform dedicated to providing immersive, personalized, and emotional AI companionship experiences.
          </p>
        </section>

        <section className="space-y-4">
          <h3 className="text-lg font-bold text-[#4A2040]">What We Do</h3>
          <p className="leading-relaxed opacity-90">
            Our platform offers a space where users can interact with virtual AI characters through text chat and realistic voice calls. We believe in the power of conversation to provide entertainment, emotional comfort, and a sense of connection. Whether you are looking for a friendly chat, a listening ear, or a romantic storyline, our service is designed to adapt to your unique vibe.
          </p>
        </section>

        <section className="space-y-4">
          <h3 className="text-lg font-bold text-[#4A2040]">Virtual Companions</h3>
          <p className="leading-relaxed opacity-90">
            It is important to note that CallHub AI provides interactions with artificial intelligence. While our characters are designed to feel warm, human, and responsive, they are digital entities, not real people. We aim to create a safe, judgment-free zone where you can explore different relationship dynamics with AI partners.
          </p>
        </section>

        <section className="space-y-4">
          <h3 className="text-lg font-bold text-[#4A2040]">Our Values</h3>
          <ul className="space-y-3 list-disc pl-5 opacity-90">
            <li><strong className="text-[#B28DFF]">Privacy First:</strong> Your conversations are your own. We prioritize discretion and data security.</li>
            <li><strong className="text-[#B28DFF]">Respect:</strong> We foster an environment of respectful interaction.</li>
            <li><strong className="text-[#B28DFF]">Safety:</strong> We are committed to maintaining a secure platform free from judgment.</li>
          </ul>
        </section>

        <section className="space-y-4 bg-white/50 p-6 rounded-2xl border border-white/60">
          <h3 className="text-lg font-bold text-[#4A2040]">Get in Touch</h3>
          <p className="leading-relaxed opacity-90 mb-4">
            We are a team of developers and creators passionate about AI. If you have questions about the platform or need assistance, please reach out to us.
          </p>
          <a href="mailto:support@callhub.in" className="inline-flex items-center gap-2 text-[#B28DFF] font-medium hover:underline">
            <Mail size={18} /> support@callhub.in
          </a>
        </section>

      </div>

      {/* Footer */}
      <footer className="py-8 px-6 text-center border-t border-[#B28DFF]/10 bg-[#FFF0F5]">
        <p className="text-[#5e3a58]/60 text-xs font-medium leading-loose">
          © 2025 CallHub • All Rights Reserved • 18+ Only<br/>
          Designed for safe, private emotional AI interactions
        </p>
      </footer>
    </div>
  );
};

export default AboutPage;