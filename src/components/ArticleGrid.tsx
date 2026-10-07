import React, { useState } from 'react';
import { Article, categories } from '../data/articles';
import {
  Clock,
  ArrowRight,
  Heart,
  MessageCircle,
  Eye,
  Bookmark,
} from 'lucide-react';

interface ArticleGridProps {
  articles: Article[];
  searchQuery: string;
  onOpenArticle: (article: Article) => void;
  onOpenProfile: (usernameOrId: string) => void;
  likedArticles: Set<string>;
  bookmarkedArticles: Set<string>;
  onToggleLike: (articleId: string) => void;
  onToggleBookmark: (articleId: string) => void;
  getArticleCommentsCount: (articleId: string) => number;
  onOpenAuth: () => void;
  showToast: (msg: string) => void;
  isAuthenticated: boolean;
}

export const ArticleGrid: React.FC<ArticleGridProps> = ({
  articles,
  searchQuery,
  onOpenArticle,
  onOpenProfile,
  likedArticles,
  bookmarkedArticles,
  onToggleLike,
  onToggleBookmark,
  getArticleCommentsCount,
  onOpenAuth,
  showToast,
  isAuthenticated,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Filter articles based on category and expanded search query
  const filteredArticles = articles.filter((article) => {
    const matchesCategory =
      selectedCategory === 'All' || article.category === selectedCategory;
    const query = searchQuery.trim().toLowerCase();
    const matchesSearch =
      query === '' ||
      article.title.toLowerCase().includes(query) ||
      article.excerpt.toLowerCase().includes(query) ||
      (article.content && article.content.toLowerCase().includes(query)) ||
      article.tag.toLowerCase().includes(query) ||
      article.author.name.toLowerCase().includes(query) ||
      (article.author.username &&
        article.author.username.toLowerCase().includes(query.replace('@', '')));

    return matchesCategory && matchesSearch;
  });

  return (
    <section id="articles" className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Filter Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                Featured Publications
              </h2>
              <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 text-xs font-bold rounded-full border border-blue-200">
                {filteredArticles.length}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Curated engineering guides, tutorials, and architecture deep-dives.
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
                  {cat === 'All' ? 'All Topics' : cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* 3-Column Articles Grid */}
        {filteredArticles.length === 0 ? (
          <div className="text-center py-16 bg-slate-50 rounded-2xl border border-slate-200 my-6 space-y-3">
            <p className="text-base text-slate-700 font-semibold">
              No articles found matching "{searchQuery}".
            </p>
            <p className="text-xs text-slate-500">
              Try searching with another keyword or reset the category filters.
            </p>
            <button
              onClick={() => setSelectedCategory('All')}
              className="mt-2 px-4 py-2 text-xs font-semibold text-blue-600 bg-white border border-slate-300 rounded-lg hover:bg-blue-50 transition"
            >
              Reset Category Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-8">
            {filteredArticles.map((article) => {
              const isLiked = likedArticles.has(article.id);
              const isBookmarked = bookmarkedArticles.has(article.id);
              const commentsCount = getArticleCommentsCount(article.id);

              return (
                <article
                  key={article.id}
                  className="group flex flex-col justify-between bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md hover:border-slate-300 transition duration-200 overflow-hidden"
                >
                  {/* Image Thumbnail with Overlay Badges */}
                  <div
                    onClick={() => onOpenArticle(article)}
                    className="relative h-48 w-full bg-slate-100 overflow-hidden cursor-pointer"
                  >
                    <img
                      src={article.cover_image || article.thumbnail}
                      alt={article.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                    
                    {/* Category Tag Badge */}
                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-1 text-xs font-bold bg-white/95 text-blue-700 rounded-lg shadow-sm border border-slate-200/80 backdrop-blur-sm">
                        {article.tag}
                      </span>
                    </div>

                    {/* Bookmark Quick Action Button */}
                    <div className="absolute top-3 right-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!isAuthenticated) {
                            onOpenAuth();
                            showToast('Please sign in to save articles');
                            return;
                          }
                          onToggleBookmark(article.id);
                          showToast(
                            isBookmarked
                              ? 'Removed from reading list'
                              : 'Saved to your reading list!'
                          );
                        }}
                        className={`p-1.5 rounded-lg backdrop-blur-md transition ${
                          isBookmarked
                            ? 'bg-blue-600 text-white shadow-md'
                            : 'bg-white/90 text-slate-700 hover:bg-white hover:text-blue-600'
                        }`}
                        title={isBookmarked ? 'Saved to bookmarks' : 'Bookmark article'}
                      >
                        <Bookmark
                          className={`w-4 h-4 ${isBookmarked ? 'fill-white' : ''}`}
                        />
                      </button>
                    </div>
                  </div>

                  {/* Card Content Body */}
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div className="space-y-2.5">
                      <div className="flex items-center text-xs text-slate-500 gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{article.readTime}</span>
                        <span>•</span>
                        <span>{article.category}</span>
                      </div>

                      <h3
                        onClick={() => onOpenArticle(article)}
                        className="text-base font-bold text-slate-900 leading-snug line-clamp-2 group-hover:text-blue-600 transition-colors cursor-pointer"
                      >
                        {article.title}
                      </h3>

                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed line-clamp-3">
                        {article.excerpt}
                      </p>
                    </div>

                    {/* Footer Row: Author & Social Metrics */}
                    <div className="pt-4 mt-4 border-t border-slate-100 space-y-3">
                      {/* Author Info */}
                      <div className="flex items-center justify-between">
                        <div
                          onClick={() =>
                            onOpenProfile(
                              article.author.username || article.author_id || article.author.name
                            )
                          }
                          className="flex items-center gap-2.5 cursor-pointer group/author"
                        >
                          <img
                            src={article.author.avatar}
                            alt={article.author.name}
                            className="w-8 h-8 rounded-full object-cover border border-slate-200 group-hover/author:border-blue-600 transition"
                          />
                          <div>
                            <div className="text-xs font-bold text-slate-900 group-hover/author:text-blue-600 transition">
                              {article.author.name}
                            </div>
                            <div className="text-[10px] text-slate-500">
                              @{article.author.username || 'author'}
                            </div>
                          </div>
                        </div>

                        {/* Read Full Article Trigger */}
                        <button
                          onClick={() => onOpenArticle(article)}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline transition"
                        >
                          <span>Read</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Social Metric Badges Bar */}
                      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                        <div className="flex items-center gap-3">
                          {/* Views */}
                          <span className="inline-flex items-center gap-1">
                            <Eye className="w-3.5 h-3.5 text-slate-400" />
                            <span>{article.views_count || 0}</span>
                          </span>

                          {/* Likes Button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (!isAuthenticated) {
                                onOpenAuth();
                                showToast('Please sign in to like articles');
                                return;
                              }
                              onToggleLike(article.id);
                            }}
                            className={`inline-flex items-center gap-1 transition ${
                              isLiked
                                ? 'text-red-600 font-semibold'
                                : 'hover:text-red-600 text-slate-500'
                            }`}
                          >
                            <Heart
                              className={`w-3.5 h-3.5 ${
                                isLiked ? 'fill-red-600 text-red-600' : ''
                              }`}
                            />
                            <span>{article.likes_count || 0}</span>
                          </button>

                          {/* Comments */}
                          <span className="inline-flex items-center gap-1">
                            <MessageCircle className="w-3.5 h-3.5 text-slate-400" />
                            <span>{commentsCount}</span>
                          </span>
                        </div>

                        <span className="text-[10px] text-slate-400">
                          {article.publishedAt}
                        </span>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

      </div>
    </section>
  );
};
