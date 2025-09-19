-- Migration 007: Seed How-To Content
-- Description: Insert step-by-step tutorial content for statistical calculations
-- Version: 2025-09-19

-- Insert main how-to content entries
INSERT INTO slim_content (id, slug, type, title, summary, content, status, reading_time, priority, featured, difficulty, industry, target_tool, tags, created_at, updated_at) VALUES

(201, 'how-calculate-mean', 'howto', 'How to Calculate Mean Step by Step', 'Master mean calculation with detailed steps, examples, and common pitfalls to avoid.',
'# How to Calculate Mean Step by Step

Mean (arithmetic average) is the sum of all values divided by the number of values. It''s the most common measure of central tendency.

**Formula**: Mean = (Sum of all values) ÷ (Number of values)
**Mathematical notation**: x̄ = Σx / n

Where:
- x̄ (x-bar) = sample mean
- Σx = sum of all values  
- n = number of values

## When to Use Mean
- Data is roughly symmetrical
- No extreme outliers
- You need to account for all values
- Mathematical calculations required

## Alternative Measures
If your data has outliers or is skewed, consider using the [median](/calculator/median) instead.',
'published', 8, 8, 1, 'beginner', 'education', '/calculator/mean', '["tutorial", "mean", "calculation", "statistics", "step-by-step"]', '2025-09-19 10:00:00', '2025-09-19 10:00:00'),

(202, 'how-calculate-median', 'howto', 'How to Calculate Median: Complete Guide', 'Learn to find the median value with step-by-step instructions for both odd and even datasets.',
'# How to Calculate Median: Complete Guide

The median is the middle value in a dataset when values are arranged in order. Unlike the mean, median is not affected by outliers, making it ideal for skewed data.

## Why Use Median?
- **Resistant to outliers**: Extreme values don''t affect the result
- **Better for skewed data**: Represents "typical" value better than mean
- **Simple interpretation**: Literally the middle value

## When Median is Preferred
- Income data (usually right-skewed)
- House prices (extreme values present)  
- Survey ratings and scores
- Any data with potential outliers

## Median vs Mean
- **Use median** when data is skewed or has outliers
- **Use mean** when data is roughly normal and you need mathematical properties',
'published', 6, 7, 0, 'beginner', 'education', '/calculator/median', '["tutorial", "median", "calculation", "statistics", "outliers"]', '2025-09-19 10:00:00', '2025-09-19 10:00:00'),

(203, 'how-calculate-standard-deviation', 'howto', 'How to Calculate Standard Deviation', 'Master standard deviation calculation with detailed examples and understand when to use sample vs population formulas.',
'# How to Calculate Standard Deviation

Standard deviation measures how spread out data points are from the mean. It''s one of the most important statistics for understanding data variability.

## Two Types of Standard Deviation

### Population Standard Deviation (σ)
Use when you have data for the **entire** group you''re studying.

### Sample Standard Deviation (s)  
Use when you have data for a **subset** of a larger group (most common).

The key difference is in the denominator: sample SD uses (n-1) instead of n.

## Understanding the Results
- **Small SD**: Data points are close to the mean (consistent)
- **Large SD**: Data points are spread out (variable)
- **Zero SD**: All values are identical

## Interpreting Standard Deviation
- Compare to the mean (coefficient of variation)
- Use the 68-95-99.7 rule for normal distributions
- Consider the context of your data',
'published', 10, 9, 1, 'intermediate', 'education', '/calculator/standard-deviation', '["tutorial", "standard deviation", "variability", "statistics"]', '2025-09-19 10:00:00', '2025-09-19 10:00:00'),

(204, 'how-calculate-variance', 'howto', 'How to Calculate Variance Step by Step', 'Learn variance calculation with practical examples and understand the relationship between variance and standard deviation.',
'# How to Calculate Variance Step by Step

Variance measures how spread out data points are from the mean. It''s the foundation for calculating standard deviation and many other statistical measures.

## What is Variance?
Variance is the average of squared differences from the mean. It tells you how much variability exists in your data.

## Variance vs Standard Deviation
- **Variance**: Measured in squared units
- **Standard Deviation**: Square root of variance, same units as original data
- **Relationship**: SD = √Variance

## When to Use Variance
- Mathematical calculations requiring additive properties
- Comparing variability between groups
- Advanced statistical procedures (ANOVA, regression)
- When you need the foundational measure for other statistics

## Interpreting Variance
- **Larger variance**: More spread in data
- **Smaller variance**: Data clustered closer to mean
- **Zero variance**: All values are identical',
'published', 8, 6, 0, 'intermediate', 'education', '/calculator/variance', '["tutorial", "variance", "variability", "statistics"]', '2025-09-19 10:00:00', '2025-09-19 10:00:00'),

