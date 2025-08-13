import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, addMonths, subMonths } from 'date-fns';
import { es } from 'date-fns/locale';
import { useMedication } from '../context/MedicationContext';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiChevronLeft, FiChevronRight, FiPill } = FiIcons;

const Calendar = () => {
  const { medications } = useMedication();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getMedicationsForDate = (date) => {
    return medications.filter(med => 
      isSameDay(new Date(med.dateTime), date)
    );
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

  const previousMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));

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
          
          <h2 className="text-xl font-bold text-medical-800 dark:text-medical-200">
            {format(currentDate, 'MMMM yyyy', { locale: es })}
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
          {calendarDays.map((day, index) => {
            const medicationCount = getMedicationCountForDate(day);
            const isSelected = selectedDate && isSameDay(day, selectedDate);
            const isCurrentMonth = isSameMonth(day, currentDate);
            
            return (
              <motion.button
                key={day.toISOString()}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedDate(day)}
                className={`
                  relative p-2 h-12 rounded-lg transition-all
                  ${isCurrentMonth ? 'text-medical-800 dark:text-medical-200' : 'text-medical-400 dark:text-medical-600'}
                  ${isSelected ? 'ring-2 ring-primary-500' : ''}
                  ${getIntensityColor(medicationCount)}
                  hover:shadow-md
                `}
              >
                <span className="text-sm font-medium">
                  {format(day, 'd')}
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
            <h3 className="text-lg font-semibold text-medical-800 dark:text-medical-200 mb-4">
              {format(selectedDate, "EEEE, d 'de' MMMM", { locale: es })}
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
                        {format(new Date(med.dateTime), 'HH:mm')}
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