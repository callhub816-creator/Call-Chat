import React from 'react';
import { Check, Star, Zap, Crown } from 'lucide-react';

const Subscription: React.FC = () => {
  const plans = [
    {
      name: 'Basic',
      price: '₹199',
      features: ['Unlimited Chat', 'Basic Memory', 'Ad-free'],
      icon: Star,
      color: 'blue'
    },
    {
      name: 'Plus',
      price: '₹399',
      features: ['Everything in Basic', 'Voice Messages', '3 Characters'],
      icon: Zap,
      color: 'purple',
      popular: true
    },
    {
      name: 'Ultra',
      price: '₹999',
      features: ['Everything in Plus', 'Video Calls', 'Private Rooms', 'Creator Mode'],
      icon: Crown,
      color: 'pink'
    }
  ];

  return (
    <div className="py-12 px-4">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-display font-bold mb-4">Unlock the <span className="text-neon-pink">Fantasy</span></h1>
        <p className="text-gray-400">Choose the level of intimacy you desire.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {plans.map((plan) => (
          <div key={plan.name} className={`relative rounded-3xl p-8 border ${plan.popular ? 'border-neon-pink bg-neon-pink/5 shadow-[0_0_30px_rgba(255,0,255,0.15)]' : 'border-dark-border bg-glass-panel'}`}>
            {plan.popular && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-neon-pink to-purple-600 text-white px-4 py-1 rounded-full text-sm font-bold shadow-lg">
                MOST POPULAR
              </div>
            )}
            
            <div className={`w-12 h-12 rounded-xl bg-${plan.color}-500/20 flex items-center justify-center mb-6 text-${plan.color}-500`}>
               <plan.icon size={24} className={`text-${plan.color === 'pink' ? 'neon-pink' : plan.color === 'blue' ? 'neon-blue' : 'purple-500'}`} />
            </div>

            <h2 className="text-2xl font-bold mb-2">{plan.name}</h2>
            <div className="flex items-baseline mb-6">
              <span className="text-4xl font-bold">{plan.price}</span>
              <span className="text-gray-500 ml-2">/month</span>
            </div>

            <ul className="space-y-4 mb-8">
              {plan.features.map((f, i) => (
                <li key={i} className="flex items-center gap-3 text-gray-300">
                  <div className="bg-green-500/20 p-1 rounded-full">
                    <Check size={12} className="text-green-400" />
                  </div>
                  {f}
                </li>
              ))}
            </ul>

            <button className={`w-full py-4 rounded-xl font-bold transition-all ${
              plan.popular 
                ? 'bg-gradient-to-r from-neon-pink to-neon-purple text-white hover:shadow-[0_0_20px_rgba(255,0,255,0.4)]' 
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}>
              Select Plan
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Subscription;