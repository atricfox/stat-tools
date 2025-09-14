-- Initial core calculators and group metadata

INSERT OR IGNORE INTO group_meta (group_name, display_name, sort_order) VALUES
  ('means-weighted', 'Mean & Weighted Average', 1),
  ('dispersion', 'Variance & Standard Deviation', 2),
  ('gpa-grades', 'GPA & Grade Tools', 3),
  ('descriptive-others', 'Other Statistical Tools', 4);

-- Mean & Weighted Average
INSERT INTO calculator (name, description, url, group_name, is_hot, is_new, sort_order)
VALUES
  ('Mean Calculator', 'Calculate arithmetic mean (average) of a dataset', '/calculator/mean', 'means-weighted', 1, 0, 1),
  ('Weighted Mean Calculator', 'Calculate weighted average with custom weights', '/calculator/weighted-mean', 'means-weighted', 0, 0, 2),
  ('Median Calculator', 'Compute the median of a dataset', '/calculator/median', 'means-weighted', 0, 0, 3);

-- Variance & Standard Deviation
INSERT INTO calculator (name, description, url, group_name, is_hot, is_new, sort_order)
VALUES
  ('Standard Deviation Calculator', 'Calculate standard deviation (sample/population)', '/calculator/standard-deviation', 'dispersion', 1, 0, 1),
  ('Variance Calculator', 'Compute variance of a dataset', '/calculator/variance', 'dispersion', 0, 0, 2),
  ('Range Calculator', 'Find the difference between max and min', '/calculator/range', 'dispersion', 0, 0, 3);

-- GPA & Grade Tools
INSERT INTO calculator (name, description, url, group_name, is_hot, is_new, sort_order)
VALUES
  ('GPA Calculator', 'Calculate weighted GPA with multiple grading systems', '/calculator/gpa', 'gpa-grades', 1, 0, 1),
  ('Unweighted GPA Calculator', 'Calculate unweighted GPA on standard 4.0 scale', '/calculator/unweighted-gpa', 'gpa-grades', 0, 1, 2),
  ('Cumulative GPA Calculator', 'Calculate cumulative GPA for graduate school applications', '/calculator/cumulative-gpa', 'gpa-grades', 0, 0, 3),
  ('Final Grade Calculator', 'Calculate the score needed on your final exam', '/calculator/final-grade', 'gpa-grades', 1, 0, 4),
  ('Semester Grade Calculator', 'Calculate weighted semester grade from multiple courses', '/calculator/semester-grade', 'gpa-grades', 0, 0, 5);

-- Other Statistical Tools
INSERT INTO calculator (name, description, url, group_name, is_hot, is_new, sort_order)
VALUES
  ('Percent Error Calculator', 'Calculate percent error between true and measured values', '/calculator/percent-error', 'descriptive-others', 0, 0, 1);

