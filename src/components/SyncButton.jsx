import React from 'react'
import { motion } from 'framer-motion'
import { useMedication } from '../context/MedicationContext'
import * as FiIcons from 'react-icons/fi'
import SafeIcon from '../common/SafeIcon'

const { FiRefreshCw, FiCheck } = FiIcons

const SyncButton = () => {
  const { isOnline, isLoading, refreshData, syncPendingChanges, medications } = useMedication()
  
  const hasPendingChanges = medications.some(med => med._pendingSync)

  const handleSync = async () => {
    if (hasPendingChanges) {
      await syncPendingChanges()
    } else {
      await refreshData()
    }
  }

  if (!isOnline) return null

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={handleSync}
      disabled={isLoading}
      className={`
        p-2 rounded-lg transition-colors
        ${hasPendingChanges 
          ? 'bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-400' 
          : 'bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400'
        }
        ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-80'}
      `}
    >
      <SafeIcon 
        icon={isLoading ? FiRefreshCw : (hasPendingChanges ? FiRefreshCw : FiCheck)} 
        className={`text-lg ${isLoading ? 'animate-spin' : ''}`} 
      />
    </motion.button>
  )
}

export default SyncButton