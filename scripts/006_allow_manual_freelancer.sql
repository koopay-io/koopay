-- Allow assigning an external collaborator by Stellar address.

-- 1. Add a new column for manual addresses
ALTER TABLE public.projects
ADD COLUMN freelancer_address text;

-- 2. Ensure freelancer_id can be nullable (project can use freelancer_address instead)
ALTER TABLE public.projects
ALTER COLUMN freelancer_id DROP NOT NULL;

-- 3. Require at least one of freelancer_id or freelancer_address
ALTER TABLE public.projects
ADD CONSTRAINT project_freelancer_check
CHECK (freelancer_id IS NOT NULL OR freelancer_address IS NOT NULL);
