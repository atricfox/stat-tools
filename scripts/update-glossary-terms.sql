-- 更新 Glossary 术语定义脚本
-- 执行方式: sqlite3 data/statcal.db < scripts/update-glossary-terms.sql

-- Mode (众数) - 统计学概念
UPDATE glossary_terms 
SET 
    short_description = 'The value that appears most frequently in a dataset',
    definition = 'In statistics, the mode is the value that appears most often in a data set. A distribution can have one mode (unimodal), two modes (bimodal), or more than two modes (multimodal). Unlike the mean and median, the mode can be used with nominal data. For example, in the dataset [1, 2, 2, 3, 4, 4, 4], the mode is 4 because it appears three times, more than any other value. The mode is particularly useful for categorical data where we want to know which category is most common.',
    first_letter = 'M',
    updated_at = datetime('now')
WHERE slug = 'mode';

-- Unweighted GPA (非加权GPA)
UPDATE glossary_terms 
SET 
    short_description = 'GPA calculated using standard 4.0 scale without weighting for course difficulty',
    definition = 'Unweighted GPA is calculated on a standard 4.0 scale where each course is given equal weight regardless of its difficulty level. Letter grades are converted to points: A = 4.0, B = 3.0, C = 2.0, D = 1.0, F = 0.0. The GPA is calculated by dividing the total grade points by the total number of courses. For example, if a student has grades of A, B, A, C (4.0 + 3.0 + 4.0 + 2.0 = 13.0 total points ÷ 4 courses = 3.25 GPA). This system treats all courses equally, whether they are regular, honors, or AP classes.',
    first_letter = 'U',
    updated_at = datetime('now')
WHERE slug = 'unweighted-gpa';

-- Weighted GPA (加权GPA)
UPDATE glossary_terms 
SET 
    short_description = 'GPA calculated with additional points for advanced courses like AP, IB, or Honors',
    definition = 'Weighted GPA accounts for the difficulty level of courses by assigning additional points to advanced classes. Typically, Honors courses add 0.5 points and AP/IB courses add 1.0 point to the standard grade values. For example: Regular A = 4.0, Honors A = 4.5, AP A = 5.0. A student with an A in AP Math (5.0), B in Honors English (3.5), A in Regular History (4.0), and B in Regular Science (3.0) would have: (5.0 + 3.5 + 4.0 + 3.0) ÷ 4 = 3.875 weighted GPA. This system recognizes the increased difficulty of advanced coursework and is often used by colleges for admissions decisions.',
    first_letter = 'W',
    updated_at = datetime('now')
WHERE slug = 'weighted-gpa';

-- 验证更新结果
SELECT 
    id,
    slug, 
    title, 
    short_description,
    LENGTH(definition) as def_length,
    first_letter,
    updated_at
FROM glossary_terms 
WHERE slug IN ('mode', 'unweighted-gpa', 'weighted-gpa')
ORDER BY slug;