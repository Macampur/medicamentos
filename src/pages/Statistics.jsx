import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { format, subDays, subWeeks, subMonths, isAfter } from 'date-fns';
import { es } from 'date-fns/locale';
import { useMedication } from '../context/MedicationContext';
import ReactECharts from 'echarts-for-react';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiTrendingUp, FiPieChart, FiBarChart, FiActivity } = FiIcons;

const Statistics = () => {
  const { medications } = useMedication();

  const stats = useMemo(() => {
    const now = new Date();
    const last7Days = subDays(now, 7);
    const last30Days = subDays(now, 30);
    const last3Months = subMonths(now, 3);

    // Medications in different time periods
    const medicationsLast7Days = medications.filter(med => 
      isAfter(new Date(med.dateTime), last7Days)
    );
    const medicationsLast30Days = medications.filter(med => 
      isAfter(new Date(med.dateTime), last30Days)
    );

    // Most used medications
    const medicationCounts = medications.reduce((acc, med) => {
      acc[med.name] = (acc[med.name] || 0) + med.quantity;
      return acc;
    }, {});

    const mostUsed = Object.entries(medicationCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5);

    // Daily averages
    const totalPills7Days = medicationsLast7Days.reduce((total, med) => total + med.quantity, 0);
    const totalPills30Days = medicationsLast30Days.reduce((total, med) => total + med.quantity, 0);

    return {
      totalMedications: medications.length,
      totalPills: medications.reduce((total, med) => total + med.quantity, 0),
      uniqueMedications: new Set(medications.map(med => med.name)).size,
      averageDaily7Days: totalPills7Days / 7,
      averageDaily30Days: totalPills30Days / 30,
      mostUsed,
      medicationsLast7Days: medicationsLast7Days.length,
      medicationsLast30Days: medicationsLast30Days.length
    };
  }, [medications]);

  // Chart for most used medications
  const medicationChartOption = {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      textStyle: {
        color: '#64748b'
      }
    },
    series: [
      {
        name: 'Medicamentos',
        type: 'pie',
        radius: '50%',
        data: stats.mostUsed.map(([name, count]) => ({
          value: count,
          name: name
        })),
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  };

  // Weekly trend chart
  const weeklyTrendOption = {
    tooltip: {
      trigger: 'axis'
    },
    xAxis: {
      type: 'category',
      data: Array.from({ length: 7 }, (_, i) => {
        const date = subDays(new Date(), 6 - i);
        return format(date, 'EEE', { locale: es });
      })
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        data: Array.from({ length: 7 }, (_, i) => {
          const date = subDays(new Date(), 6 - i);
          const dayMedications = medications.filter(med => {
            const medDate = new Date(med.dateTime);
            return medDate.toDateString() === date.toDateString();
          });
          return dayMedications.reduce((total, med) => total + med.quantity, 0);
        }),
        type: 'line',
        smooth: true,
        lineStyle: {
          color: '#0ea5e9'
        },
        itemStyle: {
          color: '#0ea5e9'
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              {
                offset: 0,
                color: 'rgba(14, 165, 233, 0.3)'
              },
              {
                offset: 1,
                color: 'rgba(14, 165, 233, 0.1)'
              }
            ]
          }
        }
      }
    ]
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="p-4 space-y-6"
    >
      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4">
        <motion.div variants={item} className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl p-4 text-white">
          <SafeIcon icon={FiActivity} className="text-2xl mb-2" />
          <p className="text-primary-100 text-sm">Total Registros</p>
          <p className="text-2xl font-bold">{stats.totalMedications}</p>
        </motion.div>

        <motion.div variants={item} className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 text-white">
          <SafeIcon icon={FiTrendingUp} className="text-2xl mb-2" />
          <p className="text-green-100 text-sm">Total Pastillas</p>
          <p className="text-2xl font-bold">{stats.totalPills}</p>
        </motion.div>

        <motion.div variants={item} className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-4 text-white">
          <SafeIcon icon={FiPieChart} className="text-2xl mb-2" />
          <p className="text-orange-100 text-sm">Medicamentos Únicos</p>
          <p className="text-2xl font-bold">{stats.uniqueMedications}</p>
        </motion.div>

        <motion.div variants={item} className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 text-white">
          <SafeIcon icon={FiBarChart} className="text-2xl mb-2" />
          <p className="text-purple-100 text-sm">Promedio Diario</p>
          <p className="text-2xl font-bold">{stats.averageDaily7Days.toFixed(1)}</p>
        </motion.div>
      </div>

      {/* Period Comparison */}
      <motion.div variants={item} className="bg-white dark:bg-medical-800 rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-medical-800 dark:text-medical-200 mb-4">
          Comparación por Períodos
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-primary-600">{stats.medicationsLast7Days}</p>
            <p className="text-sm text-medical-600 dark:text-medical-400">Últimos 7 días</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">{stats.medicationsLast30Days}</p>
            <p className="text-sm text-medical-600 dark:text-medical-400">Últimos 30 días</p>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div className="text-center">
            <p className="text-lg font-semibold text-medical-700 dark:text-medical-300">
              {stats.averageDaily7Days.toFixed(1)}
            </p>
            <p className="text-xs text-medical-500 dark:text-medical-400">Promedio diario (7d)</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-semibold text-medical-700 dark:text-medical-300">
              {stats.averageDaily30Days.toFixed(1)}
            </p>
            <p className="text-xs text-medical-500 dark:text-medical-400">Promedio diario (30d)</p>
          </div>
        </div>
      </motion.div>

      {/* Weekly Trend Chart */}
      <motion.div variants={item} className="bg-white dark:bg-medical-800 rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-medical-800 dark:text-medical-200 mb-4">
          Tendencia Semanal
        </h3>
        {medications.length > 0 ? (
          <ReactECharts option={weeklyTrendOption} style={{ height: '250px' }} />
        ) : (
          <div className="text-center py-8 text-medical-500 dark:text-medical-400">
            No hay suficientes datos para mostrar la tendencia
          </div>
        )}
      </motion.div>

      {/* Most Used Medications */}
      <motion.div variants={item} className="bg-white dark:bg-medical-800 rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-medical-800 dark:text-medical-200 mb-4">
          Medicamentos Más Utilizados
        </h3>
        {stats.mostUsed.length > 0 ? (
          <>
            <ReactECharts option={medicationChartOption} style={{ height: '300px' }} />
            <div className="mt-4 space-y-2">
              {stats.mostUsed.map(([name, count], index) => (
                <div key={name} className="flex justify-between items-center">
                  <span className="text-medical-700 dark:text-medical-300">{name}</span>
                  <span className="font-semibold text-primary-600">{count} pastillas</span>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-8 text-medical-500 dark:text-medical-400">
            No hay datos de medicamentos para mostrar
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default Statistics;