import React, { useState } from 'react';
import { Article, categories } from '../data/articles';
import { Clock, ArrowRight } from 'lucide-react';

interface ArticleGridProps {
  articles: Article[];
  searchQuery: string;
  onActionClick: (action: string) => void;
}

export const ArticleGrid: React.FC<ArticleGridProps> = ({
  articles,
  searchQuery,
  onActionClick,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Filter articles based on active category and search query
  const filteredArticles = articles.filter((article) => {
    const matchesCategory =
      selectedCategory === 'All' || article.category === selectedCategory;
    const query = searchQuery.trim().toLowerCase();
    const matchesSearch =
      query === '' ||
      article.title.toLowerCase().includes(query) ||
      article.excerpt.toLowerCase().includes(query) ||
      article.tag.toLowerCase().includes(query) ||
      article.author.name.toLowerCase().includes(query);

    return matchesCategory && matchesSearch;
  });

  return (
    <section id="articles" className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Filter Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              Featured Articles
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">
              Showing {filteredArticles.length} publications
            </p>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            {categories.map((cat) => {
              const isActive = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* 3-Column Articles Grid */}
        {filteredArticles.length === 0 ? (
          <div className="text-center py-16 bg-slate-50 rounded-xl border border-slate-200 my-6">
            <p className="text-base text-slate-600 font-medium">
              No articles found matching "{searchQuery}".
            </p>
            <button
              onClick={() => setSelectedCategory('All')}
              className="mt-3 px-4 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100"
            >
              Reset Category Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-8">
            {filteredArticles.map((article) => (
              <article
                key={article.id}
                className="flex flex-col justify-between bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md hover:border-slate-300 transition duration-200 overflow-hidden"
              >
                {/* Image Thumbnail */}
                <div className="relative h-48 w-full bg-slate-100 overflow-hidden">
                  <img
                    src={article.thumbnail}
                    alt={article.title}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-1 text-xs font-semibold bg-white/95 text-blue-700 rounded-md shadow-sm border border-slate-200/60">
                      {article.tag}
                    </span>
                  </div>
                </div>

                {/* Card Content Body */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div className="space-y-2.5">
                    <div className="flex items-center text-xs text-slate-500 gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{article.readTime}</span>
                      <span>•</span>
                      <span>{article.category}</span>
                    </div>

                    <h3 className="text-lg font-bold text-slate-900 leading-snug line-clamp-2 hover:text-blue-600 transition-colors">
                      {article.title}
                    </h3>

                    <p className="text-sm text-slate-600 leading-relaxed line-clamp-3">
                      {article.excerpt}
                    </p>
                  </div>

                  {/* Author & Date Footer */}
                  <div className="pt-5 mt-4 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={article.author.avatar}
                        alt={article.author.name}
                        className="w-8 h-8 rounded-full object-cover border border-slate-200"
                      />
                      <div>
                        <div className="text-xs font-semibold text-slate-900">
                          {article.author.name}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {article.publishedAt}
                        </div>
                      </div>
                    </div>

                    {/* Read Article Button */}
                    <button
                      onClick={() => onActionClick(`Reading "${article.title}"`)}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline transition"
                    >
                      <span>Read</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

      </div>
    </section>
  );
};
