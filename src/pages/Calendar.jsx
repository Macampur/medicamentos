import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMedication } from '../context/MedicationContext';
import { formatTimeBrazil } from '../utils/dateUtils';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiChevronLeft, FiChevronRight, FiPill } = FiIcons;

const Calendar = () => {
  const { medications } = useMedication();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);

  // Obtener el primer y último día del mes
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  
  // Obtener el primer día de la semana (domingo = 0)
  const firstDayOfWeek = firstDayOfMonth.getDay();
  
  // Generar días del calendario
  const calendarDays = [];
  
  // Días del mes anterior (para completar la primera semana)
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const prevDate = new Date(firstDayOfMonth);
    prevDate.setDate(prevDate.getDate() - (i + 1));
    calendarDays.push({ date: prevDate, isCurrentMonth: false });
  }
  
  // Días del mes actual
  for (let day = 1; day <= lastDayOfMonth.getDate(); day++) {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    calendarDays.push({ date, isCurrentMonth: true });
  }
  
  // Días del próximo mes (para completar la última semana)
  const remainingDays = 42 - calendarDays.length; // 6 filas × 7 días = 42
  for (let day = 1; day <= remainingDays; day++) {
    const nextDate = new Date(lastDayOfMonth);
    nextDate.setDate(nextDate.getDate() + day);
    calendarDays.push({ date: nextDate, isCurrentMonth: false });
  }

  const getMedicationsForDate = (date) => {
    return medications.filter(med => {
      const medDate = new Date(med.dateTime);
      return medDate.toDateString() === date.toDateString();
    });
  };

  const getMedicationCountForDate = (date) => {
    const dayMedications = getMedicationsForDate(date);
    return dayMedications.reduce((total, med) => total + med.quantity, 0);
  };

  const getIntensityColor = (count) => {
    if (count === 0) return 'bg-medical-100 dark:bg-medical-800';
    if (count <= 2) return 'bg-green-200 dark:bg-green-800';
    if (count <= 4) return 'bg-yellow-200 dark:bg-yellow-800';
    if (count <= 6) return 'bg-orange-200 dark:bg-orange-800';
    return 'bg-red-200 dark:bg-red-800';
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const formatMonthYear = (date) => {
    const months = [
      'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
      'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
    ];
    return `${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  const formatSelectedDate = (date) => {
    const weekdays = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
    const months = [
      'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
      'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
    ];
    
    const weekday = weekdays[date.getDay()];
    const day = date.getDate();
    const month = months[date.getMonth()];
    
    return `${weekday}, ${day} de ${month}`;
  };

  const selectedDateMedications = selectedDate ? getMedicationsForDate(selectedDate) : [];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-4 space-y-4"
    >
      {/* Calendar Header */}
      <div className="bg-white dark:bg-medical-800 rounded-xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={previousMonth}
            className="p-2 hover:bg-medical-100 dark:hover:bg-medical-700 rounded-lg transition-colors"
          >
            <SafeIcon icon={FiChevronLeft} className="text-medical-600 dark:text-medical-400" />
          </motion.button>

          <h2 className="text-xl font-bold text-medical-800 dark:text-medical-200 capitalize">
            {formatMonthYear(currentDate)}
          </h2>

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={nextMonth}
            className="p-2 hover:bg-medical-100 dark:hover:bg-medical-700 rounded-lg transition-colors"
          >
            <SafeIcon icon={FiChevronRight} className="text-medical-600 dark:text-medical-400" />
          </motion.button>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(day => (
            <div key={day} className="text-center text-sm font-medium text-medical-600 dark:text-medical-400 py-2">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map(({ date, isCurrentMonth }, index) => {
            const medicationCount = getMedicationCountForDate(date);
            const isSelected = selectedDate && selectedDate.toDateString() === date.toDateString();

            return (
              <motion.button
                key={`${date.toDateString()}-${index}`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedDate(date)}
                className={`
                  relative p-2 h-12 rounded-lg transition-all
                  ${isCurrentMonth 
                    ? 'text-medical-800 dark:text-medical-200' 
                    : 'text-medical-400 dark:text-medical-600'
                  }
                  ${isSelected ? 'ring-2 ring-primary-500' : ''}
                  ${getIntensityColor(medicationCount)}
                  hover:shadow-md
                `}
              >
                <span className="text-sm font-medium">
                  {date.getDate()}
                </span>
                {medicationCount > 0 && (
                  <div className="absolute -top-1 -right-1 bg-primary-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {medicationCount}
                  </div>
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-4 flex items-center justify-center space-x-4 text-xs">
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-green-200 dark:bg-green-800 rounded"></div>
            <span className="text-medical-600 dark:text-medical-400">1-2</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-yellow-200 dark:bg-yellow-800 rounded"></div>
            <span className="text-medical-600 dark:text-medical-400">3-4</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-orange-200 dark:bg-orange-800 rounded"></div>
            <span className="text-medical-600 dark:text-medical-400">5-6</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-red-200 dark:bg-red-800 rounded"></div>
            <span className="text-medical-600 dark:text-medical-400">7+</span>
          </div>
        </div>
      </div>

      {/* Selected Date Details */}
      <AnimatePresence>
        {selectedDate && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white dark:bg-medical-800 rounded-xl p-4 shadow-sm"
          >
            <h3 className="text-lg font-semibold text-medical-800 dark:text-medical-200 mb-4 capitalize">
              {formatSelectedDate(selectedDate)}
            </h3>

            {selectedDateMedications.length === 0 ? (
              <div className="text-center py-8">
                <SafeIcon icon={FiPill} className="text-4xl text-medical-400 mx-auto mb-2" />
                <p className="text-medical-600 dark:text-medical-400">
                  No se registraron medicamentos este día
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {selectedDateMedications.map((med) => (
                  <motion.div
                    key={med.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-medical-50 dark:bg-medical-700 rounded-lg p-3"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold text-medical-800 dark:text-medical-200">
                          {med.name}
                        </h4>
                        <p className="text-sm text-medical-600 dark:text-medical-400">
                          {med.quantity} pastilla{med.quantity !== 1 ? 's' : ''}
                        </p>
                        {med.notes && (
                          <p className="text-sm text-medical-600 dark:text-medical-400 mt-1">
                            {med.notes}
                          </p>
                        )}
                      </div>
                      <span className="text-sm text-medical-500 dark:text-medical-400">
                        {formatTimeBrazil(med.dateTime)}
                      </span>
                    </div>
                  </motion.div>
                ))}

                <div className="mt-4 p-3 bg-primary-50 dark:bg-primary-900 rounded-lg">
                  <p className="text-sm text-primary-700 dark:text-primary-300">
                    <strong>Total del día:</strong> {selectedDateMedications.reduce((total, med) => total + med.quantity, 0)} pastillas
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Calendar;