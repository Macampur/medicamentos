import { createClient } from '@supabase/supabase-js'

// NEW Supabase project credentials for Proton-01 organization
// Replace these with your actual new project credentials
const SUPABASE_URL = 'https://YOUR_NEW_PROJECT_ID.supabase.co'
const SUPABASE_ANON_KEY = 'YOUR_NEW_ANON_KEY'

console.log('Initializing NEW Supabase client with URL:', SUPABASE_URL)

// Create the Supabase client
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// Test the connection when the file loads
supabase.from('medications_app')
  .select('count')
  .limit(1)
  .then(() => console.log('✅ NEW Supabase connection successful'))
  .catch(err => console.error('❌ NEW Supabase connection error:', err.message))

// Database table schemas (same as before)
export const TABLES = {
  MEDICATIONS: 'medications_app',
  COMMON_MEDICATIONS: 'common_medications_app',
  USER_PREFERENCES: 'user_preferences_app'
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