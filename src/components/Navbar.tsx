import React from 'react';
import { BookOpen, Search, Edit3, User, Menu, X } from 'lucide-react';

interface NavbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onActionClick: (action: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  searchQuery,
  onSearchChange,
  onActionClick,
}) => {
  const [mobileOpen, setMobileOpen] = React.useState(false);

  return (
    <nav className="sticky top-0 z-40 w-full bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo */}
          <div className="flex items-center gap-6">
            <a href="#home" className="flex items-center gap-2.5 text-slate-900 group">
              <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-sm">
                <BookOpen className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-lg tracking-tight text-slate-900">
                  DevBlog
                </span>
                <span className="text-[11px] text-slate-500 -mt-1 hidden sm:block">
                  Engineering Insights
                </span>
              </div>
            </a>

            {/* Desktop Link */}
            <a
              href="#articles"
              className="hidden md:inline-block text-sm font-medium text-slate-600 hover:text-blue-600 transition"
            >
              Articles
            </a>
          </div>

          {/* Search Input */}
          <div className="flex-1 max-w-md mx-2 sm:mx-6">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search articles by title, tag, or topic..."
                className="w-full pl-9 pr-4 py-1.5 text-sm bg-slate-50 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="hidden sm:flex items-center gap-3">
            <button
              onClick={() => onActionClick('Write Article')}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 hover:text-blue-600 transition"
            >
              <Edit3 className="w-4 h-4 text-slate-500" />
              <span>Write</span>
            </button>

            <button
              onClick={() => onActionClick('Sign In')}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-sm transition"
            >
              <User className="w-4 h-4" />
              <span>Sign In</span>
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex sm:hidden">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 rounded-lg text-slate-600 hover:bg-slate-100"
              aria-label="Toggle navigation menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>

        {/* Mobile menu dropdown */}
        {mobileOpen && (
          <div className="sm:hidden border-t border-slate-200 py-3 space-y-2">
            <a
              href="#articles"
              onClick={() => setMobileOpen(false)}
              className="block px-3 py-2 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              Articles
            </a>
            <div className="flex gap-2 pt-1">
              <button
                onClick={() => {
                  onActionClick('Write Article');
                  setMobileOpen(false);
                }}
                className="w-1/2 py-2 text-sm font-medium border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50"
              >
                Write
              </button>
              <button
                onClick={() => {
                  onActionClick('Sign In');
                  setMobileOpen(false);
                }}
                className="w-1/2 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Sign In
              </button>
            </div>
          </div>
        )}

      </div>
    </nav>
  );
};
