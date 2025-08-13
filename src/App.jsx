import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Header from './components/Header';
import Navigation from './components/Navigation';
import Home from './pages/Home';
import AddMedication from './pages/AddMedication';
import History from './pages/History';
import Calendar from './pages/Calendar';
import Statistics from './pages/Statistics';
import Settings from './pages/Settings';
import { MedicationProvider } from './context/MedicationContext';
import { ThemeProvider } from './context/ThemeContext';

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate app loading
    setTimeout(() => setIsLoading(false), 1000);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-medical-100 dark:from-medical-900 dark:to-medical-800 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-medical-700 dark:text-medical-300">
            Cargando Seguimiento de Analgésicos
          </h2>
        </motion.div>
      </div>
    );
  }

  return (
    <ThemeProvider>
      <MedicationProvider>
        <Router>
          <div className="min-h-screen bg-medical-50 dark:bg-medical-900 transition-colors duration-300">
            <div className="max-w-md mx-auto bg-white dark:bg-medical-800 min-h-screen shadow-xl">
              <Header />
              
              <main className="pb-20">
                <AnimatePresence mode="wait">
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/add" element={<AddMedication />} />
                    <Route path="/edit/:id" element={<AddMedication />} />
                    <Route path="/history" element={<History />} />
                    <Route path="/calendar" element={<Calendar />} />
                    <Route path="/statistics" element={<Statistics />} />
                    <Route path="/settings" element={<Settings />} />
                  </Routes>
                </AnimatePresence>
              </main>
              
              <Navigation />
            </div>
          </div>
        </Router>
      </MedicationProvider>
    </ThemeProvider>
  );
}

export default App;