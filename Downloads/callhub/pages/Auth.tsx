import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, ArrowRight, Github, Chrome } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/NeonComponents';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password) {
      login(email);
      navigate('/dashboard');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh] px-4">
      <div className="w-full max-w-md glass-panel p-8 rounded-2xl border border-dark-border relative overflow-hidden">
        {/* Background Glow */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-full h-1 bg-gradient-to-r from-transparent via-neon-pink to-transparent"></div>
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-neon-purple/20 blur-3xl rounded-full pointer-events-none"></div>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-display font-bold mb-2 text-white">Welcome Back</h1>
          <p className="text-gray-400">Log in to continue your intimate journey.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm text-gray-400 ml-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-3.5 text-gray-500" size={18} />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-dark-bg border border-dark-border rounded-xl py-3 pl-12 pr-4 text-white focus:border-neon-pink focus:ring-1 focus:ring-neon-pink outline-none transition"
                placeholder="you@example.com"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-gray-400 ml-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-3.5 text-gray-500" size={18} />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-dark-bg border border-dark-border rounded-xl py-3 pl-12 pr-4 text-white focus:border-neon-pink focus:ring-1 focus:ring-neon-pink outline-none transition"
                placeholder="••••••••"
                required
              />
            </div>
            <div className="flex justify-end">
              <a href="#" className="text-xs text-neon-blue hover:underline">Forgot Password?</a>
            </div>
          </div>

          <Button type="submit" className="w-full flex justify-center items-center gap-2">
            Sign In <ArrowRight size={18} />
          </Button>
        </form>

        <div className="mt-8 text-center">
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-dark-border"></div></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-dark-card px-2 text-gray-500">Or continue with</span></div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button className="flex items-center justify-center gap-2 py-2.5 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 transition text-sm">
              <Chrome size={18} /> Google
            </button>
            <button className="flex items-center justify-center gap-2 py-2.5 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 transition text-sm">
              <Github size={18} /> GitHub
            </button>
          </div>

          <p className="mt-8 text-gray-400 text-sm">
            Don't have an account? <Link to="/register" className="text-neon-pink font-bold hover:underline">Sign Up</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export const Register: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password && name) {
      register(email, name);
      navigate('/dashboard');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh] px-4">
      <div className="w-full max-w-md glass-panel p-8 rounded-2xl border border-dark-border relative overflow-hidden">
        {/* Background Glow */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-full h-1 bg-gradient-to-r from-transparent via-neon-blue to-transparent"></div>
        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-neon-blue/20 blur-3xl rounded-full pointer-events-none"></div>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-display font-bold mb-2 text-white">Create Account</h1>
          <p className="text-gray-400">Start your AI romance journey today.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm text-gray-400 ml-1">Full Name</label>
            <div className="relative">
              <User className="absolute left-4 top-3.5 text-gray-500" size={18} />
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-dark-bg border border-dark-border rounded-xl py-3 pl-12 pr-4 text-white focus:border-neon-blue focus:ring-1 focus:ring-neon-blue outline-none transition"
                placeholder="Enter your name"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-gray-400 ml-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-3.5 text-gray-500" size={18} />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-dark-bg border border-dark-border rounded-xl py-3 pl-12 pr-4 text-white focus:border-neon-blue focus:ring-1 focus:ring-neon-blue outline-none transition"
                placeholder="you@example.com"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-gray-400 ml-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-3.5 text-gray-500" size={18} />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-dark-bg border border-dark-border rounded-xl py-3 pl-12 pr-4 text-white focus:border-neon-blue focus:ring-1 focus:ring-neon-blue outline-none transition"
                placeholder="Create a strong password"
                required
              />
            </div>
          </div>

          <Button variant="primary" type="submit" className="w-full flex justify-center items-center gap-2 mt-2 !bg-gradient-to-r !from-neon-blue !to-neon-purple">
            Create Account <ArrowRight size={18} />
          </Button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-gray-400 text-sm">
            Already have an account? <Link to="/login" className="text-neon-blue font-bold hover:underline">Log In</Link>
          </p>
        </div>
      </div>
    </div>
  );
};