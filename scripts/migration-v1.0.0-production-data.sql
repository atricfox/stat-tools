-- =================================================================
-- Migration v1.0.0 - Production Data Export
-- Generated: $(date)
-- Description: Complete data migration with all current calculator, 
--              content, and glossary data
-- =================================================================

-- Migration metadata
INSERT OR IGNORE INTO migration_history (version, name, applied_at, description) VALUES 
('1.0.0', 'production-data-export', datetime('now'), 'Complete production data export including calculators, content, and glossary');

-- =================================================================
-- CALCULATOR GROUPS DATA
-- =================================================================

-- Clear existing data (in proper dependency order)
DELETE FROM calculators;
DELETE FROM calculator_groups;

-- Insert calculator groups
INSERT INTO calculator_groups (id, name, description, sort_order, created_at, updated_at) VALUES 
(1, 'Basic Statistics', 'Fundamental statistical calculations for central tendency and variability', 1, '2024-01-01 00:00:00', '2024-01-01 00:00:00'),
(2, 'Advanced Statistics', 'Complex statistical analysis and probability calculations', 2, '2024-01-01 00:00:00', '2024-01-01 00:00:00'),
(3, 'GPA & Academic', 'Grade point average and academic performance calculators', 3, '2024-01-01 00:00:00', '2024-01-01 00:00:00'),
(4, 'Error Analysis', 'Measurement accuracy and error analysis tools', 4, '2024-01-01 00:00:00', '2024-01-01 00:00:00');

-- =================================================================
-- CALCULATORS DATA  
-- =================================================================

INSERT INTO calculators (id, group_id, name, url, description, is_hot, is_new, sort_order, created_at, updated_at) VALUES 
(1, 1, 'Mean Calculator', '/calculator/mean', 'Calculate the arithmetic mean (average) of a dataset', 1, 0, 1, '2024-01-01 00:00:00', '2024-01-01 00:00:00'),
(2, 1, 'Weighted Mean Calculator', '/calculator/weighted-mean', 'Calculate weighted average with different importance levels', 0, 0, 2, '2024-01-01 00:00:00', '2024-01-01 00:00:00'),
(3, 1, 'Median Calculator', '/calculator/median', 'Find the middle value in a sorted dataset', 1, 0, 3, '2024-01-01 00:00:00', '2024-01-01 00:00:00'),
(4, 1, 'Standard Deviation Calculator', '/calculator/standard-deviation', 'Measure the spread of data around the mean', 1, 0, 4, '2024-01-01 00:00:00', '2024-01-01 00:00:00'),
(5, 1, 'Variance Calculator', '/calculator/variance', 'Calculate the variance of a dataset', 0, 0, 5, '2024-01-01 00:00:00', '2024-01-01 00:00:00'),
(6, 1, 'Range Calculator', '/calculator/range', 'Find the difference between maximum and minimum values', 0, 0, 6, '2024-01-01 00:00:00', '2024-01-01 00:00:00'),
(7, 3, 'GPA Calculator', '/calculator/gpa', 'Calculate Grade Point Average from letter grades', 1, 0, 7, '2024-01-01 00:00:00', '2024-01-01 00:00:00'),
(8, 3, 'Unweighted GPA Calculator', '/calculator/unweighted-gpa', 'Calculate standard 4.0 scale GPA without course weighting', 0, 0, 8, '2024-01-01 00:00:00', '2024-01-01 00:00:00'),
(9, 3, 'Cumulative GPA Calculator', '/calculator/cumulative-gpa', 'Calculate overall GPA across multiple semesters', 0, 1, 9, '2024-01-01 00:00:00', '2024-01-01 00:00:00'),
(10, 3, 'Final Grade Calculator', '/calculator/final-grade', 'Determine what grade is needed on final exam', 0, 0, 10, '2024-01-01 00:00:00', '2024-01-01 00:00:00'),
(11, 3, 'Semester Grade Calculator', '/calculator/semester-grade', 'Calculate semester GPA from current courses', 0, 0, 11, '2024-01-01 00:00:00', '2024-01-01 00:00:00'),
(12, 4, 'Percent Error Calculator', '/calculator/percent-error', 'Calculate percentage error between measured and true values', 0, 0, 12, '2024-01-01 00:00:00', '2024-01-01 00:00:00');

