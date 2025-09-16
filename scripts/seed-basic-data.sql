-- 基础数据种子脚本 - 适配实际表结构
-- 执行: sqlite3 data/statcal.db < scripts/seed-basic-data.sql

-- ==========================================
-- 1. 计算器组数据
-- ==========================================

INSERT OR IGNORE INTO calculator_groups (group_name, display_name, sort_order) VALUES
  ('means-weighted', 'Mean & Weighted Average', 1),
  ('dispersion', 'Variance & Standard Deviation', 2),
  ('gpa-grades', 'GPA & Grade Tools', 3),
  ('descriptive-others', 'Other Statistical Tools', 4);

-- ==========================================
-- 2. 计算器数据
-- ==========================================

-- Mean & Weighted Average 组
INSERT OR IGNORE INTO calculators (name, description, url, group_id, is_hot, is_new, sort_order)
SELECT 
  'Mean Calculator',
  'Calculate arithmetic mean (average) of a dataset',
  '/calculator/mean',
  cg.id,
  1, 0, 1
FROM calculator_groups cg WHERE cg.group_name = 'means-weighted';

INSERT OR IGNORE INTO calculators (name, description, url, group_id, is_hot, is_new, sort_order)
SELECT 
  'Weighted Mean Calculator',
  'Calculate weighted average with custom weights',
  '/calculator/weighted-mean',
  cg.id,
  0, 0, 2
FROM calculator_groups cg WHERE cg.group_name = 'means-weighted';

INSERT OR IGNORE INTO calculators (name, description, url, group_id, is_hot, is_new, sort_order)
SELECT 
  'Median Calculator',
  'Compute the median of a dataset',
  '/calculator/median',
  cg.id,
  0, 0, 3
FROM calculator_groups cg WHERE cg.group_name = 'means-weighted';

-- Variance & Standard Deviation 组
INSERT OR IGNORE INTO calculators (name, description, url, group_id, is_hot, is_new, sort_order)
SELECT 
  'Standard Deviation Calculator',
  'Calculate standard deviation (sample/population)',
  '/calculator/standard-deviation',
  cg.id,
  1, 0, 1
FROM calculator_groups cg WHERE cg.group_name = 'dispersion';

INSERT OR IGNORE INTO calculators (name, description, url, group_id, is_hot, is_new, sort_order)
SELECT 
  'Variance Calculator',
  'Compute variance of a dataset',
  '/calculator/variance',
  cg.id,
  0, 0, 2
FROM calculator_groups cg WHERE cg.group_name = 'dispersion';

INSERT OR IGNORE INTO calculators (name, description, url, group_id, is_hot, is_new, sort_order)
SELECT 
  'Range Calculator',
  'Calculate the range (max - min) of a dataset',
  '/calculator/range',
  cg.id,
  0, 0, 3
FROM calculator_groups cg WHERE cg.group_name = 'dispersion';

-- GPA & Grade Tools 组
INSERT OR IGNORE INTO calculators (name, description, url, group_id, is_hot, is_new, sort_order)
SELECT 
  'GPA Calculator',
  'Calculate weighted GPA from grades and credits',
  '/calculator/gpa',
  cg.id,
  1, 0, 1
FROM calculator_groups cg WHERE cg.group_name = 'gpa-grades';

INSERT OR IGNORE INTO calculators (name, description, url, group_id, is_hot, is_new, sort_order)
SELECT 
  'Unweighted GPA Calculator',
  'Calculate simple unweighted GPA',
  '/calculator/unweighted-gpa',
  cg.id,
  0, 0, 2
FROM calculator_groups cg WHERE cg.group_name = 'gpa-grades';

INSERT OR IGNORE INTO calculators (name, description, url, group_id, is_hot, is_new, sort_order)
SELECT 
  'Cumulative GPA Calculator',
  'Calculate cumulative GPA across semesters',
  '/calculator/cumulative-gpa',
  cg.id,
  0, 0, 3
