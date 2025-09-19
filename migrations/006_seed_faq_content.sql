-- Migration 006: Seed FAQ Content
-- Description: Insert frequently asked questions for educational content
-- Version: 2025-09-19

INSERT INTO slim_content (id, slug, type, title, summary, content, status, reading_time, priority, featured, difficulty, industry, target_tool, tags, created_at, updated_at) VALUES

-- Basic Statistics FAQs
(101, 'difference-mean-median', 'faq', 'What''s the difference between mean and median?', 'Learn the key differences between mean and median, including when to use each measure and how outliers affect them.', 
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
'published', 3, 8, 1, 'beginner', 'education', '/calculator/mean', '["statistics", "mean", "median", "central tendency"]', '2025-09-19 10:00:00', '2025-09-19 10:00:00'),

(102, 'when-use-mean-median', 'faq', 'When should I use mean vs median?', 'Discover when to use mean versus median for data analysis, with practical examples and decision guidelines.',
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

## Quick Decision Guide

```
Is your data roughly symmetrical? 
├─ Yes → Use MEAN
└─ No → Are there outliers?
    ├─ Yes → Use MEDIAN  
    └─ No → Either is fine, MEAN slightly preferred
```

## Related Concepts
- [Understanding Outliers](/glossary/outlier)
- [Data Distribution Types](/glossary/normal-distribution)
- [Central Tendency Measures](/glossary/mean)',
'published', 3, 7, 0, 'beginner', 'education', '/calculator/median', '["statistics", "mean", "median", "data analysis", "decision making"]', '2025-09-19 10:00:00', '2025-09-19 10:00:00'),

(103, 'what-is-standard-deviation', 'faq', 'What is standard deviation and why does it matter?', 'Understand standard deviation as a measure of data spread and learn why it''s crucial for data analysis.',
'# What is standard deviation and why does it matter?

## Simple Definition
Standard deviation measures how spread out data points are from the average (mean). A smaller standard deviation means data points are clustered closer to the mean, while a larger one means they''re more spread out.

## Why It Matters

### 1. Consistency Assessment
- **Low SD**: Data is consistent and predictable
- **High SD**: Data is variable and unpredictable

### 2. Quality Control
- Manufacturing: Product consistency
- Testing: Score reliability
- Investment: Risk assessment

### 3. Comparison Tool
Compare variability between different groups or time periods.

## Real-World Examples

### Example 1: Two Classes'' Test Scores
- **Class A**: Mean = 80, SD = 3 (scores: 77, 79, 80, 81, 83)
- **Class B**: Mean = 80, SD = 12 (scores: 68, 75, 80, 85, 92)

Both classes have the same average, but Class A is much more consistent.

### Example 2: Investment Returns
- **Stock A**: Mean return = 8%, SD = 2% (stable)
- **Stock B**: Mean return = 8%, SD = 15% (volatile)

Same expected return, but Stock B is much riskier.

## How to Interpret Standard Deviation

### Normal Distribution Rule (68-95-99.7)
- 68% of data falls within 1 SD of the mean
- 95% of data falls within 2 SD of the mean
- 99.7% of data falls within 3 SD of the mean

### Relative Context
- Compare SD to the mean (coefficient of variation)
- SD of 5 is small if mean is 1000, but large if mean is 10

## When Standard Deviation Is Important

1. **Quality Control**: Manufacturing tolerances
2. **Risk Assessment**: Financial volatility
3. **Performance Evaluation**: Consistency in sports
4. **Research**: Reliability of measurements
5. **Grading**: Fairness in academic assessment

## Related Tools
- [Standard Deviation Calculator](/calculator/standard-deviation)
- [Variance Calculator](/calculator/variance)
- [Range Calculator](/calculator/range)',
'published', 4, 9, 1, 'intermediate', 'education', '/calculator/standard-deviation', '["statistics", "standard deviation", "variability", "data analysis"]', '2025-09-19 10:00:00', '2025-09-19 10:00:00'),

