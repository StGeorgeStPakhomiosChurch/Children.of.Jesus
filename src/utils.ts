export const formatGregorianDate = (date: Date, format: string, language: 'ar' | 'en' = 'ar') => {
  const d = date.getDate();
  const m = date.getMonth();
  const y = date.getFullYear();
  
  if (format === 'long') {
    const monthsAr = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
    const monthsEn = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const monthName = language === 'ar' ? monthsAr[m] : monthsEn[m];
    return `${d} ${monthName} ${y}`;
  }

  const dd = String(d).padStart(2, '0');
  const mm = String(m + 1).padStart(2, '0');
  
  if (format === 'MM/DD/YYYY') return `${mm}/${dd}/${y}`;
  if (format === 'YYYY-MM-DD') return `${y}-${mm}-${dd}`;
  return `${dd}/${mm}/${y}`;
};

export const formatTime = (date: Date, format: string) => {
  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  
  if (format === '12h') {
    const ampm = hours >= 12 ? 'م' : 'ص';
    hours = hours % 12;
    hours = hours ? hours : 12;
    return `${hours}:${minutes}:${seconds} ${ampm}`;
  }
  return `${String(hours).padStart(2, '0')}:${minutes}:${seconds}`;
};

export const getCopticDate = (date: Date, language: 'ar' | 'en' = 'ar') => {
  const copticMonthsAr = [
    'توت', 'بابة', 'هاتور', 'كيهك', 'طوبة', 'أمشير', 
    'برمهات', 'برمودة', 'بشنس', 'بؤونة', 'أبيب', 'مسرى', 'نسئ'
  ];
  const copticMonthsEn = [
    'Thout', 'Paopi', 'Hathor', 'Koiahk', 'Tobi', 'Meshir',
    'Paremhat', 'Paremoude', 'Pashons', 'Paoni', 'Epip', 'Mesori', 'Nasie'
  ];
  const copticMonths = language === 'ar' ? copticMonthsAr : copticMonthsEn;
  const year = date.getFullYear();
  let tout1 = new Date(year, 8, 11);
  let cYear = year - 283;
  if (date < tout1) {
    tout1 = new Date(year - 1, 8, 11);
    cYear = year - 284;
  }
  const diffDays = Math.floor((date.getTime() - tout1.getTime()) / (1000 * 60 * 60 * 24));
  const cMonth = Math.floor(diffDays / 30);
  const cDay = (diffDays % 30) + 1;
  return `${cDay} ${copticMonths[cMonth] || (language === 'ar' ? 'نسئ' : 'Nasie')} ${cYear}`;
};

export const getFridaysOfYear = (year: number) => {
  const fridays = [];
  const date = new Date(year, 0, 1);
  while (date.getDay() !== 5) {
    date.setDate(date.getDate() + 1);
  }
  while (date.getFullYear() === year) {
    fridays.push(new Date(date));
    date.setDate(date.getDate() + 7);
  }
  return fridays;
};

export const getFridaysOfMonth = (year: number, month: number) => {
  const fridays = [];
  const date = new Date(year, month, 1);
  while (date.getDay() !== 5) {
    date.setDate(date.getDate() + 1);
  }
  while (date.getMonth() === month) {
    fridays.push(new Date(date));
    date.setDate(date.getDate() + 7);
  }
  return fridays;
};

export const toLocalDateString = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getMostRecentFriday = (date: Date = new Date()) => {
  const d = new Date(date);
  const day = d.getDay();
  // Friday is 5.
  const diff = (day >= 5) ? (day - 5) : (day + 2);
  d.setDate(d.getDate() - diff);
  return d;
};

export const getNextFriday = (dateStr: string) => {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + 7);
  return toLocalDateString(date);
};

export const getPrevFriday = (dateStr: string) => {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() - 7);
  return toLocalDateString(date);
};

export const generateId = () => {
  try {
    return crypto.randomUUID();
  } catch (e) {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }
};

export const formatDate = (dateStr: string | undefined) => {
  if (!dateStr) return 'غير محدد';
  try {
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    const [year, month, day] = parts;
    return `${day}/${month}/${year}`;
  } catch (e) {
    return dateStr;
  }
};