FROM calculator_groups cg WHERE cg.group_name = 'gpa-grades';

INSERT OR IGNORE INTO calculators (name, description, url, group_id, is_hot, is_new, sort_order)
SELECT 
  'Final Grade Calculator',
  'Calculate required final exam score for target grade',
  '/calculator/final-grade',
  cg.id,
  0, 0, 4
FROM calculator_groups cg WHERE cg.group_name = 'gpa-grades';

INSERT OR IGNORE INTO calculators (name, description, url, group_id, is_hot, is_new, sort_order)
SELECT 
  'Semester Grade Calculator',
  'Calculate semester grade from assignments and exams',
  '/calculator/semester-grade',
  cg.id,
  0, 0, 5
FROM calculator_groups cg WHERE cg.group_name = 'gpa-grades';

-- Other Statistical Tools 组
INSERT OR IGNORE INTO calculators (name, description, url, group_id, is_hot, is_new, sort_order)
SELECT 
  'Percent Error Calculator',
  'Calculate percentage error between measured and actual values',
  '/calculator/percent-error',
  cg.id,
  0, 0, 1
FROM calculator_groups cg WHERE cg.group_name = 'descriptive-others';

-- ==========================================
-- 3. 术语数据 (glossary_terms)
-- ==========================================

INSERT OR IGNORE INTO glossary_terms (slug, title, short_description, definition) VALUES

('mean', 'Mean', 'The average of a set of numbers', 
'Mean (arithmetic mean) is the sum of all values divided by the number of values. It represents the central tendency of a dataset and is one of the most commonly used statistical measures.'),

('median', 'Median', 'The middle value when data is ordered', 
'Median is the middle value in an ordered dataset. For odd numbers of data points, it''s the middle value. For even numbers, it''s the average of the two middle values. Median is less affected by outliers than mean.'),

('mode', 'Mode', 'The most frequently occurring value', 
'Mode is the value that appears most frequently in a dataset. A dataset can have no mode, one mode (unimodal), or multiple modes (bimodal, multimodal). Mode is useful for both numerical and categorical data.'),

('standard-deviation', 'Standard Deviation', 'Measure of data spread around the mean', 
'Standard deviation measures how spread out data points are from the mean. A small standard deviation indicates data points are close to the mean, while a large standard deviation indicates more spread. It''s the square root of variance.'),

('variance', 'Variance', 'Average of squared differences from the mean', 
'Variance measures the variability of data points from the mean. It''s calculated as the average of squared differences from the mean. Sample variance uses n-1 in the denominator (Bessel''s correction) while population variance uses n.'),

('range', 'Range', 'Difference between maximum and minimum values', 
'Range is the simplest measure of variability, calculated as the difference between the largest and smallest values in a dataset. While easy to calculate, it''s sensitive to outliers and doesn''t account for the distribution of values between extremes.'),

('weighted-mean', 'Weighted Mean', 'Average that accounts for different importance of values', 
'Weighted mean (weighted average) gives different weights to different values based on their importance or frequency. It''s calculated by multiplying each value by its weight, summing these products, and dividing by the sum of weights.'),

('gpa', 'GPA', 'Grade Point Average for academic performance', 
'GPA (Grade Point Average) is a standardized way to measure academic achievement. It''s calculated by assigning point values to letter grades, multiplying by credit hours, and dividing by total credit hours attempted.'),

('unweighted-gpa', 'Unweighted GPA', 'Simple GPA without difficulty adjustments', 
'Unweighted GPA treats all courses equally regardless of difficulty level. Standard grades (A=4.0, B=3.0, C=2.0, D=1.0, F=0.0) are used without additional points for honors, AP, or advanced courses.'),

('weighted-gpa', 'Weighted GPA', 'GPA adjusted for course difficulty', 
'Weighted GPA gives additional points for more challenging courses like Honors, AP, or IB classes. This system recognizes that advanced courses require more effort and provides a more comprehensive view of academic achievement.'),

