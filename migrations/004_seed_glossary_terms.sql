-- Migration 004: Seed Glossary Terms
-- Description: Insert statistical terms and definitions for educational content
-- Version: 2025-09-19

INSERT INTO glossary_terms (id, slug, title, definition, example, category, related_terms, tags, difficulty, created_at, updated_at) VALUES

-- Basic Statistical Concepts
(1, 'mean', 'Mean (Average)', 'The arithmetic average of a set of values, calculated by adding all values and dividing by the number of values.', 'The mean of [2, 4, 6, 8, 10] is (2+4+6+8+10)/5 = 6', 'central-tendency', '["median", "mode", "weighted-mean"]', '["statistics", "average", "central tendency"]', 'beginner', '2025-09-19 10:00:00', '2025-09-19 10:00:00'),

(2, 'median', 'Median', 'The middle value in a dataset when values are arranged in ascending order. For even numbers of values, it''s the average of the two middle values.', 'The median of [1, 3, 5, 7, 9] is 5. The median of [1, 3, 5, 7] is (3+5)/2 = 4', 'central-tendency', '["mean", "mode", "quartile"]', '["statistics", "central tendency", "resistant measure"]', 'beginner', '2025-09-19 10:00:00', '2025-09-19 10:00:00'),

(3, 'mode', 'Mode', 'The value that appears most frequently in a dataset. A dataset can have one mode, multiple modes, or no mode.', 'In [1, 2, 2, 3, 4], the mode is 2. In [1, 2, 2, 3, 3], both 2 and 3 are modes (bimodal)', 'central-tendency', '["mean", "median", "frequency"]', '["statistics", "central tendency", "frequency"]', 'beginner', '2025-09-19 10:00:00', '2025-09-19 10:00:00'),

(4, 'standard-deviation', 'Standard Deviation', 'A measure of variability that indicates how spread out data points are from the mean. Lower values indicate data points are closer to the mean.', 'If test scores have a mean of 80 and standard deviation of 5, most scores fall between 75-85', 'variability', '["variance", "mean", "range"]', '["statistics", "variability", "dispersion"]', 'intermediate', '2025-09-19 10:00:00', '2025-09-19 10:00:00'),

(5, 'variance', 'Variance', 'The average of squared differences from the mean. It measures the spread of data points around the mean.', 'If data points are [2, 4, 6] with mean 4, variance = [(2-4)² + (4-4)² + (6-4)²]/3 = 8/3', 'variability', '["standard-deviation", "mean", "sum-of-squares"]', '["statistics", "variability", "squared deviations"]', 'intermediate', '2025-09-19 10:00:00', '2025-09-19 10:00:00'),

(6, 'range', 'Range', 'The difference between the maximum and minimum values in a dataset. It provides a simple measure of data spread.', 'For test scores [65, 78, 82, 91, 95], the range is 95 - 65 = 30 points', 'variability', '["minimum", "maximum", "standard-deviation"]', '["statistics", "variability", "simple measure"]', 'beginner', '2025-09-19 10:00:00', '2025-09-19 10:00:00'),

-- Advanced Concepts
(7, 'outlier', 'Outlier', 'A data point that differs significantly from other observations. Often defined as values beyond 1.5×IQR from the quartiles.', 'In income data [30K, 32K, 35K, 38K, 200K], the 200K salary is an outlier', 'data-quality', '["quartile", "iqr", "boxplot"]', '["statistics", "data cleaning", "extreme values"]', 'intermediate', '2025-09-19 10:00:00', '2025-09-19 10:00:00'),

(8, 'correlation', 'Correlation', 'A statistical measure indicating the strength and direction of a linear relationship between two variables, ranging from -1 to +1.', 'Height and weight typically have positive correlation (~0.7), meaning taller people tend to weigh more', 'relationships', '["covariance", "regression", "scatter-plot"]', '["statistics", "relationships", "linear association"]', 'intermediate', '2025-09-19 10:00:00', '2025-09-19 10:00:00'),

(9, 'confidence-interval', 'Confidence Interval', 'A range of values that likely contains the true population parameter with a specified level of confidence (e.g., 95%).', 'A 95% confidence interval for mean height might be [68.2, 69.8] inches', 'inference', '["margin-of-error", "sample-size", "t-distribution"]', '["statistics", "inference", "uncertainty"]', 'advanced', '2025-09-19 10:00:00', '2025-09-19 10:00:00'),

(10, 'p-value', 'P-Value', 'The probability of obtaining results as extreme as observed, assuming the null hypothesis is true. Used in hypothesis testing.', 'A p-value of 0.03 means there''s a 3% chance of getting these results if the null hypothesis were true', 'hypothesis-testing', '["null-hypothesis", "significance-level", "t-test"]', '["statistics", "hypothesis testing", "probability"]', 'advanced', '2025-09-19 10:00:00', '2025-09-19 10:00:00'),

