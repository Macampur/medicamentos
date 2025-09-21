import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useMedication } from '../context/MedicationContext';
import { formatDateBrazil, isDateInRange } from '../utils/dateUtils';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiSearch, FiEdit, FiTrash2, FiFilter, FiDownload, FiClock } = FiIcons;

const History = () => {
  const { medications, deleteMedication, exportData } = useMedication();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMedication, setSelectedMedication] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [showFilters, setShowFilters] = useState(false);

  const filteredMedications = medications.filter(med => {
    const matchesSearch = med.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (med.notes && med.notes.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesMedication = !selectedMedication || med.name === selectedMedication;
    
    // Usar la función de utilidades para verificar el rango de fechas
    const matchesDateRange = isDateInRange(med.dateTime, dateRange.start, dateRange.end);
    
    return matchesSearch && matchesMedication && matchesDateRange;
  });

  const uniqueMedications = [...new Set(medications.map(med => med.name))];

  const handleDelete = (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este registro?')) {
      deleteMedication(id);
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedMedication('');
    setDateRange({ start: '', end: '' });
  };

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };

  const item = {
    hidden: { opacity: 0, x: -20 },
    show: { opacity: 1, x: 0 }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-4 space-y-4"
    >
      {/* Search and Filter Bar */}
      <div className="bg-white dark:bg-medical-800 rounded-xl p-4 shadow-sm">
        <div className="flex items-center space-x-2 mb-4">
          <div className="relative flex-1">
            <SafeIcon 
              icon={FiSearch} 
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-medical-400" 
            />
            <input
              type="text"
              placeholder="Buscar medicamentos o notas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-medical-300 dark:border-medical-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-medical-700 text-medical-900 dark:text-medical-100"
            />
          </div>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowFilters(!showFilters)}
            className="p-2 bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400 rounded-lg"
          >
            <SafeIcon icon={FiFilter} />
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={exportData}
            className="p-2 bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400 rounded-lg"
          >
            <SafeIcon icon={FiDownload} />
          </motion.button>
        </div>

        {/* Advanced Filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-4 border-t border-medical-200 dark:border-medical-700 pt-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-medical-700 dark:text-medical-300 mb-1">
                    Medicamento
                  </label>
                  <select
                    value={selectedMedication}
                    onChange={(e) => setSelectedMedication(e.target.value)}
                    className="w-full px-3 py-2 border border-medical-300 dark:border-medical-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-medical-700 text-medical-900 dark:text-medical-100"
                  >
                    <option value="">Todos los medicamentos</option>
                    {uniqueMedications.map(med => (
                      <option key={med} value={med}>{med}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-medical-700 dark:text-medical-300 mb-1">
                    Fecha inicio (Brasil/São Paulo)
                  </label>
                  <input
                    type="date"
                    value={dateRange.start}
                    onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                    className="w-full px-3 py-2 border border-medical-300 dark:border-medical-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-medical-700 text-medical-900 dark:text-medical-100"
                  />
                </div>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex-1 mr-4">
                  <label className="block text-sm font-medium text-medical-700 dark:text-medical-300 mb-1">
                    Fecha fin (Brasil/São Paulo)
                  </label>
                  <input
                    type="date"
                    value={dateRange.end}
                    onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                    className="w-full px-3 py-2 border border-medical-300 dark:border-medical-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-medical-700 text-medical-900 dark:text-medical-100"
                  />
                </div>
                <button
                  onClick={clearFilters}
                  className="mt-6 px-4 py-2 bg-medical-500 text-white rounded-lg hover:bg-medical-600 transition-colors"
                >
                  Limpiar
                </button>
              </div>
              
              {/* Debug info for date filtering */}
              {(dateRange.start || dateRange.end) && (
                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900 rounded-lg text-xs">
                  <p className="font-medium text-blue-800 dark:text-blue-200 mb-1">
                    🇧🇷 Filtro de fechas (Brasil/São Paulo):
                  </p>
                  {dateRange.start && (
                    <p className="text-blue-700 dark:text-blue-300">
                      Desde: {dateRange.start} 00:00:00 (Brasil)
                    </p>
                  )}
                  {dateRange.end && (
                    <p className="text-blue-700 dark:text-blue-300">
                      Hasta: {dateRange.end} 23:59:59 (Brasil)
                    </p>
                  )}
                  <p className="text-blue-600 dark:text-blue-400 mt-1">
                    Resultados: {filteredMedications.length} medicamentos
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Results Count */}
      <div className="text-sm text-medical-600 dark:text-medical-400">
        {filteredMedications.length} registro{filteredMedications.length !== 1 ? 's' : ''} encontrado{filteredMedications.length !== 1 ? 's' : ''}
        {(dateRange.start || dateRange.end) && (
          <span className="ml-2 text-blue-600 dark:text-blue-400">
            (filtrado por fechas en zona horaria de Brasil)
          </span>
        )}
      </div>

      {/* Medications List */}
      {filteredMedications.length === 0 ? (
        <div className="bg-white dark:bg-medical-800 rounded-xl p-8 text-center">
          <SafeIcon icon={FiClock} className="text-4xl text-medical-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-medical-700 dark:text-medical-300 mb-2">
            No se encontraron registros
          </h3>
          <p className="text-medical-600 dark:text-medical-400 mb-4">
            {medications.length === 0 
              ? 'Aún no has registrado ningún medicamento' 
              : 'Intenta ajustar los filtros de búsqueda'
            }
          </p>
          {medications.length === 0 && (
            <Link
              to="/add"
              className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Agregar primer medicamento
            </Link>
          )}
        </div>
      ) : (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="space-y-3"
        >
          {filteredMedications.map((med) => (
            <motion.div
              key={med.id}
              variants={item}
              layout
              className="bg-white dark:bg-medical-800 rounded-xl p-4 shadow-sm border border-medical-200 dark:border-medical-700"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-medical-800 dark:text-medical-200 mb-1">
                    {med.name}
                  </h3>
                  <p className="text-sm text-medical-600 dark:text-medical-400">
                    {med.quantity} pastilla{med.quantity !== 1 ? 's' : ''}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Link
                    to={`/edit/${med.id}`}
                    className="p-2 text-primary-600 hover:bg-primary-100 dark:hover:bg-primary-900 rounded-lg transition-colors"
                  >
                    <SafeIcon icon={FiEdit} />
                  </Link>
                  <button
                    onClick={() => handleDelete(med.id)}
                    className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900 rounded-lg transition-colors"
                  >
                    <SafeIcon icon={FiTrash2} />
                  </button>
                </div>
              </div>
              
              <div className="text-sm text-medical-600 dark:text-medical-400 mb-2">
                🇧🇷 {formatDateBrazil(med.dateTime)}
              </div>
              
              {med.notes && (
                <div className="bg-medical-50 dark:bg-medical-700 rounded-lg p-3">
                  <p className="text-sm text-medical-700 dark:text-medical-300">
                    {med.notes}
                  </p>
                </div>
              )}
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
};

export default History;