('percentile', 'Percentile', 'Value below which a percentage of data falls', 
'Percentile indicates the value below which a certain percentage of observations fall. For example, the 75th percentile is the value below which 75% of the data points lie. Percentiles are useful for understanding relative position in a dataset.'),

('confidence-interval', 'Confidence Interval', 'Range of plausible values for a parameter', 
'Confidence interval provides a range of values that likely contains the true population parameter. A 95% confidence interval means that if we repeated the sampling process many times, 95% of the intervals would contain the true parameter value.'),

('percent-error', 'Percent Error', 'Measure of accuracy in measurements or calculations', 
'Percent error quantifies the accuracy of a measured or calculated value compared to the true or accepted value. It''s calculated as the absolute difference between measured and true values, divided by the true value, then multiplied by 100%.');

-- ==========================================
-- 4. 内容数据 (slim_content)
-- ==========================================

INSERT OR IGNORE INTO slim_content (slug, type, title, summary, content, status, reading_time, priority, featured, difficulty, industry, target_tool, tags) VALUES

-- FAQ 类型
('difference-mean-median', 'faq', 'What''s the difference between mean and median?', 
'Learn the key differences between mean and median, including when to use each measure and how outliers affect them.',
'# What''s the difference between mean and median?

## Quick Answer
**Mean** is the arithmetic average (sum ÷ count), while **median** is the middle value when data is sorted. The key difference is that mean is affected by outliers, but median is not.

## Detailed Explanation

### Mean (Average)
- **Definition**: Sum of all values divided by the number of values
- **Formula**: (x₁ + x₂ + ... + xₙ) ÷ n
- **Sensitive to outliers**: Yes, extreme values pull the mean toward them

### Median  
- **Definition**: The middle value in an ordered dataset
- **Calculation**: Sort data, find middle value (or average of two middle values for even n)
- **Sensitive to outliers**: No, only position matters

## Example Comparison
**Data**: [2, 3, 4, 5, 100]

- **Mean**: (2+3+4+5+100) ÷ 5 = 22.8
- **Median**: 4 (middle value)

The outlier (100) dramatically increases the mean but doesn''t affect the median.

## When to Use Each

### Use Mean When:
- Data is roughly symmetrical
- No significant outliers
- You need to account for all values

### Use Median When:  
- Data is skewed
- Outliers are present
- You want a "typical" value

## Related Tools
- [Mean Calculator](/calculator/mean) - Calculate arithmetic mean
- [Median Calculator](/calculator/median) - Find the median value

Understanding both measures helps you choose the right statistic for your data analysis needs.',
'published', 4, 8, 1, 'beginner', 'education', '/calculator/mean', '["statistics", "mean", "median", "central tendency"]'),

('when-use-mean-median', 'faq', 'When should I use mean vs median?',
'Discover when to use mean versus median for data analysis, with practical examples and decision guidelines.',
'# When should I use mean vs median?

## Decision Framework

The choice between mean and median depends on your data''s characteristics and your analysis goals.

## Use Mean When:

### 1. Normal Distribution
- Data is roughly symmetrical
- Bell-shaped distribution
- No significant skewness

### 2. Complete Information Needed
- You want to account for every data point
- Extreme values are meaningful
- Mathematical calculations required

### 3. Small Datasets
- Limited number of observations
- Every value carries weight
- Sampling variation is a concern

## Use Median When:

### 1. Skewed Data
- Income distributions (usually right-skewed)
- House prices (extreme high values)
- Response times (can''t be negative, often right-skewed)

### 2. Outliers Present
- Data contains extreme values
- Measurement errors possible
- You want "typical" value

### 3. Ordinal Data
- Ranked data (ratings, scores)
- Survey responses (1-5 scales)
- Non-parametric analyses

## Real-World Examples

### Example 1: Employee Salaries
**Salaries**: $35K, $40K, $45K, $42K, $38K, $200K
- **Mean**: $66.7K (inflated by CEO salary)
- **Median**: $41K (typical employee salary)
- **Best choice**: Median (more representative)

### Example 2: Test Scores
**Scores**: 78, 82, 85, 88, 91, 79, 86
- **Mean**: 84.1
- **Median**: 85
- **Best choice**: Either (data is roughly normal)

### Example 3: Website Load Times
**Times (seconds)**: 1.2, 1.5, 1.8, 2.1, 15.7
- **Mean**: 4.46s (affected by slow outlier)
- **Median**: 1.8s (typical performance)
- **Best choice**: Median (for user experience)

## Quick Decision Guide

```
Is your data roughly symmetrical? 
├─ Yes → Use MEAN
└─ No → Are there outliers?
    ├─ Yes → Use MEDIAN  
    └─ No → Either is fine, MEAN slightly preferred
```

## Both Together
Often the best approach is reporting both:
- Mean shows the mathematical center
- Median shows the typical value
- Difference between them indicates skewness

## Related Concepts
- [Understanding Outliers](/glossary/outlier)
- [Data Distribution Types](/glossary/distribution)
- [Central Tendency Measures](/glossary/central-tendency)',
'published', 5, 7, 0, 'beginner', 'education', '/calculator/median', '["statistics", "mean", "median", "data analysis", "decision making"]'),

