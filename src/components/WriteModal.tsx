import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  PenTool,
  BookOpen,
  User,
  Tag,
  AlertCircle,
  Loader2,
  Lock,
  ShieldAlert,
  Image as ImageIcon,
  Sparkles,
  Clock,
} from 'lucide-react';
import { Article } from '../data/articles';
import { supabase, isSupabaseConfigured, CATEGORY_META, mapDbArticleToArticle } from '../lib/supabase';
import { UserProfile } from '../data/mockSocialData';
import { User as SupabaseUser } from '@supabase/supabase-js';

interface WriteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPublish: (newArticle: Article) => void;
  currentUser?: SupabaseUser | null;
  currentProfile?: UserProfile;
  onError?: (message: string) => void;
}

const PRESET_COVERS: Record<Article['category'], string[]> = {
  Web: [
    'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=80',
  ],
  Python: [
    'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=800&auto=format&fit=crop&q=80',
  ],
  'AI/ML': [
    'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&auto=format&fit=crop&q=80',
  ],
};

export const WriteModal: React.FC<WriteModalProps> = ({
  isOpen,
  onClose,
  onPublish,
  currentUser,
  currentProfile,
  onError,
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<Article['category']>('Web');
  const [coverImage, setCoverImage] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Derive locked author display name
  const authorDisplayName = useMemo(() => {
    return (
      currentProfile?.full_name ||
      currentUser?.user_metadata?.full_name ||
      currentUser?.user_metadata?.username ||
      currentUser?.email?.split('@')[0] ||
      'Guest Author'
    );
  }, [currentProfile, currentUser]);

  const authorUsername = useMemo(() => {
    return (
      currentProfile?.username ||
      currentUser?.user_metadata?.username ||
      currentUser?.email?.split('@')[0]?.toLowerCase().replace(/[^a-z0-9_]/g, '') ||
      'author'
    );
  }, [currentProfile, currentUser]);

  // Compute word count and reading time dynamically in the background
  const computedMetrics = useMemo(() => {
    const combinedText = `${title} ${excerpt} ${content}`;
    const words = combinedText.trim().split(/\s+/).filter(Boolean).length;
    const minutes = Math.max(1, Math.ceil(words / 200));
    return {
      wordCount: words,
      readingTime: `${minutes} min read`,
    };
  }, [title, excerpt, content]);

  // Set default cover when category changes
  useEffect(() => {
    if (!coverImage || PRESET_COVERS.Web.includes(coverImage) || PRESET_COVERS.Python.includes(coverImage) || PRESET_COVERS['AI/ML'].includes(coverImage)) {
      setCoverImage(PRESET_COVERS[category][0]);
    }
  }, [category]);

  // Reset errors when opened
  useEffect(() => {
    if (isOpen) {
      setErrorMessage(null);
    }
  }, [isOpen]);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const resetForm = () => {
    setTitle('');
    setCategory('Web');
    setCoverImage('');
    setExcerpt('');
    setContent('');
    setErrorMessage(null);
    setIsSubmitting(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !excerpt.trim()) {
      setErrorMessage('Please fill in both the Title and Short Description.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    // Verify authentication
    let activeUser: SupabaseUser | null = currentUser || null;
    if (!activeUser && isSupabaseConfigured) {
      const { data: authData } = await supabase.auth.getUser();
      activeUser = authData?.user ?? null;
    }

    if (!activeUser && isSupabaseConfigured) {
      const authErr = 'Unauthorized: Please sign in or create an account to publish.';
      setErrorMessage(authErr);
      if (onError) onError(authErr);
      setIsSubmitting(false);
      return;
    }

    const calculatedReadTime = computedMetrics.readingTime;
    const catMeta = CATEGORY_META[category] || CATEGORY_META.Web;
    const finalCover = coverImage.trim() || catMeta.thumbnail;
    const finalContent = content.trim() || excerpt.trim();

    // 1. Supabase Database insertion
    if (isSupabaseConfigured && activeUser?.id) {
      try {
        const { data, error } = await supabase
          .from('articles')
          .insert([
            {
              title: title.trim(),
              category,
              reading_time: calculatedReadTime,
              excerpt: excerpt.trim(),
              content: finalContent,
              cover_image: finalCover,
              author_id: activeUser.id,
              author_name: authorDisplayName,
              views_count: 0,
              likes_count: 0,
            },
          ])
          .select('*, profiles(*)')
          .single();

        if (error) {
          console.error('Supabase article insert error:', error);
          const isRlsError =
            error.code === '42501' ||
            error.message?.toLowerCase().includes('row-level security');
          const errText = isRlsError
            ? 'Unauthorized: You must be logged in to publish.'
            : error.message || 'Failed to publish article to the database.';

          setErrorMessage(errText);
          if (onError) onError(errText);
          setIsSubmitting(false);
          return;
        }

        if (data) {
          const formattedArticle = mapDbArticleToArticle(data);
          onPublish(formattedArticle);
          resetForm();
          onClose();
          return;
        }
      } catch (err: any) {
        console.error('Unexpected publish error:', err);
        const errText = err?.message || 'Failed to publish article.';
        setErrorMessage(errText);
        if (onError) onError(errText);
        setIsSubmitting(false);
        return;
      }
    } else {
      // 2. Local Fallback & Prototype Mode
      const fallbackArticle: Article = {
        id: `article-${Date.now()}`,
        title: title.trim(),
        category,
        excerpt: excerpt.trim(),
        content: finalContent,
        tag: catMeta.defaultTag,
        readTime: calculatedReadTime,
        publishedAt: 'Today',
        thumbnail: finalCover,
        cover_image: finalCover,
        author_id: currentProfile?.id || activeUser?.id || 'current-user',
        author: {
          id: currentProfile?.id || activeUser?.id || 'current-user',
          name: authorDisplayName,
          username: authorUsername,
          role: 'Contributing Author',
          avatar:
            currentProfile?.avatar_url ||
            activeUser?.user_metadata?.avatar_url ||
            'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
          bio: currentProfile?.bio || 'Software engineer & tech writer.',
          location: currentProfile?.location || 'San Francisco, CA',
          website: currentProfile?.website || 'https://devblog.io',
        },
        views_count: 0,
        likes_count: 0,
        comments_count: 0,
      };

      onPublish(fallbackArticle);
      resetForm();
      onClose();
    }
  };

  const isUnauthenticated = !currentUser && isSupabaseConfigured;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/70 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm">
              <PenTool className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Write & Publish Article
              </h3>
              <p className="text-xs text-slate-500">
                Publish technical tutorials, guides, and engineering deep-dives.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 rounded-lg transition"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          {/* Unauthenticated Warning */}
          {isUnauthenticated && (
            <div className="flex items-center gap-2.5 p-3 text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg animate-fade-in">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Authentication required: You must be signed in to publish an article.</span>
            </div>
          )}

          {/* Error Notice */}
          {errorMessage && (
            <div className="flex items-start gap-2.5 p-3 text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg animate-fade-in">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <div className="flex-1">{errorMessage}</div>
            </div>
          )}

          {/* Article Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Article Title <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <BookOpen className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                disabled={isUnauthenticated}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Architecting Scalable Microservices with FastAPI and Celery"
                className="w-full pl-9 pr-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white disabled:opacity-60 disabled:cursor-not-allowed transition"
              />
            </div>
          </div>

          {/* Category & Cover Image URL Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Category selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Category <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Tag className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <select
                  value={category}
                  disabled={isUnauthenticated}
                  onChange={(e) => setCategory(e.target.value as Article['category'])}
                  className="w-full pl-9 pr-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white disabled:opacity-60 disabled:cursor-not-allowed transition cursor-pointer font-medium"
                >
                  <option value="Web">Web Development</option>
                  <option value="Python">Python & Backend</option>
                  <option value="AI/ML">AI & Machine Learning</option>
                </select>
              </div>
            </div>

            {/* Cover Image URL */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Cover Image URL
              </label>
              <div className="relative">
                <ImageIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="url"
                  disabled={isUnauthenticated}
                  value={coverImage}
                  onChange={(e) => setCoverImage(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full pl-9 pr-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white disabled:opacity-60 disabled:cursor-not-allowed transition"
                />
              </div>
            </div>
          </div>

          {/* Quick preset cover picker buttons */}
          <div className="flex items-center gap-2 pt-0.5">
            <span className="text-[11px] font-medium text-slate-500">Preset Covers:</span>
            <div className="flex items-center gap-1.5 overflow-x-auto">
              {PRESET_COVERS[category].map((presetUrl, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCoverImage(presetUrl)}
                  className={`w-10 h-7 rounded border overflow-hidden shrink-0 transition ${
                    coverImage === presetUrl
                      ? 'ring-2 ring-blue-600 border-blue-600'
                      : 'border-slate-200 opacity-70 hover:opacity-100'
                  }`}
                  title={`Select preset cover ${idx + 1}`}
                >
                  <img src={presetUrl} alt="preset" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Author Name - Strictly Locked to Authenticated Profile */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-700">
                Author
              </label>
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500">
                <Lock className="w-3 h-3 text-slate-400" />
                <span>Locked to @{authorUsername}</span>
              </span>
            </div>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                readOnly
                value={`${authorDisplayName} (@${authorUsername})`}
                className="w-full pl-9 pr-3.5 py-2 text-sm bg-slate-100 border border-slate-200 rounded-lg text-slate-700 cursor-not-allowed select-none font-medium focus:outline-none"
              />
            </div>
          </div>

          {/* Short Excerpt / Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Short Description / Excerpt <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              rows={2}
              disabled={isUnauthenticated}
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="A concise 1-2 sentence executive summary displayed on cards and search..."
              className="w-full p-3 text-sm bg-slate-50 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white disabled:opacity-60 disabled:cursor-not-allowed transition resize-none"
            />
          </div>

          {/* Full Article Content Body */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-700">
                Full Article Content (Markdown Supported)
              </label>
              <div className="inline-flex items-center gap-1.5 text-[11px] text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md font-medium border border-blue-200/60">
                <Clock className="w-3 h-3 text-blue-600" />
                <span>Auto-computed: {computedMetrics.readingTime} ({computedMetrics.wordCount} words)</span>
              </div>
            </div>
            <div className="relative">
              <textarea
                rows={7}
                disabled={isUnauthenticated}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your in-depth guide, code blocks, architecture explanations, or markdown here..."
                className="w-full p-3 font-mono text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white disabled:opacity-60 disabled:cursor-not-allowed transition"
              />
            </div>
          </div>

          {/* Submit Action Button */}
          <div className="pt-2 flex items-center justify-between gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting || isUnauthenticated}
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-sm transition"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Publishing Article...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Publish Article</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
