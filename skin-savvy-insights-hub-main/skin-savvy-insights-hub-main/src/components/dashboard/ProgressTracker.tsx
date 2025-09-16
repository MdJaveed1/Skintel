import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUp, Calendar } from 'lucide-react';
import { formatDate } from '../../lib/utils';

interface ProgressTrackerProps {
  streakDays: number;
  lastActivity: Date;
  completionRate: number;
}

const ProgressTracker: React.FC<ProgressTrackerProps> = ({
  streakDays = 7,
  lastActivity = new Date(),
  completionRate = 85,
}) => {
  // Generate last 7 days for activity tracking
  const getDays = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      // Randomly decide if the day was active
      // In a real app, this would be based on user data
      const isActive = i === 0 || Math.random() > 0.3;
      
      days.push({
        date,
        isActive,
        dayName: date.toLocaleDateString('en-US', { weekday: 'short' }).substring(0, 1),
      });
    }
    return days;
  };

  const activityDays = getDays();

  return (
    <motion.div 
      className="card h-full"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h3 className="text-lg font-semibold mb-6">Skincare Progress</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-neutral-50 dark:bg-neutral-900 rounded-lg p-4 border border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Current Streak</h4>
            <div className="bg-success-100 dark:bg-success-900/30 p-1.5 rounded">
              <ArrowUp className="h-4 w-4 text-success-500" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-bold">{streakDays} days</p>
          <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">Keep it up!</p>
        </div>
        
        <div className="bg-neutral-50 dark:bg-neutral-900 rounded-lg p-4 border border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Last Activity</h4>
            <div className="bg-primary-100 dark:bg-primary-900/30 p-1.5 rounded">
              <Calendar className="h-4 w-4 text-primary-500" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-bold">{formatDate(lastActivity)}</p>
          <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
            {new Date().toDateString() === lastActivity.toDateString() 
              ? 'Today' 
              : formatDate(lastActivity)}
          </p>
        </div>
        
        <div className="bg-neutral-50 dark:bg-neutral-900 rounded-lg p-4 border border-neutral-200 dark:border-neutral-800">
          <h4 className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Routine Completion</h4>
          <div className="mt-2 relative pt-1">
            <div className="overflow-hidden h-4 text-xs flex rounded-full bg-neutral-200 dark:bg-neutral-700">
              <div
                style={{ width: `${completionRate}%` }}
                className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary-400"
              />
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-xs text-neutral-500 dark:text-neutral-400">This Week</span>
              <span className="text-xs font-semibold">{completionRate}%</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-8">
        <h4 className="text-sm font-medium mb-4 text-neutral-700 dark:text-neutral-300">Weekly Activity</h4>
        <div className="flex justify-between items-end h-32">
          {activityDays.map((day, index) => (
            <div key={index} className="flex flex-col items-center">
              <motion.div 
                className={`w-8 rounded-t-md ${
                  day.isActive 
                    ? 'bg-primary-400 dark:bg-primary-500' 
                    : 'bg-neutral-200 dark:bg-neutral-700'
                }`}
                initial={{ height: 0 }}
                animate={{ height: day.isActive ? 20 + Math.random() * 60 : 10 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              />
              <div className="mt-2 text-xs font-medium">{day.dayName}</div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default ProgressTracker;