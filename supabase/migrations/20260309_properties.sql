-- Properties table for portfolio assets
CREATE TABLE IF NOT EXISTS public.properties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    name TEXT NOT NULL DEFAULT 'Untitled',
    address TEXT DEFAULT '',
    status TEXT NOT NULL DEFAULT 'Lead / Prospect',
    type TEXT NOT NULL DEFAULT 'Single-family',
    image TEXT DEFAULT '',
    units INTEGER DEFAULT 1,
    lat DOUBLE PRECISION,
    lng DOUBLE PRECISION,
    purchase_price DOUBLE PRECISION DEFAULT 0,
    current_value DOUBLE PRECISION DEFAULT 0,
    renovation_cost DOUBLE PRECISION DEFAULT 0,
    debt DOUBLE PRECISION DEFAULT 0,
    monthly_rent DOUBLE PRECISION DEFAULT 0,
    monthly_expenses DOUBLE PRECISION DEFAULT 0,
    monthly_debt_service DOUBLE PRECISION DEFAULT 0,
    principle_payment DOUBLE PRECISION DEFAULT 0,
    debt_type TEXT,
    interest_rate DOUBLE PRECISION,
    loan_duration_months INTEGER,
    fixed_term_remaining_months INTEGER,
    reservice_date TEXT,
    acquisition_date TEXT,
    events JSONB DEFAULT '[]'::jsonb,
    bedrooms INTEGER,
    bathrooms INTEGER,
    year_built INTEGER,
    lot_size TEXT,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS properties_user_id_idx ON public.properties (user_id);
CREATE INDEX IF NOT EXISTS properties_created_at_idx ON public.properties (created_at DESC);

ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "properties_allow_all" ON public.properties;
CREATE POLICY "properties_allow_all" ON public.properties FOR ALL USING (true) WITH CHECK (true);
