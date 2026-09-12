import React from 'react';
import { BookOpen } from 'lucide-react';

interface FooterProps {
  onActionClick: (action: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onActionClick }) => {
  return (
    <footer className="bg-slate-50 border-t border-slate-200 py-12 text-slate-600 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-slate-200">
          
          {/* Col 1: Platform Info */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
              <div className="w-7 h-7 rounded-md bg-blue-600 text-white flex items-center justify-center">
                <BookOpen className="w-4 h-4" />
              </div>
              <span>DevBlog</span>
            </div>
            <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
              A modern, clean technical publication platform built as an academic frontend prototype for sharing developer guides and software insights.
            </p>
            <div className="text-xs text-slate-500 font-medium">
              Academic Project Submission • RCPIT
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Quick Navigation
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="#home" className="hover:text-blue-600 transition">
                  Home
                </a>
              </li>
              <li>
                <a href="#articles" className="hover:text-blue-600 transition">
                  Articles
                </a>
              </li>
              <li>
                <button
                  onClick={() => onActionClick('Opening Write Guide')}
                  className="hover:text-blue-600 transition"
                >
                  Publish an Article
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Topics */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Topics
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onActionClick('Category: Web Development')}
                  className="hover:text-blue-600 transition"
                >
                  Web Development (React / TS)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onActionClick('Category: Python')}
                  className="hover:text-blue-600 transition"
                >
                  Python & FastAPI
                </button>
              </li>
              <li>
                <button
                  onClick={() => onActionClick('Category: AI & Machine Learning')}
                  className="hover:text-blue-600 transition"
                >
                  AI / ML & LLMs
                </button>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom copyright row */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div>
            © {new Date().getFullYear()} DevBlog Frontend Prototype.
          </div>
          <div className="text-slate-400">
            Prepared for Academic Review & Evaluation
          </div>
        </div>

      </div>
    </footer>
  );
};
