-- Seed core system data
-- Created: 2025-09-17  
-- Description: Inserts core system data (calculator groups, calculators, content types)

-- Insert content types
INSERT INTO content_types_static (id, type_name, display_name) VALUES
(1, 'faq', 'FAQ'),
(2, 'howto', 'How-to'),
(3, 'case', 'Case Study');

-- Insert calculator groups
INSERT INTO calculator_groups (id, group_name, display_name, sort_order, created_at, updated_at) VALUES
(1, 'means-weighted', 'Mean & Weighted Average', 1, '2025-09-16 03:05:53', '2025-09-16 03:05:53'),
(2, 'dispersion', 'Variance & Standard Deviation', 2, '2025-09-16 03:05:53', '2025-09-16 03:05:53'),
(3, 'gpa-grades', 'GPA & Grade Tools', 3, '2025-09-16 03:05:53', '2025-09-16 03:05:53'),
(4, 'descriptive-others', 'Other Statistical Tools', 4, '2025-09-16 03:05:53', '2025-09-16 03:05:53');

-- Insert calculators
INSERT INTO calculators (id, group_id, name, url, description, is_hot, is_new, sort_order, created_at, updated_at) VALUES
(1, 1, 'Mean Calculator', '/calculator/mean', 'Calculate arithmetic mean (average) of a dataset', 1, 0, 1, '2025-09-16 03:05:53', '2025-09-16 03:05:53'),
(2, 1, 'Weighted Mean Calculator', '/calculator/weighted-mean', 'Calculate weighted average with custom weights', 0, 0, 2, '2025-09-16 03:05:53', '2025-09-16 03:05:53'),
(3, 1, 'Median Calculator', '/calculator/median', 'Compute the median of a dataset', 0, 0, 3, '2025-09-16 03:05:53', '2025-09-16 03:05:53'),
(4, 2, 'Standard Deviation Calculator', '/calculator/standard-deviation', 'Calculate standard deviation (sample/population)', 1, 0, 1, '2025-09-16 03:05:53', '2025-09-16 03:05:53'),
(5, 2, 'Variance Calculator', '/calculator/variance', 'Compute variance of a dataset', 0, 0, 2, '2025-09-16 03:05:53', '2025-09-16 03:05:53'),
(6, 2, 'Range Calculator', '/calculator/range', 'Calculate the range (max - min) of a dataset', 0, 0, 3, '2025-09-16 03:05:53', '2025-09-16 03:05:53'),
(7, 3, 'GPA Calculator', '/calculator/gpa', 'Calculate weighted GPA from grades and credits', 1, 0, 1, '2025-09-16 03:05:53', '2025-09-16 03:05:53'),
(8, 3, 'Unweighted GPA Calculator', '/calculator/unweighted-gpa', 'Calculate simple unweighted GPA', 0, 0, 2, '2025-09-16 03:05:53', '2025-09-16 03:05:53'),
(9, 3, 'Cumulative GPA Calculator', '/calculator/cumulative-gpa', 'Calculate cumulative GPA across semesters', 0, 0, 3, '2025-09-16 03:05:53', '2025-09-16 03:05:53'),
(10, 3, 'Final Grade Calculator', '/calculator/final-grade', 'Calculate required final exam score for target grade', 0, 0, 4, '2025-09-16 03:05:53', '2025-09-16 03:05:53'),
(11, 3, 'Semester Grade Calculator', '/calculator/semester-grade', 'Calculate semester grade from assignments and exams', 0, 0, 5, '2025-09-16 03:05:53', '2025-09-16 03:05:53'),
(12, 4, 'Percent Error Calculator', '/calculator/percent-error', 'Calculate percentage error between measured and actual values', 0, 0, 1, '2025-09-16 03:05:53', '2025-09-16 03:05:53'),
(13, 2, 'Mean Confidence Intervals Calculator', '/calculator/mean-confidence-intervals', 'Calculate multiple types of confidence intervals for the mean: t-interval, Bootstrap percentile, BCa, and trimmed mean', 0, 1, 13, '2025-09-17 06:12:51', '2025-09-17 06:12:51');