-- How-to 类型
('how-calculate-mean', 'howto', 'How to Calculate Mean Step by Step',
'Master mean calculation with detailed steps, examples, and common pitfalls to avoid.',
'# How to Calculate Mean Step by Step

## What is Mean?
Mean (arithmetic average) is the sum of all values divided by the number of values. It''s the most common measure of central tendency.

## Formula
**Mean = (Sum of all values) ÷ (Number of values)**

Mathematical notation: **x̄ = Σx / n**

Where:
- x̄ = sample mean
- Σx = sum of all values  
- n = number of values

## Step-by-Step Process

### Step 1: Collect Your Data
Write down all the numbers you want to average.

**Example**: Test scores: 85, 92, 78, 90, 88

### Step 2: Add All Values
Sum every number in your dataset.

**Calculation**: 85 + 92 + 78 + 90 + 88 = 433

### Step 3: Count the Values
Determine how many numbers you have.

**Count**: 5 test scores

### Step 4: Divide Sum by Count
**Mean = 433 ÷ 5 = 86.6**

## More Examples

### Example 1: Monthly Expenses
**Data**: $1,200, $1,350, $1,180, $1,420, $1,250, $1,100

**Steps**:
1. Sum: 1,200 + 1,350 + 1,180 + 1,420 + 1,250 + 1,100 = 7,500
2. Count: 6 months
3. Mean: 7,500 ÷ 6 = $1,250

### Example 2: Website Traffic
**Daily visitors**: 245, 312, 178, 289, 356, 203, 267

**Steps**:
1. Sum: 245 + 312 + 178 + 289 + 356 + 203 + 267 = 1,850
2. Count: 7 days
3. Mean: 1,850 ÷ 7 = 264.3 visitors/day

## Common Mistakes to Avoid

### 1. Forgetting Values
Double-check you''ve included all data points.

### 2. Arithmetic Errors
Use a calculator for large datasets or many decimal places.

### 3. Wrong Count
Make sure you count every value, including zeros if relevant.

### 4. Mixing Units
Ensure all values use the same units (don''t mix dollars and cents).

## Using Our Calculator
For quick calculations, use our [Mean Calculator](/calculator/mean):
1. Enter your data (comma or space separated)
2. Click calculate
3. Get instant results with verification

## When Mean is Useful
- **Grade calculations**: Average test scores
- **Budget analysis**: Average monthly spending
- **Performance metrics**: Average response times
- **Quality control**: Average product measurements

## When to Be Careful
- **Outliers present**: Extreme values skew the mean
- **Skewed data**: Consider median instead
- **Small samples**: One unusual value has big impact

## Related Concepts
- [Median Calculator](/calculator/median) - Alternative measure
- [Weighted Mean](/calculator/weighted-mean) - When values have different importance
- [Standard Deviation](/calculator/standard-deviation) - Measure of spread

Remember: Mean gives you the mathematical center of your data, but it may not always represent the "typical" value, especially with outliers present.',
'published', 6, 8, 0, 'beginner', 'education', '/calculator/mean', '["tutorial", "mean", "calculation", "statistics", "step-by-step"]'),

