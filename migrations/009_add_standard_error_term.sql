-- Migration 009: Add Standard Error vs Standard Deviation Term
-- Description: Add a new glossary term explaining the difference between standard error and standard deviation
-- Version: 2025-09-19

-- Add the new term
INSERT INTO glossary_terms (
    id,
    slug,
    title,
    short_description,
    definition,
    first_letter,
    created_at,
    updated_at
) VALUES (
    21,
    'standard-error-vs-standard-deviation',
    'Standard Error vs Standard Deviation',
    'Key differences between SE and SD in statistics',
    'Standard Deviation (SD) measures the variability of individual data points in a dataset, while Standard Error (SE) measures the variability of a sample statistic (like the mean) across multiple samples. SD describes spread in your data; SE describes precision of your estimate. SE = SD/√n, where n is sample size. Example: If SD = 10 for test scores and you have a sample of 25 students, then SE of the mean = 10/√25 = 2. This means the sample mean is likely within ±2 points of the true population mean.',
    'S',
    '2025-09-19 10:30:00',
    '2025-09-19 10:30:00'
);

-- Also add the standalone Standard Error term for completeness
INSERT INTO glossary_terms (
    id,
    slug,
    title,
    short_description,
    definition,
    first_letter,
    created_at,
    updated_at
) VALUES (
    22,
    'standard-error',
    'Standard Error (SE)',
    'Measure of sampling variability of a statistic',
    'The standard error is the standard deviation of the sampling distribution of a statistic, most commonly the mean. It quantifies the precision of the sample estimate and decreases as sample size increases. SE = σ/√n for the mean, where σ is population standard deviation and n is sample size. Example: With a population SD of 15 and sample size of 100, SE = 15/√100 = 1.5. This means sample means will typically vary by about 1.5 units from the true population mean.',
    'S',
    '2025-09-19 10:30:00',
    '2025-09-19 10:30:00'
);