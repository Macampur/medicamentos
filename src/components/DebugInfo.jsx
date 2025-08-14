import React from 'react'
import { useMedication } from '../context/MedicationContext'

const DebugInfo = () => {
  const { 
    medications, 
    commonMedications, 
    isOnline, 
    isLoading,
    lastSync,
    error
  } = useMedication()

  if (process.env.NODE_ENV === 'production') {
    return null
  }

  return (
    <div className="fixed bottom-20 left-0 right-0 max-w-md mx-auto bg-gray-800 text-white text-xs p-2 z-50 overflow-auto max-h-40">
      <div className="flex justify-between">
        <span>Debug Info</span>
        <span>{isOnline ? '🟢 Online' : '🔴 Offline'}</span>
        {isLoading && <span>⏳ Loading</span>}
      </div>
      <div>
        <p>Medications: {medications.length}</p>
        <p>Common Meds: {commonMedications.length}</p>
        <p>Last Sync: {lastSync ? new Date(lastSync).toLocaleTimeString() : 'Never'}</p>
        {error && <p className="text-red-400">Error: {error}</p>}
        <details>
          <summary>Last 3 medications</summary>
          <pre className="text-xs overflow-x-auto">
            {JSON.stringify(medications.slice(0, 3), null, 2)}
          </pre>
        </details>
      </div>
    </div>
  )
}

export default DebugInfo