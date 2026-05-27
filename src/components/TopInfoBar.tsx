import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Church } from 'lucide-react';
import { formatGregorianDate, formatTime, getCopticDate } from '../utils';

interface TopInfoBarProps {
  settings: {
    language: 'ar' | 'en';
    darkMode: boolean;
    timeFormat: string;
  };
}

export const TopInfoBar: React.FC<TopInfoBarProps> = ({ 
  settings
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className={`${settings.darkMode ? 'text-slate-400' : 'text-slate-600'} px-4 py-1.5 flex items-center justify-between text-[10px] sm:text-xs font-bold transition-colors overflow-x-auto whitespace-nowrap`}>
      <div className="flex items-center gap-2">
        <Calendar size={12} className="text-emerald-500" />
        <span>{formatGregorianDate(currentTime, 'long', settings.language)}</span>
      </div>
      <div className="flex items-center gap-2">
        <Clock size={12} className="text-blue-500" />
        <span>{formatTime(currentTime, settings.timeFormat)}</span>
      </div>
      <div className="flex items-center gap-2">
        <Church size={12} className="text-amber-500" />
        <span>{getCopticDate(currentTime, settings.language)}</span>
      </div>
    </div>
  );
};
