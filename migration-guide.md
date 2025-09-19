# 📋 GUÍA DE MIGRACIÓN MANUAL - PASO A PASO

## PASO 1: EXPORTAR DATOS DEL PROYECTO ACTUAL (MACAMPUR)

### 1.1 Ir al proyecto actual de Macampur
1. Ve a https://supabase.com/dashboard
2. Cambia a la organización **Macampur**
3. Entra al proyecto actual donde tienes los datos

### 1.2 Exportar medicamentos
1. Ve a **SQL Editor**
2. Ejecuta esta consulta y **COPIA EL RESULTADO**:

```sql
SELECT 
  'INSERT INTO medications_app (id, name, quantity, date_time, notes, created_at, user_id) VALUES ' ||
  string_agg(
    '(''' || id::text || ''', ''' || replace(name, '''', '''''') || ''', ' || 
    quantity || ', ''' || date_time::text || ''', ''' || 
    coalesce(replace(notes, '''', ''''''), '') || ''', ''' || 
    created_at::text || ''', NULL)', ', '
  ) || ';' as insert_statement
FROM medications_app;
```

**GUARDAR EL RESULTADO** en un archivo de texto.

### 1.3 Exportar medicamentos comunes
1. En el mismo SQL Editor, ejecuta:

```sql
SELECT 
  'INSERT INTO common_medications_app (id, name, usage_count, last_used, user_id) VALUES ' ||
  string_agg(
    '(''' || id::text || ''', ''' || replace(name, '''', '''''') || ''', ' || 
    coalesce(usage_count, 1) || ', ''' || last_used::text || ''', NULL)', ', '
  ) || ';' as insert_statement
FROM common_medications_app;
```

**GUARDAR EL RESULTADO** también.

### 1.4 Verificar conteos
```sql
SELECT 'medications_app' as tabla, count(*) as registros FROM medications_app
UNION ALL
SELECT 'common_medications_app' as tabla, count(*) as registros FROM common_medications_app;
```

**ANOTAR LOS NÚMEROS** para verificar después.

---

## PASO 2: CREAR NUEVO PROYECTO EN PROTON-01

### 2.1 Crear proyecto
1. Ve a https://supabase.com/dashboard
2. Cambia a la organización **Proton-01**
3. Clic en **"New Project"**
4. Nombre: `seguimiento-analgesicos-nuevo` (o el que prefieras)
5. Selecciona región y contraseña
6. Clic **"Create new project"**
7. **ESPERAR** a que termine de configurarse (2-3 minutos)

### 2.2 Obtener credenciales
1. Una vez creado, ve a **Settings > API**
2. **COPIAR**:
   - **Project URL**: `https://XXXXXXXXX.supabase.co`
   - **anon/public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

---

## PASO 3: CREAR TABLAS EN EL NUEVO PROYECTO

### 3.1 Ir al SQL Editor del nuevo proyecto
1. En el nuevo proyecto, ve a **SQL Editor**

### 3.2 Ejecutar script de creación
**COPIAR Y PEGAR** este script completo:

```sql
-- Crear tabla medications_app
CREATE TABLE IF NOT EXISTS medications_app (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  date_time TIMESTAMPTZ NOT NULL,
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  user_id UUID
);

-- Crear tabla common_medications_app  
CREATE TABLE IF NOT EXISTS common_medications_app (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  usage_count INTEGER DEFAULT 1 CHECK (usage_count >= 0),
  last_used TIMESTAMPTZ DEFAULT NOW(),
  user_id UUID
);

-- Crear índices para rendimiento
CREATE INDEX IF NOT EXISTS idx_medications_date_time ON medications_app(date_time DESC);
CREATE INDEX IF NOT EXISTS idx_medications_name ON medications_app(name);
CREATE INDEX IF NOT EXISTS idx_common_medications_usage ON common_medications_app(usage_count DESC);
CREATE INDEX IF NOT EXISTS idx_common_medications_name ON common_medications_app(name);

-- Habilitar Row Level Security
ALTER TABLE medications_app ENABLE ROW LEVEL SECURITY;
ALTER TABLE common_medications_app ENABLE ROW LEVEL SECURITY;

-- Crear políticas (acceso público por ahora, igual que antes)
CREATE POLICY "Allow public read access" ON medications_app FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON medications_app FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON medications_app FOR UPDATE USING (true);
CREATE POLICY "Allow public delete" ON medications_app FOR DELETE USING (true);

CREATE POLICY "Allow public read access" ON common_medications_app FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON common_medications_app FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON common_medications_app FOR UPDATE USING (true);
CREATE POLICY "Allow public delete" ON common_medications_app FOR DELETE USING (true);
```

