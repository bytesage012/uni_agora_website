-- SUPABASE SQL SCHEMA FOR COMMUNITY FORUM

-- 1. COMMUNITY POSTS TABLE
CREATE TABLE IF NOT EXISTS public.community_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'General',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. COMMUNITY COMMENTS TABLE
CREATE TABLE IF NOT EXISTS public.community_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID REFERENCES public.community_posts(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. ENABLE ROW LEVEL SECURITY (RLS)
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_comments ENABLE ROW LEVEL SECURITY;

-- 4. RLS POLICIES FOR POSTS
-- Anyone can read posts
CREATE POLICY "Allow public read-only access to posts" 
ON public.community_posts FOR SELECT USING (true);

-- Authenticated users can create posts
CREATE POLICY "Allow authenticated users to create posts" 
ON public.community_posts FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- Users can update/delete their own posts
CREATE POLICY "Allow users to update their own posts" 
ON public.community_posts FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Allow users to delete their own posts" 
ON public.community_posts FOR DELETE 
USING (auth.uid() = user_id);


-- 5. RLS POLICIES FOR COMMENTS
-- Anyone can read comments
CREATE POLICY "Allow public read-only access to comments" 
ON public.community_comments FOR SELECT USING (true);

-- Authenticated users can create comments
CREATE POLICY "Allow authenticated users to create comments" 
ON public.community_comments FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- Users can update/delete their own comments
CREATE POLICY "Allow users to update their own comments" 
ON public.community_comments FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Allow users to delete their own comments" 
ON public.community_comments FOR DELETE 
USING (auth.uid() = user_id);

-- 6. AUTOMATIC UPDATED_AT TRIGGER (Optional but recommended)
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_community_posts_modtime
    BEFORE UPDATE ON public.community_posts
    FOR EACH ROW
    EXECUTE PROCEDURE update_modified_column();
