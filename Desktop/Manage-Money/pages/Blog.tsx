import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { blogPosts } from '../data/content';
import { Calendar, User, ArrowLeft, ArrowRight } from 'lucide-react';

const Blog: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  // Blog Detail View
  if (id) {
    const post = blogPosts.find(p => p.id === id);
    if (!post) return <div className="container mx-auto p-12 text-center">Post not found. <Link to="/blog" className="underline">Back to blog</Link></div>;

    return (
      <article className="min-h-screen bg-slate-50 pb-20">
         <div className="bg-white border-b border-slate-200">
            <div className="container mx-auto px-4 py-8">
              <Link to="/blog" className="inline-flex items-center text-slate-500 hover:text-brand-blue mb-4">
                <ArrowLeft size={16} className="mr-2" /> Back to Blog
              </Link>
              <div className="max-w-3xl mx-auto text-center py-8">
                <span className="inline-block bg-brand-green/10 text-brand-darkGreen px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
                  {post.category}
                </span>
                <h1 className="text-3xl md:text-5xl font-bold text-slate-900 mb-6 leading-tight">{post.title}</h1>
                <div className="flex items-center justify-center space-x-6 text-slate-500 text-sm">
                  <div className="flex items-center"><User size={16} className="mr-2" /> {post.author}</div>
                  <div className="flex items-center"><Calendar size={16} className="mr-2" /> {post.date}</div>
                </div>
              </div>
            </div>
         </div>
         
         <div className="container mx-auto px-4 -mt-8">
           <div className="max-w-4xl mx-auto">
             <img src={post.imageUrl} alt={post.title} className="w-full h-[400px] object-cover rounded-xl shadow-lg mb-12" />
             <div className="bg-white p-8 md:p-12 rounded-xl shadow-sm border border-slate-200">
               <p className="text-xl text-slate-800 font-medium mb-8 italic border-l-4 border-brand-green pl-4">
                 {post.excerpt}
               </p>
               <div className="prose prose-lg prose-slate max-w-none text-slate-600">
                 {post.content.split('\n\n').map((paragraph, idx) => (
                   <p key={idx} className="mb-4">{paragraph}</p>
                 ))}
               </div>
             </div>
           </div>
         </div>
      </article>
    );
  }

  // Blog List View
  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <div className="bg-brand-blue py-16 mb-12">
        <div className="container mx-auto px-4 text-center text-white">
          <h1 className="text-4xl font-bold mb-4">Financial Insights Blog</h1>
          <p className="text-xl text-slate-200">Latest tips, trends, and strategies for your wallet.</p>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {blogPosts.map((post) => (
            <Link key={post.id} to={`/blog/${post.id}`} className="group bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-slate-200 flex flex-col">
              <div className="h-48 overflow-hidden">
                <img 
                  src={post.imageUrl} 
                  alt={post.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-6 flex-grow flex flex-col">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs font-bold text-brand-green uppercase tracking-wider">{post.category}</span>
                  <span className="text-xs text-slate-400">{post.date}</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-brand-blue transition-colors line-clamp-2">
                  {post.title}
                </h3>
                <p className="text-slate-600 text-sm mb-4 line-clamp-3 flex-grow">
                  {post.excerpt}
                </p>
                <div className="text-brand-blue font-semibold text-sm flex items-center mt-auto">
                  Read Article <ArrowRight size={14} className="ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Blog;
