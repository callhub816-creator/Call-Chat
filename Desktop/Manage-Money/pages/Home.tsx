import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, TrendingUp, Users, Globe } from 'lucide-react';
import { guides } from '../data/content';

const Home: React.FC = () => {
  return (
    <div className="space-y-20 pb-20">
      {/* Hero Section */}
      <section className="relative bg-brand-blue overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://picsum.photos/seed/finance/1600/900')] opacity-10 bg-cover bg-center"></div>
        <div className="relative container mx-auto px-4 py-24 sm:px-6 lg:px-8 flex flex-col items-center text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight mb-6">
            Take Control of Your Money, <br />
            <span className="text-brand-green">Build a Better Future</span>
          </h1>
          <p className="text-xl text-slate-200 max-w-2xl mb-10">
            Simple, actionable financial advice for everyone. Learn to budget smart, crush debt, and invest wisely—giving you the freedom to live life on your own terms.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link to="/guides" className="px-8 py-4 bg-brand-green hover:bg-brand-darkGreen text-white font-bold rounded-full transition shadow-lg hover:shadow-xl flex items-center justify-center">
              Start Learning <ArrowRight className="ml-2" size={20} />
            </Link>
            <Link to="/guides/budgeting-basics" className="px-8 py-4 bg-white hover:bg-slate-100 text-brand-blue font-bold rounded-full transition shadow-lg hover:shadow-xl">
              Create a Budget
            </Link>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-900">Why trust Manage Money Online?</h2>
          <p className="text-slate-600 mt-2">Financial literacy made simple and accessible.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-xl shadow-md border border-slate-100 text-center">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 text-brand-blue">
              <Globe size={32} />
            </div>
            <h3 className="text-xl font-bold mb-3">Universal Principles</h3>
            <p className="text-slate-600">Tailored advice that focuses on the fundamental rules of money management applicable anywhere in the world.</p>
          </div>
          <div className="bg-white p-8 rounded-xl shadow-md border border-slate-100 text-center">
            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 text-brand-green">
              <ShieldCheck size={32} />
            </div>
            <h3 className="text-xl font-bold mb-3">Unbiased & Free</h3>
            <p className="text-slate-600">Our mission is education. We provide clear, objective information to help you make your own decisions.</p>
          </div>
          <div className="bg-white p-8 rounded-xl shadow-md border border-slate-100 text-center">
            <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 text-purple-600">
              <Users size={32} />
            </div>
            <h3 className="text-xl font-bold mb-3">Community First</h3>
            <p className="text-slate-600">Join thousands of others taking the first steps towards financial independence.</p>
          </div>
        </div>
      </section>

      {/* Guides Preview */}
      <section className="bg-slate-50 py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl font-bold text-slate-900">Explore Our Guides</h2>
              <p className="text-slate-600 mt-2 max-w-xl">Comprehensive resources to help you master every aspect of your financial life.</p>
            </div>
            <Link to="/guides" className="hidden md:flex text-brand-blue font-semibold hover:text-brand-green items-center transition">
              View all guides <ArrowRight size={16} className="ml-1" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {guides.slice(0, 3).map((guide) => (
              <Link key={guide.id} to={`/guides/${guide.id}`} className="group bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition border border-slate-200 hover:border-brand-green">
                <h3 className="text-xl font-bold text-slate-900 group-hover:text-brand-green transition mb-2">{guide.title}</h3>
                <p className="text-slate-600">{guide.summary}</p>
                <span className="inline-block mt-4 text-sm font-semibold text-brand-blue group-hover:underline">Read Guide &rarr;</span>
              </Link>
            ))}
          </div>
          
          <div className="mt-8 text-center md:hidden">
             <Link to="/guides" className="text-brand-blue font-semibold hover:text-brand-green inline-flex items-center transition">
              View all guides <ArrowRight size={16} className="ml-1" />
            </Link>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-brand-green rounded-3xl p-12 text-center text-white relative overflow-hidden">
           <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl"></div>
           <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 bg-black opacity-10 rounded-full blur-3xl"></div>
           
           <h2 className="relative text-3xl md:text-4xl font-bold mb-6">Ready to transform your wallet?</h2>
           <p className="relative text-lg text-green-50 mb-8 max-w-2xl mx-auto">
             Don't wait for the "perfect time". The best time to start managing your money was yesterday. The second best time is today.
           </p>
           <div className="relative">
             <Link to="/contact" className="inline-block bg-white text-brand-green px-8 py-3 rounded-full font-bold shadow-lg hover:bg-slate-100 transition">
               Get in Touch
             </Link>
           </div>
        </div>
      </section>
    </div>
  );
};

export default Home;