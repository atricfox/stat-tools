-- Migration 003: Seed Calculator Data
-- Description: Insert initial calculator groups and calculator configurations
-- Version: 2025-09-19

-- Insert calculator groups
INSERT INTO calculator_groups (id, group_name, display_name, sort_order, created_at, updated_at) VALUES
(1, 'means-weighted', 'Mean & Weighted Average', 1, '2025-09-19 10:00:00', '2025-09-19 10:00:00'),
(2, 'dispersion', 'Variance & Standard Deviation', 2, '2025-09-19 10:00:00', '2025-09-19 10:00:00'),
(3, 'gpa-grades', 'GPA & Grade Tools', 3, '2025-09-19 10:00:00', '2025-09-19 10:00:00'),
(4, 'descriptive-others', 'Other Statistical Tools', 4, '2025-09-19 10:00:00', '2025-09-19 10:00:00');

-- Insert calculators
INSERT INTO calculators (id, group_id, name, url, description, is_hot, is_new, sort_order, created_at, updated_at) VALUES
-- Mean & Weighted Average Group
(1, 1, 'Mean Calculator', '/calculator/mean', 'Calculate arithmetic mean (average) of a dataset', 1, 0, 1, '2025-09-19 10:00:00', '2025-09-19 10:00:00'),
(2, 1, 'Weighted Mean Calculator', '/calculator/weighted-mean', 'Calculate weighted average with custom weights', 0, 0, 2, '2025-09-19 10:00:00', '2025-09-19 10:00:00'),
(3, 1, 'Median Calculator', '/calculator/median', 'Compute the median of a dataset', 0, 0, 3, '2025-09-19 10:00:00', '2025-09-19 10:00:00'),

-- Variance & Standard Deviation Group
(4, 2, 'Standard Deviation Calculator', '/calculator/standard-deviation', 'Calculate standard deviation (sample/population)', 1, 0, 1, '2025-09-19 10:00:00', '2025-09-19 10:00:00'),
(5, 2, 'Variance Calculator', '/calculator/variance', 'Compute variance of a dataset', 0, 0, 2, '2025-09-19 10:00:00', '2025-09-19 10:00:00'),
(6, 2, 'Range Calculator', '/calculator/range', 'Calculate the range (max - min) of a dataset', 0, 0, 3, '2025-09-19 10:00:00', '2025-09-19 10:00:00'),

-- GPA & Grade Tools Group
(7, 3, 'GPA Calculator', '/calculator/gpa', 'Calculate weighted GPA from grades and credits', 1, 0, 1, '2025-09-19 10:00:00', '2025-09-19 10:00:00'),
(8, 3, 'Unweighted GPA Calculator', '/calculator/unweighted-gpa', 'Calculate simple unweighted GPA', 0, 0, 2, '2025-09-19 10:00:00', '2025-09-19 10:00:00'),
(9, 3, 'Cumulative GPA Calculator', '/calculator/cumulative-gpa', 'Calculate cumulative GPA across semesters', 0, 0, 3, '2025-09-19 10:00:00', '2025-09-19 10:00:00'),

-- Other Statistical Tools Group
(10, 4, 'Correlation Calculator', '/calculator/correlation', 'Calculate correlation coefficient between datasets', 0, 1, 1, '2025-09-19 10:00:00', '2025-09-19 10:00:00'),
(11, 4, 'T-Test Calculator', '/calculator/t-test', 'Perform statistical t-tests for hypothesis testing', 0, 1, 2, '2025-09-19 10:00:00', '2025-09-19 10:00:00'),
(12, 4, 'Percent Error Calculator', '/calculator/percent-error', 'Calculate percentage error between values', 0, 0, 3, '2025-09-19 10:00:00', '2025-09-19 10:00:00'),
(13, 4, 'Mean Confidence Intervals Calculator', '/calculator/mean-confidence-intervals', 'Calculate multiple types of confidence intervals for the mean: t-interval, Bootstrap percentile, BCa, and trimmed mean', 0, 1, 4, '2025-09-19 10:00:00', '2025-09-19 10:00:00');