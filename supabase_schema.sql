-- =========================================================================
-- UNIAGORA COMPLETE DATABASE SCHEMA
-- This file compiles all tables, triggers, functions, policies, and storage
-- required to build the UniAGORA backend database in Supabase.
-- =========================================================================

-- Enable uuid-ossp extension for UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- 1. Helper Functions
-- ==========================================

-- Helper function to check if the current user is an admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN (auth.jwt() ->> 'email') = 'bytesage013@gmail.com';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==========================================
-- 2. Profiles Table
-- ==========================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    phone_number TEXT,
    university TEXT NOT NULL,
    is_freelancer BOOLEAN DEFAULT FALSE,
    verification_status TEXT DEFAULT 'unverified', -- 'unverified', 'pending', 'verified'
    verification_document_url TEXT,
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 3. Services Table
-- ==========================================
CREATE TABLE IF NOT EXISTS public.services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT NOT NULL,
    price_range TEXT NOT NULL,
    image_url TEXT,
    is_featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 4. Service Reviews Table
-- ==========================================
CREATE TABLE IF NOT EXISTS public.service_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_id UUID REFERENCES public.services(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
    comment TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_user_service_review UNIQUE (service_id, user_id)
);

-- ==========================================
-- 5. Conversations & Messaging System
-- ==========================================
CREATE TABLE IF NOT EXISTS public.conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.conversation_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_conversation_participant UNIQUE (conversation_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
    sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    text TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 6. Notifications Table
-- ==========================================
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    type TEXT NOT NULL, -- 'message', 'reply', 'system', 'inquiry'
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    link TEXT, -- e.g., '/messages/123' or '/community/post/456'
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 7. Community Forum Tables
-- ==========================================
CREATE TABLE IF NOT EXISTS public.community_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'General',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.community_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID REFERENCES public.community_posts(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 8. Contact Submissions Table
-- ==========================================
CREATE TABLE IF NOT EXISTS public.contact_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 9. Stored Procedures (RPCs)
-- ==========================================

-- Function to start or retrieve a conversation between two users
CREATE OR REPLACE FUNCTION public.get_or_create_conversation(p_id1 UUID, p_id2 UUID)
RETURNS UUID AS $$
DECLARE
    v_conversation_id UUID;
BEGIN
    -- Check if a conversation between p_id1 and p_id2 already exists
    SELECT cp1.conversation_id INTO v_conversation_id
    FROM public.conversation_participants cp1
    JOIN public.conversation_participants cp2 ON cp1.conversation_id = cp2.conversation_id
    WHERE cp1.user_id = p_id1 AND cp2.user_id = p_id2
    LIMIT 1;

    -- If conversation doesn't exist, create it
    IF v_conversation_id IS NULL THEN
        -- Insert new conversation
        INSERT INTO public.conversations (created_at, updated_at)
        VALUES (now(), now())
        RETURNING id INTO v_conversation_id;

        -- Insert both participants
        INSERT INTO public.conversation_participants (conversation_id, user_id)
        VALUES (v_conversation_id, p_id1), (v_conversation_id, p_id2);
    END IF;

    RETURN v_conversation_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==========================================
-- 10. Triggers for Automatic Timestamps and Notifications
-- ==========================================

-- Trigger to update 'updated_at' column
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_modtime
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

CREATE TRIGGER update_services_modtime
    BEFORE UPDATE ON public.services
    FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

CREATE TRIGGER update_conversations_modtime
    BEFORE UPDATE ON public.conversations
    FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

CREATE TRIGGER update_community_posts_modtime
    BEFORE UPDATE ON public.community_posts
    FOR EACH ROW EXECUTE PROCEDURE update_modified_column();


-- Trigger: Notify post author when someone comments on their forum post
CREATE OR REPLACE FUNCTION notify_post_author_on_comment()
RETURNS TRIGGER AS $$
DECLARE
    post_author_id UUID;
    post_title TEXT;
BEGIN
    SELECT user_id, title INTO post_author_id, post_title 
    FROM public.community_posts 
    WHERE id = NEW.post_id;

    IF NEW.user_id != post_author_id THEN
        INSERT INTO public.notifications (user_id, type, title, content, link)
        VALUES (
            post_author_id, 
            'reply', 
            'New reply on your post', 
            'Someone replied to your discussion: ' || post_title,
            '/community/post/' || NEW.post_id
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_community_comment_added
    AFTER INSERT ON public.community_comments
    FOR EACH ROW EXECUTE PROCEDURE notify_post_author_on_comment();


-- Trigger: Notify recipient when a new message is sent
CREATE OR REPLACE FUNCTION notify_recipient_on_message()
RETURNS TRIGGER AS $$
DECLARE
    recipient_user_id UUID;
    sender_name TEXT;
BEGIN
    -- Find the other participant
    SELECT user_id INTO recipient_user_id
    FROM public.conversation_participants
    WHERE conversation_id = NEW.conversation_id
    AND user_id != NEW.sender_id
    LIMIT 1;

    -- Get sender's name
    SELECT full_name INTO sender_name
    FROM public.profiles
    WHERE id = NEW.sender_id;

    -- Insert notification for the recipient
    IF recipient_user_id IS NOT NULL THEN
        INSERT INTO public.notifications (user_id, type, title, content, link)
        VALUES (
            recipient_user_id, 
            'message', 
            'New message from ' || COALESCE(sender_name, 'a user'), 
            NEW.text,
            '/messages/' || NEW.conversation_id
        );
        
        -- Also update updated_at for the conversation
        UPDATE public.conversations 
        SET updated_at = now() 
        WHERE id = NEW.conversation_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_message_added
    AFTER INSERT ON public.messages
    FOR EACH ROW EXECUTE PROCEDURE notify_recipient_on_message();


-- ==========================================
-- 11. Row Level Security (RLS) Policies
-- ==========================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;

-- 11a. Profiles Policies
CREATE POLICY "Allow public read access to profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Allow users to insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Allow users to update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Allow admin all actions on profiles" ON public.profiles FOR ALL USING (public.is_admin());

-- 11b. Services Policies
CREATE POLICY "Allow public read access to services" ON public.services FOR SELECT USING (true);
CREATE POLICY "Allow authenticated users to create services" ON public.services FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Allow users to update their own services" ON public.services FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Allow users to delete their own services" ON public.services FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Allow admin all actions on services" ON public.services FOR ALL USING (public.is_admin());

-- 11c. Service Reviews Policies
CREATE POLICY "Allow public read access to reviews" ON public.service_reviews FOR SELECT USING (true);
CREATE POLICY "Allow authenticated users to create reviews" ON public.service_reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Allow users to update their own reviews" ON public.service_reviews FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Allow users to delete their own reviews" ON public.service_reviews FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Allow admin all actions on reviews" ON public.service_reviews FOR ALL USING (public.is_admin());

-- 11d. Conversations Policies
CREATE POLICY "Users can select conversations they participate in" ON public.conversations FOR SELECT 
USING (EXISTS (SELECT 1 FROM public.conversation_participants cp WHERE cp.conversation_id = conversations.id AND cp.user_id = auth.uid()));
CREATE POLICY "Allow conversation creation" ON public.conversations FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow admin all actions on conversations" ON public.conversations FOR ALL USING (public.is_admin());

-- 11e. Conversation Participants Policies
CREATE POLICY "Users can view participants in their conversations" ON public.conversation_participants FOR SELECT 
USING (EXISTS (SELECT 1 FROM public.conversation_participants cp WHERE cp.conversation_id = conversation_participants.conversation_id AND cp.user_id = auth.uid()));
CREATE POLICY "Users can insert participants" ON public.conversation_participants FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow admin all actions on participants" ON public.conversation_participants FOR ALL USING (public.is_admin());

-- 11f. Messages Policies
CREATE POLICY "Users can view messages in their conversations" ON public.messages FOR SELECT 
USING (EXISTS (SELECT 1 FROM public.conversation_participants cp WHERE cp.conversation_id = messages.conversation_id AND cp.user_id = auth.uid()));
CREATE POLICY "Users can insert messages into their conversations" ON public.messages FOR INSERT 
WITH CHECK (auth.uid() = sender_id AND EXISTS (SELECT 1 FROM public.conversation_participants cp WHERE cp.conversation_id = messages.conversation_id AND cp.user_id = auth.uid()));
CREATE POLICY "Allow admin all actions on messages" ON public.messages FOR ALL USING (public.is_admin());

-- 11g. Notifications Policies
CREATE POLICY "Users view own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users update own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Allow system insert" ON public.notifications FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow admin all actions on notifications" ON public.notifications FOR ALL USING (public.is_admin());

-- 11h. Community Posts Policies
CREATE POLICY "Allow public read-only access to posts" ON public.community_posts FOR SELECT USING (true);
CREATE POLICY "Allow authenticated users to create posts" ON public.community_posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Allow users to update their own posts" ON public.community_posts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Allow users to delete their own posts" ON public.community_posts FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Allow admin all actions on posts" ON public.community_posts FOR ALL USING (public.is_admin());

-- 11i. Community Comments Policies
CREATE POLICY "Allow public read-only access to comments" ON public.community_comments FOR SELECT USING (true);
CREATE POLICY "Allow authenticated users to create comments" ON public.community_comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Allow users to update their own comments" ON public.community_comments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Allow users to delete their own comments" ON public.community_comments FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Allow admin all actions on comments" ON public.community_comments FOR ALL USING (public.is_admin());

-- 11j. Contact Submissions Policies
CREATE POLICY "Allow public submissions" ON public.contact_submissions FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow admin read access to contact submissions" ON public.contact_submissions FOR SELECT USING (public.is_admin());
CREATE POLICY "Allow admin delete access to contact submissions" ON public.contact_submissions FOR DELETE USING (public.is_admin());

-- ==========================================
-- 12. Storage Buckets and Storage Policies
-- ==========================================

-- Enable storage bucket for uploads (like service pictures and profile image files)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('uniagora', 'uniagora', true)
ON CONFLICT (id) DO NOTHING;

-- Policies for uniagora bucket
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'uniagora');
CREATE POLICY "Allow authenticated uploads" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'uniagora');
CREATE POLICY "Allow owner update" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'uniagora' AND auth.uid() = owner);
CREATE POLICY "Allow owner delete" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'uniagora' AND auth.uid() = owner);
