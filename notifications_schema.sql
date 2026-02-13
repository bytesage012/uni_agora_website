-- NOTIFICATION SYSTEM SCHEMA

-- 1. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    type TEXT NOT NULL, -- 'message', 'reply', 'system', 'inquiry'
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    link TEXT, -- e.g., '/messages/123' or '/community/post/456'
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- RLS POLICIES
-- Users can only see their own notifications
CREATE POLICY "Users view own notifications" 
ON public.notifications FOR SELECT 
USING (auth.uid() = user_id);

-- Users can mark their own notifications as read
CREATE POLICY "Users update own notifications" 
ON public.notifications FOR UPDATE 
USING (auth.uid() = user_id);

-- System/Service Role can insert (or triggers)
CREATE POLICY "Allow system insert" 
ON public.notifications FOR INSERT 
WITH CHECK (true);


-- 2. TRIGGERS FOR AUTOMATION

-- A. Trigger for Community Comments (Forum Replies)
CREATE OR REPLACE FUNCTION notify_post_author_on_comment()
RETURNS TRIGGER AS $$
DECLARE
    post_author_id UUID;
    post_title TEXT;
BEGIN
    -- Get post author and title
    SELECT user_id, title INTO post_author_id, post_title 
    FROM public.community_posts 
    WHERE id = NEW.post_id;

    -- Only notify if the commenter is NOT the author
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
    FOR EACH ROW
    EXECUTE PROCEDURE notify_post_author_on_comment();


-- B. Trigger for Messages (Hotfixed)
CREATE OR REPLACE FUNCTION notify_recipient_on_message()
RETURNS TRIGGER AS $$
DECLARE
    recipient_user_id UUID;
    sender_name TEXT;
BEGIN
    -- Find the other participant in the conversation
    -- This assumes your messages table has 'conversation_id' and 'sender_id'
    SELECT user_id INTO recipient_user_id
    FROM public.conversation_participants
    WHERE conversation_id = NEW.conversation_id
    AND user_id != NEW.sender_id
    LIMIT 1;

    -- Get sender's name for the notification
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
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_message_added
    AFTER INSERT ON public.messages
    FOR EACH ROW
    EXECUTE PROCEDURE notify_recipient_on_message();
