import React from 'react';
import { Target, Heart, Globe2 } from 'lucide-react';

const About: React.FC = () => {
  return (
    <div className="bg-white">
      {/* Header */}
      <div className="bg-brand-blue py-16">
        <div className="container mx-auto px-4 text-center">
           <h1 className="text-4xl font-bold text-white mb-4">Our Mission</h1>
           <p className="text-xl text-slate-200 max-w-2xl mx-auto">Making financial literacy accessible, understandable, and actionable for everyone.</p>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
        {/* Mission Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 mb-6">Money shouldn't be a mystery.</h2>
            <p className="text-slate-600 mb-4 text-lg leading-relaxed">
              We believe that financial well-being is a fundamental right. However, schools rarely teach us how to budget, the importance of credit scores, or how compound interest works.
            </p>
            <p className="text-slate-600 text-lg leading-relaxed">
              Manage Money Online fills that gap. We provide clear, jargon-free guides tailored for readers worldwide, recognizing that while currencies change, the principles of financial health remain universal.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
              <Target className="text-brand-green mb-4" size={32} />
              <h3 className="font-bold text-lg mb-2">Practical Advice</h3>
              <p className="text-slate-500 text-sm">No fluff. Just step-by-step guides you can implement today.</p>
            </div>
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
              <Globe2 className="text-brand-blue mb-4" size={32} />
              <h3 className="font-bold text-lg mb-2">Global Context</h3>
              <p className="text-slate-500 text-sm">Strategies that apply regardless of your local currency.</p>
            </div>
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 sm:col-span-2">
              <Heart className="text-red-500 mb-4" size={32} />
              <h3 className="font-bold text-lg mb-2">User Focused</h3>
              <p className="text-slate-500 text-sm">We put your financial health first, advocating for ethical saving and spending.</p>
            </div>
          </div>
        </div>

        {/* Founder Story */}
        <div className="bg-slate-50 rounded-2xl p-8 md:p-12">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <img 
              src="https://picsum.photos/seed/founder/300/300" 
              alt="Founder" 
              className="w-32 h-32 md:w-48 md:h-48 rounded-full object-cover border-4 border-white shadow-lg mx-auto md:mx-0"
            />
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-4 text-center md:text-left">A Note from the Founder</h2>
              <div className="prose prose-slate text-slate-600">
                <p className="mb-4">
                  "Hi, I'm Alex. Ten years ago, I found myself drowning in debt despite having a decent job. I didn't understand where my money was going, and the banking jargon felt designed to keep me confused."
                </p>
                <p className="mb-4">
                  "I spent years educating myself, reading every book on personal finance I could find. I learned that managing money isn't about being a math genius; it's about behavior, habits, and having the right information."
                </p>
                <p>
                  "I built this site to be the resource I wish I had back then. Whether you are saving for your first home, paying off student loans, or investing for a comfortable retirement, I hope these guides help you build the life you deserve."
                </p>
                <p className="mt-4 font-bold text-brand-blue">- Alex Mercer</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;