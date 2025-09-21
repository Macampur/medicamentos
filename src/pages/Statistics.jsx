import React,{useMemo} from 'react';
import {motion} from 'framer-motion';
import {format,subDays,subWeeks,subMonths,isAfter} from 'date-fns';
import {es} from 'date-fns/locale';
import {useMedication} from '../context/MedicationContext';
import ReactECharts from 'echarts-for-react';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const {FiTrendingUp,FiPieChart,FiBarChart,FiActivity}=FiIcons;

const Statistics=()=> {
  const {medications}=useMedication();

  const stats=useMemo(()=> {
    const now=new Date();
    const last7Days=subDays(now,7);
    const last30Days=subDays(now,30);
    const last3Months=subMonths(now,3);

    // Medications in different time periods
    const medicationsLast7Days=medications.filter(med=> 
      isAfter(new Date(med.dateTime),last7Days)
    );
    const medicationsLast30Days=medications.filter(med=> 
      isAfter(new Date(med.dateTime),last30Days)
    );

    // Most used medications with better formatting
    const medicationCounts=medications.reduce((acc,med)=> {
      // Truncate long medication names
      const shortName = med.name.length > 15 ? med.name.substring(0, 15) + '...' : med.name;
      const originalName = med.name;
      
      if (!acc[originalName]) {
        acc[originalName] = { count: 0, shortName };
      }
      acc[originalName].count += med.quantity;
      return acc;
    },{});

    const mostUsed=Object.entries(medicationCounts)
      .sort(([,a],[,b])=> b.count - a.count)
      .slice(0,5)
      .map(([name, data]) => [data.shortName, data.count, name]); // [shortName, count, originalName]

    // Daily averages
    const totalPills7Days=medicationsLast7Days.reduce((total,med)=> total + med.quantity,0);
    const totalPills30Days=medicationsLast30Days.reduce((total,med)=> total + med.quantity,0);

    return {
      totalMedications: medications.length,
      totalPills: medications.reduce((total,med)=> total + med.quantity,0),
      uniqueMedications: new Set(medications.map(med=> med.name)).size,
      averageDaily7Days: totalPills7Days / 7,
      averageDaily30Days: totalPills30Days / 30,
      mostUsed,
      medicationsLast7Days: medicationsLast7Days.length,
      medicationsLast30Days: medicationsLast30Days.length
    };
  },[medications]);

  // Improved chart for most used medications
  const medicationChartOption={
    tooltip: {
      trigger: 'item',
      formatter: function(params) {
        const originalName = stats.mostUsed[params.dataIndex]?.[2] || params.name;
        return `<strong>${originalName}</strong><br/>Cantidad: ${params.value} (${params.percent}%)`;
      }
    },
    legend: {
      show: false // Hide legend to save space
    },
    series: [
      {
        name: 'Medicamentos',
        type: 'pie',
        radius: ['40%', '70%'], // Make it a donut chart for better readability
        center: ['50%', '50%'],
        avoidLabelOverlap: true,
        itemStyle: {
          borderRadius: 8,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: true,
          position: 'outside',
          formatter: function(params) {
            return `${params.name}\n${params.value}`;
          },
          fontSize: 11,
          color: '#64748b'
        },
        labelLine: {
          show: true,
          length: 15,
          length2: 10
        },
        data: stats.mostUsed.map(([shortName, count]) => ({
          value: count,
          name: shortName,
          itemStyle: {
            color: [
              '#0ea5e9', // Primary blue
              '#10b981', // Green
              '#f59e0b', // Orange
              '#ef4444', // Red
              '#8b5cf6'  // Purple
            ][stats.mostUsed.findIndex(([n]) => n === shortName)] || '#64748b'
          }
        })),
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0,0,0,0.5)'
          }
        }
      }
    ]
  };

  // Weekly trend chart with better styling
  const weeklyTrendOption={
    tooltip: {
      trigger: 'axis',
      formatter: function(params) {
        const day = params[0].axisValue;
        const value = params[0].value;
        return `<strong>${day}</strong><br/>Pastillas: ${value}`;
      }
    },
    grid: {
      left: '10%',
      right: '10%',
      top: '15%',
      bottom: '15%'
    },
    xAxis: {
      type: 'category',
      data: Array.from({length: 7},(_,i)=> {
        const date=subDays(new Date(),6 - i);
        return format(date,'EEE d',{locale: es});
      }),
      axisLabel: {
        fontSize: 11,
        color: '#64748b'
      }
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        fontSize: 11,
        color: '#64748b'
      },
      splitLine: {
        lineStyle: {
          color: '#e2e8f0'
        }
      }
    },
    series: [
      {
        data: Array.from({length: 7},(_,i)=> {
          const date=subDays(new Date(),6 - i);
          const dayMedications=medications.filter(med=> {
            const medDate=new Date(med.dateTime);
            return medDate.toDateString()===date.toDateString();
          });
          return dayMedications.reduce((total,med)=> total + med.quantity,0);
        }),
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        lineStyle: {
          color: '#0ea5e9',
          width: 3
        },
        itemStyle: {
          color: '#0ea5e9',
          borderColor: '#fff',
          borderWidth: 2
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              {offset: 0, color: 'rgba(14,165,233,0.3)'},
              {offset: 1, color: 'rgba(14,165,233,0.05)'}
            ]
          }
        }
      }
    ]
  };

  const container={
    hidden: {opacity: 0},
    show: {opacity: 1,transition: {staggerChildren: 0.1}}
  };

  const item={
    hidden: {opacity: 0,y: 20},
    show: {opacity: 1,y: 0}
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
        <motion.div
          variants={item}
          className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl p-4 text-white"
        >
          <SafeIcon icon={FiActivity} className="text-2xl mb-2" />
          <p className="text-primary-100 text-sm">Total Registros</p>
          <p className="text-2xl font-bold">{stats.totalMedications}</p>
        </motion.div>

        <motion.div
          variants={item}
          className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 text-white"
        >
          <SafeIcon icon={FiTrendingUp} className="text-2xl mb-2" />
          <p className="text-green-100 text-sm">Total Pastillas</p>
          <p className="text-2xl font-bold">{stats.totalPills}</p>
        </motion.div>

        <motion.div
          variants={item}
          className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-4 text-white"
        >
          <SafeIcon icon={FiPieChart} className="text-2xl mb-2" />
          <p className="text-orange-100 text-sm">Medicamentos Únicos</p>
          <p className="text-2xl font-bold">{stats.uniqueMedications}</p>
        </motion.div>

        <motion.div
          variants={item}
          className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 text-white"
        >
          <SafeIcon icon={FiBarChart} className="text-2xl mb-2" />
          <p className="text-purple-100 text-sm">Promedio Diario</p>
          <p className="text-2xl font-bold">{stats.averageDaily7Days.toFixed(1)}</p>
        </motion.div>
      </div>

      {/* Period Comparison */}
      <motion.div
        variants={item}
        className="bg-white dark:bg-medical-800 rounded-xl p-6 shadow-sm"
      >
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
      <motion.div
        variants={item}
        className="bg-white dark:bg-medical-800 rounded-xl p-6 shadow-sm"
      >
        <h3 className="text-lg font-semibold text-medical-800 dark:text-medical-200 mb-4">
          Tendencia Semanal
        </h3>
        {medications.length > 0 ? (
          <ReactECharts
            option={weeklyTrendOption}
            style={{height: '250px'}}
          />
        ) : (
          <div className="text-center py-8 text-medical-500 dark:text-medical-400">
            No hay suficientes datos para mostrar la tendencia
          </div>
        )}
      </motion.div>

      {/* Most Used Medications */}
      <motion.div
        variants={item}
        className="bg-white dark:bg-medical-800 rounded-xl p-6 shadow-sm"
      >
        <h3 className="text-lg font-semibold text-medical-800 dark:text-medical-200 mb-4">
          Medicamentos Más Utilizados
        </h3>
        {stats.mostUsed.length > 0 ? (
          <>
            <ReactECharts
              option={medicationChartOption}
              style={{height: '350px'}}
            />
            <div className="mt-6 space-y-3">
              <h4 className="font-medium text-medical-700 dark:text-medical-300 mb-3">
                Detalles por Medicamento:
              </h4>
              {stats.mostUsed.map(([shortName, count, originalName], index) => (
                <div key={originalName} className="flex justify-between items-center p-3 bg-medical-50 dark:bg-medical-700 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{
                        backgroundColor: [
                          '#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'
                        ][index] || '#64748b'
                      }}
                    />
                    <span className="text-medical-700 dark:text-medical-300 font-medium">
                      {originalName}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-semibold text-primary-600 dark:text-primary-400">
                      {count} pastillas
                    </span>
                    <div className="text-xs text-medical-500 dark:text-medical-400">
                      {((count / stats.totalPills) * 100).toFixed(1)}% del total
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-8 text-medical-500 dark:text-medical-400">
            <SafeIcon icon={FiPieChart} className="text-4xl mx-auto mb-2 opacity-50" />
            <p>No hay datos de medicamentos para mostrar</p>
            <p className="text-sm mt-1">Agrega algunos registros para ver las estadísticas</p>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default Statistics;