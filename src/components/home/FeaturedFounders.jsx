import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight } from 'lucide-react';
import { FounderCard } from './FounderCard';
import { useData } from '../../context/DataContext';
 
export const FeaturedFounders = ({ onOpenPortfolio }) => {
  const { members, isLoading: loading } = useData();
 
  // Safe even if members is undefined or null
  const featured = (members ?? [])
    .filter((member) => member.role === 'Founder' && member.membershipTier === 'executive_fellow')
    .slice(0, 3);
 
  return (
    <section className="py-10 border-t border-zinc-200 dark:border-zinc-800">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-6 gap-2">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-1">
            <Sparkles className="w-3.5 h-3.5" />
 
            <span>EXECUTIVE SPOTLIGHT</span>
          </div>
 
          {/* Color forced to #4A3328 in light AND dark mode */}
          <h2
            className="font-serif text-2xl sm:text-3xl font-bold !text-[#4A3328]"
            style={{ color: '#4A3328' }}
          >
            Featured Founders & Operators
          </h2>
        </div>
 
        <Link
          to="/directory"
          className="text-xs font-semibold text-amber-600 hover:text-amber-500 flex items-center gap-1 group"
        >
          <span>View All Members</span>
 
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
 
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="h-64 rounded-xl bg-zinc-100 dark:bg-zinc-800 animate-pulse"
            />
          ))}
        </div>
      ) : featured.length === 0 ? (
        <div className="py-10 text-center text-zinc-500 dark:text-zinc-400">
          No featured founders found.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featured.map((member) => (
            <FounderCard
              key={member.id}
              member={member}
              onOpenPortfolio={onOpenPortfolio}
            />
          ))}
        </div>
      )}
    </section>
  );
};
 
export default FeaturedFounders;
