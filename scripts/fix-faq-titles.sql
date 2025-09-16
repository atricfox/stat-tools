-- Convert FAQ titles to Title Case (Every Word Capitalized)

UPDATE slim_content 
SET title = CASE slug
  WHEN 'difference-mean-median' THEN 'What''s The Difference Between Mean And Median?'
  WHEN 'when-use-mean-median' THEN 'When Should I Use Mean Vs Median?'
  WHEN 'when-to-use-mean-vs-median' THEN 'When Should I Use Mean Vs Median?'
  WHEN 'sample-vs-population-standard-deviation' THEN 'What Is The Difference Between Sample And Population Standard Deviation?'
  WHEN 'weighted-vs-unweighted-gpa-importance' THEN 'Which Is More Important: Weighted Or Unweighted GPA?'
  WHEN 'how-to-calculate-cumulative-gpa' THEN 'How Do I Calculate Cumulative GPA Across Multiple Semesters?'
  WHEN 'calculator-data-input-formats' THEN 'What Data Input Formats Do The Calculators Support?'
  WHEN 'calculation-accuracy-precision' THEN 'How Accurate Are The Calculation Results?'
  ELSE title
END
WHERE type = 'faq';