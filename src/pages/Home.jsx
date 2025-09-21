import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useMedication } from '../context/MedicationContext';
import { formatTimeBrazil } from '../utils/dateUtils';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiPlus, FiClock, FiTrendingUp, FiActivity } = FiIcons;

const Home = () => {
  const { medications } = useMedication();
  
  const today = new Date();
  const todayMedications = medications.filter(med => {
    const medDate = new Date(med.dateTime);
    return medDate.toDateString() === today.toDateString();
  });

  const recentMedications = medications.slice(0, 3);

  const getTotalToday = () => {
    return todayMedications.reduce((total, med) => total + med.quantity, 0);
  };

  const formatTodayDate = () => {
    const weekdays = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
    const months = [
      'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
      'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
    ];
    
    const weekday = weekdays[today.getDay()];
    const day = today.getDate();
    const month = months[today.getMonth()];
    
    return `${weekday}, ${day} de ${month}`;
  };

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="p-4 space-y-6"
    >
      {/* Welcome Section */}
      <motion.div variants={item} className="text-center py-6">
        <h2 className="text-2xl font-bold text-medical-800 dark:text-medical-200 mb-2">
          Bienvenido
        </h2>
        <p className="text-medical-600 dark:text-medical-400 capitalize">
          {formatTodayDate()}
        </p>
      </motion.div>

      {/* Today's Summary */}
      <motion.div
        variants={item}
        className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl p-6 text-white shadow-lg"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Resumen de Hoy</h3>
          <SafeIcon icon={FiActivity} className="text-2xl" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-primary-100">Medicamentos</p>
            <p className="text-2xl font-bold">{todayMedications.length}</p>
          </div>
          <div>
            <p className="text-primary-100">Total Pastillas</p>
            <p className="text-2xl font-bold">{getTotalToday()}</p>
          </div>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div variants={item} className="grid grid-cols-2 gap-4">
        <Link to="/add">
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="bg-white dark:bg-medical-800 rounded-xl p-6 shadow-md border border-medical-200 dark:border-medical-700 text-center"
          >
            <SafeIcon icon={FiPlus} className="text-3xl text-primary-500 mx-auto mb-2" />
            <h4 className="font-semibold text-medical-800 dark:text-medical-200">
              Agregar
            </h4>
            <p className="text-sm text-medical-600 dark:text-medical-400">
              Nuevo medicamento
            </p>
          </motion.div>
        </Link>

        <Link to="/statistics">
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="bg-white dark:bg-medical-800 rounded-xl p-6 shadow-md border border-medical-200 dark:border-medical-700 text-center"
          >
            <SafeIcon icon={FiTrendingUp} className="text-3xl text-green-500 mx-auto mb-2" />
            <h4 className="font-semibold text-medical-800 dark:text-medical-200">
              Estadísticas
            </h4>
            <p className="text-sm text-medical-600 dark:text-medical-400">
              Ver tendencias
            </p>
          </motion.div>
        </Link>
      </motion.div>

      {/* Recent Medications */}
      <motion.div variants={item}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-medical-800 dark:text-medical-200">
            Medicamentos Recientes
          </h3>
          <Link to="/history" className="text-primary-600 text-sm font-medium">
            Ver todos
          </Link>
        </div>

        {recentMedications.length === 0 ? (
          <div className="bg-white dark:bg-medical-800 rounded-xl p-6 text-center border border-medical-200 dark:border-medical-700">
            <SafeIcon icon={FiClock} className="text-4xl text-medical-400 mx-auto mb-2" />
            <p className="text-medical-600 dark:text-medical-400">
              No hay medicamentos registrados
            </p>
            <Link to="/add" className="text-primary-600 font-medium mt-2 inline-block">
              Agregar el primero
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {recentMedications.map((med) => (
              <motion.div
                key={med.id}
                whileHover={{ scale: 1.01 }}
                className="bg-white dark:bg-medical-800 rounded-lg p-4 shadow-sm border border-medical-200 dark:border-medical-700"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold text-medical-800 dark:text-medical-200">
                      {med.name}
                    </h4>
                    <p className="text-sm text-medical-600 dark:text-medical-400">
                      {med.quantity} pastilla{med.quantity !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <span className="text-xs text-medical-500 dark:text-medical-400">
                    {formatTimeBrazil(med.dateTime)}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default Home;