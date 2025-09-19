-- Setup New Database in Proton-01 Organization
-- Run this in your NEW Supabase project SQL editor

-- Create medications table with the same structure
CREATE TABLE IF NOT EXISTS medications_app (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    date_time TIMESTAMPTZ NOT NULL,
    notes TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    user_id UUID
);

-- Create common medications table
CREATE TABLE IF NOT EXISTS common_medications_app (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    usage_count INTEGER DEFAULT 1 CHECK (usage_count >= 0),
    last_used TIMESTAMPTZ DEFAULT NOW(),
    user_id UUID
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_medications_date_time ON medications_app(date_time DESC);
CREATE INDEX IF NOT EXISTS idx_medications_name ON medications_app(name);
CREATE INDEX IF NOT EXISTS idx_common_medications_usage ON common_medications_app(usage_count DESC);
CREATE INDEX IF NOT EXISTS idx_common_medications_name ON common_medications_app(name);

-- Enable Row Level Security
ALTER TABLE medications_app ENABLE ROW LEVEL SECURITY;
ALTER TABLE common_medications_app ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (allow public access for now, same as current setup)
CREATE POLICY "Allow public read access" ON medications_app FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON medications_app FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON medications_app FOR UPDATE USING (true);
CREATE POLICY "Allow public delete" ON medications_app FOR DELETE USING (true);

CREATE POLICY "Allow public read access" ON common_medications_app FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON common_medications_app FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON common_medications_app FOR UPDATE USING (true);
CREATE POLICY "Allow public delete" ON common_medications_app FOR DELETE USING (true);