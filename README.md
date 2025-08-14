# Seguimiento de Analgésicos

Una aplicación web moderna para el seguimiento personal de medicamentos analgésicos con sincronización en la nube.

## 🚀 Características

### ✨ Funcionalidades Principales
- **Registro de Medicamentos**: Agregar, editar y eliminar registros de medicamentos
- **Historial Completo**: Visualización y búsqueda de todos los registros
- **Calendario Visual**: Vista de calendario con indicadores de uso
- **Estadísticas Avanzadas**: Gráficos y análisis de patrones de uso
- **Autocompletado Inteligente**: Sugerencias basadas en medicamentos usados anteriormente

### 🌐 Características de Conectividad
- **Sincronización en la Nube**: Datos respaldados y sincronizados con Supabase
- **Modo Sin Conexión**: Funcionalidad completa sin internet
- **Sincronización Automática**: Los cambios se sincronizan cuando se recupera la conexión
- **Indicadores de Estado**: Visualización clara del estado de conexión y sincronización

### 🎨 Experiencia de Usuario
- **Diseño Responsivo**: Optimizado para dispositivos móviles y desktop
- **Modo Oscuro**: Tema claro y oscuro
- **Animaciones Fluidas**: Transiciones suaves con Framer Motion
- **Interfaz Intuitiva**: Navegación simple y clara

## 🛠️ Tecnologías

- **Frontend**: React 18, Vite
- **Estilos**: Tailwind CSS
- **Animaciones**: Framer Motion
- **Gráficos**: ECharts
- **Backend**: Supabase
- **Iconos**: React Icons
- **Fechas**: date-fns
- **Routing**: React Router

## 📦 Instalación

1. **Clonar el repositorio**:
   ```bash
   git clone [repository-url]
   cd seguimiento-analgesicos
   ```

2. **Instalar dependencias**:
   ```bash
   npm install
   ```

3. **Configurar Supabase**:
   - Crear un proyecto en [Supabase](https://supabase.com)
   - Copiar `.env.example` a `.env`
   - Configurar las variables de entorno:
     ```
     VITE_SUPABASE_URL=tu-url-de-supabase
     VITE_SUPABASE_ANON_KEY=tu-clave-anonima
     ```

4. **Crear las tablas en Supabase**:
   ```sql
   -- Tabla de medicamentos
   CREATE TABLE medications (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     name TEXT NOT NULL,
     quantity INTEGER NOT NULL,
     date_time TIMESTAMPTZ NOT NULL,
     notes TEXT,
     created_at TIMESTAMPTZ DEFAULT NOW(),
     user_id UUID REFERENCES auth.users(id)
   );

   -- Tabla de medicamentos comunes
   CREATE TABLE common_medications (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     name TEXT NOT NULL UNIQUE,
     usage_count INTEGER DEFAULT 1,
     last_used TIMESTAMPTZ DEFAULT NOW(),
     user_id UUID REFERENCES auth.users(id)
   );

   -- Índices para mejor rendimiento
   CREATE INDEX idx_medications_date_time ON medications(date_time);
   CREATE INDEX idx_medications_name ON medications(name);
   CREATE INDEX idx_common_medications_usage ON common_medications(usage_count DESC);
   ```

5. **Ejecutar en desarrollo**:
   ```bash
   npm run dev
   ```

## 🏗️ Estructura del Proyecto

```
src/
├── components/          # Componentes reutilizables
│   ├── Header.jsx
│   ├── Navigation.jsx
│   ├── OfflineIndicator.jsx
│   └── SyncButton.jsx
├── context/            # Context API para estado global
│   ├── MedicationContext.jsx
│   └── ThemeContext.jsx
├── lib/               # Configuraciones y utilidades
│   └── supabase.js
├── pages/             # Páginas principales
│   ├── Home.jsx
│   ├── AddMedication.jsx
│   ├── History.jsx
│   ├── Calendar.jsx
│   ├── Statistics.jsx
│   └── Settings.jsx
├── services/          # Servicios para API
│   └── medicationService.js
└── common/           # Componentes comunes
    └── SafeIcon.jsx
```

## 🔧 Configuración de Supabase

### Políticas de Seguridad (Row Level Security)

```sql
-- Habilitar RLS en las tablas
ALTER TABLE medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE common_medications ENABLE ROW LEVEL SECURITY;

-- Políticas para medications (cuando se implemente autenticación)
CREATE POLICY "Users can view own medications" ON medications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own medications" ON medications
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own medications" ON medications
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own medications" ON medications
  FOR DELETE USING (auth.uid() = user_id);
```

## 📱 Uso de la Aplicación

### Agregar Medicamento
1. Ir a la página "Agregar"
2. Seleccionar o escribir el nombre del medicamento
3. Especificar cantidad y fecha/hora
4. Agregar notas opcionales
5. Guardar el registro

### Ver Estadísticas
- Acceder a la página "Estadísticas"
- Ver gráficos de uso por período
- Analizar patrones y tendencias
- Revisar medicamentos más utilizados

### Modo Sin Conexión
- La app funciona completamente sin internet
- Los cambios se guardan localmente
- Se sincronizan automáticamente al recuperar conexión
- Indicadores visuales muestran el estado de sincronización

## 🔒 Privacidad y Seguridad

- Los datos se almacenan de forma segura en Supabase
- Cifrado en tránsito y en reposo
- No se comparte información con terceros
- Los datos permanecen bajo tu control

## 🚨 Aviso Médico

Esta aplicación es solo para seguimiento personal y no reemplaza el consejo médico profesional. Siempre consulta con tu médico sobre el uso de medicamentos.

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crear una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

## 📞 Soporte

Si tienes alguna pregunta o problema, por favor abre un issue en el repositorio.