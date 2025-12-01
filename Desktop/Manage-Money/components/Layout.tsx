import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, DollarSign, Facebook, Twitter, Instagram, Linkedin, Globe } from 'lucide-react';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Guides', path: '/guides' },
    { name: 'Blog', path: '/blog' },
    { name: 'Contact', path: '/contact' },
  ];

  const isActive = (path: string) => {
    if (path === '/' && location.pathname !== '/') return false;
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen flex flex-col font-sans text-slate-800 bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white shadow-sm border-b border-slate-200">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <div className="bg-brand-green p-2 rounded-full text-white">
                <DollarSign size={24} />
              </div>
              <span className="text-xl font-bold text-brand-blue tracking-tight">Manage Money<span className="text-brand-green">.online</span></span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex space-x-8">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`text-sm font-medium transition-colors duration-200 ${
                    isActive(link.path)
                      ? 'text-brand-green'
                      : 'text-slate-600 hover:text-brand-blue'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </nav>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 rounded-md text-slate-600 hover:text-brand-blue focus:outline-none"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-slate-100 shadow-lg">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    isActive(link.path)
                      ? 'bg-slate-50 text-brand-green'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-brand-blue'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-grow">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-brand-blue text-white pt-12 pb-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="bg-brand-green p-1.5 rounded-full text-white">
                  <DollarSign size={18} />
                </div>
                <span className="text-lg font-bold">Manage Money<span className="text-brand-green">.online</span></span>
              </div>
              <p className="text-slate-300 text-sm">
                Empowering individuals everywhere to take control of their financial destiny through education and smart tools.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4 text-brand-green">Quick Links</h3>
              <ul className="space-y-2 text-sm text-slate-300">
                <li><Link to="/guides" className="hover:text-white transition">Budgeting Guides</Link></li>
                <li><Link to="/guides/investing-intro" className="hover:text-white transition">Investing 101</Link></li>
                <li><Link to="/blog" className="hover:text-white transition">Latest News</Link></li>
                <li><Link to="/about" className="hover:text-white transition">Our Mission</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4 text-brand-green">Resources</h3>
              <ul className="space-y-2 text-sm text-slate-300">
                <li><Link to="/guides/financial-tools" className="hover:text-white transition">Calculators</Link></li>
                <li><Link to="/guides/credit-debt" className="hover:text-white transition">Debt Help</Link></li>
                <li><Link to="/guides/saving-strategies" className="hover:text-white transition">Saving Tips</Link></li>
                <li><Link to="/contact" className="hover:text-white transition">Support</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4 text-brand-green">Connect</h3>
              <div className="flex space-x-4 mb-4">
                <a href="#" className="text-slate-300 hover:text-white transition"><Facebook size={20} /></a>
                <a href="#" className="text-slate-300 hover:text-white transition"><Twitter size={20} /></a>
                <a href="#" className="text-slate-300 hover:text-white transition"><Instagram size={20} /></a>
                <a href="#" className="text-slate-300 hover:text-white transition"><Linkedin size={20} /></a>
              </div>
              <div className="flex items-center text-slate-400 text-xs">
                <Globe size={14} className="mr-1" />
                <span>Global Financial Literacy</span>
              </div>
            </div>
          </div>
          
          <div className="border-t border-slate-700 mt-12 pt-8 text-center text-sm text-slate-400">
            <p>&copy; {new Date().getFullYear()} Manage Money Online. All rights reserved. Disclaimer: Content is for educational purposes only.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;