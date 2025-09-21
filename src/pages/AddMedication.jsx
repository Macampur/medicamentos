import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useMedication } from '../context/MedicationContext';
import { formatForInput, getCurrentDateTime } from '../utils/dateUtils';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiSave, FiX, FiChevronDown } = FiIcons;

const AddMedication = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { addMedication, updateMedication, getMedicationById, commonMedications, isLoading } = useMedication();
  
  const isEditing = Boolean(id);
  const existingMedication = isEditing ? getMedicationById(id) : null;
  
  const [formData, setFormData] = useState({
    name: '',
    quantity: 1,
    dateTime: getCurrentDateTime(),
    notes: ''
  });
  
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (existingMedication) {
      setFormData({
        name: existingMedication.name,
        quantity: existingMedication.quantity,
        dateTime: formatForInput(new Date(existingMedication.dateTime)),
        notes: existingMedication.notes || ''
      });
    }
  }, [existingMedication]);

  useEffect(() => {
    if (formData.name) {
      const filtered = commonMedications.filter(med =>
        med.toLowerCase().includes(formData.name.toLowerCase())
      );
      setFilteredSuggestions(filtered);
    } else {
      setFilteredSuggestions(commonMedications);
    }
  }, [formData.name, commonMedications]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      alert('Por favor ingresa el nombre del medicamento');
      return;
    }

    try {
      setIsSaving(true);
      
      const medicationData = {
        ...formData,
        dateTime: new Date(formData.dateTime).toISOString(),
        quantity: parseInt(formData.quantity)
      };

      console.log('Submitting medication data:', medicationData);

      if (isEditing) {
        await updateMedication(id, medicationData);
      } else {
        await addMedication(medicationData);
      }

      navigate('/');
    } catch (error) {
      console.error('Error saving medication:', error);
      alert('Error al guardar el medicamento. Por favor intenta nuevamente.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleNameChange = (e) => {
    setFormData({ ...formData, name: e.target.value });
    setShowSuggestions(true);
  };

  const selectSuggestion = (suggestion) => {
    setFormData({ ...formData, name: suggestion });
    setShowSuggestions(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="p-4"
    >
      <div className="bg-white dark:bg-medical-800 rounded-xl shadow-lg p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Medication Name */}
          <div className="relative">
            <label className="block text-sm font-medium text-medical-700 dark:text-medical-300 mb-2">
              Nombre del Medicamento *
            </label>
            <div className="relative">
              <input
                type="text"
                value={formData.name}
                onChange={handleNameChange}
                onFocus={() => setShowSuggestions(true)}
                className="w-full px-4 py-3 border border-medical-300 dark:border-medical-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-medical-700 text-medical-900 dark:text-medical-100"
                placeholder="Ej: Paracetamol, Ibuprofeno..."
                required
              />
              <SafeIcon
                icon={FiChevronDown}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-medical-400 pointer-events-none"
              />
            </div>

            {showSuggestions && filteredSuggestions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute z-10 w-full mt-1 bg-white dark:bg-medical-700 border border-medical-300 dark:border-medical-600 rounded-lg shadow-lg max-h-48 overflow-y-auto"
              >
                {filteredSuggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => selectSuggestion(suggestion)}
                    className="w-full text-left px-4 py-2 hover:bg-primary-50 dark:hover:bg-primary-900 text-medical-900 dark:text-medical-100"
                  >
                    {suggestion}
                  </button>
                ))}
              </motion.div>
            )}
          </div>

          {/* Quantity */}
          <div>
            <label className="block text-sm font-medium text-medical-700 dark:text-medical-300 mb-2">
              Cantidad (pastillas)
            </label>
            <input
              type="number"
              min="1"
              max="20"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
              className="w-full px-4 py-3 border border-medical-300 dark:border-medical-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-medical-700 text-medical-900 dark:text-medical-100"
              required
            />
          </div>

          {/* Date and Time */}
          <div>
            <label className="block text-sm font-medium text-medical-700 dark:text-medical-300 mb-2">
              Fecha y Hora
            </label>
            <input
              type="datetime-local"
              value={formData.dateTime}
              onChange={(e) => setFormData({ ...formData, dateTime: e.target.value })}
              className="w-full px-4 py-3 border border-medical-300 dark:border-medical-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-medical-700 text-medical-900 dark:text-medical-100"
              required
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-medical-700 dark:text-medical-300 mb-2">
              Notas (opcional)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows="3"
              className="w-full px-4 py-3 border border-medical-300 dark:border-medical-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-medical-700 text-medical-900 dark:text-medical-100"
              placeholder="Síntomas, efectividad, etc..."
            />
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4 pt-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isSaving || isLoading}
              className={`
                flex-1 bg-primary-600 hover:bg-primary-700 text-white py-3 px-6 rounded-lg font-medium flex items-center justify-center space-x-2
                ${(isSaving || isLoading) ? 'opacity-70 cursor-not-allowed' : ''}
              `}
            >
              {isSaving || isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              ) : (
                <SafeIcon icon={FiSave} />
              )}
              <span>{isEditing ? 'Actualizar' : 'Guardar'}</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={() => navigate('/')}
              disabled={isSaving || isLoading}
              className={`
                flex-1 bg-medical-500 hover:bg-medical-600 text-white py-3 px-6 rounded-lg font-medium flex items-center justify-center space-x-2
                ${(isSaving || isLoading) ? 'opacity-70 cursor-not-allowed' : ''}
              `}
            >
              <SafeIcon icon={FiX} />
              <span>Cancelar</span>
            </motion.button>
          </div>

          {/* Debug Info in Development */}
          {process.env.NODE_ENV !== 'production' && (
            <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg text-xs">
              <p className="font-mono">Form data: {JSON.stringify(formData, null, 2)}</p>
            </div>
          )}
        </form>
      </div>
    </motion.div>
  );
};

export default AddMedication;