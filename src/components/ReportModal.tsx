import React from 'react';
import { motion } from 'motion/react';
import { X, Check, FileText } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { Servant, AttendanceRecord } from '../types';

interface ReportModalProps {
  showReport: string;
  setShowReport: (id: string | null) => void;
  servants: Servant[];
  attendance: AttendanceRecord[];
  reportType: 'yearly' | 'monthly';
  setReportType: (type: 'yearly' | 'monthly') => void;
  reportMonth: number;
  setReportMonth: (month: number) => void;
  settings: any;
  t: (key: string) => string;
  getFridaysOfYear: (year: number) => Date[];
  getFridaysOfMonth: (year: number, month: number) => Date[];
  toLocalDateString: (date: Date) => string;
  formatDate: (date: string) => string;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  showReport,
  setShowReport,
  servants,
  attendance,
  reportType,
  setReportType,
  reportMonth,
  setReportMonth,
  settings,
  t,
  getFridaysOfYear,
  getFridaysOfMonth,
  toLocalDateString,
  formatDate
}) => {
  const servant = servants.find(s => s.id === showReport);
  const currentYear = new Date().getFullYear();
  const months = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];

  const fridays = (reportType === 'yearly' ? getFridaysOfYear(currentYear) : getFridaysOfMonth(currentYear, reportMonth)).filter(f => f <= new Date());
  
  let both = 0, massOnly = 0, serviceOnly = 0, absent = 0;
  
  fridays.forEach(friday => {
    const dateStr = toLocalDateString(friday);
    const record = (attendance.find(r => r.date === dateStr)?.records || {})[showReport] || { mass: false, service: false };
    if (record.mass && record.service) both++;
    else if (record.mass) massOnly++;
    else if (record.service) serviceOnly++;
    else absent++;
  });

  const pieData = [
    { name: 'الكل', value: both, color: '#10b981' },
    { name: 'قداس فقط', value: massOnly, color: '#3b82f6' },
    { name: 'خدمة فقط', value: serviceOnly, color: '#f59e0b' },
    { name: 'غياب', value: absent, color: '#ef4444' }
  ].filter(d => d.value > 0);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" dir={settings.language === 'ar' ? 'rtl' : 'ltr'}>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => setShowReport(null)}
        className="absolute inset-0 bg-black/60 backdrop-blur-md"
      />
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="relative bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border dark:border-slate-800"
      >
        <div className="p-6 sm:p-8 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-center bg-emerald-600 dark:bg-emerald-700 text-white gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold">تقرير الحضور {reportType === 'yearly' ? 'السنوي' : 'الشهري'}</h2>
            <p className="text-emerald-100 text-sm mt-1">
              {servant?.name} - {reportType === 'yearly' ? currentYear : `${months[reportMonth]} ${currentYear}`}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex bg-white/10 p-1 rounded-xl border border-white/10">
              <button 
                onClick={() => setReportType('yearly')}
                className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all ${reportType === 'yearly' ? 'bg-white text-emerald-600' : 'text-white/60 hover:bg-white/5'}`}
              >
                سنوي
              </button>
              <button 
                onClick={() => setReportType('monthly')}
                className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all ${reportType === 'monthly' ? 'bg-white text-emerald-600' : 'text-white/60 hover:bg-white/5'}`}
              >
                شهري
              </button>
            </div>
            {reportType === 'monthly' && (
              <select 
                className="bg-white/10 border border-white/10 rounded-xl px-2 py-1 text-[10px] font-bold outline-none"
                value={reportMonth}
                onChange={(e) => setReportMonth(parseInt(e.target.value))}
              >
                {months.map((m, i) => (
                  <option key={i} value={i} className="text-slate-900">{m}</option>
                ))}
              </select>
            )}
            <button onClick={() => setShowReport(null)} className="p-2 hover:bg-white/20 rounded-full transition-colors">
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 sm:p-8">
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center bg-slate-50 dark:bg-slate-900/50 p-6 rounded-[2.5rem] border border-slate-100 dark:border-slate-800">
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: settings.darkMode ? '#020617' : '#fff', 
                        borderRadius: '1rem', 
                        border: 'none', 
                        boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                        color: settings.darkMode ? '#fff' : '#000'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-3">
                <h3 className="font-bold text-lg dark:text-slate-100 mb-4">ملخص الحضور</h3>
                {pieData.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-sm font-bold text-slate-600 dark:text-slate-400">{item.name}</span>
                    </div>
                    <span className="text-sm font-black text-slate-900 dark:text-slate-100">{item.value}</span>
                  </div>
                ))}
                <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-900 dark:text-slate-100">الإجمالي</span>
                  <span className="text-sm font-black text-slate-900 dark:text-slate-100">{fridays.length}</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-4 gap-2 text-center text-[10px] sm:text-xs font-bold text-slate-400 dark:text-slate-500 mb-2 px-4">
                <div className="text-right">التاريخ (جمعة)</div>
                <div>القداس</div>
                <div>الخدمة</div>
                <div>الحالة</div>
              </div>
              {(reportType === 'yearly' ? getFridaysOfYear(currentYear) : getFridaysOfMonth(currentYear, reportMonth)).map((friday, idx) => {
                const dateStr = toLocalDateString(friday);
                const record = (attendance.find(r => r.date === dateStr)?.records || {})[showReport] || { mass: false, service: false };
                const isFuture = friday > new Date();
                
                return (
                  <div key={idx} className={`grid grid-cols-4 gap-2 items-center p-3 sm:p-4 rounded-2xl transition-colors ${isFuture ? 'bg-slate-50/50 dark:bg-slate-900/50 opacity-50' : 'bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
                    <div className="text-right font-bold text-slate-700 dark:text-slate-200 text-xs sm:text-sm">
                      <span dir="ltr">{formatDate(dateStr)}</span>
                    </div>
                    <div className="flex justify-center">
                      <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center ${record.mass ? 'bg-emerald-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500'}`}>
                        {record.mass ? <Check size={12} /> : <X size={12} />}
                      </div>
                    </div>
                    <div className="flex justify-center">
                      <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center ${record.service ? 'bg-emerald-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500'}`}>
                        {record.service ? <Check size={12} /> : <X size={12} />}
                      </div>
                    </div>
                    <div className="text-center">
                      {isFuture ? (
                        <span className="text-[8px] sm:text-[10px] font-bold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-full">قادم</span>
                      ) : (record.mass || record.service) ? (
                        <span className="text-[8px] sm:text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-1 rounded-full">حاضر</span>
                      ) : (
                        <span className="text-[8px] sm:text-[10px] font-bold text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/30 px-2 py-1 rounded-full">غائب</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