(205, 'how-calculate-weighted-mean', 'howto', 'How to Calculate Weighted Mean', 'Master weighted average calculations for GPA, portfolio analysis, and other applications where values have different importance.',
'# How to Calculate Weighted Mean

A weighted mean (weighted average) gives different values different levels of importance. This is essential when some data points should contribute more to the final average than others.

## Common Applications
- **GPA calculation**: Courses with more credits count more
- **Portfolio returns**: Investments with larger amounts count more  
- **Survey analysis**: Responses from larger groups count more
- **Quality scores**: Different criteria have different importance

## Weighted Mean vs Simple Mean
- **Simple mean**: All values have equal importance
- **Weighted mean**: Values have different levels of importance based on weights

## Key Concepts
- **Weights**: Numbers representing the importance of each value
- **Weight sum**: Total of all weights (must be > 0)
- **Quality points**: Value × Weight for each item',
'published', 7, 7, 1, 'intermediate', 'education', '/calculator/weighted-mean', '["tutorial", "weighted average", "GPA", "portfolio", "statistics"]', '2025-09-19 10:00:00', '2025-09-19 10:00:00');

-- Insert detailed step-by-step content
INSERT INTO slim_content_details (content_id, details) VALUES
(201, '{"steps":[{"stepId":"step-1","name":"Step 1: Collect Your Data","description":"Write down all the numbers you want to average. Make sure all values are in the same units."},{"stepId":"step-2","name":"Step 2: Add All Values","description":"Sum every number in your dataset. Use a calculator for accuracy with large datasets."},{"stepId":"step-3","name":"Step 3: Count the Values","description":"Determine how many numbers you have. Don''t count any value twice."},{"stepId":"step-4","name":"Step 4: Divide Sum by Count","description":"Mean = Total Sum ÷ Number of Values"}],"examples":[{"title":"Student Test Scores","description":"Calculate the mean of test scores: 85, 92, 78, 88, 95","data":"85, 92, 78, 88, 95","calculation":"1. Sum: 85 + 92 + 78 + 88 + 95 = 438\\n2. Count: 5 tests\\n3. Mean: 438 ÷ 5 = 87.6","result":"Mean score: 87.6"},{"title":"Monthly Expenses","description":"Find average monthly spending: $1,200, $1,350, $1,180, $1,420, $1,250","data":"$1,200, $1,350, $1,180, $1,420, $1,250","calculation":"1. Sum: 1,200 + 1,350 + 1,180 + 1,420 + 1,250 = 6,400\\n2. Count: 5 months\\n3. Mean: 6,400 ÷ 5 = $1,280","result":"Average monthly expense: $1,280"},{"title":"Website Traffic","description":"Calculate average daily visitors: 245, 312, 178, 289, 356, 203, 267","data":"245, 312, 178, 289, 356, 203, 267","calculation":"1. Sum: 245 + 312 + 178 + 289 + 356 + 203 + 267 = 1,850\\n2. Count: 7 days\\n3. Mean: 1,850 ÷ 7 = 264.3","result":"Average daily visitors: 264.3"}],"tips":["Double-check your addition - arithmetic errors are common","Make sure all values use the same units (don''t mix dollars and cents)","For large datasets, use spreadsheet software or a calculator","The mean can be a decimal even if all original values are whole numbers","Consider whether outliers make median a better choice"],"relatedTools":[{"name":"Mean Calculator","url":"/calculator/mean"},{"name":"Median Calculator","url":"/calculator/median"},{"name":"Weighted Mean Calculator","url":"/calculator/weighted-mean"}]}'),

