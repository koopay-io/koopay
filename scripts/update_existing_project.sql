-- Update existing project with escrow contract ID
-- This updates the project that was created with title 'web' and description 'vfdve'
-- Project ID: 1f9233db-ceb8-4ca3-972d-a662437793aa
-- Escrow Contract ID: CBIYHZXTMTAWLGD4D7QTLINZCJKYXCHDV52L4BGCBPCC7YSXMSQPBZ64

UPDATE public.projects
SET contract_id = 'CBIYHZXTMTAWLGD4D7QTLINZCJKYXCHDV52L4BGCBPCC7YSXMSQPBZ64',
    updated_at = NOW()
WHERE id = '1f9233db-ceb8-4ca3-972d-a662437793aa';

-- Verify the update
SELECT id, title, contract_id, updated_at 
FROM public.projects 
WHERE id = '1f9233db-ceb8-4ca3-972d-a662437793aa';

