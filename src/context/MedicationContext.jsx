import React, { createContext, useContext, useState, useEffect } from 'react'
import { MedicationService } from '../services/medicationService'

const MedicationContext = createContext()

export const useMedication = () => {
  const context = useContext(MedicationContext)
  if (!context) {
    throw new Error('useMedication must be used within a MedicationProvider')
  }
  return context
}

export const MedicationProvider = ({ children }) => {
  const [medications, setMedications] = useState([])
  const [commonMedications, setCommonMedications] = useState([])
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [isLoading, setIsLoading] = useState(false)
  const [lastSync, setLastSync] = useState(null)
  const [initComplete, setInitComplete] = useState(false)
  const [error, setError] = useState(null)

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Initialize tables on mount
  useEffect(() => {
    const initTables = async () => {
      if (isOnline) {
        try {
          setIsLoading(true)
          const result = await MedicationService.initializeTables()
          setInitComplete(result)
          if (!result) {
            setError('Error initializing database tables')
          } else {
            setError(null)
          }
        } catch (err) {
          console.error('Error initializing tables:', err)
          setError('Error connecting to database: ' + err.message)
        } finally {
          setIsLoading(false)
        }
      }
    }
    
    initTables()
  }, [isOnline])

  // Load data on mount or when initialization completes
  useEffect(() => {
    if (isOnline && initComplete) {
      loadData()
    } else if (!isOnline) {
      loadLocalData()
    }
  }, [isOnline, initComplete])

  // Sync when coming back online
  useEffect(() => {
    if (isOnline && lastSync) {
      const timeSinceSync = Date.now() - lastSync
      if (timeSinceSync > 5 * 60 * 1000) { // 5 minutes
        loadData()
      }
    }
  }, [isOnline, lastSync])

  const loadLocalData = () => {
    setIsLoading(true)
    try {
      // Load from local storage when offline
      const savedMedications = localStorage.getItem('medications')
      const savedCommonMedications = localStorage.getItem('commonMedications')
      
      if (savedMedications) {
        const parsedMeds = JSON.parse(savedMedications)
        console.log('Loaded medications from local storage:', parsedMeds.length)
        setMedications(parsedMeds)
      }
      
      if (savedCommonMedications) {
        const parsedCommonMeds = JSON.parse(savedCommonMedications)
        console.log('Loaded common medications from local storage:', parsedCommonMeds.length)
        setCommonMedications(parsedCommonMeds)
      } else {
        // Set default medications if none exist
        const defaultMeds = [
          'Paracetamol', 'Ibuprofeno', 'Aspirina', 'Naproxeno', 'Diclofenaco',
          'Ketorolaco', 'Tramadol', 'Codeína', 'Metamizol', 'Celecoxib'
        ]
        setCommonMedications(defaultMeds)
        localStorage.setItem('commonMedications', JSON.stringify(defaultMeds))
      }
      
      setError(null)
    } catch (error) {
      console.error('Error loading local data:', error)
      setError('Error loading local data: ' + error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const loadData = async () => {
    setIsLoading(true)
    try {
      if (isOnline) {
        console.log('Loading data from Supabase...')
        // Load from Supabase
        const [medicationsData, commonMedsData] = await Promise.all([
          MedicationService.getAllMedications(),
          MedicationService.getCommonMedications()
        ])
        
        console.log('Loaded medications from Supabase:', medicationsData.length)
        console.log('Loaded common medications from Supabase:', commonMedsData.length)
        
        setMedications(medicationsData)
        setCommonMedications(commonMedsData)
        setLastSync(Date.now())
        setError(null)
        
        // Update local storage as backup
        localStorage.setItem('medications', JSON.stringify(medicationsData))
        localStorage.setItem('commonMedications', JSON.stringify(commonMedsData))
      } else {
        // Load from local storage when offline
        loadLocalData()
      }
    } catch (error) {
      console.error('Error loading data:', error)
      setError('Error loading data: ' + error.message)
      // Fallback to local storage
      loadLocalData()
    } finally {
      setIsLoading(false)
    }
  }

  const addMedication = async (medication) => {
    try {
      console.log('Adding medication:', medication)
      setIsLoading(true)
      
      if (isOnline) {
        const newMedication = await MedicationService.addMedication(medication)
        console.log('Medication added successfully:', newMedication)
        
        setMedications(prev => [newMedication, ...prev])
        setError(null)
        
        // Update local storage
        const updated = [newMedication, ...medications]
        localStorage.setItem('medications', JSON.stringify(updated))
        
        return newMedication
      } else {
        // Offline mode - store locally
        const newMedication = {
          id: `offline_${Date.now()}`,
          ...medication,
          createdAt: new Date().toISOString(),
          _pendingSync: true
        }
        
        const updated = [newMedication, ...medications]
        setMedications(updated)
        localStorage.setItem('medications', JSON.stringify(updated))
        
        return newMedication
      }
    } catch (error) {
      console.error('Error adding medication:', error)
      setError('Error adding medication: ' + error.message)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const updateMedication = async (id, updatedMedication) => {
    try {
      console.log('Updating medication:', id, updatedMedication)
      setIsLoading(true)
      
      if (isOnline) {
        const updated = await MedicationService.updateMedication(id, updatedMedication)
        
        setMedications(prev => 
          prev.map(med => med.id === id ? updated : med)
        )
        setError(null)
        
        // Update local storage
        const updatedList = medications.map(med => med.id === id ? updated : med)
        localStorage.setItem('medications', JSON.stringify(updatedList))
        
        return updated
      } else {
        // Offline mode
        const updated = { ...updatedMedication, _pendingSync: true }
        
        setMedications(prev =>
          prev.map(med => med.id === id ? { ...med, ...updated } : med)
        )
        
        const updatedList = medications.map(med => 
          med.id === id ? { ...med, ...updated } : med
        )
        localStorage.setItem('medications', JSON.stringify(updatedList))
        
        return { id, ...updated }
      }
    } catch (error) {
      console.error('Error updating medication:', error)
      setError('Error updating medication: ' + error.message)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const deleteMedication = async (id) => {
    try {
      console.log('Deleting medication:', id)
      setIsLoading(true)
      
      if (isOnline) {
        await MedicationService.deleteMedication(id)
      }
      
      const updated = medications.filter(med => med.id !== id)
      setMedications(updated)
      localStorage.setItem('medications', JSON.stringify(updated))
      setError(null)
      
      return true
    } catch (error) {
      console.error('Error deleting medication:', error)
      setError('Error deleting medication: ' + error.message)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const addToCommonMedications = async (medicationName) => {
    if (!medicationName) return

    const formattedName = medicationName.trim()
    const exists = commonMedications.some(
      med => med.toLowerCase() === formattedName.toLowerCase()
    )

    if (!exists) {
      try {
        setIsLoading(true)
        
        if (isOnline) {
          const success = await MedicationService.addCommonMedication(formattedName)
          if (success) {
            const updated = [...commonMedications, formattedName].sort()
            setCommonMedications(updated)
            localStorage.setItem('commonMedications', JSON.stringify(updated))
            setError(null)
          }
        } else {
          // Offline mode
          const updated = [...commonMedications, formattedName].sort()
          setCommonMedications(updated)
          localStorage.setItem('commonMedications', JSON.stringify(updated))
        }
      } catch (error) {
        console.error('Error adding common medication:', error)
        setError('Error adding common medication: ' + error.message)
      } finally {
        setIsLoading(false)
      }
    }
  }

  const getMedicationById = (id) => {
    return medications.find(med => med.id === id)
  }

  const exportData = () => {
    const dataStr = JSON.stringify(medications, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `medicamentos_${new Date().toISOString().split('T')[0]}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  const clearAllData = async () => {
    try {
      console.log('Clearing all data')
      setIsLoading(true)
      
      if (isOnline) {
        await MedicationService.clearAllData()
      }
      
      setMedications([])
      setCommonMedications([])
      localStorage.removeItem('medications')
      localStorage.removeItem('commonMedications')
      setError(null)
      
      // Reload default common medications
      if (isOnline) {
        const commonMedsData = await MedicationService.getCommonMedications()
        setCommonMedications(commonMedsData)
        localStorage.setItem('commonMedications', JSON.stringify(commonMedsData))
      } else {
        const defaultMeds = [
          'Paracetamol', 'Ibuprofeno', 'Aspirina', 'Naproxeno', 'Diclofenaco',
          'Ketorolaco', 'Tramadol', 'Codeína', 'Metamizol', 'Celecoxib'
        ]
        setCommonMedications(defaultMeds)
        localStorage.setItem('commonMedications', JSON.stringify(defaultMeds))
      }
      
      return true
    } catch (error) {
      console.error('Error clearing data:', error)
      setError('Error clearing data: ' + error.message)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const syncPendingChanges = async () => {
    if (!isOnline) return

    try {
      console.log('Syncing pending changes')
      setIsLoading(true)
      
      // Find medications that need syncing
      const pendingMedications = medications.filter(med => med._pendingSync)
      console.log('Syncing pending changes:', pendingMedications.length)
      
      for (const med of pendingMedications) {
        if (med.id.startsWith('offline_')) {
          // This is a new medication created offline
          const { _pendingSync, id, ...medicationData } = med
          await MedicationService.addMedication(medicationData)
        } else {
          // This is an updated medication
          const { _pendingSync, ...medicationData } = med
          await MedicationService.updateMedication(med.id, medicationData)
        }
      }
      
      // Reload all data to get the latest
      await loadData()
      setError(null)
    } catch (error) {
      console.error('Error syncing pending changes:', error)
      setError('Error syncing changes: ' + error.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <MedicationContext.Provider
      value={{
        medications,
        commonMedications,
        isOnline,
        isLoading,
        lastSync,
        error,
        addMedication,
        updateMedication,
        deleteMedication,
        getMedicationById,
        exportData,
        clearAllData,
        addToCommonMedications,
        syncPendingChanges,
        refreshData: loadData
      }}
    >
      {children}
    </MedicationContext.Provider>
  )
}