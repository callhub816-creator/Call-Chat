import React from 'react';

export const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'outline' }> = ({ 
  className = '', 
  variant = 'primary', 
  children, 
  ...props 
}) => {
  const baseStyle = "px-6 py-3 rounded-full font-display font-bold transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-gradient-to-r from-neon-pink to-neon-purple text-white shadow-[0_0_15px_rgba(255,0,255,0.4)] hover:shadow-[0_0_25px_rgba(255,0,255,0.6)] border border-white/10",
    secondary: "bg-dark-card border border-dark-border hover:border-neon-blue hover:text-neon-blue text-gray-300",
    outline: "border-2 border-neon-pink text-neon-pink hover:bg-neon-pink hover:text-white"
  };

  return (
    <button className={`${baseStyle} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

export const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`glass-panel rounded-2xl p-4 ${className}`}>
    {children}
  </div>
);

export const Badge: React.FC<{ children: React.ReactNode; color?: string }> = ({ children, color = 'pink' }) => (
  <span className={`px-2 py-0.5 rounded text-xs font-semibold border border-${color}-500/30 bg-${color}-500/10 text-${color}-400`}>
    {children}
  </span>
);