-- =================================================================
-- CONTENT TYPES STATIC DATA
-- =================================================================

DELETE FROM content_types_static;

INSERT INTO content_types_static (id, type, display_name, description, icon_name, sort_order) VALUES 
(1, 'faq', 'Frequently Asked Questions', 'Common questions and answers about statistics and calculators', 'help-circle', 1),
(2, 'howto', 'How-To Guides', 'Step-by-step guides for using calculators and understanding concepts', 'book-open', 2),
(3, 'case', 'Case Studies', 'Real-world examples and applications of statistical concepts', 'briefcase', 3);

-- =================================================================
-- GLOSSARY TERMS DATA
-- =================================================================

DELETE FROM glossary_terms;

INSERT INTO glossary_terms (id, slug, title, short_description, definition, first_letter, created_at, updated_at) VALUES 
(1, 'mean', 'Mean', 'The arithmetic average of a dataset', 'The mean is the sum of all values in a dataset divided by the number of values. It represents the central tendency and is one of the most commonly used measures of average. The mean is sensitive to outliers and works best with normally distributed data.', 'M', '2024-01-01 00:00:00', '2024-01-01 00:00:00'),
(2, 'median', 'Median', 'The middle value when data is ordered', 'The median is the middle value in a dataset when the values are arranged in ascending or descending order. If there is an even number of values, the median is the average of the two middle values. The median is less affected by outliers than the mean.', 'M', '2024-01-01 00:00:00', '2024-01-01 00:00:00'),
(3, 'mode', 'Mode', 'The most frequently occurring value', 'The mode is the value that appears most frequently in a dataset. A dataset can have one mode (unimodal), two modes (bimodal), multiple modes (multimodal), or no mode if all values occur with equal frequency. The mode is useful for categorical data and understanding distribution peaks.', 'M', '2024-01-01 00:00:00', '2024-01-01 00:00:00'),
(4, 'standard-deviation', 'Standard Deviation', 'A measure of data spread around the mean', 'Standard deviation measures how spread out data points are from the mean. A low standard deviation indicates data points are close to the mean, while a high standard deviation indicates data points are spread over a wider range. It is the square root of variance and uses the same units as the original data.', 'S', '2024-01-01 00:00:00', '2024-01-01 00:00:00'),
(5, 'variance', 'Variance', 'The average of squared differences from the mean', 'Variance measures the variability of data points from the mean. It is calculated as the average of the squared differences between each data point and the mean. Variance is always positive and is expressed in squared units of the original data. Standard deviation is the square root of variance.', 'V', '2024-01-01 00:00:00', '2024-01-01 00:00:00'),
(6, 'range', 'Range', 'The difference between maximum and minimum values', 'Range is the simplest measure of variability, calculated as the difference between the largest and smallest values in a dataset. While easy to calculate and understand, range is sensitive to outliers and only considers the extreme values, not the distribution of all data points.', 'R', '2024-01-01 00:00:00', '2024-01-01 00:00:00'),
(7, 'weighted-mean', 'Weighted Mean', 'Average that accounts for the importance of each value', 'The weighted mean assigns different weights or importance levels to different values in a dataset. Each value is multiplied by its weight, then the sum is divided by the total of all weights. This is useful when some data points are more significant than others, such as in GPA calculations where credit hours serve as weights.', 'W', '2024-01-01 00:00:00', '2024-01-01 00:00:00'),
(8, 'gpa', 'GPA', 'Grade Point Average for academic performance', 'GPA (Grade Point Average) is a numerical representation of a student''s academic performance. It converts letter grades to numerical values (typically A=4, B=3, C=2, D=1, F=0) and calculates the average, often weighted by credit hours. GPA is used for academic standing, graduation requirements, and college admissions.', 'G', '2024-01-01 00:00:00', '2024-01-01 00:00:00'),
(9, 'unweighted-gpa', 'Unweighted GPA', 'Standard GPA calculation without course difficulty weighting', 'Unweighted GPA uses the standard 4.0 scale where A=4.0, B=3.0, C=2.0, D=1.0, and F=0.0, regardless of course difficulty. All courses are treated equally in the calculation, providing a standardized measure that can be compared across different schools and educational systems.', 'U', '2024-01-01 00:00:00', '2024-01-01 00:00:00'),
(10, 'weighted-gpa', 'Weighted GPA', 'GPA calculation that accounts for course difficulty', 'Weighted GPA assigns higher point values to more challenging courses like Advanced Placement (AP), International Baccalaureate (IB), or Honors classes. For example, an A in an AP course might be worth 5.0 points instead of 4.0. This system rewards students for taking more rigorous coursework.', 'W', '2024-01-01 00:00:00', '2024-01-01 00:00:00'),
(11, 'percentile', 'Percentile', 'The value below which a percentage of data falls', 'A percentile indicates the value below which a certain percentage of data points fall. For example, the 75th percentile is the value below which 75% of the data points lie. Percentiles are useful for understanding relative position within a dataset and are commonly used in standardized testing and growth charts.', 'P', '2024-01-01 00:00:00', '2024-01-01 00:00:00'),
(12, 'confidence-interval', 'Confidence Interval', 'A range of values likely to contain the true population parameter', 'A confidence interval provides a range of values that likely contains the true population parameter with a specified level of confidence (e.g., 95%). It accounts for sampling uncertainty and gives insight into the precision of sample estimates. Wider intervals indicate less precision, while narrower intervals suggest more precision.', 'C', '2024-01-01 00:00:00', '2024-01-01 00:00:00'),
(13, 'percent-error', 'Percent Error', 'A measure of accuracy expressed as a percentage', 'Percent error quantifies the accuracy of a measurement by expressing the absolute difference between measured and true values as a percentage of the true value. Formula: |measured - true| / true × 100%. Lower percent error indicates higher accuracy, making it useful for evaluating experimental precision and method reliability.', 'P', '2024-01-01 00:00:00', '2024-01-01 00:00:00'),
(14, 'descriptive-statistics', 'Descriptive Statistics', 'Statistical methods for summarizing and describing data characteristics', 'Statistical methods used to describe and summarize data characteristics, including measures of central tendency (mean, median, mode), dispersion (standard deviation, variance, range), and distribution shape. Descriptive statistics provide a concise summary of sample data without making inferences about the larger population. Examples include calculating the average test score for a class, finding the spread of housing prices in a neighborhood, or determining the most common customer rating.', 'D', '2024-01-01 00:00:00', '2024-01-01 00:00:00'),
(15, 'central-tendency', 'Central Tendency', 'Statistical measures that identify the center or typical value of a dataset', 'Statistical measures that describe the center position of a dataset, indicating the typical or average value around which data points cluster. The three main measures are: mean (arithmetic average), median (middle value when data is ordered), and mode (most frequently occurring value). Central tendency helps identify the "typical" case and provides a single value that represents the entire dataset. The choice between measures depends on data distribution and the presence of outliers.', 'C', '2024-01-01 00:00:00', '2024-01-01 00:00:00'),
(16, 'dispersion', 'Dispersion', 'Statistical measures that describe how spread out or variable data points are', 'Statistical measures that describe the spread or variability of data points, indicating how much values deviate from the central value. Common measures include standard deviation (average distance from mean), variance (squared standard deviation), range (difference between maximum and minimum), and interquartile range (spread of middle 50% of data). High dispersion indicates data points are spread widely from the center, while low dispersion indicates data points cluster closely around the central value.', 'D', '2024-01-01 00:00:00', '2024-01-01 00:00:00'),
(17, 'sample-vs-population', 'Sample vs Population', 'Distinction between complete datasets (population) and subsets (samples)', 'Population refers to the complete set of all objects, individuals, or measurements being studied, while sample refers to a subset selected from the population for analysis. Population parameters describe characteristics of the entire group, while sample statistics estimate these characteristics. For example, surveying all US college students represents the population, while surveying 1,000 randomly selected students represents a sample. Statistical inference uses sample data to make conclusions about population parameters, requiring careful sampling methods to ensure representativeness.', 'S', '2024-01-01 00:00:00', '2024-01-01 00:00:00'),
(18, 'credit-system', 'Credit System', 'Educational framework that assigns units to courses based on workload and difficulty', 'Educational system that assigns credit units (credit hours) to courses based on contact time, workload, and academic difficulty. Credits determine course weight in GPA calculations and graduation requirements. Typically, one credit represents one hour of class time per week over a semester. For example, a 3-credit course meets three hours weekly and carries three times the GPA weight of a 1-credit course. Credit systems enable standardized measurement of academic progress and fair comparison of student workloads across different courses and institutions.', 'C', '2024-01-01 00:00:00', '2024-01-01 00:00:00'),
(19, 'grade-point-average', 'Grade Point Average (GPA)', 'Numerical representation of academic performance calculated from letter grades', 'Academic performance indicator calculated by converting letter grades to numerical points and computing the weighted average based on credit hours. In the standard 4.0 scale: A=4.0, B=3.0, C=2.0, D=1.0, F=0.0. GPA calculation: sum of (grade points × credit hours) divided by total credit hours. For example, an A in a 3-credit course contributes 12 grade points (4.0 × 3). GPAs provide standardized comparison of academic achievement and are crucial for college admissions, scholarships, and academic standing.', 'G', '2024-01-01 00:00:00', '2024-01-01 00:00:00'),
(20, 'course-weighting', 'Course Weighting', 'System of adjusting course impact on GPA based on difficulty and type', 'System of adjusting a course''s contribution to overall GPA based on its type, difficulty level, and academic rigor. Advanced courses (AP, IB, Honors) receive higher weights to reflect increased challenge. For example: AP courses weighted 1.2 (A=4.8), Honors courses weighted 1.1 (A=4.4), Regular courses weighted 1.0 (A=4.0). This system encourages students to take challenging coursework while ensuring fair GPA representation. Weighted GPAs can exceed 4.0, while unweighted GPAs cap at 4.0 regardless of course difficulty.', 'C', '2024-01-01 00:00:00', '2024-01-01 00:00:00');

-- =================================================================
-- MIGRATION COMPLETION LOG
-- =================================================================

-- Update migration record
UPDATE migration_history 
SET completed_at = datetime('now'),
    records_migrated = (
        SELECT 
            (SELECT COUNT(*) FROM calculator_groups) +
            (SELECT COUNT(*) FROM calculators) +
            (SELECT COUNT(*) FROM content_types_static) +
            (SELECT COUNT(*) FROM glossary_terms) +
            (SELECT COUNT(*) FROM slim_content)
    ),
    status = 'completed'
WHERE version = '1.0.0' AND name = 'production-data-export';

-- =================================================================
-- VERIFICATION QUERIES
-- =================================================================

-- Uncomment these queries to verify the migration:
-- SELECT 'calculator_groups' as table_name, COUNT(*) as count FROM calculator_groups
-- UNION ALL SELECT 'calculators', COUNT(*) FROM calculators  
-- UNION ALL SELECT 'content_types_static', COUNT(*) FROM content_types_static
-- UNION ALL SELECT 'glossary_terms', COUNT(*) FROM glossary_terms
-- UNION ALL SELECT 'slim_content', COUNT(*) FROM slim_content;

-- =================================================================
-- END OF MIGRATION v1.0.0
-- =================================================================