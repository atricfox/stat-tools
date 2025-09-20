-- Remove unimplemented calculator entries
-- These will be added back when their implementations are ready

DELETE FROM calculators
WHERE name IN ('Correlation Calculator', 'T-Test Calculator');

-- Update the sort order for remaining calculators if needed
UPDATE calculators
SET sort_order = sort_order - 2
WHERE sort_order > 10;