(202, '{"steps":[{"stepId":"step-1","name":"Step 1: Arrange Data in Order","description":"Sort all values from smallest to largest. This is crucial for finding the middle value."},{"stepId":"step-2","name":"Step 2: Count Total Values","description":"Determine if you have an odd or even number of values (n)."},{"stepId":"step-3","name":"Step 3: Find Middle Position","description":"For odd n: position = (n+1)/2\\nFor even n: average the two middle values"},{"stepId":"step-4","name":"Step 4: Identify Median","description":"Odd n: The value at the middle position\\nEven n: Average of the two middle values"}],"examples":[{"title":"Test Scores (Odd Count)","description":"Find median of: 78, 85, 92, 67, 88, 90, 76","data":"78, 85, 92, 67, 88, 90, 76","calculation":"1. Sort: 67, 76, 78, 85, 88, 90, 92\\n2. Count: 7 values (odd)\\n3. Middle position: (7+1)/2 = 4th position\\n4. Median: 85","result":"Median: 85"},{"title":"House Prices (Even Count)","description":"Find median price: $150K, $155K, $160K, $165K, $170K, $175K","data":"$150K, $155K, $160K, $165K, $170K, $175K","calculation":"1. Already sorted\\n2. Count: 6 values (even)\\n3. Middle positions: 3rd and 4th\\n4. Median: ($160K + $165K)/2 = $162.5K","result":"Median price: $162,500"},{"title":"Survey Ratings","description":"Find median rating: 5, 3, 4, 3, 5, 2, 4, 4, 3","data":"5, 3, 4, 3, 5, 2, 4, 4, 3","calculation":"1. Sort: 2, 3, 3, 3, 4, 4, 4, 5, 5\\n2. Count: 9 values (odd)\\n3. Middle position: (9+1)/2 = 5th position\\n4. Median: 4","result":"Median rating: 4"}],"tips":["Always sort the data first - this is the most common mistake","For even counts, you must average the two middle values","Median can be a decimal even if all data points are whole numbers","When data is already sorted, finding median is much easier","Use median when you have outliers that would skew the mean"],"relatedTools":[{"name":"Median Calculator","url":"/calculator/median"},{"name":"Mean Calculator","url":"/calculator/mean"},{"name":"Range Calculator","url":"/calculator/range"}]}'),

(203, '{"steps":[{"stepId":"step-1","name":"Step 1: Calculate the Mean","description":"Find the average of your dataset: x̄ = Σx / n"},{"stepId":"step-2","name":"Step 2: Find Deviations","description":"Subtract the mean from each value: (x - x̄)"},{"stepId":"step-3","name":"Step 3: Square the Deviations","description":"Square each deviation to eliminate negative values: (x - x̄)²"},{"stepId":"step-4","name":"Step 4: Sum Squared Deviations","description":"Add all the squared deviations: Σ(x - x̄)²"},{"stepId":"step-5","name":"Step 5: Calculate Variance","description":"Sample: s² = Σ(x - x̄)² / (n-1)\\nPopulation: σ² = Σ(x - x̄)² / n"},{"stepId":"step-6","name":"Step 6: Take Square Root","description":"Standard deviation = √variance"}],"examples":[{"title":"Test Scores Example","description":"Calculate SD for scores: 85, 88, 92, 78, 87","data":"85, 88, 92, 78, 87","calculation":"1. Mean: (85+88+92+78+87)/5 = 86\\n2. Deviations: -1, 2, 6, -8, 1\\n3. Squared: 1, 4, 36, 64, 1\\n4. Sum: 106\\n5. Sample variance: 106/4 = 26.5\\n6. Sample SD: √26.5 = 5.15","result":"Sample SD: 5.15"},{"title":"Manufacturing Quality","description":"Widget weights (grams): 99.8, 100.2, 99.9, 100.1, 100.0","data":"99.8, 100.2, 99.9, 100.1, 100.0","calculation":"1. Mean: 100.0g\\n2. Deviations: -0.2, 0.2, -0.1, 0.1, 0.0\\n3. Squared: 0.04, 0.04, 0.01, 0.01, 0.00\\n4. Sum: 0.10\\n5. Sample variance: 0.10/4 = 0.025\\n6. Sample SD: √0.025 = 0.158g","result":"Sample SD: 0.158g"},{"title":"Investment Returns","description":"Monthly returns (%): 2.5, 1.8, 3.2, -0.5, 2.1","data":"2.5, 1.8, 3.2, -0.5, 2.1","calculation":"1. Mean: 1.82%\\n2. Deviations: 0.68, -0.02, 1.38, -2.32, 0.28\\n3. Squared: 0.46, 0.00, 1.90, 5.38, 0.08\\n4. Sum: 7.82\\n5. Sample variance: 7.82/4 = 1.96\\n6. Sample SD: √1.96 = 1.40%","result":"Sample SD: 1.40%"}],"tips":["Use (n-1) for sample SD, n for population SD","Keep extra decimal places during calculation for accuracy","Standard deviation is always positive","Units are the same as original data","A larger SD means more variability in the data"],"relatedTools":[{"name":"Standard Deviation Calculator","url":"/calculator/standard-deviation"},{"name":"Variance Calculator","url":"/calculator/variance"},{"name":"Mean Calculator","url":"/calculator/mean"}]}');

