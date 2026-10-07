-- =====================================================================
-- DevBlog (Project 5) Supabase Complete Schema & Social Migration
-- Includes: profiles, articles, follows, article_likes, comments,
--           bookmarks, notifications, Row Level Security (RLS),
--           and automated database triggers.
-- =====================================================================

-- Enable pgcrypto for UUID generation if not already enabled
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================================
-- 1. Profiles Table (Linked to auth.users)
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  username TEXT UNIQUE,
  avatar_url TEXT,
  cover_url TEXT,
  bio TEXT,
  location TEXT,
  website TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Ensure newly added columns exist if table was already created
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS website TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS cover_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now());

-- =====================================================================
-- 2. Articles Table
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  author_name TEXT,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  reading_time TEXT DEFAULT '5 min read',
  excerpt TEXT NOT NULL,
  content TEXT,
  cover_image TEXT,
  views_count INT NOT NULL DEFAULT 0,
  likes_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Ensure newly added columns exist if table was already created
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS content TEXT;
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS cover_image TEXT;
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS views_count INT NOT NULL DEFAULT 0;
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS likes_count INT NOT NULL DEFAULT 0;

-- Indices for performance
CREATE INDEX IF NOT EXISTS idx_articles_author_id ON public.articles(author_id);
CREATE INDEX IF NOT EXISTS idx_articles_category ON public.articles(category);
CREATE INDEX IF NOT EXISTS idx_articles_created_at ON public.articles(created_at DESC);

-- =====================================================================
-- 3. Follows Table (Follower -> Following relationships)
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.follows (
  follower_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  following_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  PRIMARY KEY (follower_id, following_id)
);

CREATE INDEX IF NOT EXISTS idx_follows_follower ON public.follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following ON public.follows(following_id);

-- =====================================================================
-- 4. Article Likes Table
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.article_likes (
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  article_id UUID REFERENCES public.articles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  PRIMARY KEY (user_id, article_id)
);

CREATE INDEX IF NOT EXISTS idx_article_likes_user ON public.article_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_article_likes_article ON public.article_likes(article_id);

-- =====================================================================
-- 5. Comments Table (Supports 1-level or multi-level nested replies)
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_comments_article_id ON public.comments(article_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON public.comments(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON public.comments(parent_id);

-- =====================================================================
-- 6. Bookmarks Table (Saved articles for reading later)
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.bookmarks (
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  article_id UUID REFERENCES public.articles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  PRIMARY KEY (user_id, article_id)
);

CREATE INDEX IF NOT EXISTS idx_bookmarks_user ON public.bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_article ON public.bookmarks(article_id);

-- =====================================================================
-- 7. Notifications Table
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  actor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('like', 'comment', 'follow')),
  article_id UUID REFERENCES public.articles(id) ON DELETE CASCADE,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON public.notifications(recipient_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(recipient_id, read);

-- =====================================================================
-- 8. Enable Row Level Security (RLS) on all tables
-- =====================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.article_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- =====================================================================
-- 9. RLS Policies
-- =====================================================================

-- --- PROFILES ---
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone."
  ON public.profiles FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can insert their own profile." ON public.profiles;
CREATE POLICY "Users can insert their own profile."
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update only their own profile." ON public.profiles;
CREATE POLICY "Users can update only their own profile."
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- --- ARTICLES ---
DROP POLICY IF EXISTS "Articles are viewable by everyone." ON public.articles;
CREATE POLICY "Articles are viewable by everyone."
  ON public.articles FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert articles." ON public.articles;
CREATE POLICY "Authenticated users can insert articles."
  ON public.articles FOR INSERT
  WITH CHECK (auth.uid() = author_id);

DROP POLICY IF EXISTS "Authors can update their own articles." ON public.articles;
CREATE POLICY "Authors can update their own articles."
  ON public.articles FOR UPDATE
  USING (auth.uid() = author_id);

DROP POLICY IF EXISTS "Authors can delete their own articles." ON public.articles;
CREATE POLICY "Authors can delete their own articles."
  ON public.articles FOR DELETE
  USING (auth.uid() = author_id);

-- --- FOLLOWS ---
DROP POLICY IF EXISTS "Follows are viewable by everyone." ON public.follows;
CREATE POLICY "Follows are viewable by everyone."
  ON public.follows FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can follow creators." ON public.follows;
CREATE POLICY "Authenticated users can follow creators."
  ON public.follows FOR INSERT
  WITH CHECK (auth.uid() = follower_id);

DROP POLICY IF EXISTS "Users can unfollow creators." ON public.follows;
CREATE POLICY "Users can unfollow creators."
  ON public.follows FOR DELETE
  USING (auth.uid() = follower_id);

-- --- ARTICLE LIKES ---
DROP POLICY IF EXISTS "Likes are viewable by everyone." ON public.article_likes;
CREATE POLICY "Likes are viewable by everyone."
  ON public.article_likes FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can like articles." ON public.article_likes;
CREATE POLICY "Authenticated users can like articles."
  ON public.article_likes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can unlike articles." ON public.article_likes;
CREATE POLICY "Users can unlike articles."
  ON public.article_likes FOR DELETE
  USING (auth.uid() = user_id);

-- --- COMMENTS ---
DROP POLICY IF EXISTS "Comments are viewable by everyone." ON public.comments;
CREATE POLICY "Comments are viewable by everyone."
  ON public.comments FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can create comments." ON public.comments;
CREATE POLICY "Authenticated users can create comments."
  ON public.comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Comment authors can update their own comments." ON public.comments;
CREATE POLICY "Comment authors can update their own comments."
  ON public.comments FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Comment authors and article owners can delete comments." ON public.comments;
CREATE POLICY "Comment authors and article owners can delete comments."
  ON public.comments FOR DELETE
  USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM public.articles
      WHERE articles.id = comments.article_id AND articles.author_id = auth.uid()
    )
  );

