import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useMedication } from '../context/MedicationContext'
import * as FiIcons from 'react-icons/fi'
import SafeIcon from '../common/SafeIcon'

const { FiWifiOff, FiWifi, FiRefreshCw } = FiIcons

const OfflineIndicator = () => {
  const { isOnline, isLoading, syncPendingChanges } = useMedication()

  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="fixed top-16 left-1/2 transform -translate-x-1/2 z-50 bg-orange-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2"
        >
          <SafeIcon icon={FiWifiOff} className="text-lg" />
          <span className="text-sm font-medium">Modo sin conexión</span>
        </motion.div>
      )}
      
      {isOnline && isLoading && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="fixed top-16 left-1/2 transform -translate-x-1/2 z-50 bg-primary-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2"
        >
          <SafeIcon icon={FiRefreshCw} className="text-lg animate-spin" />
          <span className="text-sm font-medium">Sincronizando...</span>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default OfflineIndicator