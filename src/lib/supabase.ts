import { createClient } from '@supabase/supabase-js';
import { Article } from '../data/articles';
import { UserProfile } from '../data/mockSocialData';

export interface Profile {
  id: string;
  full_name: string | null;
  username: string | null;
  avatar_url: string | null;
  cover_url?: string | null;
  bio?: string | null;
  location?: string | null;
  website?: string | null;
  created_at: string;
}

export interface DbArticle {
  id: string;
  author_id: string | null;
  author_name: string | null;
  title: string;
  category: 'Web' | 'Python' | 'AI/ML';
  reading_time: string;
  excerpt: string;
  content?: string | null;
  cover_image?: string | null;
  views_count?: number;
  likes_count?: number;
  created_at: string;
  profiles?: Profile | null;
}

export interface DbComment {
  id: string;
  article_id: string;
  user_id: string;
  parent_id?: string | null;
  content: string;
  created_at: string;
  profiles?: Profile | null;
}

export interface DbNotification {
  id: string;
  recipient_id: string;
  actor_id: string;
  type: 'like' | 'comment' | 'follow';
  article_id?: string | null;
  read: boolean;
  created_at: string;
  actor_profile?: Profile | null;
  article?: { id: string; title: string } | null;
}

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Validates if real Supabase environment variables are provided
export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl.startsWith('http') &&
  !supabaseUrl.includes('your-supabase-url') &&
  !supabaseUrl.includes('your-project-ref')
);

// Central Supabase client instance
export const supabase = createClient(
  isSupabaseConfigured ? supabaseUrl : 'https://placeholder.supabase.co',
  isSupabaseConfigured ? supabaseAnonKey : 'placeholder-anon-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  }
);

export const CATEGORY_META: Record<Article['category'], { thumbnail: string; defaultTag: string }> = {
  Web: {
    thumbnail: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=80',
    defaultTag: 'Web Dev',
  },
  Python: {
    thumbnail: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80',
    defaultTag: 'Python',
  },
  'AI/ML': {
    thumbnail: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&auto=format&fit=crop&q=80',
    defaultTag: 'AI & ML',
  },
};

/**
 * Transforms a Supabase database article record to the front-end Article model.
 */
export const mapDbArticleToArticle = (dbArticle: DbArticle): Article => {
  const category = (dbArticle.category as Article['category']) || 'Web';
  const catMeta = CATEGORY_META[category] || CATEGORY_META.Web;

  let publishedAt = 'Today';
  if (dbArticle.created_at) {
    try {
      const d = new Date(dbArticle.created_at);
      publishedAt = d.toLocaleDateString('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric',
      });
    } catch {
      publishedAt = 'Recently';
    }
  }

  const authorName =
    dbArticle.author_name ||
    dbArticle.profiles?.full_name ||
    dbArticle.profiles?.username ||
    'Community Author';

  const authorUsername =
    dbArticle.profiles?.username ||
    authorName.toLowerCase().replace(/\s+/g, '_');

  return {
    id: dbArticle.id,
    title: dbArticle.title,
    excerpt: dbArticle.excerpt,
    content: dbArticle.content || dbArticle.excerpt || '',
    category: category,
    tag: catMeta.defaultTag,
    readTime: dbArticle.reading_time || '5 min read',
    publishedAt,
    thumbnail: dbArticle.cover_image || catMeta.thumbnail,
    cover_image: dbArticle.cover_image || catMeta.thumbnail,
    author_id: dbArticle.author_id || undefined,
    author: {
      id: dbArticle.author_id || undefined,
      name: authorName,
      username: authorUsername,
      role: 'Contributing Author',
      avatar:
        dbArticle.profiles?.avatar_url ||
        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
      bio: dbArticle.profiles?.bio || undefined,
      location: dbArticle.profiles?.location || undefined,
      website: dbArticle.profiles?.website || undefined,
    },
    views_count: dbArticle.views_count ?? 0,
    likes_count: dbArticle.likes_count ?? 0,
    comments_count: 0,
  };
};

/**
 * Maps Supabase Profile to UserProfile
 */
export const mapDbProfileToUserProfile = (
  profile: Profile,
  extraCounts?: { followers?: number; following?: number; articles?: number; likes?: number }
): UserProfile => {
  return {
    id: profile.id,
    full_name: profile.full_name || profile.username || 'Anonymous User',
    username: profile.username || 'user',
    avatar_url:
      profile.avatar_url ||
      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
    cover_url:
      profile.cover_url ||
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80',
    bio: profile.bio || 'Developer & writer on DevBlog.',
    location: profile.location || 'Remote',
    website: profile.website || 'https://devblog.io',
    created_at: profile.created_at || new Date().toISOString(),
    followersCount: extraCounts?.followers ?? 0,
    followingCount: extraCounts?.following ?? 0,
    articlesCount: extraCounts?.articles ?? 0,
    totalLikes: extraCounts?.likes ?? 0,
  };
};
