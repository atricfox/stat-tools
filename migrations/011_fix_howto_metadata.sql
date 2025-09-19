-- Migration 011: Fix How-To Metadata
-- Description: Add missing prerequisites and outcomes for how-to guides
-- Version: 2025-09-19

-- Update how-to-calculate-variance metadata
UPDATE howto_metadata
SET
  prerequisites = '["Basic understanding of mean calculation", "Familiarity with basic arithmetic operations", "Understanding of the difference between sample and population data"]',
  outcomes = '["Calculate variance for any dataset", "Understand the meaning of variance values", "Choose between sample and population variance", "Interpret variance in context"]'
WHERE howto_slug = 'how-to-calculate-variance';

-- Update how-to-calculate-percent-error metadata
INSERT OR REPLACE INTO howto_metadata (howto_slug, prerequisites, outcomes, prefill_params, estimated_time, created_at, updated_at)
VALUES (
  'how-to-calculate-percent-error',
  '["Understanding of true/theoretical values", "Basic percentage calculations", "Ability to identify experimental vs expected values"]',
  '["Calculate percent error accurately", "Assess measurement accuracy", "Interpret error magnitudes", "Apply to quality control"]',
  '{"trueValue": "100", "measuredValue": "98.5"}',
  5,
  '2025-09-18 02:12:15',
  '2025-09-18 02:12:15'
);

-- Update how-to-calculate-standard-deviation metadata
INSERT OR REPLACE INTO howto_metadata (howto_slug, prerequisites, outcomes, prefill_params, estimated_time, created_at, updated_at)
VALUES (
  'how-to-calculate-standard-deviation',
  '["Understanding of mean calculation", "Basic square root concepts", "Knowledge of variance"]',
  '["Calculate standard deviation step-by-step", "Interpret SD values", "Choose between sample and population SD", "Apply to real-world data"]',
  '{"values": "10,12,14,16,18"}',
  8,
  '2025-09-18 02:12:15',
  '2025-09-18 02:12:15'
);

-- Update how-to-calculate-range metadata
INSERT OR REPLACE INTO howto_metadata (howto_slug, prerequisites, outcomes, prefill_params, estimated_time, created_at, updated_at)
VALUES (
  'how-to-calculate-range',
  '["Understanding of minimum and maximum values", "Basic subtraction skills"]',
  '["Find the range of any dataset", "Understand range as a measure of spread", "Identify outliers affecting range", "Compare ranges across datasets"]',
  '{"values": "23,45,67,12,89,34,56"}',
  3,
  '2025-09-18 02:12:15',
  '2025-09-18 02:12:15'
);

-- Update how-to-import-data-from-excel metadata
UPDATE howto_metadata
SET
  prerequisites = '["Access to Excel or Google Sheets", "Basic spreadsheet knowledge", "Understanding of data formats"]',
  outcomes = '["Import data from various sources", "Clean and prepare data for analysis", "Handle different file formats", "Troubleshoot import issues"]'
WHERE howto_slug = 'how-to-import-data-from-excel';

-- Update basic-data-analysis-workflow metadata
UPDATE howto_metadata
SET
  prerequisites = '["Basic statistics knowledge", "Understanding of data types", "Familiarity with descriptive statistics"]',
  outcomes = '["Complete a full data analysis workflow", "Calculate and interpret key statistics", "Identify data quality issues", "Make data-driven decisions"]'
WHERE howto_slug = 'basic-data-analysis-workflow';

-- Update how-calculate-mean metadata
INSERT OR REPLACE INTO howto_metadata (howto_slug, prerequisites, outcomes, prefill_params, estimated_time, created_at, updated_at)
VALUES (
  'how-calculate-mean',
  '["Basic addition and division skills", "Understanding of averages"]',
  '["Calculate arithmetic mean", "Understand when to use mean", "Apply mean to real datasets", "Interpret mean values"]',
  '{"values": "10,20,30,40,50"}',
  5,
  '2025-09-18 02:12:15',
  '2025-09-18 02:12:15'
);

-- Update how-to-use-median-calculator metadata
INSERT OR REPLACE INTO howto_metadata (howto_slug, prerequisites, outcomes, prefill_params, estimated_time, created_at, updated_at)
VALUES (
  'how-to-use-median-calculator',
  '["Understanding of data ordering", "Knowledge of when median is preferred over mean"]',
  '["Find median of any dataset", "Handle odd and even data counts", "Understand median vs mean", "Apply to skewed data"]',
  '{"values": "12,15,18,22,25,30,120"}',
  5,
  '2025-09-18 02:12:15',
  '2025-09-18 02:12:15'
);

-- Update weighted-average-real-world-applications metadata
INSERT OR REPLACE INTO howto_metadata (howto_slug, prerequisites, outcomes, prefill_params, estimated_time, created_at, updated_at)
VALUES (
  'weighted-average-real-world-applications',
  '["Understanding of basic averages", "Knowledge of weights and their importance", "Basic multiplication skills"]',
  '["Calculate weighted averages", "Apply to GPA calculations", "Use in financial analysis", "Understand weight selection"]',
  '{"values": "85,90,78,92", "weights": "3,4,2,3"}',
  10,
  '2025-09-18 02:12:15',
  '2025-09-18 02:12:15'
);

-- Update gpa-improvement-academic-planning metadata
INSERT OR REPLACE INTO howto_metadata (howto_slug, prerequisites, outcomes, prefill_params, estimated_time, created_at, updated_at)
VALUES (
  'gpa-improvement-academic-planning',
  '["Understanding of GPA calculation", "Knowledge of credit hours", "Academic goals clarity"]',
  '["Plan GPA improvement strategies", "Calculate required grades", "Set realistic academic goals", "Track progress effectively"]',
  '{}',
  15,
  '2025-09-18 02:12:15',
  '2025-09-18 02:12:15'
);

-- Update interpreting-statistical-results metadata
INSERT OR REPLACE INTO howto_metadata (howto_slug, prerequisites, outcomes, prefill_params, estimated_time, created_at, updated_at)
VALUES (
  'interpreting-statistical-results',
  '["Basic statistics knowledge", "Understanding of common statistical measures", "Context awareness"]',
  '["Interpret statistical outputs correctly", "Avoid common misinterpretations", "Communicate results effectively", "Make informed decisions"]',
  '{}',
  12,
  '2025-09-18 02:12:15',
  '2025-09-18 02:12:15'
);