import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiHome, FiPlus, FiList, FiCalendar, FiBarChart } = FiIcons;

const Navigation = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', icon: FiHome, label: 'Inicio' },
    { path: '/add', icon: FiPlus, label: 'Agregar' },
    { path: '/history', icon: FiList, label: 'Historial' },
    { path: '/calendar', icon: FiCalendar, label: 'Calendario' },
    { path: '/statistics', icon: FiBarChart, label: 'Stats' }
  ];

  return (
    <nav className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-md bg-white dark:bg-medical-800 border-t border-medical-200 dark:border-medical-700 shadow-lg">
      <div className="flex justify-around py-2">
        {navItems.map((item, index) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className="relative flex flex-col items-center py-2 px-3 rounded-lg transition-colors duration-200"
            >
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-primary-100 dark:bg-primary-900 rounded-lg"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <div className="relative z-10 flex flex-col items-center">
                <SafeIcon 
                  icon={item.icon} 
                  className={`text-xl mb-1 ${
                    isActive 
                      ? 'text-primary-600 dark:text-primary-400' 
                      : 'text-medical-500 dark:text-medical-400'
                  }`} 
                />
                <span className={`text-xs font-medium ${
                  isActive 
                    ? 'text-primary-600 dark:text-primary-400' 
                    : 'text-medical-500 dark:text-medical-400'
                }`}>
                  {item.label}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default Navigation;