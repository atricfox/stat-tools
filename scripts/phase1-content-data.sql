-- Phase 1 High Priority Content Data - English Version
-- Content supplementation for existing 12 calculators

-- =================================================================
-- FAQ Priority Additions (6 items)
-- =================================================================

-- FAQ 1: Mean vs Median Choice
INSERT INTO content_item (type, title, content, calculator_references, search_keywords, priority_level, status, author) VALUES (
'faq',
'When should I use mean vs median?',
'Use mean for normally distributed data without outliers, as it provides the mathematical average. Use median for skewed distributions or data with outliers, as it represents the middle value and is less affected by extreme values. Consider your data distribution and analysis purpose when choosing.',
'mean,median',
'mean,median,choice,normal distribution,outliers,skewed data',
'high',
'published',
'System'
);

-- FAQ 2: Sample vs Population Standard Deviation
INSERT INTO content_item (type, title, content, calculator_references, search_keywords, priority_level, status, author) VALUES (
'faq',
'What is the difference between sample and population standard deviation?',
'Sample standard deviation (n-1 denominator) estimates population parameters and accounts for degrees of freedom. Population standard deviation (n denominator) describes the entire population. Choose based on whether your data represents a sample or complete population.',
'standard-deviation,variance',
'sample standard deviation,population standard deviation,degrees of freedom,n-1,statistical inference',
'high',
'published',
'System'
);

-- FAQ 3: Weighted vs Unweighted GPA
INSERT INTO content_item (type, title, content, calculator_references, search_keywords, priority_level, status, author) VALUES (
'faq',
'Which is more important: weighted or unweighted GPA?',
'Weighted GPA accounts for course difficulty and better reflects academic rigor, while unweighted GPA provides standardized comparison across different schools. College admissions typically consider both, with weighted GPA showing course challenge level and unweighted GPA enabling fair comparison.',
'gpa,unweighted-gpa',
'weighted GPA,unweighted GPA,college admissions,course difficulty,academic rigor',
'high',
'published',
'System'
);

-- FAQ 4: Cumulative GPA Calculation
INSERT INTO content_item (type, title, content, calculator_references, search_keywords, priority_level, status, author) VALUES (
'faq',
'How do I calculate cumulative GPA across multiple semesters?',
'Cumulative GPA = (Semester 1 GPA × Credits + Semester 2 GPA × Credits + ...) ÷ Total Credits. Each semester must be weighted by its credit hours. Use our cumulative GPA calculator to track your progress across multiple terms.',
'cumulative-gpa,semester-grade',
'cumulative GPA,multiple semesters,credit weighting,calculation method,academic progress',
'high',
'published',
'System'
);

-- FAQ 5: Data Input Formats
INSERT INTO content_item (type, title, content, calculator_references, search_keywords, priority_level, status, author) VALUES (
'faq',
'What data input formats do the calculators support?',
'Our calculators accept comma-separated, space-separated, and line-separated number sequences. You can also copy and paste data columns directly from Excel or Google Sheets. The system automatically detects and parses various number formats.',
'mean,median,standard-deviation,variance,range',
'data input,formats,comma separated,Excel copy,Google Sheets,number parsing',
'high',
'published',
'System'
);

-- FAQ 6: Calculation Precision
INSERT INTO content_item (type, title, content, calculator_references, search_keywords, priority_level, status, author) VALUES (
'faq',
'How accurate are the calculation results?',
'All calculators use double-precision floating-point algorithms for maximum accuracy. Results display 4 decimal places by default, but you can adjust precision settings. Internal calculations maintain full precision regardless of display settings.',
'mean,weighted-mean,standard-deviation,variance,gpa',
'calculation precision,accuracy,double precision,decimal places,floating point',
'high',
'published',
'System'
);

-- =================================================================
-- How-To Guides Priority Additions (4 items)
-- =================================================================