-- Insert how-to steps for detailed tutorials
INSERT INTO howto_steps (howto_slug, step_order, step_title, step_content, created_at, updated_at) VALUES

-- Mean calculation steps
('how-calculate-mean', 1, 'Collect Your Data', 'Write down all the numbers you want to average. Ensure all values are in the same units and double-check for any data entry errors.', '2025-09-19 10:00:00', '2025-09-19 10:00:00'),
('how-calculate-mean', 2, 'Add All Values', 'Sum every number in your dataset. For accuracy with large datasets, use a calculator or spreadsheet software.', '2025-09-19 10:00:00', '2025-09-19 10:00:00'),
('how-calculate-mean', 3, 'Count the Values', 'Determine how many numbers you have. Make sure you don''t count any value twice or miss any values.', '2025-09-19 10:00:00', '2025-09-19 10:00:00'),
('how-calculate-mean', 4, 'Divide Sum by Count', 'Calculate: Mean = Total Sum ÷ Number of Values. The result is your arithmetic mean.', '2025-09-19 10:00:00', '2025-09-19 10:00:00'),

-- Median calculation steps  
('how-calculate-median', 1, 'Arrange Data in Order', 'Sort all values from smallest to largest. This step is essential - you cannot find the median without ordered data.', '2025-09-19 10:00:00', '2025-09-19 10:00:00'),
('how-calculate-median', 2, 'Count Total Values', 'Determine if you have an odd or even number of values (n). This affects how you find the median.', '2025-09-19 10:00:00', '2025-09-19 10:00:00'),
('how-calculate-median', 3, 'Find Middle Position(s)', 'For odd n: middle position = (n+1)/2. For even n: you''ll need the two middle positions.', '2025-09-19 10:00:00', '2025-09-19 10:00:00'),
('how-calculate-median', 4, 'Identify the Median', 'Odd n: The value at the middle position. Even n: Average of the two middle values.', '2025-09-19 10:00:00', '2025-09-19 10:00:00'),

-- Standard deviation steps
('how-calculate-standard-deviation', 1, 'Calculate the Mean', 'Find the arithmetic mean of your dataset: x̄ = (sum of all values) ÷ (number of values)', '2025-09-19 10:00:00', '2025-09-19 10:00:00'),
('how-calculate-standard-deviation', 2, 'Find Deviations', 'For each value, subtract the mean: deviation = value - mean. Some will be positive, some negative.', '2025-09-19 10:00:00', '2025-09-19 10:00:00'),
('how-calculate-standard-deviation', 3, 'Square the Deviations', 'Square each deviation to eliminate negative values: (deviation)². This gives you squared deviations.', '2025-09-19 10:00:00', '2025-09-19 10:00:00'),
('how-calculate-standard-deviation', 4, 'Sum Squared Deviations', 'Add all the squared deviations together: Σ(x - x̄)²', '2025-09-19 10:00:00', '2025-09-19 10:00:00'),
('how-calculate-standard-deviation', 5, 'Calculate Variance', 'Sample variance: divide by (n-1). Population variance: divide by n. Most use sample variance.', '2025-09-19 10:00:00', '2025-09-19 10:00:00'),
('how-calculate-standard-deviation', 6, 'Take Square Root', 'Standard deviation = √variance. This gives you the final result in the same units as your original data.', '2025-09-19 10:00:00', '2025-09-19 10:00:00');

-- Insert metadata for how-to guides
INSERT INTO howto_metadata (howto_slug, total_steps, estimated_time, prerequisites, tools_needed, difficulty_level, last_updated) VALUES
('how-calculate-mean', 4, 15, '["basic arithmetic"]', '["calculator", "pen and paper"]', 'beginner', '2025-09-19 10:00:00'),
('how-calculate-median', 4, 20, '["basic arithmetic", "sorting"]', '["calculator", "pen and paper"]', 'beginner', '2025-09-19 10:00:00'),
('how-calculate-standard-deviation', 6, 30, '["mean calculation", "basic arithmetic", "square root"]', '["calculator", "pen and paper"]', 'intermediate', '2025-09-19 10:00:00'),
('how-calculate-variance', 5, 25, '["mean calculation", "basic arithmetic"]', '["calculator", "pen and paper"]', 'intermediate', '2025-09-19 10:00:00'),
('how-calculate-weighted-mean', 4, 20, '["basic arithmetic", "multiplication"]', '["calculator", "pen and paper"]', 'intermediate', '2025-09-19 10:00:00');