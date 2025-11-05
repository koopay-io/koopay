-- Add contract_id column to projects table for storing escrow contract IDs
-- This column stores the Stellar escrow contract ID (account address) of the escrow

ALTER TABLE public.projects
ADD COLUMN IF NOT EXISTS contract_id TEXT;

-- Add comment to document the column
COMMENT ON COLUMN public.projects.contract_id IS 'Stellar escrow contract ID (account address) for the project';

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_projects_contract_id ON public.projects(contract_id);

