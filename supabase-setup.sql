-- Seguimiento de Analgésicos - Database Setup
-- Execute this SQL in your Supabase SQL editor

-- Create medications table
CREATE TABLE IF NOT EXISTS medications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  date_time TIMESTAMPTZ NOT NULL,
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create common_medications table
CREATE TABLE IF NOT EXISTS common_medications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  usage_count INTEGER DEFAULT 1 CHECK (usage_count >= 0),
  last_used TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  UNIQUE(name, user_id)
);

-- Create user_preferences table (for future use)
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  theme TEXT DEFAULT 'light' CHECK (theme IN ('light', 'dark')),
  notifications_enabled BOOLEAN DEFAULT true,
  export_format TEXT DEFAULT 'json' CHECK (export_format IN ('json', 'csv')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_medications_user_id ON medications(user_id);
CREATE INDEX IF NOT EXISTS idx_medications_date_time ON medications(date_time DESC);
CREATE INDEX IF NOT EXISTS idx_medications_name ON medications(name);
CREATE INDEX IF NOT EXISTS idx_medications_user_date ON medications(user_id, date_time DESC);

CREATE INDEX IF NOT EXISTS idx_common_medications_user_id ON common_medications(user_id);
CREATE INDEX IF NOT EXISTS idx_common_medications_usage ON common_medications(usage_count DESC);
CREATE INDEX IF NOT EXISTS idx_common_medications_name ON common_medications(name);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at trigger to medications table
CREATE TRIGGER update_medications_updated_at 
  BEFORE UPDATE ON medications 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Apply updated_at trigger to user_preferences table
CREATE TRIGGER update_user_preferences_updated_at 
  BEFORE UPDATE ON user_preferences 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE common_medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies for medications table
-- Allow users to see only their own medications
CREATE POLICY "Users can view own medications" ON medications
  FOR SELECT USING (
    auth.uid() = user_id OR 
    user_id IS NULL -- Allow access to legacy data without user_id
  );

-- Allow users to insert their own medications
CREATE POLICY "Users can insert own medications" ON medications
  FOR INSERT WITH CHECK (
    auth.uid() = user_id OR 
    user_id IS NULL -- Allow insertion without user_id for now
  );

-- Allow users to update their own medications
CREATE POLICY "Users can update own medications" ON medications
  FOR UPDATE USING (
    auth.uid() = user_id OR 
    user_id IS NULL -- Allow updates to legacy data
  );

-- Allow users to delete their own medications
CREATE POLICY "Users can delete own medications" ON medications
  FOR DELETE USING (
    auth.uid() = user_id OR 
    user_id IS NULL -- Allow deletion of legacy data
  );

-- RLS Policies for common_medications table
CREATE POLICY "Users can view own common medications" ON common_medications
  FOR SELECT USING (
    auth.uid() = user_id OR 
    user_id IS NULL
  );

CREATE POLICY "Users can insert own common medications" ON common_medications
  FOR INSERT WITH CHECK (
    auth.uid() = user_id OR 
    user_id IS NULL
  );

CREATE POLICY "Users can update own common medications" ON common_medications
  FOR UPDATE USING (
    auth.uid() = user_id OR 
    user_id IS NULL
  );

CREATE POLICY "Users can delete own common medications" ON common_medications
  FOR DELETE USING (
    auth.uid() = user_id OR 
    user_id IS NULL
  );

-- RLS Policies for user_preferences table
CREATE POLICY "Users can view own preferences" ON user_preferences
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences" ON user_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences" ON user_preferences
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own preferences" ON user_preferences
  FOR DELETE USING (auth.uid() = user_id);

-- Insert default common medications (optional)
INSERT INTO common_medications (name, usage_count, user_id) VALUES
  ('Paracetamol', 0, NULL),
  ('Ibuprofeno', 0, NULL),
  ('Aspirina', 0, NULL),
  ('Naproxeno', 0, NULL),
  ('Diclofenaco', 0, NULL),
  ('Ketorolaco', 0, NULL),
  ('Tramadol', 0, NULL),
  ('Codeína', 0, NULL),
  ('Metamizol', 0, NULL),
  ('Celecoxib', 0, NULL)
ON CONFLICT (name, user_id) DO NOTHING;

-- Create a function to automatically create user preferences
CREATE OR REPLACE FUNCTION create_user_preferences()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_preferences (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to create user preferences when a new user signs up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION create_user_preferences();

-- Create a view for medication statistics (optional)
CREATE OR REPLACE VIEW medication_stats AS
SELECT 
  user_id,
  name,
  COUNT(*) as total_entries,
  SUM(quantity) as total_quantity,
  AVG(quantity) as avg_quantity,
  MIN(date_time) as first_use,
  MAX(date_time) as last_use,
  COUNT(DISTINCT DATE(date_time)) as days_used
FROM medications
GROUP BY user_id, name;

-- Grant access to the view
GRANT SELECT ON medication_stats TO authenticated;

-- Create RLS policy for the view
CREATE POLICY "Users can view own medication stats" ON medication_stats
  FOR SELECT USING (
    auth.uid() = user_id OR 
    user_id IS NULL
  );

-- Enable RLS on the view
ALTER VIEW medication_stats ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE medications IS 'Stores individual medication intake records';
COMMENT ON TABLE common_medications IS 'Stores frequently used medications for autocomplete';
COMMENT ON TABLE user_preferences IS 'Stores user-specific app preferences';
COMMENT ON VIEW medication_stats IS 'Provides aggregated statistics for medications per user';