import React, { useState } from 'react';
import {
  X,
  BarChart2,
  TrendingUp,
  Eye,
  Heart,
  MessageCircle,
  BookOpen,
  ArrowRight,
  Sparkles,
  Award,
  Search,
} from 'lucide-react';
import { Article } from '../data/articles';
import { UserProfile } from '../data/mockSocialData';

interface AnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentProfile: UserProfile;
  analyticsData: {
    totalArticles: number;
    totalViews: number;
    totalLikes: number;
    totalComments: number;
    avgViewsPerArticle: number;
    avgLikesPerArticle: number;
    engagementRate: string;
    articles: Article[];
  };
  getArticleCommentsCount: (articleId: string) => number;
  onOpenArticle: (article: Article) => void;
  onOpenWrite: () => void;
}

export const AnalyticsModal: React.FC<AnalyticsModalProps> = ({
  isOpen,
  onClose,
  currentProfile,
  analyticsData,
  getArticleCommentsCount,
  onOpenArticle,
  onOpenWrite,
}) => {
  const [filterQuery, setFilterQuery] = useState('');

  if (!isOpen) return null;

  const filteredArticles = analyticsData.articles.filter(
    (a) =>
      a.title.toLowerCase().includes(filterQuery.toLowerCase()) ||
      a.category.toLowerCase().includes(filterQuery.toLowerCase())
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-4xl bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm">
              <BarChart2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900">
                  Writer Analytics Dashboard
                </h3>
                <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-[11px] font-bold rounded">
                  Creator Studio
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Performance metrics for @{currentProfile.username} ({currentProfile.full_name})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 sm:p-8 space-y-8 overflow-y-auto flex-1">
          {/* 4 Summary Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Total Articles */}
            <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-sm space-y-2 hover:border-slate-300 transition">
              <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
                <span>Total Articles</span>
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                  <BookOpen className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-extrabold text-slate-900">
                {analyticsData.totalArticles}
              </div>
              <div className="text-xs text-slate-500 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>Published publications</span>
              </div>
            </div>

            {/* Card 2: Total Views */}
            <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-sm space-y-2 hover:border-slate-300 transition">
              <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
                <span>Total Views</span>
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                  <Eye className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-extrabold text-slate-900">
                {analyticsData.totalViews.toLocaleString()}
              </div>
              <div className="text-xs text-slate-500">
                Avg. ~{analyticsData.avgViewsPerArticle} views / article
              </div>
            </div>

            {/* Card 3: Total Likes */}
            <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-sm space-y-2 hover:border-slate-300 transition">
              <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
                <span>Total Likes</span>
                <div className="p-2 bg-red-50 text-red-600 rounded-lg">
                  <Heart className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-extrabold text-slate-900">
                {analyticsData.totalLikes.toLocaleString()}
              </div>
              <div className="text-xs text-slate-500">
                Avg. ~{analyticsData.avgLikesPerArticle} likes / article
              </div>
            </div>

            {/* Card 4: Comments & Engagement */}
            <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-sm space-y-2 hover:border-slate-300 transition">
              <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
                <span>Discussions</span>
                <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                  <MessageCircle className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-extrabold text-slate-900">
                {analyticsData.totalComments}
              </div>
              <div className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>{analyticsData.engagementRate}% engagement rate</span>
              </div>
            </div>
          </div>

          {/* Article Performance Table */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="text-base font-bold text-slate-900">
                  Article Performance Breakdown
                </h4>
                <p className="text-xs text-slate-500">
                  Track individual views, reactions, and discussions.
                </p>
              </div>

              {/* Table Search */}
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={filterQuery}
                  onChange={(e) => setFilterQuery(e.target.value)}
                  placeholder="Filter articles..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {analyticsData.articles.length === 0 ? (
              <div className="text-center py-12 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <Award className="w-10 h-10 text-slate-400 mx-auto" />
                <p className="text-sm font-semibold text-slate-700">No authored articles found.</p>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Start writing and publishing articles to begin collecting real-time performance and audience engagement metrics.
                </p>
                <button
                  onClick={() => {
                    onClose();
                    onOpenWrite();
                  }}
                  className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Write Your First Article</span>
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto border border-slate-200 rounded-xl shadow-sm">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
                      <th className="py-3 px-4">Article Title</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Published</th>
                      <th className="py-3 px-4 text-center">Views</th>
                      <th className="py-3 px-4 text-center">Likes</th>
                      <th className="py-3 px-4 text-center">Comments</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {filteredArticles.map((art) => {
                      const commentsCount = getArticleCommentsCount(art.id);
                      return (
                        <tr key={art.id} className="hover:bg-slate-50 transition">
                          <td className="py-3.5 px-4 font-semibold text-slate-900 max-w-xs">
                            <div className="truncate" title={art.title}>
                              {art.title}
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="px-2 py-0.5 bg-blue-50 text-blue-700 font-semibold rounded text-[10px]">
                              {art.category}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                            {art.publishedAt}
                          </td>
                          <td className="py-3.5 px-4 text-center font-bold text-slate-800">
                            {art.views_count || 0}
                          </td>
                          <td className="py-3.5 px-4 text-center font-bold text-red-600">
                            {art.likes_count || 0}
                          </td>
                          <td className="py-3.5 px-4 text-center font-bold text-purple-600">
                            {commentsCount}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <button
                              onClick={() => {
                                onClose();
                                onOpenArticle(art);
                              }}
                              className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline"
                            >
                              <span>View</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Writer Insights Tips */}
          <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-blue-900">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span>Creator Growth Tips</span>
            </div>
            <p className="text-xs text-blue-800 leading-relaxed">
              Articles with comprehensive code snippets and clear headings receive <strong>2.4x more engagement and bookmarks</strong>. Respond to comments within the first 24 hours to foster active developer discussions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
