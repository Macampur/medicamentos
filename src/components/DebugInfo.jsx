import React from 'react'
import { useMedication } from '../context/MedicationContext'

const DebugInfo = () => {
  const { 
    medications, 
    commonMedications, 
    isOnline, 
    isLoading, 
    lastSync, 
    error, 
    initComplete 
  } = useMedication()

  if (process.env.NODE_ENV === 'production') {
    return null
  }

  return (
    <div className="fixed bottom-20 left-0 right-0 max-w-md mx-auto bg-gray-800 text-white text-xs p-2 z-50 overflow-auto max-h-40">
      <div className="flex justify-between items-center mb-1">
        <span className="font-bold">Debug Info</span>
        <div className="flex items-center space-x-2">
          <span>{isOnline ? '🟢 Online' : '🔴 Offline'}</span>
          {isLoading && <span>⏳ Loading</span>}
          {initComplete ? '✅ Init' : '⏳ Init'}
        </div>
      </div>
      
      <div className="space-y-1">
        <p>Medications: {medications.length}</p>
        <p>Common Meds: {commonMedications.length}</p>
        <p>Last Sync: {lastSync ? new Date(lastSync).toLocaleTimeString() : 'Never'}</p>
        
        {error && (
          <p className="text-red-400 text-wrap break-words">
            Error: {error}
          </p>
        )}
        
        <details className="mt-2">
          <summary className="cursor-pointer hover:text-gray-300">
            Recent medications ({medications.slice(0, 2).length})
          </summary>
          <pre className="text-xs overflow-x-auto mt-1 bg-gray-900 p-2 rounded max-h-32 overflow-y-auto">
            {JSON.stringify(medications.slice(0, 2).map(med => ({
              id: med.id.substring(0, 8) + '...',
              name: med.name,
              quantity: med.quantity,
              pending: med._pendingSync || false
            })), null, 2)}
          </pre>
        </details>
      </div>
    </div>
  )
}

export default DebugInfo