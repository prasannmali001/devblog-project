import React from 'react';
import { ArrowRight, BookOpen, PenTool } from 'lucide-react';

interface HeroProps {
  onActionClick: (action: string) => void;
}

export const Hero: React.FC<HeroProps> = ({ onActionClick }) => {
  return (
    <section id="home" className="bg-slate-50 border-b border-slate-200 py-16 sm:py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
        
        {/* Simple Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
          <BookOpen className="w-3.5 h-3.5 text-blue-600" />
          <span>Student & Developer Publication</span>
        </div>

        {/* Clean Heading */}
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
          Read & Share Engineering Insights
        </h1>

        {/* Subtext */}
        <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
          A clean, open platform for developers to explore technical tutorials, software architecture concepts, and modern programming practices.
        </p>

        {/* Call to Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <a
            href="#articles"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium text-sm text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition"
          >
            <span>Explore Articles</span>
            <ArrowRight className="w-4 h-4" />
          </a>

          <button
            onClick={() => onActionClick('Start Writing')}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium text-sm text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 shadow-sm transition"
          >
            <PenTool className="w-4 h-4 text-slate-500" />
            <span>Start Writing</span>
          </button>
        </div>

      </div>
    </section>
  );
};
