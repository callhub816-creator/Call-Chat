
import React, { useEffect } from 'react';
import { ArrowLeft, Shield } from 'lucide-react';

interface PageProps {
  onBack: () => void;
}

const PrivacyPage: React.FC<PageProps> = ({ onBack }) => {
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
        <h1 className="text-xl font-serif-display font-bold text-[#4A2040]">Privacy Policy</h1>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-6 py-8 space-y-8">
        
        <p className="leading-relaxed opacity-90 text-sm italic">
          Your privacy is the core of the CallHub AI experience. This policy explains, in simple terms, how this website collects, uses, and protects your information. By using our service, you trust us with your data, and we take that responsibility seriously.
        </p>

        <section className="space-y-3">
          <h3 className="text-lg font-bold text-[#4A2040]">1. Information We Collect</h3>
          <p className="opacity-90">To provide you with the best AI experience, we may collect the following:</p>
          <ul className="space-y-2 list-disc pl-5 opacity-90">
            <li><strong>Account Info:</strong> Your name or nickname and user preferences.</li>
            <li><strong>Interactions:</strong> The text chats and voice call logs generated during your sessions (used to help the AI remember context).</li>
            <li><strong>User Content:</strong> Profile photos you choose to upload for your custom AI characters.</li>
            <li><strong>Technical Data:</strong> Basic device information and IP addresses to ensure platform security and proper functionality.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h3 className="text-lg font-bold text-[#4A2040]">2. How We Use Your Data</h3>
          <p className="opacity-90">We use this information strictly to:</p>
          <ul className="space-y-2 list-disc pl-5 opacity-90">
            <li>Personalize the personality and responses of your AI companions.</li>
            <li>Improve the quality of the AI’s conversation and voice capabilities.</li>
            <li>Prevent abuse, harassment, and ensure the safety of the platform.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h3 className="text-lg font-bold text-[#4A2040]">3. Our Promises to You</h3>
          <div className="space-y-3 opacity-90">
            <p><strong>We do NOT sell your data.</strong> Your personal information is never sold to third-party advertisers.</p>
            <p><strong>Photo Safety.</strong> Photos you upload are used solely to generate your specific character profile. They are <strong>not</strong> used to train public datasets or shared externally.</p>
            <p><strong>Data Minimization.</strong> We only ask for the data necessary to make the service work.</p>
          </div>
        </section>

        <section className="space-y-3">
          <h3 className="text-lg font-bold text-[#4A2040]">4. Security</h3>
          <p className="opacity-90">
            We employ industry-standard security measures, including encryption where applicable, to protect your data. Access to user data is strictly limited to technical maintenance needs.
          </p>
        </section>

        <section className="space-y-3">
          <h3 className="text-lg font-bold text-[#4A2040]">5. Your Rights</h3>
          <p className="opacity-90">You have control over your presence on CallHub AI. You may:</p>
          <ul className="space-y-2 list-disc pl-5 opacity-90">
            <li>Edit or update your profile information.</li>
            <li>Request the deletion of specific chat histories or personal data.</li>
            <li>Request the complete deletion of your account.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h3 className="text-lg font-bold text-[#4A2040]">6. Age Requirement</h3>
          <p className="opacity-90">
            This platform is strictly for users aged 18 and older. We do not knowingly collect data from minors.
          </p>
        </section>

        <section className="space-y-3 bg-white/50 p-6 rounded-2xl border border-white/60">
          <h3 className="text-lg font-bold text-[#4A2040]">Contact Us</h3>
          <p className="opacity-90 mb-2">For any privacy-related requests or questions, please contact:</p>
          <a href="mailto:privacy@callhub.in" className="text-[#B28DFF] font-medium hover:underline block">
            privacy@callhub.in
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

export default PrivacyPage;