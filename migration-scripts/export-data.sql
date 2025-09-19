-- Export Data from Current Supabase Database (Macampur)
-- Run these queries in your current Supabase SQL editor and save the results

-- 1. Export medications table structure and data
SELECT 
  'INSERT INTO medications_app (id, name, quantity, date_time, notes, created_at, user_id) VALUES ' ||
  string_agg(
    '(''' || id::text || ''', ''' || 
    replace(name, '''', '''''') || ''', ' || 
    quantity || ', ''' || 
    date_time::text || ''', ''' || 
    coalesce(replace(notes, '''', ''''''), '') || ''', ''' || 
    created_at::text || ''', ' || 
    coalesce('''' || user_id::text || '''', 'NULL') || ')',
    ', '
  ) || ';'
FROM medications_app
WHERE id IS NOT NULL;

-- 2. Export common medications table
SELECT 
  'INSERT INTO common_medications_app (id, name, usage_count, last_used, user_id) VALUES ' ||
  string_agg(
    '(''' || id::text || ''', ''' || 
    replace(name, '''', '''''') || ''', ' || 
    coalesce(usage_count, 1) || ', ''' || 
    last_used::text || ''', ' || 
    coalesce('''' || user_id::text || '''', 'NULL') || ')',
    ', '
  ) || ';'
FROM common_medications_app
WHERE id IS NOT NULL;

-- 3. Get table counts for verification
SELECT 'medications_app' as table_name, count(*) as record_count FROM medications_app
UNION ALL
SELECT 'common_medications_app' as table_name, count(*) as record_count FROM common_medications_app;