-- Case study 类型
('gpa-improvement-case-study', 'case', 'Strategic GPA Improvement: From 2.8 to 3.5 in Two Semesters',
'Real student case study showing strategic course selection and study habits that improved GPA from 2.8 to 3.5.',
'# Strategic GPA Improvement: From 2.8 to 3.5 in Two Semesters

## Student Profile
- **Major**: Computer Science
- **Starting GPA**: 2.8 (after 4 semesters)
- **Target GPA**: 3.5
- **Timeline**: 2 semesters
- **Total Credits**: 60 (start) → 90 (end)

## Initial Situation Analysis

### Starting Position (After 4 Semesters)
- **Cumulative GPA**: 2.8
- **Total Credits Completed**: 60
- **Total Grade Points**: 2.8 × 60 = 168

### Challenge
To reach 3.5 GPA with 90 total credits:
- **Required Total Grade Points**: 3.5 × 90 = 315
- **Additional Points Needed**: 315 - 168 = 147
- **Credits to Complete**: 30
- **Required Semester GPA**: 147 ÷ 30 = 4.9

**Problem**: 4.9 GPA is impossible (max is 4.0)!

## Strategic Solution

### Strategy 1: Retake Low-Grade Courses
**Identified Courses for Retake**:
- Calculus II: D (1.0) → Target: B+ (3.3)
- Physics I: D+ (1.3) → Target: B (3.0)  
- Data Structures: C- (1.7) → Target: A- (3.7)

**Impact Analysis**:
- **Original Points**: (1.0 + 1.3 + 1.7) × 3 = 12 points
- **New Points**: (3.3 + 3.0 + 3.7) × 3 = 30 points
- **Point Gain**: +18 points

### Strategy 2: Optimize Course Selection
**Semester 5 Course Load**:
- Easy electives with good professors (research ratings)
- Courses matching learning style
- Balanced difficulty distribution

**Semester 6 Adjustments**:
- Lighter credit load (13 vs 15 credits)
- Focus on major courses requiring strong foundation
- One challenging course max per semester

## Implementation & Results

### Semester 5 Results
**Courses Taken**:
- Retake: Calculus II → B+ (3.3) - 3 credits
- Retake: Physics I → B (3.0) - 4 credits  
- Software Engineering → A- (3.7) - 3 credits
- Technical Writing → A (4.0) - 3 credits
- Art History (elective) → A (4.0) - 3 credits

**Semester GPA**: 3.63
**Credits**: 16
**Grade Points**: 58.1

### Semester 6 Results  
**Courses Taken**:
- Retake: Data Structures → A- (3.7) - 3 credits
- Database Systems → B+ (3.3) - 3 credits
- Web Development → A (4.0) - 3 credits
- Statistics → B+ (3.3) - 3 credits
- Music Appreciation → A (4.0) - 1 credit

**Semester GPA**: 3.64
**Credits**: 13  
**Grade Points**: 47.3

## Final Calculation

### Cumulative GPA After 6 Semesters
- **Original 60 credits**: 168 points (minus retaken courses)
- **Retaken courses**: +18 point improvement
- **New coursework**: 58.1 + 47.3 = 105.4 points
- **Total**: 168 + 18 + 105.4 = 291.4 points
- **Total Credits**: 89
- **Final GPA**: 291.4 ÷ 89 = **3.27**

## Analysis & Lessons

### Why Target Wasn''t Fully Reached
1. **Mathematical constraint**: Starting deficit was too large
2. **Retake limitations**: Some courses couldn''t be retaken immediately
3. **Course difficulty**: Some required courses had limited grade potential

### Key Success Factors
1. **Strategic retakes**: Focused on highest-impact courses
2. **Professor research**: Chose sections with better grade distributions  
3. **Balanced load**: Avoided overcommitment
4. **Study group formation**: Collaborative learning improved performance
5. **Time management**: Better schedule planning

### Unexpected Benefits
- **Deeper understanding**: Retaking courses provided stronger foundation
- **Confidence boost**: Success momentum improved subsequent performance
- **Study skills**: Developed better learning strategies
- **Network building**: Study groups created lasting friendships

## Tools Used

### GPA Planning
- [Cumulative GPA Calculator](/calculator/cumulative-gpa): Plan semester targets
- [Final Grade Calculator](/calculator/final-grade): Determine exam requirements
- Spreadsheet tracking: Monitor progress weekly

### Study Strategy
- Grade distribution research (RateMyProfessor, course evaluations)
- Past exam analysis
- Study group organization
- Office hours utilization

## Recommendations for Similar Situations

### 1. Realistic Goal Setting
- Calculate mathematically possible improvements
- Set incremental targets (semester by semester)
- Consider long-term vs short-term gains

### 2. Strategic Course Selection
- **Retakes**: Focus on highest credit, lowest grade courses
- **New courses**: Balance difficulty and credit load
- **Professors**: Research teaching styles and grade distributions
- **Prerequisites**: Ensure strong foundation for advanced courses

### 3. Support Systems
- Academic advisor consultation
- Tutoring center utilization
- Study group formation
- Mental health resources

### 4. Tracking & Adjustment
- Regular GPA monitoring
- Mid-semester grade checks
- Strategy adjustment based on performance
- Celebrate incremental progress

## Final Outcome
While the student didn''t reach the initial 3.5 target, the improvement from 2.8 to 3.27 represented:
- **17% improvement** in GPA
- **Stronger academic foundation** for remaining coursework
- **Improved study habits** and time management
- **Greater confidence** in academic abilities

The strategic approach turned academic probation risk into solid academic standing, demonstrating that systematic planning can overcome significant GPA deficits.

## Related Tools
- [Cumulative GPA Calculator](/calculator/cumulative-gpa)
- [GPA Calculator](/calculator/gpa)  
- [Final Grade Calculator](/calculator/final-grade)',
'published', 12, 6, 0, 'intermediate', 'education', '/calculator/cumulative-gpa', '["case study", "gpa improvement", "academic strategy", "student success"]');

