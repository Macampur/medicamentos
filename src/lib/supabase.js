import { createClient } from '@supabase/supabase-js'

// Supabase project credentials - these are real values from your connected project
const SUPABASE_URL = 'https://dmhgnddaugjnjuwnvjaj.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRtaGduZGRhdWdqbmp1d252amFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNjkyNjcsImV4cCI6MjA3MDc0NTI2N30.xyjVgqT3GHtSWqyE7KFvEwklh0H-Fyv9N7Pqopy5C4g'

console.log('Initializing Supabase client with URL:', SUPABASE_URL)

// Create the Supabase client
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// Test the connection when the file loads
supabase.from('medications_app')
  .select('count')
  .limit(1)
  .then(() => console.log('✅ Supabase connection successful'))
  .catch(err => console.error('❌ Supabase connection error:', err.message))

// Database table schemas
export const TABLES = {
  MEDICATIONS: 'medications_app',  // Using a unique name to avoid conflicts
  COMMON_MEDICATIONS: 'common_medications_app',  // Using a unique name to avoid conflicts
  USER_PREFERENCES: 'user_preferences_app'  // Using a unique name to avoid conflicts
}

// Medication record type
export const createMedicationRecord = (medication) => ({
  id: medication.id,
  name: medication.name,
  quantity: parseInt(medication.quantity),
  date_time: medication.dateTime,
  notes: medication.notes || '',
  created_at: medication.createdAt || new Date().toISOString(),
  user_id: null // Will be set when user auth is implemented
})

// Common medication record type
export const createCommonMedicationRecord = (name) => ({
  name: name.trim(),
  usage_count: 1,
  last_used: new Date().toISOString(),
  user_id: null // Will be set when user auth is implemented
})