-- How-To 1: Basic Data Analysis Process
INSERT INTO content_item (type, title, content, calculator_references, search_keywords, priority_level, status, author) VALUES (
'how-to',
'How to Perform Basic Data Analysis: Starting with Descriptive Statistics',
'# Basic Data Analysis Workflow

## Step 1: Data Exploration
1. Calculate mean and median to understand central tendency
2. Calculate standard deviation and variance for dispersion measures
3. Calculate range to determine data spread

## Step 2: Data Quality Check
1. Identify outliers using the IQR method
2. Check for data completeness and missing values
3. Validate data reasonableness and accuracy

## Step 3: Result Interpretation
1. Compare mean vs median to assess distribution symmetry
2. Use standard deviation to evaluate data consistency
3. Create visualizations to communicate findings

## Tools to Use
- Use our Mean Calculator for central tendency
- Use Standard Deviation Calculator for variability
- Use Range Calculator for data spread analysis',
'mean,median,standard-deviation,variance,range',
'data analysis,descriptive statistics,workflow,outliers,data quality',
'high',
'published',
'System'
);

-- How-To 2: GPA Improvement Strategy
INSERT INTO content_item (type, title, content, calculator_references, search_keywords, priority_level, status, author) VALUES (
'how-to',
'How to Use GPA Calculators for Academic Planning',
'# GPA Improvement Strategy Guide

## Current GPA Assessment
1. Use Cumulative GPA Calculator to evaluate current standing
2. Analyze each course''s weight impact on overall GPA
3. Identify subjects with greatest improvement potential

## Goal Setting
1. Set realistic target GPA based on remaining credits
2. Use Final Grade Calculator to determine required scores
3. Create semester-by-semester improvement plan

## Strategy Implementation
1. Prioritize high-credit courses for maximum impact
2. Balance weighted and unweighted GPA development
3. Regular progress tracking using our GPA calculators

## Monitoring Progress
- Weekly grade updates using Semester Grade Calculator
- Monthly cumulative GPA checks
- End-of-term comprehensive analysis',
'gpa,cumulative-gpa,final-grade,semester-grade',
'GPA improvement,academic planning,goal setting,progress tracking,study strategy',
'high',
'published',
'System'
);

-- How-To 3: Weighted Average Applications
INSERT INTO content_item (type, title, content, calculator_references, search_keywords, priority_level, status, author) VALUES (
'how-to',
'Real-World Applications of Weighted Average Calculations',
'# Weighted Average Practical Applications

## Investment Portfolio Analysis
1. Asset allocation weighting by portfolio percentage
2. Risk-adjusted return calculations
3. Expected portfolio return estimation

## Academic Assessment
1. Course credit hour weighting for GPA
2. Assignment and exam weight distribution
3. Comprehensive grade calculations

## Business Decision Making
1. Customer satisfaction weighted by importance
2. Supplier evaluation scoring systems
3. Performance metric weight design

## Example Calculation
For a portfolio with:
- Stock A: 60% allocation, 8% return
- Stock B: 40% allocation, 5% return
- Weighted return = (60% × 8%) + (40% × 5%) = 6.8%

Use our Weighted Mean Calculator for accurate results.',
'weighted-mean,gpa',
'weighted average,portfolio analysis,business applications,asset allocation,performance metrics',
'high',
'published',
'System'
);

-- How-To 4: Statistical Result Interpretation
INSERT INTO content_item (type, title, content, calculator_references, search_keywords, priority_level, status, author) VALUES (
'how-to',
'How to Correctly Interpret Statistical Calculation Results',
'# Statistical Results Interpretation Guide

## Central Tendency Interpretation
- **Mean**: Average value, sensitive to outliers
- **Median**: Middle value, resistant to outliers
- **Selection criteria**: Based on data distribution shape

## Dispersion Interpretation
- **Standard Deviation**: Average deviation from mean
- **Variance**: Squared standard deviation, useful for theoretical analysis
- **Range**: Simplest measure of spread

## Practical Translation
1. Convert statistical measures to business language
2. Consider statistical significance and practical significance
3. Contextualize results within specific scenarios

## Common Interpretations
- Low standard deviation = consistent, predictable data
- High standard deviation = variable, unpredictable data
- Mean > Median = right-skewed distribution
- Mean < Median = left-skewed distribution

## Reporting Best Practices
Always report both measures of central tendency and dispersion for complete data description.',
'mean,median,standard-deviation,variance,range',
'result interpretation,central tendency,dispersion,business language,statistical significance',
'high',
'published',
'System'
);

