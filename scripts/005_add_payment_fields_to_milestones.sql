-- Add payment tracking fields to milestones table
ALTER TABLE public.milestones
ADD COLUMN IF NOT EXISTS payment_hash TEXT,
ADD COLUMN IF NOT EXISTS payment_sent_at TIMESTAMPTZ;

-- Add comments
COMMENT ON COLUMN public.milestones.payment_hash IS 'Stellar transaction hash for milestone payment';
COMMENT ON COLUMN public.milestones.payment_sent_at IS 'Timestamp when payment was sent to Stellar network';

-- Create index for faster lookups by transaction hash
CREATE INDEX IF NOT EXISTS idx_milestones_payment_hash ON public.milestones(payment_hash);
