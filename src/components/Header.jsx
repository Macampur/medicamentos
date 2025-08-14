import React from 'react'
import { motion } from 'framer-motion'
import { useLocation } from 'react-router-dom'
import { useMedication } from '../context/MedicationContext'
import * as FiIcons from 'react-icons/fi'
import SafeIcon from '../common/SafeIcon'
import SyncButton from './SyncButton'

const { FiActivity } = FiIcons

const Header = () => {
  const location = useLocation()
  const { isOnline } = useMedication()

  const getTitle = () => {
    switch (location.pathname) {
      case '/': return 'Inicio'
      case '/add': return 'Agregar Medicamento'
      case '/history': return 'Historial'
      case '/calendar': return 'Calendario'
      case '/statistics': return 'Estadísticas'
      case '/settings': return 'Configuración'
      default: return 'Seguimiento de Analgésicos'
    }
  }

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-primary-600 to-primary-700 dark:from-primary-700 dark:to-primary-800 text-white p-4 shadow-lg"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <SafeIcon icon={FiActivity} className="text-2xl" />
          <h1 className="text-xl font-bold">{getTitle()}</h1>
        </div>
        
        <div className="flex items-center space-x-2">
          <SyncButton />
          
          {/* Connection status indicator */}
          <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-400' : 'bg-orange-400'}`} />
        </div>
      </div>
    </motion.header>
  )
}

export default Header