-- --- BOOKMARKS ---
DROP POLICY IF EXISTS "Users can view their own bookmarks." ON public.bookmarks;
CREATE POLICY "Users can view their own bookmarks."
  ON public.bookmarks FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Authenticated users can bookmark articles." ON public.bookmarks;
CREATE POLICY "Authenticated users can bookmark articles."
  ON public.bookmarks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can remove their own bookmarks." ON public.bookmarks;
CREATE POLICY "Users can remove their own bookmarks."
  ON public.bookmarks FOR DELETE
  USING (auth.uid() = user_id);

-- --- NOTIFICATIONS ---
DROP POLICY IF EXISTS "Users can view their own notifications." ON public.notifications;
CREATE POLICY "Users can view their own notifications."
  ON public.notifications FOR SELECT
  USING (auth.uid() = recipient_id);

DROP POLICY IF EXISTS "Authenticated users can insert notifications." ON public.notifications;
CREATE POLICY "Authenticated users can insert notifications."
  ON public.notifications FOR INSERT
  WITH CHECK (auth.uid() = actor_id);

DROP POLICY IF EXISTS "Users can update their own notification read status." ON public.notifications;
CREATE POLICY "Users can update their own notification read status."
  ON public.notifications FOR UPDATE
  USING (auth.uid() = recipient_id);

-- =====================================================================
-- 10. Triggers & Helpers
-- =====================================================================

-- Auto-sync likes_count on articles
CREATE OR REPLACE FUNCTION public.sync_article_likes_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    UPDATE public.articles
    SET likes_count = likes_count + 1
    WHERE id = NEW.article_id;
    RETURN NEW;
  ELSIF (TG_OP = 'DELETE') THEN
    UPDATE public.articles
    SET likes_count = GREATEST(0, likes_count - 1)
    WHERE id = OLD.article_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS on_article_like_changed ON public.article_likes;
CREATE TRIGGER on_article_like_changed
  AFTER INSERT OR DELETE ON public.article_likes
  FOR EACH ROW EXECUTE FUNCTION public.sync_article_likes_count();

-- Auto-create profile on auth signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    full_name,
    username,
    avatar_url,
    cover_url,
    bio,
    location,
    website
  )
  VALUES (
    new.id,
    COALESCE(
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'name',
      split_part(new.email, '@', 1)
    ),
    COALESCE(
      new.raw_user_meta_data->>'username',
      split_part(new.email, '@', 1)
    ),
    COALESCE(
      new.raw_user_meta_data->>'avatar_url',
      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80'
    ),
    COALESCE(
      new.raw_user_meta_data->>'cover_url',
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80'
    ),
    COALESCE(
      new.raw_user_meta_data->>'bio',
      'Software engineer and technical writer passionate about clean code, web performance, and developer tools.'
    ),
    COALESCE(
      new.raw_user_meta_data->>'location',
      'San Francisco, CA'
    ),
    COALESCE(
      new.raw_user_meta_data->>'website',
      'https://devblog.io'
    )
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    username = EXCLUDED.username,
    avatar_url = EXCLUDED.avatar_url;

  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