-- =================================================================
-- Core Glossary Terms (8 items)
-- =================================================================

-- Term 1: Descriptive Statistics
INSERT INTO glossary_term (term, slug, definition, examples, seeAlso, calculatorReferences, category) VALUES (
'Descriptive Statistics',
'descriptive-statistics',
'Statistical methods used to describe and summarize data characteristics, including measures of central tendency, dispersion, and distribution shape',
'Mean, median, standard deviation, variance, and range are all descriptive statistics',
'inferential-statistics,central-tendency,dispersion',
'mean,median,standard-deviation,variance,range',
'basic-concepts'
);

-- Term 2: Central Tendency
INSERT INTO glossary_term (term, slug, definition, examples, seeAlso, calculatorReferences, category) VALUES (
'Central Tendency',
'central-tendency',
'Statistical measures that describe the center position of a dataset, indicating the typical or average value',
'Mean (average), median (middle value), and mode (most frequent value) are the three main measures of central tendency',
'mean,median,mode,descriptive-statistics',
'mean,median,weighted-mean',
'basic-concepts'
);

-- Term 3: Dispersion
INSERT INTO glossary_term (term, slug, definition, examples, seeAlso, calculatorReferences, category) VALUES (
'Dispersion',
'dispersion',
'Statistical measures that describe the spread or variability of data points, indicating how much values deviate from the central value',
'Standard deviation, variance, range, and interquartile range are measures of dispersion',
'standard-deviation,variance,range,central-tendency',
'standard-deviation,variance,range',
'basic-concepts'
);

-- Term 4: Sample vs Population
INSERT INTO glossary_term (term, slug, definition, examples, seeAlso, calculatorReferences, category) VALUES (
'Sample vs Population',
'sample-vs-population',
'Population is the complete set of all objects being studied, while sample is a subset selected from the population for analysis. Statistical inference uses samples to estimate population characteristics',
'Surveying all US college students (population) vs surveying 100 college students (sample)',
'sampling,inference,standard-deviation',
'standard-deviation,variance,mean',
'basic-concepts'
);

-- Term 5: Credit System
INSERT INTO glossary_term (term, slug, definition, examples, seeAlso, calculatorReferences, category) VALUES (
'Credit System',
'credit-system',
'Educational system that assigns credit units to courses based on contact hours and difficulty, used to measure student workload and course weighting',
'A 3-credit course has more impact on GPA than a 1-credit course',
'weighted-gpa,unweighted-gpa,cumulative-gpa',
'gpa,cumulative-gpa,semester-grade',
'gpa-concepts'
);

-- Term 6: Grade Point Average
INSERT INTO glossary_term (term, slug, definition, examples, seeAlso, calculatorReferences, category) VALUES (
'Grade Point Average',
'grade-point-average',
'Academic performance indicator calculated by converting letter grades to numerical points and computing the weighted average',
'A=4.0, B=3.0, C=2.0, D=1.0, F=0.0 in standard 4.0 scale',
'weighted-gpa,unweighted-gpa,cumulative-gpa,credit-system',
'gpa,weighted-gpa,unweighted-gpa,cumulative-gpa',
'gpa-concepts'
);

-- Term 7: Course Weighting
INSERT INTO glossary_term (term, slug, definition, examples, seeAlso, calculatorReferences, category) VALUES (
'Course Weighting',
'course-weighting',
'System of adjusting a course''s contribution to overall GPA based on its type and difficulty level, with advanced courses receiving higher weights',
'AP courses weighted 1.2, Honors courses weighted 1.1, Regular courses weighted 1.0',
'weighted-gpa,advanced-placement,honors-courses',
'gpa,weighted-gpa',
'gpa-concepts'
);

