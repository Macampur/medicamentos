# 🚀 INSTRUCCIONES DE CONFIGURACIÓN FINAL

## ✅ LO QUE YA ESTÁ HECHO:
1. **Credenciales configuradas**: El archivo `.env` ya tiene las credenciales de tu nuevo proyecto
2. **Cliente Supabase actualizado**: `src/lib/supabase.js` configurado con el nuevo proyecto
3. **Aplicación lista**: Todo el código está preparado para funcionar

## 🔧 PASOS FINALES (HAZLO EN SUPABASE):

### 1. Ve a tu proyecto Supabase
- Abre: https://supabase.com/dashboard/project/nyfypjabduypajhlbtbl
- Ve a **SQL Editor**

### 2. Ejecuta este script para crear las tablas:

**COPIA Y PEGA EXACTAMENTE ESTE CÓDIGO (sin las marcas ```sql):**

-- Setup New Database in Proton-01 Organization
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

-- Insert default common medications
INSERT INTO common_medications_app (name, usage_count, last_used, user_id) VALUES
('Paracetamol', 0, NOW(), NULL),
('Ibuprofeno', 0, NOW(), NULL),
('Aspirina', 0, NOW(), NULL),
('Naproxeno', 0, NOW(), NULL),
('Diclofenaco', 0, NOW(), NULL),
('Ketorolaco', 0, NOW(), NULL),
('Tramadol', 0, NOW(), NULL),
('Codeína', 0, NOW(), NULL),
('Metamizol', 0, NOW(), NULL),
('Celecoxib', 0, NOW(), NULL)
ON CONFLICT DO NOTHING;

### 3. Ejecutar la aplicación:
```bash
npm run dev
```

## 🎯 VERIFICACIÓN:
Después de ejecutar el script SQL:
1. La aplicación debería conectarse sin errores
2. Podrás agregar nuevos medicamentos
3. Los medicamentos comunes aparecerán en el autocompletado
4. Todo funcionará como antes, pero en el nuevo proyecto

## 📋 MIGRAR DATOS ANTIGUOS (OPCIONAL):
Si tienes datos en tu proyecto anterior de Macampur, sigue las instrucciones en `migration-guide.md`

---
**¡Listo! Tu aplicación está configurada para funcionar con el nuevo proyecto Supabase.**