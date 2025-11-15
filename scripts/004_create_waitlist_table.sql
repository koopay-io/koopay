-- Create waitlist table for landing page email subscriptions
CREATE TABLE IF NOT EXISTS public.waitlist (
  id BIGSERIAL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_waitlist_email ON public.waitlist(email);

-- Enable RLS (Row Level Security)
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (for public waitlist signup)
CREATE POLICY "Allow public insert on waitlist"
  ON public.waitlist
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Allow authenticated users to read (for admin purposes)
CREATE POLICY "Allow authenticated read on waitlist"
  ON public.waitlist
  FOR SELECT
  TO authenticated
  USING (true);

