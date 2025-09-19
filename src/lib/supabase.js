import { createClient } from '@supabase/supabase-js'

// NUEVO proyecto Supabase en la organización Proton-01
const SUPABASE_URL = 'https://nyfypjabduypajhlbtbl.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im55ZnlwamFiZHV5cGFqaGxidGJsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgzMDI1ODEsImV4cCI6MjA3Mzg3ODU4MX0.f7jnaTbTvkI80MFJA5DSTAUMsCypxjKYuaLFxM58OIs'

console.log('✅ Conectado al NUEVO proyecto Supabase (Proton-01):', SUPABASE_URL)

// Crear el cliente de Supabase
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true
  }
})

// Probar la conexión al cargar el archivo
supabase.from('medications_app')
  .select('count')
  .limit(1)
  .then(() => console.log('✅ Conexión exitosa al nuevo proyecto Supabase'))
  .catch(err => console.error('❌ Error de conexión al nuevo proyecto:', err.message))

// Esquemas de tablas de la base de datos
export const TABLES = {
  MEDICATIONS: 'medications_app',
  COMMON_MEDICATIONS: 'common_medications_app',
  USER_PREFERENCES: 'user_preferences_app'
}

// Tipo de registro de medicamento
export const createMedicationRecord = (medication) => ({
  id: medication.id,
  name: medication.name,
  quantity: parseInt(medication.quantity),
  date_time: medication.dateTime,
  notes: medication.notes || '',
  created_at: medication.createdAt || new Date().toISOString(),
  user_id: null // Se establecerá cuando se implemente la autenticación de usuario
})

// Tipo de registro de medicamento común
export const createCommonMedicationRecord = (name) => ({
  name: name.trim(),
  usage_count: 1,
  last_used: new Date().toISOString(),
  user_id: null // Se establecerá cuando se implemente la autenticación de usuario
})