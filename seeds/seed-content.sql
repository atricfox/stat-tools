PRAGMA foreign_keys = ON;
BEGIN;

-- Seed minimal content: 1 FAQ, 1 How-to (with steps), 1 Case (with details)

-- FAQ
INSERT OR IGNORE INTO slim_content (
  slug, type, title, summary, content, status, reading_time,
  priority, featured, difficulty, industry, target_tool, tags
) VALUES (
  'faq-what-is-mean', 'faq',
  'What is the Mean?',
  'A quick definition of arithmetic mean.',
  'The arithmetic mean is the sum of values divided by the number of values.',
  'published', 2,
  5, 1, NULL, NULL, NULL,
  '["statistics","basics"]'
);

-- How-to
INSERT OR IGNORE INTO slim_content (
  slug, type, title, summary, content, status, reading_time,
  priority, featured, difficulty, industry, target_tool, tags
) VALUES (
  'howto-calc-mean', 'howto',
  'How to Calculate the Mean',
  'Step-by-step guide to compute the mean.',
  'Use this guide to compute the mean of a list of numbers.',
  'published', 4,
  8, 1, 'beginner', NULL, NULL,
  '["statistics","howto"]'
);

-- How-to steps in details JSON
INSERT OR REPLACE INTO slim_content_details (content_id, details)
SELECT id,
  json_object(
    'steps', json_array(
      json_object(
        'stepId','collect-data',
        'name','Collect Data',
        'description','Gather all numbers you want to average.',
        'tip','Count how many numbers you have.',
        'warning',NULL,
        'stepOrder',1
      ),
      json_object(
        'stepId','sum-values',
        'name','Sum Values',
        'description','Add all numbers together.',
        'tip','Use a calculator to avoid mistakes.',
        'warning',NULL,
        'stepOrder',2
      ),
      json_object(
        'stepId','divide-count',
        'name','Divide by Count',
        'description','Divide the sum by the number of values.',
        'tip','Check the count is not zero.',
        'warning','Do not divide by zero.',
        'stepOrder',3
      )
    )
  )
FROM slim_content WHERE slug = 'howto-calc-mean';

-- Case Study
INSERT OR IGNORE INTO slim_content (
  slug, type, title, summary, content, status, reading_time,
  priority, featured, difficulty, industry, target_tool, tags
) VALUES (
  'case-mean-in-survey', 'case',
  'Using Mean in a Survey',
  'A small survey where mean helps summarize results.',
  'We collected responses from 20 participants and used mean to summarize satisfaction.',
  'published', 5,
  7, 0, 'intermediate', 'education', NULL,
  '["statistics","case","survey"]'
);

-- Case details in JSON
INSERT OR REPLACE INTO slim_content_details (content_id, details)
SELECT id,
  json_object(
    'case', json_object(
      'problem','Summarize survey satisfaction quickly.',
      'solution','Compute the mean score across responses.',
      'results', json('["Mean score: 4.2","Std dev: 0.8"]'),
      'lessons', json('["Mean is easy to communicate","Beware of outliers"]'),
      'toolsUsed', json('["Spreadsheet","Calculator"]'),
      'background','20 participants rated satisfaction from 1 to 5.',
      'challenge','A few outliers skewed the result.',
      'approach', json('{"method":"descriptive","metric":"mean"}'),
      'resultsDetail', json('{"mean":4.2,"std":0.8}'),
      'keyInsights', json('["Mean is sensitive to outliers"]'),
      'recommendations', json('["Also report median","Show distribution"]')
    )
  )
FROM slim_content WHERE slug = 'case-mean-in-survey';

COMMIT;