(104, 'sample-vs-population', 'faq', 'What''s the difference between sample and population statistics?', 'Learn when to use sample vs population formulas and understand the key differences in statistical calculations.',
'# Sample vs Population Statistics: Key Differences

## Definitions

### Population
- **All** members of a group you''re studying
- Usually impossible or impractical to measure entirely
- Parameters describe populations (μ, σ)

### Sample
- **Subset** of the population
- What you actually measure or observe
- Statistics describe samples (x̄, s)

## Formula Differences

### Mean
- **Population mean (μ)**: Sum of all values ÷ Population size
- **Sample mean (x̄)**: Sum of sample values ÷ Sample size
- Formula is the same, but notation differs

### Standard Deviation
- **Population SD (σ)**: Divide by N
- **Sample SD (s)**: Divide by (n-1)

The (n-1) adjustment is called "Bessel''s correction" and accounts for the fact that sample variance tends to underestimate population variance.

## When to Use Each

### Use Population Formulas When:
- You have data for the entire group
- Census data
- Complete inventory
- Standardized test results for all students in a class

### Use Sample Formulas When:
- You have a subset of the larger group
- Survey responses
- Quality control testing
- Research studies
- Most real-world situations

## Real-World Examples

### Example 1: School Testing
- **Population**: All 500 students in a grade take a standardized test
- **Sample**: Testing 50 randomly selected students to estimate grade performance

### Example 2: Manufacturing
- **Population**: All products in a completed batch
- **Sample**: Testing 20 items from a batch of 10,000 to assess quality

### Example 3: Market Research
- **Population**: All customers of a company
- **Sample**: Surveying 1,000 customers to understand satisfaction

## Why the Difference Matters

### Statistical Inference
- Sample statistics estimate population parameters
- Understanding the difference helps interpret results correctly
- Affects confidence intervals and hypothesis testing

### Accuracy Considerations
- Larger samples better represent populations
- Sample bias can affect estimates
- Random sampling improves representativeness

## Common Misconceptions

1. **"Bigger is always better"**: Quality of sampling matters more than size
2. **"Samples must be large"**: Even small samples can be useful if representative
3. **"Population data is always better"**: Sometimes sampling provides sufficient accuracy with less cost

## Related Concepts
- [Sampling Distribution](/glossary/sampling-distribution)
- [Central Limit Theorem](/glossary/central-limit-theorem)
- [Standard Error vs Standard Deviation](/faq/standard-error-vs-deviation)',
'published', 5, 6, 0, 'intermediate', 'education', '/calculator/standard-deviation', '["statistics", "sampling", "population", "inference"]', '2025-09-19 10:00:00', '2025-09-19 10:00:00'),

(105, 'gpa-calculation-basics', 'faq', 'How is GPA calculated and what do the numbers mean?', 'Master GPA calculation fundamentals, credit weighting, and interpretation of grade point averages.',
'# GPA Calculation: Complete Guide

## Basic GPA Calculation

### Standard 4.0 Scale
- **A**: 4.0 points
- **B**: 3.0 points  
- **C**: 2.0 points
- **D**: 1.0 points
- **F**: 0.0 points

### Step-by-Step Process
1. **Convert grades to points**: Use the scale above
2. **Multiply by credit hours**: Points × Credits for each course
3. **Sum quality points**: Add all (Points × Credits)
4. **Sum credit hours**: Add all credit hours
5. **Calculate GPA**: Total Quality Points ÷ Total Credit Hours

## Example Calculation

### Semester Courses:
- Math (4 credits): B (3.0) → 3.0 × 4 = 12 quality points
- English (3 credits): A (4.0) → 4.0 × 3 = 12 quality points  
- Science (4 credits): C (2.0) → 2.0 × 4 = 8 quality points
- History (2 credits): A (4.0) → 4.0 × 2 = 8 quality points

### GPA Calculation:
- **Total Quality Points**: 12 + 12 + 8 + 8 = 40
- **Total Credit Hours**: 4 + 3 + 4 + 2 = 13
- **GPA**: 40 ÷ 13 = **3.08**

## Types of GPA

### 1. Semester/Term GPA
- Based only on current term courses
- Shows recent academic performance
- Can fluctuate significantly

### 2. Cumulative GPA
- Based on all completed courses
- More stable and comprehensive
- Used for graduation requirements

### 3. Major GPA
- Based only on courses in your major
- Sometimes called "in-major GPA"
- Often required for program admission

## GPA Interpretation

### GPA Ranges
- **3.7-4.0**: Excellent (A- to A average)
- **3.3-3.69**: Good (B+ to A- average)
- **3.0-3.29**: Satisfactory (B to B+ average)
- **2.7-2.99**: Below Average (B- to B average)
- **2.0-2.69**: Poor (C to B- average)
- **Below 2.0**: Academic probation risk

### Academic Standing
- **Dean''s List**: Usually 3.5+ GPA
- **Honor Roll**: Usually 3.25+ GPA
- **Good Standing**: Usually 2.0+ GPA
- **Academic Probation**: Usually below 2.0 GPA

## Plus/Minus Grades

Many schools use plus/minus grading:
- **A**: 4.0, **A-**: 3.7
- **B+**: 3.3, **B**: 3.0, **B-**: 2.7
- **C+**: 2.3, **C**: 2.0, **C-**: 1.7
- **D+**: 1.3, **D**: 1.0, **D-**: 0.7

## GPA Improvement Strategies

### Focus on High-Credit Courses
- Higher credit courses have more impact
- Strategic course selection matters

### Retaking Courses
- Some schools replace grades
- Others average old and new grades
- Check your school''s policy

### Grade Forgiveness
- Some schools offer limited grade forgiveness
- Usually for early academic struggles
- Specific eligibility requirements

## Common GPA Mistakes

1. **Ignoring credit hours**: All courses aren''t weighted equally
2. **Confusing term vs cumulative**: Different calculations
3. **Forgetting withdrawn courses**: May still affect GPA
4. **Misunderstanding retake policies**: School-specific rules

## Related Tools
- [GPA Calculator](/calculator/gpa) - Calculate weighted GPA
- [Cumulative GPA Calculator](/calculator/cumulative-gpa) - Multi-semester tracking
- [Unweighted GPA Calculator](/calculator/unweighted-gpa) - Simple averaging',
'published', 6, 8, 1, 'beginner', 'education', '/calculator/gpa', '["education", "GPA", "grades", "academic performance"]', '2025-09-19 10:00:00', '2025-09-19 10:00:00');