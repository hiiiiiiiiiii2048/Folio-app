-- Create user_activities table
CREATE TABLE IF NOT EXISTS public.user_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL, -- Clerk User ID
    type TEXT NOT NULL, -- 'login', 'property_view', 'portfolio_view', 'shared_link_view', 'add_property', 'edit_property'
    target_id TEXT, -- ID of the property or share link if applicable
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS user_activities_user_id_idx ON public.user_activities(user_id);
CREATE INDEX IF NOT EXISTS user_activities_created_at_idx ON public.user_activities(created_at);

-- RLS (Row Level Security) - Admin can see all, users can see their own if needed
ALTER TABLE public.user_activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only see their own activity"
    ON public.user_activities
    FOR SELECT
    USING (auth.uid()::text = user_id);

-- For admin access, we usually use a service role or bypass RLS in the edge function
