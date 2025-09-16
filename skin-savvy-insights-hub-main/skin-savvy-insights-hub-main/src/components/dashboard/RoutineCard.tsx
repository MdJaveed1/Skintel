import React from 'react';
import { motion } from 'framer-motion';
import { Clock, Droplets, Sun, Moon } from 'lucide-react';

interface RoutineCardProps {
  type: 'morning' | 'evening';
}

const RoutineCard: React.FC<RoutineCardProps> = ({ type }) => {
  const routineSteps = type === 'morning' 
    ? [
        { id: 1, name: 'Gentle Cleanser', duration: '30 sec', icon: <Droplets className="h-4 w-4" /> },
        { id: 2, name: 'Vitamin C Serum', duration: '30 sec', icon: <Droplets className="h-4 w-4" /> },
        { id: 3, name: 'Hydrating Moisturizer', duration: '1 min', icon: <Droplets className="h-4 w-4" /> },
        { id: 4, name: 'SPF 50 Sunscreen', duration: '1 min', icon: <Droplets className="h-4 w-4" /> }
      ] 
    : [
        { id: 1, name: 'Oil Cleanser', duration: '1 min', icon: <Droplets className="h-4 w-4" /> },
        { id: 2, name: 'Foaming Cleanser', duration: '30 sec', icon: <Droplets className="h-4 w-4" /> },
        { id: 3, name: 'Retinol Serum', duration: '30 sec', icon: <Droplets className="h-4 w-4" /> },
        { id: 4, name: 'Night Cream', duration: '1 min', icon: <Droplets className="h-4 w-4" /> }
      ];

  return (
    <motion.div 
      className="card h-full"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center">
          {type === 'morning' ? (
            <>
              <Sun className="h-5 w-5 text-warning-400 mr-2" /> 
              Morning Routine
            </>
          ) : (
            <>
              <Moon className="h-5 w-5 text-secondary-400 mr-2" /> 
              Evening Routine
            </>
          )}
        </h3>
        <span className="badge badge-primary flex items-center">
          <Clock className="h-3 w-3 mr-1" /> 
          {routineSteps.reduce((acc, step) => {
            const time = parseInt(step.duration.split(' ')[0]);
            return acc + time;
          }, 0)} min
        </span>
      </div>

      <ul className="space-y-3">
        {routineSteps.map((step, index) => (
          <motion.li 
            key={step.id}
            className="flex items-center p-3 rounded-md bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <div className="bg-white dark:bg-neutral-800 h-8 w-8 rounded-full flex items-center justify-center text-primary-500 mr-3 shadow-sm border border-neutral-200 dark:border-neutral-700">
              {index + 1}
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-medium">{step.name}</h4>
              <div className="flex items-center mt-1">
                <Clock className="h-3 w-3 text-neutral-400 mr-1" />
                <span className="text-xs text-neutral-500 dark:text-neutral-400">{step.duration}</span>
              </div>
            </div>
            <div className="bg-primary-100 dark:bg-primary-900/30 h-8 w-8 rounded-full flex items-center justify-center text-primary-600 dark:text-primary-400">
              {step.icon}
            </div>
          </motion.li>
        ))}
      </ul>
      
      <button className="mt-4 btn btn-outline w-full">
        Edit Routine
      </button>
    </motion.div>
  );
};

export default RoutineCard;