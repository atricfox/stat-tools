-- Fix FAQ tag formatting: Replace hyphens with spaces and apply title case

-- Update tags to replace hyphens with spaces and apply proper formatting
UPDATE slim_content 
SET tags = REPLACE(
  REPLACE(
    REPLACE(
      REPLACE(
        REPLACE(
          REPLACE(
            REPLACE(
              REPLACE(
                REPLACE(tags, '"central-tendency"', '"Central Tendency"'),
                '"data-analysis"', '"Data Analysis"'
              ),
              '"standard-deviation"', '"Standard Deviation"'
            ),
            '"college-admissions"', '"College Admissions"'
          ),
          '"academic-planning"', '"Academic Planning"'
        ),
        '"data-input"', '"Data Input"'
      ),
      '"user-guide"', '"User Guide"'
    ),
    '"technical-specs"', '"Technical Specs"'
  ),
  '"central tendency"', '"Central Tendency"'
)
WHERE type = 'faq';

-- Also fix any other hyphenated tags that might exist
UPDATE slim_content 
SET tags = REPLACE(
  REPLACE(
    REPLACE(
      REPLACE(tags, '"decision-making"', '"Decision Making"'),
      '"error-analysis"', '"Error Analysis"'
    ),
    '"quality-control"', '"Quality Control"'
  ),
  '"business-analytics"', '"Business Analytics"'
)
WHERE type IN ('faq', 'howto', 'case');