-- ==========================================
-- 5. 更新搜索索引
-- ==========================================

-- 清空并重建搜索索引
DELETE FROM content_search;

INSERT INTO content_search(rowid, title, summary, content)
SELECT 
    sc.id,
    sc.title,
    COALESCE(sc.summary, 'Content summary not available'),
    COALESCE(sc.content, sc.title)
FROM slim_content sc;

-- ==========================================
-- 6. 验证和报告
-- ==========================================

SELECT 'Basic data seeding completed successfully!' as status;

SELECT '=== Data Summary ===' as section;
SELECT 'Calculator Groups' as type, COUNT(*) as count FROM calculator_groups
UNION ALL
SELECT 'Calculators', COUNT(*) FROM calculators  
UNION ALL
SELECT 'Glossary Terms', COUNT(*) FROM glossary_terms
UNION ALL  
SELECT 'Content Items', COUNT(*) FROM slim_content
UNION ALL
SELECT 'Search Index Entries', COUNT(*) FROM content_search;

SELECT '=== Sample Data ===' as section;
SELECT 'Calculator Groups:' as info;
SELECT group_name, display_name FROM calculator_groups ORDER BY sort_order;

SELECT 'Sample Calculators:' as info;
SELECT name, url, is_hot FROM calculators WHERE is_hot = 1;

SELECT 'Sample Glossary:' as info;  
SELECT title, slug FROM glossary_terms ORDER BY title LIMIT 5;

SELECT 'Sample Content:' as info;
SELECT title, type, target_tool FROM slim_content ORDER BY priority DESC LIMIT 5;