---

## PASO 4: IMPORTAR LOS DATOS

### 4.1 Importar medicamentos
1. En el SQL Editor del **NUEVO proyecto**
2. **PEGAR** el INSERT statement que guardaste del Paso 1.2
3. Ejecutar

### 4.2 Importar medicamentos comunes
1. **PEGAR** el INSERT statement que guardaste del Paso 1.3
2. Ejecutar

### 4.3 Verificar importación
```sql
SELECT 'medications_app' as tabla, count(*) as registros FROM medications_app
UNION ALL
SELECT 'common_medications_app' as tabla, count(*) as registros FROM common_medications_app;
```

**COMPARAR** con los números del Paso 1.4 - deben ser iguales.

---

## PASO 5: ACTUALIZAR LA APLICACIÓN

### 5.1 Actualizar credenciales
En tu código, edita el archivo `src/lib/supabase.js`:

```javascript
import { createClient } from '@supabase/supabase-js'

// NUEVAS credenciales del proyecto Proton-01
const SUPABASE_URL = 'https://TU_NUEVO_PROJECT_ID.supabase.co'
const SUPABASE_ANON_KEY = 'TU_NUEVA_ANON_KEY'

console.log('✅ Conectado al NUEVO proyecto Supabase (Proton-01):', SUPABASE_URL)

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// Resto del código igual...
```

**REEMPLAZAR** con tus credenciales reales del Paso 2.2.

---

## PASO 6: PROBAR LA APLICACIÓN

### 6.1 Verificar conexión
1. Ejecutar `npm run dev`
2. Abrir la aplicación
3. Verificar que aparezcan todos tus medicamentos en el Historial
4. Verificar que las estadísticas muestren datos
5. Intentar agregar un nuevo medicamento

### 6.2 Verificar funcionalidades
- ✅ Ver historial completo
- ✅ Ver estadísticas con datos
- ✅ Agregar nuevo medicamento
- ✅ Editar medicamento existente
- ✅ Ver calendario con datos

---

## PASO 7: LIMPIAR (OPCIONAL)

### 7.1 Una vez verificado que todo funciona
1. Puedes eliminar el proyecto anterior en Macampur
2. O mantenerlo como backup por unos días

---

## ⚠️ PUNTOS IMPORTANTES

1. **HACER BACKUP**: Antes de eliminar nada, asegúrate de que todo funciona
2. **VERIFICAR CONTEOS**: Los números de registros deben coincidir exactamente
3. **PROBAR TODAS LAS FUNCIONES**: Agregar, editar, eliminar, ver estadísticas
4. **CREDENCIALES**: Asegúrate de usar las credenciales correctas del nuevo proyecto

---

## 🆘 SI ALGO SALE MAL

Si tienes problemas:
1. **NO elimines** el proyecto original hasta estar 100% seguro
2. Verifica que las credenciales estén correctas
3. Revisa la consola del navegador para errores
4. Comprueba que las tablas se crearon correctamente en Supabase

---

## 📞 VERIFICACIÓN FINAL

Cuando termines, deberías poder:
- Ver todos tus medicamentos históricos
- Ver las estadísticas con tus datos reales
- Agregar nuevos medicamentos sin problemas
- Todo funcionando igual que antes, pero en el nuevo proyecto