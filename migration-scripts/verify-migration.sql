-- Verification queries to run in NEW database
-- Compare these results with your old database

-- Check table structures
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name IN ('medications_app', 'common_medications_app')
ORDER BY table_name, ordinal_position;

-- Check record counts
SELECT 'medications_app' as table_name, count(*) as record_count FROM medications_app
UNION ALL
SELECT 'common_medications_app' as table_name, count(*) as record_count FROM common_medications_app;

-- Check sample data from medications
SELECT 
  name,
  count(*) as usage_count,
  min(date_time) as first_use,
  max(date_time) as last_use
FROM medications_app 
GROUP BY name 
ORDER BY usage_count DESC 
LIMIT 10;

-- Check common medications
SELECT name, usage_count, last_used 
FROM common_medications_app 
ORDER BY usage_count DESC;

-- Check for any NULL or invalid data
SELECT 
  'medications_app' as table_name,
  count(*) filter (where id is null) as null_ids,
  count(*) filter (where name is null or name = '') as null_names,
  count(*) filter (where quantity <= 0) as invalid_quantities
FROM medications_app
UNION ALL
SELECT 
  'common_medications_app' as table_name,
  count(*) filter (where id is null) as null_ids,
  count(*) filter (where name is null or name = '') as null_names,
  count(*) filter (where usage_count < 0) as invalid_counts
FROM common_medications_app;