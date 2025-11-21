import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, MessageCircle, User, PlusCircle, Heart, Menu, X, LogIn, LogOut, Settings } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from './NeonComponents';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout } = useAuth();

  const isActive = (path: string) => location.pathname === path ? 'text-neon-pink drop-shadow-lg' : 'text-gray-400';

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-dark-bg flex flex-col text-white font-sans">
      {/* Desktop/Mobile Header */}
      <header className="sticky top-0 z-50 glass-panel border-b border-dark-border">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="text-2xl font-display font-bold bg-clip-text text-transparent bg-gradient-to-r from-neon-pink to-neon-blue neon-text">
            CallHub
          </Link>
          
          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/" className={`hover:text-neon-pink transition ${isActive('/')}`}>Home</Link>
            <Link to="/characters" className={`hover:text-neon-pink transition ${isActive('/characters')}`}>Browse</Link>
            <Link to="/subscribe" className={`hover:text-neon-pink transition ${isActive('/subscribe')}`}>Premium</Link>
            
            {user ? (
              <div className="flex items-center gap-6">
                <Link to="/dashboard" className={`hover:text-neon-pink transition ${isActive('/dashboard')}`}>Dashboard</Link>
                <button onClick={handleLogout} className="text-gray-400 hover:text-white transition">
                  <LogOut size={20} />
                </button>
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-neon-pink to-neon-purple flex items-center justify-center text-xs font-bold">
                   {user.email[0].toUpperCase()}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                 <Link to="/login" className="text-gray-300 hover:text-white transition">Log In</Link>
                 <Link to="/register">
                   <Button className="!py-2 !px-5 text-sm">Sign Up</Button>
                 </Link>
              </div>
            )}
          </nav>

          {/* Mobile Menu Toggle */}
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden text-white">
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-40 bg-dark-bg/95 pt-20 px-6 md:hidden">
           <nav className="flex flex-col space-y-6 text-xl font-display">
            <Link to="/" onClick={() => setIsMenuOpen(false)}>Home</Link>
            <Link to="/characters" onClick={() => setIsMenuOpen(false)}>Characters</Link>
            <Link to="/subscribe" onClick={() => setIsMenuOpen(false)} className="text-neon-pink">Premium Plans</Link>
            
            {user ? (
              <>
                <Link to="/dashboard" onClick={() => setIsMenuOpen(false)}>Dashboard</Link>
                <Link to="/creator" onClick={() => setIsMenuOpen(false)}>Create AI</Link>
                <button onClick={handleLogout} className="text-left text-red-400 mt-4 flex items-center gap-2">
                  <LogOut size={20} /> Log Out
                </button>
              </>
            ) : (
              <>
                <div className="h-px bg-gray-800 my-2"></div>
                <Link to="/login" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-2">
                  <LogIn size={20} /> Log In
                </Link>
                <Link to="/register" onClick={() => setIsMenuOpen(false)} className="text-neon-blue">
                  Create Free Account
                </Link>
              </>
            )}
           </nav>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-grow container mx-auto px-4 py-6 pb-24 md:pb-6">
        {children}
      </main>

      {/* Mobile Bottom Tab Bar */}
      <div className="fixed bottom-0 left-0 right-0 h-16 glass-panel border-t border-dark-border md:hidden z-50 flex justify-around items-center pb-1">
        <Link to="/" className={`flex flex-col items-center p-2 ${isActive('/')}`}>
          <Home size={20} />
          <span className="text-[10px] mt-1">Home</span>
        </Link>
        <Link to="/characters" className={`flex flex-col items-center p-2 ${isActive('/characters')}`}>
          <Heart size={20} />
          <span className="text-[10px] mt-1">Meet</span>
        </Link>
        <Link to="/creator" className={`flex flex-col items-center p-2 -mt-6 bg-neon-pink/20 rounded-full border border-neon-pink shadow-[0_0_15px_rgba(255,0,255,0.4)]`}>
          <PlusCircle size={28} className="text-neon-pink" />
        </Link>
        <Link to={user ? "/dashboard" : "/login"} className={`flex flex-col items-center p-2 ${isActive('/dashboard')}`}>
          <MessageCircle size={20} />
          <span className="text-[10px] mt-1">Chat</span>
        </Link>
        <Link to={user ? "/dashboard" : "/login"} className={`flex flex-col items-center p-2 ${isActive('/login')}`}>
          <User size={20} />
          <span className="text-[10px] mt-1">Me</span>
        </Link>
      </div>
    </div>
  );
};

export default Layout;