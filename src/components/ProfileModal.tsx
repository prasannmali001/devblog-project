import React, { useState } from 'react';
import {
  X,
  MapPin,
  Globe,
  Calendar,
  UserPlus,
  UserCheck,
  Edit3,
  BarChart2,
  BookOpen,
  Bookmark,
  Heart,
  Eye,
  ArrowRight,
  Trash2,
  ExternalLink,
} from 'lucide-react';
import { UserProfile } from '../data/mockSocialData';
import { Article } from '../data/articles';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  isOwnProfile: boolean;
  isFollowing: boolean;
  onToggleFollow: (userId: string, userName?: string) => void;
  onOpenEditProfile: () => void;
  onOpenAnalytics: () => void;
  userArticles: Article[];
  bookmarkedArticlesList: Article[];
  onOpenArticle: (article: Article) => void;
  onRemoveBookmark: (articleId: string) => void;
  onOpenAuth: () => void;
  showToast: (msg: string) => void;
  isAuthenticated: boolean;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  profile,
  isOwnProfile,
  isFollowing,
  onToggleFollow,
  onOpenEditProfile,
  onOpenAnalytics,
  userArticles,
  bookmarkedArticlesList,
  onOpenArticle,
  onRemoveBookmark,
  onOpenAuth,
  showToast,
  isAuthenticated,
}) => {
  const [activeTab, setActiveTab] = useState<'articles' | 'saved'>('articles');

  if (!isOpen) return null;

  const joinDateFormatted = (() => {
    try {
      return new Date(profile.created_at).toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return 'Recently';
    }
  })();

  const totalArticleLikes = userArticles.reduce((sum, a) => sum + (a.likes_count || 0), 0);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Floating Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 bg-white/80 hover:bg-white text-slate-700 hover:text-slate-900 rounded-full shadow-md backdrop-blur-sm transition"
          aria-label="Close profile"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Scrollable Container */}
        <div className="overflow-y-auto flex-1">
          {/* Hero Cover Banner */}
          <div className="relative h-44 sm:h-56 w-full bg-slate-200 overflow-hidden">
            <img
              src={
                profile.cover_url ||
                'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80'
              }
              alt="Profile Cover"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
          </div>

          {/* Profile Header & Stats */}
          <div className="px-6 sm:px-8 pb-6 relative">
            {/* Avatar & Action Button Row */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-16 sm:-mt-20 mb-4">
              {/* Avatar with fallback */}
              <div className="relative">
                <img
                  src={
                    profile.avatar_url ||
                    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80'
                  }
                  alt={profile.full_name}
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-4 border-white shadow-lg bg-white"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2.5">
                {isOwnProfile ? (
                  <>
                    <button
                      onClick={onOpenEditProfile}
                      className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg shadow-sm transition"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                      <span>Edit Profile</span>
                    </button>

                    <button
                      onClick={onOpenAnalytics}
                      className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition"
                    >
                      <BarChart2 className="w-3.5 h-3.5" />
                      <span>Writer Analytics</span>
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => {
                      if (!isAuthenticated) {
                        onOpenAuth();
                        showToast('Please sign in to follow authors');
                        return;
                      }
                      onToggleFollow(profile.id, profile.full_name);
                      showToast(
                        isFollowing
                          ? `Unfollowed @${profile.username}`
                          : `You are now following @${profile.username}!`
                      );
                    }}
                    className={`inline-flex items-center gap-1.5 px-5 py-2 text-xs font-semibold rounded-lg shadow-sm transition ${
                      isFollowing
                        ? 'bg-slate-100 text-slate-700 hover:bg-red-50 hover:text-red-600 border border-slate-300'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {isFollowing ? (
                      <>
                        <UserCheck className="w-4 h-4" />
                        <span>Following</span>
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4" />
                        <span>Follow Author</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Name, Username, Bio */}
            <div className="space-y-2 mb-6">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                  {profile.full_name}
                </h2>
                <span className="text-sm font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                  @{profile.username}
                </span>
              </div>

              <p className="text-sm text-slate-700 max-w-2xl leading-relaxed">
                {profile.bio || 'Software engineer and author on DevBlog.'}
              </p>

              {/* Location, Website, Join Date */}
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                {profile.location && (
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{profile.location}</span>
                  </span>
                )}

                {profile.website && (
                  <a
                    href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-blue-600 hover:underline font-medium"
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span>{profile.website.replace(/^https?:\/\//, '')}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}

                <span className="inline-flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>Joined {joinDateFormatted}</span>
                </span>
              </div>
            </div>

            {/* 4 Stats Counters */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-4 px-4 bg-slate-50 border border-slate-200 rounded-xl mb-6 text-center">
              <div>
                <div className="text-xl font-extrabold text-slate-900">
                  {userArticles.length}
                </div>
                <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mt-0.5">
                  Articles
                </div>
              </div>

              <div>
                <div className="text-xl font-extrabold text-slate-900">
                  {profile.followersCount}
                </div>
                <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mt-0.5">
                  Followers
                </div>
              </div>

              <div>
                <div className="text-xl font-extrabold text-slate-900">
                  {profile.followingCount}
                </div>
                <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mt-0.5">
                  Following
                </div>
              </div>

              <div>
                <div className="text-xl font-extrabold text-slate-900">
                  {totalArticleLikes > 0 ? totalArticleLikes : profile.totalLikes || 0}
                </div>
                <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mt-0.5">
                  Total Likes
                </div>
              </div>
            </div>

            {/* Profile Tabs */}
            <div className="flex items-center gap-6 border-b border-slate-200 mb-6">
              <button
                onClick={() => setActiveTab('articles')}
                className={`pb-3 text-sm font-semibold flex items-center gap-2 transition border-b-2 ${
                  activeTab === 'articles'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>Articles ({userArticles.length})</span>
              </button>

              {isOwnProfile && (
                <button
                  onClick={() => setActiveTab('saved')}
                  className={`pb-3 text-sm font-semibold flex items-center gap-2 transition border-b-2 ${
                    activeTab === 'saved'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <Bookmark className="w-4 h-4" />
                  <span>Saved / Bookmarks ({bookmarkedArticlesList.length})</span>
                </button>
              )}
            </div>

            {/* Tab 1: Articles List */}
            {activeTab === 'articles' && (
              <div className="space-y-4">
                {userArticles.length === 0 ? (
                  <div className="text-center py-12 bg-slate-50 border border-slate-200 rounded-xl">
                    <BookOpen className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                    <p className="text-sm font-medium text-slate-700">No articles published yet.</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {isOwnProfile
                        ? 'Share your engineering expertise by publishing your first article.'
                        : 'This author has not published any articles yet.'}
                    </p>
                  </div>
                ) : (
                  userArticles.map((art) => (
                    <div
                      key={art.id}
                      className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-white border border-slate-200 rounded-xl hover:border-slate-300 hover:shadow-sm transition"
                    >
                      <div className="flex items-start sm:items-center gap-3.5 flex-1 min-w-0">
                        <img
                          src={art.thumbnail}
                          alt={art.title}
                          className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg object-cover border border-slate-200 shrink-0"
                        />
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            <span className="px-2 py-0.5 bg-blue-50 text-blue-700 font-semibold rounded">
                              {art.category}
                            </span>
                            <span>•</span>
                            <span>{art.readTime}</span>
                          </div>
                          <h4
                            onClick={() => {
                              onClose();
                              onOpenArticle(art);
                            }}
                            className="text-base font-bold text-slate-900 truncate hover:text-blue-600 transition cursor-pointer"
                          >
                            {art.title}
                          </h4>
                          <p className="text-xs text-slate-500 line-clamp-1">
                            {art.excerpt}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                        <div className="flex items-center gap-3 text-xs text-slate-500">
                          <span className="inline-flex items-center gap-1">
                            <Eye className="w-3.5 h-3.5" />
                            <span>{art.views_count || 0}</span>
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <Heart className="w-3.5 h-3.5 text-red-500" />
                            <span>{art.likes_count || 0}</span>
                          </span>
                        </div>

                        <button
                          onClick={() => {
                            onClose();
                            onOpenArticle(art);
                          }}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition"
                        >
                          <span>Read</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Tab 2: Saved / Bookmarks List */}
            {activeTab === 'saved' && isOwnProfile && (
              <div className="space-y-4">
                {bookmarkedArticlesList.length === 0 ? (
                  <div className="text-center py-12 bg-slate-50 border border-slate-200 rounded-xl">
                    <Bookmark className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                    <p className="text-sm font-medium text-slate-700">No saved articles yet.</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Click the bookmark icon on any article to save it for reading later.
                    </p>
                  </div>
                ) : (
                  bookmarkedArticlesList.map((art) => (
                    <div
                      key={art.id}
                      className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-white border border-slate-200 rounded-xl hover:shadow-sm transition"
                    >
                      <div className="flex items-start sm:items-center gap-3.5 flex-1 min-w-0">
                        <img
                          src={art.thumbnail}
                          alt={art.title}
                          className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg object-cover border border-slate-200 shrink-0"
                        />
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            <span className="px-2 py-0.5 bg-blue-50 text-blue-700 font-semibold rounded">
                              {art.category}
                            </span>
                            <span>•</span>
                            <span>by {art.author.name}</span>
                          </div>
                          <h4
                            onClick={() => {
                              onClose();
                              onOpenArticle(art);
                            }}
                            className="text-base font-bold text-slate-900 truncate hover:text-blue-600 transition cursor-pointer"
                          >
                            {art.title}
                          </h4>
                          <p className="text-xs text-slate-500 line-clamp-1">
                            {art.excerpt}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-2.5 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                        <button
                          onClick={() => {
                            onRemoveBookmark(art.id);
                            showToast('Bookmark removed');
                          }}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Remove bookmark"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => {
                            onClose();
                            onOpenArticle(art);
                          }}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition"
                        >
                          <span>Read</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