-- Term 8: Percent Error
INSERT INTO glossary_term (term, slug, definition, examples, seeAlso, calculatorReferences, category) VALUES (
'Percent Error',
'percent-error',
'Measure of accuracy expressed as the percentage difference between measured and true values, used to assess measurement precision',
'If true value is 100 and measured value is 95, percent error is 5%',
'measurement-error,accuracy,precision',
'percent-error',
'error-analysis'
);

-- =================================================================
-- Priority Case Studies (4 items)
-- =================================================================

-- Case Study 1: GPA Optimization
INSERT INTO content_item (type, title, content, calculator_references, search_keywords, priority_level, status, author) VALUES (
'case-study',
'College Application GPA Optimization: Sarah''s Academic Planning Case',
'# Case Background
Sarah is a high school junior with a current cumulative GPA of 3.2, aiming for admission to competitive universities. She needs to develop a strategic academic plan for her remaining semesters.

## Current Situation Analysis
- Completed Credits: 90 credits
- Current Cumulative GPA: 3.2
- Remaining Semesters: 2 semesters
- Credits per Semester: 18 credits each

## Strategic Planning Using GPA Calculators
Using our Cumulative GPA Calculator, Sarah discovered:
1. To reach 3.6 GPA: needs 4.0 average in remaining 36 credits
2. To reach 3.4 GPA: needs 3.6 average in remaining 36 credits

## Implementation Strategy
1. **Course Selection**: Choose challenging but achievable AP courses
2. **Study Focus**: Prioritize subjects with historical weak performance
3. **Load Balancing**: Distribute difficult courses across both semesters

## Progress Monitoring
Sarah uses our GPA calculators monthly to:
- Track cumulative GPA progress
- Adjust semester course planning
- Validate improvement strategies

## Results
By following this data-driven approach, Sarah successfully raised her GPA to 3.5, significantly improving her college admission prospects.',
'cumulative-gpa,gpa,semester-grade',
'GPA optimization,college admissions,academic planning,strategic planning,data-driven decisions',
'high',
'published',
'System'
);

-- Case Study 2: Market Research Analysis
INSERT INTO content_item (type, title, content, calculator_references, search_keywords, priority_level, status, author) VALUES (
'case-study',
'Product Satisfaction Survey: Statistical Analysis Case Study',
'# Project Background
TechCorp conducted a user satisfaction survey for their new mobile app, collecting 500 responses on a 1-10 satisfaction scale.

## Data Overview
- Sample Size: 500 respondents
- Rating Scale: 1-10 (1=Very Unsatisfied, 10=Very Satisfied)
- Data Type: Quantitative continuous

## Statistical Analysis Process
### 1. Basic Statistics
Using our Mean Calculator: Average satisfaction = 7.2/10
Using our Standard Deviation Calculator: σ = 1.8 (moderate variability)

### 2. Distribution Analysis
Using our Median Calculator: Median = 7.5
Since median > mean, data shows slight left skew (more low ratings)

### 3. Weighted Analysis
Customer segments weighted by business value:
- Premium Users (weight 3): Average 8.1/10
- Regular Users (weight 1): Average 6.8/10
- Weighted Average: 7.4/10

## Business Insights
1. **Overall Performance**: Good satisfaction but room for improvement
2. **Segment Analysis**: Premium users significantly more satisfied
3. **Priority Focus**: Address concerns of regular user segment

## Actionable Recommendations
1. Investigate factors driving premium user satisfaction
2. Implement feedback from users rating below 6
3. Develop retention strategies for regular users

This analysis demonstrates how statistical tools inform business strategy.',
'mean,weighted-mean,standard-deviation,median',
'satisfaction survey,market research,statistical analysis,business insights,customer segmentation',
'high',
'published',
'System'
);

