-- =====================================================================
-- DevBlog Supabase Database Schema & Security Migration
-- Includes: profiles, articles, Row Level Security (RLS), and auth triggers
-- =====================================================================

-- 1. Create profiles table linked to Supabase auth.users
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  username TEXT UNIQUE,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. Create articles table
CREATE TABLE IF NOT EXISTS public.articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  author_name TEXT,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  reading_time TEXT DEFAULT '5 min read',
  excerpt TEXT NOT NULL,
  content TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. Create indices for performance
CREATE INDEX IF NOT EXISTS idx_articles_author_id ON public.articles(author_id);
CREATE INDEX IF NOT EXISTS idx_articles_category ON public.articles(category);
CREATE INDEX IF NOT EXISTS idx_articles_created_at ON public.articles(created_at DESC);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies for profiles
-- Anyone can view public profiles
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone."
  ON public.profiles FOR SELECT
  USING (true);

-- Authenticated users can insert their own profile
DROP POLICY IF EXISTS "Users can insert their own profile." ON public.profiles;
CREATE POLICY "Users can insert their own profile."
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Users can update only their own profile
DROP POLICY IF EXISTS "Users can update their own profile." ON public.profiles;
CREATE POLICY "Users can update their own profile."
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- 6. RLS Policies for articles
-- Anyone can read articles (Public access)
DROP POLICY IF EXISTS "Articles are viewable by everyone." ON public.articles;
CREATE POLICY "Articles are viewable by everyone."
  ON public.articles FOR SELECT
  USING (true);

-- Authenticated users can insert their own articles
DROP POLICY IF EXISTS "Authenticated users can insert articles." ON public.articles;
CREATE POLICY "Authenticated users can insert articles."
  ON public.articles FOR INSERT
  WITH CHECK (auth.uid() = author_id);

-- Authors can update their own articles
DROP POLICY IF EXISTS "Authors can update their own articles." ON public.articles;
CREATE POLICY "Authors can update their own articles."
  ON public.articles FOR UPDATE
  USING (auth.uid() = author_id);

-- Authors can delete their own articles
DROP POLICY IF EXISTS "Authors can delete their own articles." ON public.articles;
CREATE POLICY "Authors can delete their own articles."
  ON public.articles FOR DELETE
  USING (auth.uid() = author_id);

-- 7. Postgres Trigger: Automatically create public.profiles entry on new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, username, avatar_url)
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
    )
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    username = EXCLUDED.username,
    avatar_url = EXCLUDED.avatar_url;

  RETURN new;
END;
$$;

-- Bind trigger to auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
