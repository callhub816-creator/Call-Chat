import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { guides } from '../data/content';
import { PieChart, PiggyBank, CreditCard, ShoppingBag, TrendingUp, Calculator, ArrowLeft, BookOpen, ArrowRight } from 'lucide-react';
import SavingsCalculator from '../components/SavingsCalculator';

// Icon mapping helper
const getIcon = (name: string, size: number = 24, className: string = "") => {
  const props = { size, className };
  switch (name) {
    case 'PieChart': return <PieChart {...props} />;
    case 'PiggyBank': return <PiggyBank {...props} />;
    case 'CreditCard': return <CreditCard {...props} />;
    case 'ShoppingBag': return <ShoppingBag {...props} />;
    case 'TrendingUp': return <TrendingUp {...props} />;
    case 'Calculator': return <Calculator {...props} />;
    default: return <BookOpen {...props} />;
  }
};

const Guides: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  // If ID is present, show detail view
  if (id) {
    const guide = guides.find(g => g.id === id);
    if (!guide) return <div className="container mx-auto p-12 text-center">Guide not found <Link to="/guides" className="text-brand-blue underline">Go back</Link></div>;

    return (
      <div className="bg-slate-50 min-h-screen pb-20">
        <div className="bg-brand-blue text-white py-12">
          <div className="container mx-auto px-4">
             <Link to="/guides" className="inline-flex items-center text-slate-300 hover:text-white mb-6 transition">
               <ArrowLeft size={16} className="mr-2" /> Back to Guides
             </Link>
             <div className="flex items-center space-x-4 mb-4">
               <div className="bg-white/10 p-3 rounded-lg">
                 {getIcon(guide.iconName, 32, "text-brand-green")}
               </div>
               <h1 className="text-3xl md:text-4xl font-bold">{guide.title}</h1>
             </div>
             <p className="text-xl text-slate-200 max-w-3xl">{guide.summary}</p>
          </div>
        </div>

        <div className="container mx-auto px-4 -mt-8">
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-8 md:p-12 max-w-4xl mx-auto">
             <div className="space-y-12">
               {guide.sections.map((section, index) => (
                 <div key={index} className="prose prose-slate max-w-none">
                   <h2 className="text-2xl font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">
                     {section.title}
                   </h2>
                   <div className="whitespace-pre-line text-slate-700 leading-relaxed">
                     {section.content}
                   </div>
                 </div>
               ))}
             </div>

             {/* Inject Calculator if it's the tools page */}
             {guide.id === 'financial-tools' && (
                <SavingsCalculator />
             )}

             <div className="mt-16 pt-8 border-t border-slate-100 flex justify-between items-center">
                <Link to="/guides" className="text-brand-blue font-semibold hover:underline">
                  &larr; View all guides
                </Link>
                <Link to="/contact" className="bg-brand-green text-white px-6 py-2 rounded-full font-medium hover:bg-brand-darkGreen transition">
                  Ask a Question
                </Link>
             </div>
          </div>
        </div>
      </div>
    );
  }

  // List view
  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <div className="bg-white border-b border-slate-200 py-16 mb-12">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">Money Management Guides</h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Everything you need to know about personal finance, organized into simple, actionable chapters.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {guides.map((guide) => (
            <Link key={guide.id} to={`/guides/${guide.id}`} className="group bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-200 overflow-hidden flex flex-col h-full">
              <div className="p-6 flex-grow">
                <div className="w-14 h-14 bg-blue-50 rounded-lg flex items-center justify-center mb-6 group-hover:bg-brand-blue transition-colors duration-300">
                  {getIcon(guide.iconName, 28, "text-brand-blue group-hover:text-white transition-colors duration-300")}
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-3 group-hover:text-brand-blue transition-colors">{guide.title}</h2>
                <p className="text-slate-600 leading-relaxed">
                  {guide.summary}
                </p>
              </div>
              <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 group-hover:bg-blue-50 transition-colors">
                <span className="text-brand-green font-bold text-sm flex items-center">
                  Start Reading <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Guides;