-- Educational Concepts
(11, 'gpa', 'Grade Point Average (GPA)', 'A weighted average of grades earned in courses, typically on a 4.0 scale where A=4, B=3, C=2, D=1, F=0.', 'If you earn an A (4.0) in a 3-credit course and B (3.0) in a 2-credit course: GPA = (4×3 + 3×2)/(3+2) = 18/5 = 3.6', 'academic', '["weighted-average", "credit-hours", "cumulative-gpa"]', '["education", "grades", "academic performance"]', 'beginner', '2025-09-19 10:00:00', '2025-09-19 10:00:00'),

(12, 'cumulative-gpa', 'Cumulative GPA', 'The overall GPA calculated across all semesters or terms, weighted by credit hours from all completed courses.', 'If Semester 1 GPA is 3.5 (15 credits) and Semester 2 GPA is 3.8 (12 credits): Cumulative = (3.5×15 + 3.8×12)/(15+12) = 3.63', 'academic', '["gpa", "weighted-average", "credit-hours"]', '["education", "grades", "long-term performance"]', 'intermediate', '2025-09-19 10:00:00', '2025-09-19 10:00:00'),

-- Measurement and Error
(13, 'percent-error', 'Percent Error', 'A measure of accuracy calculated as the absolute difference between measured and true values, divided by the true value, expressed as a percentage.', 'If true value is 100 and measured value is 98: Percent Error = |98-100|/100 × 100% = 2%', 'measurement', '["absolute-error", "accuracy", "precision"]', '["measurement", "error analysis", "quality control"]', 'intermediate', '2025-09-19 10:00:00', '2025-09-19 10:00:00'),

(14, 'sampling-distribution', 'Sampling Distribution', 'The probability distribution of a statistic (like sample mean) across all possible samples of a given size from a population.', 'If you take many samples of size 30 from a population and calculate each sample''s mean, the distribution of those means is the sampling distribution', 'sampling', '["central-limit-theorem", "standard-error", "sample-mean"]', '["statistics", "sampling", "distributions"]', 'advanced', '2025-09-19 10:00:00', '2025-09-19 10:00:00'),

(15, 'central-limit-theorem', 'Central Limit Theorem', 'States that the sampling distribution of sample means approaches a normal distribution as sample size increases, regardless of the population distribution shape.', 'Even if individual heights are not normally distributed, the means of many samples of 30 heights will be approximately normal', 'theory', '["sampling-distribution", "normal-distribution", "sample-size"]', '["statistics", "theory", "fundamental concepts"]', 'advanced', '2025-09-19 10:00:00', '2025-09-19 10:00:00'),

-- Data Types and Quality
(16, 'population', 'Population', 'The complete set of all individuals, objects, or measurements of interest in a statistical study.', 'All registered voters in a country, all students at a university, or all manufactured products in a batch', 'basic-concepts', '["sample", "parameter", "census"]', '["statistics", "data collection", "study design"]', 'beginner', '2025-09-19 10:00:00', '2025-09-19 10:00:00'),

(17, 'sample', 'Sample', 'A subset of the population selected for analysis. Good samples are representative of the larger population.', 'Surveying 1,000 randomly selected voters from all registered voters to predict election outcomes', 'basic-concepts', '["population", "statistic", "random-sampling"]', '["statistics", "data collection", "inference"]', 'beginner', '2025-09-19 10:00:00', '2025-09-19 10:00:00'),

(18, 'bias', 'Bias', 'Systematic error that consistently skews results in a particular direction, often due to flawed data collection or analysis methods.', 'Surveying only smartphone users about internet usage would bias results toward higher usage rates', 'data-quality', '["systematic-error", "random-error", "selection-bias"]', '["statistics", "data quality", "research methods"]', 'intermediate', '2025-09-19 10:00:00', '2025-09-19 10:00:00'),

(19, 'normal-distribution', 'Normal Distribution', 'A symmetric, bell-shaped probability distribution where most values cluster around the mean and probabilities tail off equally in both directions.', 'Human heights, IQ scores, and measurement errors often follow approximately normal distributions', 'distributions', '["bell-curve", "z-score", "standard-normal"]', '["statistics", "probability", "distributions"]', 'intermediate', '2025-09-19 10:00:00', '2025-09-19 10:00:00'),

(20, 'z-score', 'Z-Score (Standard Score)', 'The number of standard deviations a data point is from the mean. Positive z-scores are above the mean, negative below.', 'If mean=100, SD=15, then a score of 130 has z-score = (130-100)/15 = 2.0', 'standardization', '["standard-deviation", "normal-distribution", "percentile"]', '["statistics", "standardization", "comparison"]', 'intermediate', '2025-09-19 10:00:00', '2025-09-19 10:00:00');