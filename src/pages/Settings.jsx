import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useTheme } from '../context/ThemeContext'
import { useMedication } from '../context/MedicationContext'
import * as FiIcons from 'react-icons/fi'
import SafeIcon from '../common/SafeIcon'

const { FiMoon, FiSun, FiDownload, FiTrash2, FiInfo, FiShield, FiHeart, FiPlus, FiX, FiCloud, FiWifi, FiWifiOff } = FiIcons

const Settings = () => {
  const { isDark, toggleTheme } = useTheme()
  const { 
    exportData, 
    clearAllData, 
    medications, 
    commonMedications, 
    addToCommonMedications,
    isOnline,
    lastSync,
    refreshData,
    syncPendingChanges
  } = useMedication()
  
  const [newMedication, setNewMedication] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)

  const handleClearData = () => {
    if (window.confirm('¿Estás seguro de que deseas eliminar todos los datos? Esta acción no se puede deshacer.')) {
      clearAllData()
      alert('Todos los datos han sido eliminados.')
    }
  }

  const handleAddMedication = (e) => {
    e.preventDefault()
    if (newMedication.trim()) {
      addToCommonMedications(newMedication)
      setNewMedication('')
      setShowAddForm(false)
    }
  }

  const handleManualSync = async () => {
    try {
      await syncPendingChanges()
      await refreshData()
      alert('Sincronización completada')
    } catch (error) {
      alert('Error durante la sincronización')
    }
  }

  const hasPendingChanges = medications.some(med => med._pendingSync)

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="p-4 space-y-6"
    >
      {/* Connection Status */}
      <motion.div variants={item} className="bg-white dark:bg-medical-800 rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-medical-800 dark:text-medical-200 mb-4 flex items-center">
          <SafeIcon icon={isOnline ? FiWifi : FiWifiOff} className="mr-2" />
          Estado de Conexión
        </h3>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-medical-600 dark:text-medical-400">Estado</span>
            <div className={`flex items-center space-x-2 ${isOnline ? 'text-green-600' : 'text-orange-600'}`}>
              <SafeIcon icon={isOnline ? FiWifi : FiWifiOff} />
              <span className="font-medium">
                {isOnline ? 'Conectado' : 'Sin conexión'}
              </span>
            </div>
          </div>
          
          {lastSync && (
            <div className="flex items-center justify-between">
              <span className="text-medical-600 dark:text-medical-400">Última sincronización</span>
              <span className="text-sm text-medical-500">
                {new Date(lastSync).toLocaleString()}
              </span>
            </div>
          )}
          
          {hasPendingChanges && (
            <div className="p-3 bg-orange-50 dark:bg-orange-900 rounded-lg">
              <p className="text-sm text-orange-700 dark:text-orange-300 mb-2">
                Tienes cambios pendientes de sincronizar
              </p>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleManualSync}
                className="px-3 py-1 bg-orange-600 text-white rounded text-sm hover:bg-orange-700"
              >
                Sincronizar ahora
              </motion.button>
            </div>
          )}
          
          {isOnline && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={refreshData}
              className="w-full flex items-center justify-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white py-2 px-4 rounded-lg transition-colors"
            >
              <SafeIcon icon={FiCloud} />
              <span>Actualizar desde la nube</span>
            </motion.button>
          )}
        </div>
      </motion.div>

      {/* Theme Settings */}
      <motion.div variants={item} className="bg-white dark:bg-medical-800 rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-medical-800 dark:text-medical-200 mb-4 flex items-center">
          <SafeIcon icon={isDark ? FiMoon : FiSun} className="mr-2" />
          Apariencia
        </h3>
        <div className="flex items-center justify-between">
          <span className="text-medical-600 dark:text-medical-400">Modo oscuro</span>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={toggleTheme}
            className={`
              relative w-12 h-6 rounded-full transition-colors duration-300
              ${isDark ? 'bg-primary-600' : 'bg-medical-300'}
            `}
          >
            <motion.div
              className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-md"
              animate={{ x: isDark ? 26 : 2 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
          </motion.button>
        </div>
      </motion.div>

      {/* Medicamentos Comunes */}
      <motion.div variants={item} className="bg-white dark:bg-medical-800 rounded-xl p-6 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-medical-800 dark:text-medical-200 flex items-center">
            <SafeIcon icon={FiPlus} className="mr-2" />
            Medicamentos Comunes
          </h3>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAddForm(!showAddForm)}
            className="p-2 bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400 rounded-lg"
          >
            <SafeIcon icon={showAddForm ? FiX : FiPlus} />
          </motion.button>
        </div>

        {showAddForm && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4"
            onSubmit={handleAddMedication}
          >
            <div className="flex space-x-2">
              <input
                type="text"
                value={newMedication}
                onChange={(e) => setNewMedication(e.target.value)}
                placeholder="Nombre del medicamento"
                className="flex-1 px-3 py-2 border border-medical-300 dark:border-medical-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-medical-700 text-medical-900 dark:text-medical-100"
              />
              <button
                type="submit"
                className="px-3 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                Añadir
              </button>
            </div>
          </motion.form>
        )}

        <div className="mt-3 flex flex-wrap gap-2">
          {commonMedications.map((med, index) => (
            <div
              key={index}
              className="px-3 py-1 bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 rounded-full text-sm"
            >
              {med}
            </div>
          ))}
        </div>
        <p className="text-xs text-medical-500 dark:text-medical-400 mt-3">
          Los medicamentos que agregues o uses se añadirán automáticamente a esta lista para autocompletar.
        </p>
      </motion.div>

      {/* Data Management */}
      <motion.div variants={item} className="bg-white dark:bg-medical-800 rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-medical-800 dark:text-medical-200 mb-4 flex items-center">
          <SafeIcon icon={FiDownload} className="mr-2" />
          Gestión de Datos
        </h3>
        <div className="space-y-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={exportData}
            disabled={medications.length === 0}
            className="w-full flex items-center justify-center space-x-2 bg-primary-600 hover:bg-primary-700 disabled:bg-medical-400 text-white py-3 px-4 rounded-lg transition-colors"
          >
            <SafeIcon icon={FiDownload} />
            <span>Exportar Datos</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleClearData}
            disabled={medications.length === 0}
            className="w-full flex items-center justify-center space-x-2 bg-red-600 hover:bg-red-700 disabled:bg-medical-400 text-white py-3 px-4 rounded-lg transition-colors"
          >
            <SafeIcon icon={FiTrash2} />
            <span>Eliminar Todos los Datos</span>
          </motion.button>
        </div>

        <div className="mt-4 p-3 bg-medical-50 dark:bg-medical-700 rounded-lg">
          <p className="text-sm text-medical-600 dark:text-medical-400">
            <strong>Total de registros:</strong> {medications.length}
          </p>
          {hasPendingChanges && (
            <p className="text-sm text-orange-600 dark:text-orange-400 mt-1">
              <strong>Pendientes de sincronizar:</strong> {medications.filter(med => med._pendingSync).length}
            </p>
          )}
        </div>
      </motion.div>

      {/* Privacy Information */}
      <motion.div variants={item} className="bg-white dark:bg-medical-800 rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-medical-800 dark:text-medical-200 mb-4 flex items-center">
          <SafeIcon icon={FiShield} className="mr-2" />
          Privacidad y Seguridad
        </h3>
        <div className="space-y-3 text-sm text-medical-600 dark:text-medical-400">
          <p>🔒 Todos tus datos se almacenan de forma segura</p>
          <p>☁️ Sincronización automática en la nube</p>
          <p>📱 Acceso sin conexión cuando sea necesario</p>
          <p>🚫 No compartimos información personal con terceros</p>
          <p>💾 Los datos solo se exportan cuando lo solicitas</p>
          <p>🔐 La información está cifrada durante la transmisión</p>
        </div>
      </motion.div>

      {/* About */}
      <motion.div variants={item} className="bg-white dark:bg-medical-800 rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-medical-800 dark:text-medical-200 mb-4 flex items-center">
          <SafeIcon icon={FiInfo} className="mr-2" />
          Acerca de la App
        </h3>
        <div className="space-y-2 text-sm text-medical-600 dark:text-medical-400">
          <p><strong>Versión:</strong> 2.0.0</p>
          <p><strong>Propósito:</strong> Seguimiento personal de medicamentos analgésicos</p>
          <p><strong>Desarrollado con:</strong> React, Tailwind CSS, Framer Motion, Supabase</p>
          <p><strong>Características:</strong> Sincronización en la nube, modo sin conexión</p>
        </div>
        <div className="mt-4 p-3 bg-gradient-to-r from-primary-50 to-green-50 dark:from-primary-900 dark:to-green-900 rounded-lg">
          <p className="text-sm text-medical-700 dark:text-medical-300 flex items-center">
            <SafeIcon icon={FiHeart} className="text-red-500 mr-2" />
            Creado para ayudarte a mantener un seguimiento responsable de tus medicamentos
          </p>
        </div>
      </motion.div>

      {/* Disclaimer */}
      <motion.div variants={item} className="bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700 rounded-xl p-6">
        <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
          ⚠️ Aviso Importante
        </h4>
        <p className="text-sm text-yellow-700 dark:text-yellow-300">
          Esta aplicación es solo para seguimiento personal. No reemplaza el consejo médico profesional. 
          Consulta siempre con tu médico sobre el uso de medicamentos.
        </p>
      </motion.div>
    </motion.div>
  )
}

export default Settings