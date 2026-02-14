-- Create contact_submissions table
CREATE TABLE IF NOT EXISTS contact_submissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

-- Allow anonymous users to insert contact submissions
CREATE POLICY "Allow public submissions" 
ON contact_submissions 
FOR INSERT 
WITH CHECK (true);

-- Restrict read access to admins (optional - depends on auth setup)
-- For now, we'll keep it simple or restricted to authenticated users with admin emails if we had that logic here
-- Typically, admins would check this in the dashboard or via an email notification service
