import React from 'react';
import { motion } from 'motion/react';
import { X, Users, CheckCircle2, Calendar, BarChart3, FileText } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Servant, AttendanceRecord } from '../types';

interface GeneralReportModalProps {
  showGeneralReport: boolean;
  setShowGeneralReport: (show: boolean) => void;
  selectedMain: string;
  selectedSub: string;
  SERVICE_STRUCTURE: any;
  classServants: Servant[];
  attendance: AttendanceRecord[];
  reportType: 'yearly' | 'monthly';
  setReportType: (type: 'yearly' | 'monthly') => void;
  reportMonth: number;
  setReportMonth: (month: number) => void;
  setShowReport: (id: string | null) => void;
  settings: any;
  t: (key: string) => string;
  getFridaysOfYear: (year: number) => Date[];
  getFridaysOfMonth: (year: number, month: number) => Date[];
  toLocalDateString: (date: Date) => string;
  formatDate: (date: string) => string;
}

export const GeneralReportModal: React.FC<GeneralReportModalProps> = ({
  showGeneralReport,
  setShowGeneralReport,
  selectedMain,
  selectedSub,
  SERVICE_STRUCTURE,
  classServants,
  attendance,
  reportType,
  setReportType,
  reportMonth,
  setReportMonth,
  setShowReport,
  settings,
  t,
  getFridaysOfYear,
  getFridaysOfMonth,
  toLocalDateString,
  formatDate
}) => {
  const currentYear = new Date().getFullYear();
  const months = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];

  const fridays = reportType === 'yearly' 
    ? getFridaysOfYear(currentYear).filter(f => f <= new Date())
    : getFridaysOfMonth(currentYear, reportMonth).filter(f => f <= new Date());
  
  const totalServants = classServants.length;
  let actualAttendances = 0;
  const totalPossibleAttendances = totalServants * fridays.length;
  
  fridays.forEach(friday => {
    const dateStr = toLocalDateString(friday);
    const records = attendance.find(r => r.date === dateStr)?.records || {};
    classServants.forEach(s => {
      if (records[s.id]?.service || records[s.id]?.mass) actualAttendances++;
    });
  });

  const avgRate = totalPossibleAttendances > 0 ? Math.round((actualAttendances / totalPossibleAttendances) * 100) : 0;

  const chartData = fridays.map(friday => {
    const dateStr = toLocalDateString(friday);
    const records = attendance.find(r => r.date === dateStr)?.records || {};
    let count = 0;
    classServants.forEach(s => {
      if (records[s.id]?.service || records[s.id]?.mass) count++;
    });
    return {
      name: formatDate(dateStr),
      count: count
    };
  });

  const rankedServants = classServants
    .map(s => {
      let attended = 0;
      fridays.forEach(f => {
        const dateStr = toLocalDateString(f);
        const record = (attendance.find(r => r.date === dateStr)?.records || {})[s.id];
        if (record?.service || record?.mass) attended++;
      });
      return { ...s, attended, rate: fridays.length > 0 ? Math.round((attended / fridays.length) * 100) : 0 };
    })
    .sort((a, b) => b.rate - a.rate);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" dir={settings.language === 'ar' ? 'rtl' : 'ltr'}>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => setShowGeneralReport(false)}
        className="absolute inset-0 bg-black/60 backdrop-blur-md"
      />
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="relative bg-white dark:bg-slate-900 w-full max-w-4xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border dark:border-slate-800"
      >
        <div className="p-6 sm:p-8 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-center bg-slate-900 dark:bg-slate-950 text-white gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold">إحصائيات الفصل</h2>
            <p className="text-slate-400 text-sm mt-1">
              {selectedSub} - {SERVICE_STRUCTURE[selectedMain]?.label}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex bg-white/10 p-1 rounded-xl border border-white/10">
              <button 
                onClick={() => setReportType('yearly')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${reportType === 'yearly' ? 'bg-white text-slate-900' : 'text-white/60 hover:bg-white/5'}`}
              >
                سنوي
              </button>
              <button 
                onClick={() => setReportType('monthly')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${reportType === 'monthly' ? 'bg-white text-slate-900' : 'text-white/60 hover:bg-white/5'}`}
              >
                شهري
              </button>
            </div>
            {reportType === 'monthly' && (
              <select 
                className="bg-white/10 border border-white/10 rounded-xl px-3 py-1.5 text-xs font-bold outline-none"
                value={reportMonth}
                onChange={(e) => setReportMonth(parseInt(e.target.value))}
              >
                {months.map((m, i) => (
                  <option key={i} value={i} className="text-slate-900">{m}</option>
                ))}
              </select>
            )}
            <button onClick={() => setShowGeneralReport(false)} className="p-2 hover:bg-white/20 rounded-full transition-colors">
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 sm:p-8">
          <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white dark:bg-slate-950 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-4">
                <div className="w-14 h-14 bg-slate-50 dark:bg-slate-900 rounded-2xl flex items-center justify-center text-slate-400">
                  <Users size={28} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">إجمالي المخدومين</p>
                  <p className="text-3xl font-black text-slate-900 dark:text-slate-100">{totalServants}</p>
                </div>
              </div>
              <div className="bg-white dark:bg-slate-950 p-6 rounded-[2rem] border border-emerald-50 dark:border-emerald-900/20 shadow-sm flex items-center gap-4">
                <div className="w-14 h-14 bg-emerald-50 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center text-emerald-500">
                  <CheckCircle2 size={28} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase mb-1">متوسط الحضور</p>
                  <p className="text-3xl font-black text-emerald-900 dark:text-emerald-100">{avgRate}%</p>
                </div>
              </div>
              <div className="bg-white dark:bg-slate-950 p-6 rounded-[2rem] border border-blue-50 dark:border-blue-900/20 shadow-sm flex items-center gap-4">
                <div className="w-14 h-14 bg-blue-50 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center text-blue-500">
                  <Calendar size={28} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase mb-1">عدد الجمع</p>
                  <p className="text-3xl font-black text-blue-900 dark:text-slate-100">{fridays.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-950 p-6 sm:p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm">
              <h3 className="font-bold text-lg mb-6 flex items-center gap-2 dark:text-slate-100">
                <BarChart3 size={20} className="text-blue-600" />
                منحنى الحضور
              </h3>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={settings.darkMode ? '#1e293b' : '#f1f5f9'} />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 10, fill: '#94a3b8' }}
                      reversed={settings.language === 'ar'}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 10, fill: '#94a3b8' }}
                      orientation={settings.language === 'ar' ? 'right' : 'left'}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: settings.darkMode ? '#020617' : '#fff', 
                        borderRadius: '1rem', 
                        border: 'none', 
                        boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                        color: settings.darkMode ? '#fff' : '#000'
                      }}
                      itemStyle={{ color: '#3b82f6', fontWeight: 'bold' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="count" 
                      stroke="#3b82f6" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorCount)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-bold text-lg flex items-center gap-2 dark:text-slate-100">
                <BarChart3 size={20} className="text-emerald-600" />
                ترتيب المخدومين حسب الحضور
              </h3>
              <div className="bg-white dark:bg-slate-950 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-x-auto">
                <table className="w-full text-right min-w-[600px]">
                  <thead className="bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 text-[10px] uppercase tracking-wider">
                    <tr>
                      <th className="px-6 py-4 text-center">الترتيب</th>
                      <th className="px-6 py-4 text-right">المخدوم</th>
                      <th className="px-6 py-4 text-center">نسبة الحضور</th>
                      <th className="px-6 py-4 text-center">أيام الحضور</th>
                      <th className="px-6 py-4 text-center">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {rankedServants.map((s, idx) => (
                      <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                        <td className="px-6 py-4 text-center">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto text-xs font-black ${
                            idx === 0 ? 'bg-amber-400 text-amber-900 shadow-lg shadow-amber-200 dark:shadow-none' :
                            idx === 1 ? 'bg-slate-300 text-slate-700' :
                            idx === 2 ? 'bg-orange-300 text-orange-900' :
                            'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                          }`}>
                            {idx + 1}
                          </div>
                        </td>
                        <td className="px-6 py-4 font-bold text-slate-700 dark:text-slate-200 text-right">{s.name}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3 justify-center">
                            <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-800 rounded-full max-w-[80px] overflow-hidden">
                              <div 
                                className={`h-full rounded-full ${s.rate > 70 ? 'bg-emerald-500' : s.rate > 40 ? 'bg-orange-500' : 'bg-red-500'}`}
                                style={{ width: `${s.rate}%` }}
                              />
                            </div>
                            <span className="text-sm font-black text-slate-900 dark:text-slate-100">{s.rate}%</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center font-bold text-slate-500 dark:text-slate-400">{s.attended}</td>
                        <td className="px-6 py-4 text-center">
                          <button 
                            onClick={() => setShowReport(s.id)}
                            className="flex items-center gap-1 mx-auto text-blue-600 dark:text-blue-400 hover:text-blue-800 font-bold text-xs bg-blue-50 dark:bg-blue-900/30 px-3 py-1.5 rounded-full transition-colors"
                          >
                            <FileText size={14} />
                            عرض التقرير
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