-- Case Study 3: Laboratory Measurement Analysis
INSERT INTO content_item (type, title, content, calculator_references, search_keywords, priority_level, status, author) VALUES (
'case-study',
'Chemistry Lab Error Analysis: Concentration Determination Precision',
'# Experimental Background
Analytical chemistry lab determining solution concentration with theoretical value 2.50 mol/L through 10 repeated measurements.

## Experimental Data
Measured concentrations (mol/L): 2.48, 2.52, 2.49, 2.53, 2.47, 2.51, 2.50, 2.46, 2.54, 2.50

## Statistical Analysis
### 1. Accuracy Assessment
Using our Mean Calculator: x̄ = 2.500 mol/L
Comparison with theoretical: Perfect accuracy (no systematic error)

### 2. Precision Evaluation  
Using our Standard Deviation Calculator: s = 0.026 mol/L
Low standard deviation indicates excellent precision

### 3. Error Analysis
Using our Percent Error Calculator: 
Percent Error = |2.500 - 2.50| / 2.50 × 100% = 0%

## Quality Control Conclusions
1. **Method Reliability**: Analytical method is both accurate and precise
2. **Reproducibility**: Excellent (low standard deviation)
3. **Systematic Error**: None detected (mean equals theoretical value)

## Laboratory Applications
This statistical approach applies to:
- Quality control in analytical chemistry
- Method validation protocols
- Uncertainty estimation procedures
- Instrument calibration verification

The combination of mean, standard deviation, and percent error provides comprehensive measurement quality assessment.',
'mean,standard-deviation,percent-error',
'error analysis,laboratory precision,quality control,analytical chemistry,measurement accuracy',
'high',
'published',
'System'
);

-- Case Study 4: Educational Assessment
INSERT INTO content_item (type, title, content, calculator_references, search_keywords, priority_level, status, author) VALUES (
'case-study',
'Final Exam Score Analysis: Class Performance Evaluation',
'# Analysis Background
Mathematics teacher analyzing final exam scores for 30 students to inform next semester''s instructional improvements.

## Score Data
Student scores: 85, 92, 78, 88, 95, 82, 79, 91, 86, 77, 89, 94, 83, 87, 90, 81, 93, 84, 88, 76, 92, 85, 89, 96, 80, 91, 87, 83, 94, 88

## Comprehensive Statistical Analysis
### 1. Central Tendency
- **Mean**: 86.7 points (excellent class average)
- **Median**: 87 points (close to mean, balanced distribution)

### 2. Variability Assessment
- **Standard Deviation**: 5.2 points (moderate score variation)
- **Range**: 20 points (96-76, reasonable spread)

## Educational Insights
### Performance Evaluation
1. **Class Achievement**: Above-average performance (mean > 85)
2. **Score Consistency**: Relatively uniform performance (moderate SD)
3. **Distribution Shape**: Normal distribution indicated by mean ≈ median

### Instructional Assessment
1. **Teaching Effectiveness**: High mean suggests effective instruction
2. **Student Preparedness**: Low variability indicates consistent understanding
3. **Curriculum Appropriateness**: Range suggests appropriate difficulty level

## Improvement Strategies
1. **Maintain Standards**: Continue current instructional methods
2. **Target Support**: Focus on students scoring below 80
3. **Advanced Challenge**: Consider enrichment for top performers

## Next Semester Planning
Use these statistics to:
- Set realistic performance benchmarks
- Identify students needing additional support
- Adjust curriculum pacing and difficulty

This data-driven approach ensures evidence-based educational decisions.',
'mean,median,standard-deviation,range',
'educational assessment,score analysis,class performance,teaching evaluation,data-driven instruction',
'high',
'published',
'System'
);

-- =================================================================
-- Content Relationships and Tags
-- =================================================================

-- Insert content tags for better organization
INSERT INTO content_tag (name, description, category) VALUES 
('Statistical Concepts', 'Basic statistical theory and concepts', 'theory'),
('GPA Management', 'Grade point average calculation and optimization', 'academic'),
('Data Analysis', 'Methods and techniques for analyzing data', 'practical'),
('Error Analysis', 'Precision, accuracy, and measurement error', 'quality'),
('Business Applications', 'Real-world business use cases', 'application'),
('Academic Planning', 'Educational and academic strategy', 'academic'),
('Laboratory Science', 'Scientific measurement and analysis', 'science'),
('Quality Control', 'Measurement quality and validation', 'quality');

-- Link content items to tags (this will need to be updated with actual IDs after insertion)
-- This section would typically be handled by the application logic rather than direct SQL