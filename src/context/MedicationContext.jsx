import React, { createContext, useContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

const MedicationContext = createContext();

export const useMedication = () => {
  const context = useContext(MedicationContext);
  if (!context) {
    throw new Error('useMedication must be used within a MedicationProvider');
  }
  return context;
};

export const MedicationProvider = ({ children }) => {
  const [medications, setMedications] = useState([]);
  const [commonMedications, setCommonMedications] = useState([
    'Paracetamol',
    'Ibuprofeno',
    'Aspirina',
    'Naproxeno',
    'Diclofenaco',
    'Ketorolaco',
    'Tramadol',
    'Codeína',
    'Metamizol',
    'Celecoxib'
  ]);

  // Cargar medicamentos y lista de autocompletado del almacenamiento local
  useEffect(() => {
    const savedMedications = localStorage.getItem('medications');
    if (savedMedications) {
      setMedications(JSON.parse(savedMedications));
    }
    
    const savedCommonMedications = localStorage.getItem('commonMedications');
    if (savedCommonMedications) {
      setCommonMedications(JSON.parse(savedCommonMedications));
    }
  }, []);

  // Guardar medicamentos en almacenamiento local
  useEffect(() => {
    localStorage.setItem('medications', JSON.stringify(medications));
  }, [medications]);

  // Guardar lista de autocompletado en almacenamiento local
  useEffect(() => {
    localStorage.setItem('commonMedications', JSON.stringify(commonMedications));
  }, [commonMedications]);

  // Función para añadir medicamento a la lista de autocompletado
  const addToCommonMedications = (medicationName) => {
    if (!medicationName) return;
    
    // Convertir a formato título para consistencia
    const formattedName = medicationName.trim();
    
    // Verificar si ya existe en la lista (ignorando mayúsculas/minúsculas)
    const exists = commonMedications.some(
      med => med.toLowerCase() === formattedName.toLowerCase()
    );
    
    if (!exists) {
      setCommonMedications(prev => [...prev, formattedName].sort());
    }
  };

  const addMedication = (medication) => {
    const newMedication = {
      id: uuidv4(),
      ...medication,
      createdAt: new Date().toISOString()
    };
    
    // Añadir a la lista de medicamentos
    setMedications(prev => [newMedication, ...prev]);
    
    // Añadir a la lista de autocompletado
    addToCommonMedications(medication.name);
    
    return newMedication;
  };

  const updateMedication = (id, updatedMedication) => {
    setMedications(prev =>
      prev.map(med => med.id === id ? { ...med, ...updatedMedication } : med)
    );
    
    // Si el nombre del medicamento ha cambiado, añadirlo a la lista de autocompletado
    if (updatedMedication.name) {
      addToCommonMedications(updatedMedication.name);
    }
  };

  const deleteMedication = (id) => {
    setMedications(prev => prev.filter(med => med.id !== id));
  };

  const getMedicationById = (id) => {
    return medications.find(med => med.id === id);
  };

  const exportData = () => {
    const dataStr = JSON.stringify(medications, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `medicamentos_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const clearAllData = () => {
    setMedications([]);
    localStorage.removeItem('medications');
  };

  return (
    <MedicationContext.Provider value={{
      medications,
      commonMedications,
      addMedication,
      updateMedication,
      deleteMedication,
      getMedicationById,
      exportData,
      clearAllData,
      addToCommonMedications
    }}>
      {children}
    </MedicationContext.Provider>
  );
};