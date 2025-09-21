// Utilidades para manejo de fechas en zona horaria de Brasil
const BRAZIL_TIMEZONE = 'America/Sao_Paulo';

// Formatear fecha en zona horaria de Brasil
export const formatDateBrazil = (dateString) => {
  const date = new Date(dateString);
  
  // Convertir a zona horaria de Brasil
  const brazilDate = new Date(date.toLocaleString("en-US", { timeZone: BRAZIL_TIMEZONE }));
  
  // Días de la semana en español
  const weekdays = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  
  // Meses en español
  const months = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
  ];
  
  const weekday = weekdays[brazilDate.getDay()];
  const day = brazilDate.getDate();
  const month = months[brazilDate.getMonth()];
  const hours = brazilDate.getHours().toString().padStart(2, '0');
  const minutes = brazilDate.getMinutes().toString().padStart(2, '0');
  
  return `${weekday}, ${day} de ${month} a las ${hours}:${minutes}`;
};

// Formatear solo la hora en zona horaria de Brasil
export const formatTimeBrazil = (dateString) => {
  const date = new Date(dateString);
  const brazilDate = new Date(date.toLocaleString("en-US", { timeZone: BRAZIL_TIMEZONE }));
  
  const hours = brazilDate.getHours().toString().padStart(2, '0');
  const minutes = brazilDate.getMinutes().toString().padStart(2, '0');
  
  return `${hours}:${minutes}`;
};

// Convertir fecha de Brasil a UTC para comparaciones
export const fromBrazilToUTC = (dateString) => {
  // Crear fecha interpretando como hora de Brasil
  const [datePart, timePart] = dateString.split('T');
  const [year, month, day] = datePart.split('-');
  const [hours, minutes, seconds = '00'] = timePart.split(':');
  
  // Crear fecha en hora local de Brasil (aproximadamente UTC-3)
  const brazilOffset = -3; // Offset de Brasil en horas
  const localDate = new Date(year, month - 1, day, hours, minutes, seconds);
  
  // Ajustar por la diferencia de zona horaria
  const utcDate = new Date(localDate.getTime() - (brazilOffset * 60 * 60 * 1000));
  
  return utcDate;
};

// Verificar si una fecha está en el rango especificado (en zona horaria de Brasil)
export const isDateInRange = (dateString, startDate, endDate) => {
  const date = new Date(dateString);
  let inRange = true;
  
  if (startDate) {
    const start = fromBrazilToUTC(startDate + 'T00:00:00');
    inRange = inRange && date >= start;
  }
  
  if (endDate) {
    const end = fromBrazilToUTC(endDate + 'T23:59:59');
    inRange = inRange && date <= end;
  }
  
  return inRange;
};

// Formatear fecha para input datetime-local
export const formatForInput = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const day = d.getDate().toString().padStart(2, '0');
  const hours = d.getHours().toString().padStart(2, '0');
  const minutes = d.getMinutes().toString().padStart(2, '0');
  
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

// Obtener fecha actual formateada para input
export const getCurrentDateTime = () => {
  return formatForInput(new Date());
};