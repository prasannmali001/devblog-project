import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { ArticleGrid } from './components/ArticleGrid';
import { Footer } from './components/Footer';
import { Toast } from './components/Toast';
import { articles } from './data/articles';

export const App: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastTimer, setToastTimer] = useState<number | null>(null);

  const handleActionClick = (actionName: string) => {
    if (toastTimer) {
      window.clearTimeout(toastTimer);
    }
    setToastMessage(`Preview Mode: ${actionName}`);
    const timer = window.setTimeout(() => {
      setToastMessage(null);
    }, 3000);
    setToastTimer(timer);
  };

  const handleCloseToast = () => {
    if (toastTimer) {
      window.clearTimeout(toastTimer);
    }
    setToastMessage(null);
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans antialiased">
      {/* 1. Navbar */}
      <Navbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onActionClick={handleActionClick}
      />

      {/* Main content */}
      <main className="flex-grow">
        {/* 2. Hero Section */}
        <Hero onActionClick={handleActionClick} />

        {/* 3. 3-Column Article Grid with Category Filters */}
        <ArticleGrid
          articles={articles}
          searchQuery={searchQuery}
          onActionClick={handleActionClick}
        />
      </main>

      {/* 4. Footer */}
      <Footer onActionClick={handleActionClick} />

      {/* Preview Feedback Toast */}
      <Toast message={toastMessage} onClose={handleCloseToast} />
    </div>
  );
};

export default App;
