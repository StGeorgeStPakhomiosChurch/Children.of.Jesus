/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Users, 
  Contact,
  UserPlus, 
  Search, 
  Calendar, 
  CheckCircle2, 
  XCircle, 
  Trash2, 
  Edit3, 
  ChevronRight,
  ChevronLeft,
  LayoutDashboard,
  ClipboardList,
  MapPin,
  MessageSquare,
  Phone,
  Baby,
  GraduationCap,
  UserRound,
  Heart,
  ArrowRight,
  ArrowLeft,
  Save,
  Info,
  Camera,
  User as UserIcon,
  Facebook,
  Send,
  Instagram,
  Mail,
  Home,
  Menu,
  X,
  Plus,
  Download,
  DownloadCloud,
  Upload,
  BarChart2,
  BarChart3,
  FileText,
  Check,
  Church,
  Plane,
  DollarSign,
  Cake,
  Bell,
  Eye,
  EyeOff,
  AlertCircle,
  Settings,
  Moon,
  Sun,
  Type,
  Palette,
  Languages,
  CalendarDays,
  CheckCircle,
  Clock,
  BookOpen,
  Play,
  Pause,
  Forward
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Role, ServiceAssignment, User, Servant, AttendanceRecord, Trip, Service } from './types';
import { SERVICE_STRUCTURE, COPTIC_HOLIDAYS, ARABIC_MONTHS, TRANSLATIONS, STORAGE_KEY, USERS_STORAGE_KEY, DEFAULT_ADMIN, ICON_MAP } from './constants';
import { 
  generateId, 
  formatDate, 
  toLocalDateString, 
  formatGregorianDate, 
  formatTime, 
  getCopticDate, 
  getMostRecentFriday, 
  getNextFriday,
  getPrevFriday,
  getFridaysOfYear as utilsGetFridaysOfYear, 
  getFridaysOfMonth as utilsGetFridaysOfMonth 
} from './utils';
import { TopInfoBar } from './components/TopInfoBar';
import { Header } from './components/Header';
import { ReportModal } from './components/ReportModal';
import { GeneralReportModal } from './components/GeneralReportModal';

// --- Constants ---

export default function App() {
  // --- State ---
  const [showSplash, setShowSplash] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([DEFAULT_ADMIN]);
  const [isLoginView, setIsLoginView] = useState(true);
  
  const [servants, setServants] = useState<Servant[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [serviceStructure, setServiceStructure] = useState<Record<string, Service>>(() => {
    try {
      const saved = localStorage.getItem('serviceStructure');
      return saved ? JSON.parse(saved) : SERVICE_STRUCTURE;
    } catch {
      return SERVICE_STRUCTURE;
    }
  });

  useEffect(() => {
    localStorage.setItem('serviceStructure', JSON.stringify(serviceStructure));
  }, [serviceStructure]);

  const [isAddServiceModalOpen, setIsAddServiceModalOpen] = useState(false);
  const [newServiceForm, setNewServiceForm] = useState({
    id: '',
    label: '',
    alias: '',
    type: 'main' as 'main' | 'sub',
    parentId: '',
    subServices: [''],
    subServiceAliases: ['']
  });
  
  // Auth Form State
  const [authForm, setAuthForm] = useState({
    username: '',
    password: '',
    fullName: '',
    birthDate: '',
    email: '',
    phone: '',
    whatsapp: '',
    address: '',
    photo: '',
    assignments: [{ role: 'servant' as Role, main: '', sub: '' }]
  });
  const [view, setView] = useState<'main' | 'sub' | 'list' | 'attendance' | 'details' | 'trips' | 'profile' | 'servants_list'>('main');
  const [selectedMain, setSelectedMain] = useState<string | null>(null);
  const [selectedSub, setSelectedSub] = useState<string | null>(null);
  const [selectedGender, setSelectedGender] = useState<'all' | 'male' | 'female'>('all');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showReport, setShowReport] = useState<string | null>(null); // Servant ID for report
  const [showGeneralReport, setShowGeneralReport] = useState(false);
  const [reportType, setReportType] = useState<'monthly' | 'yearly'>('yearly');
  const [reportMonth, setReportMonth] = useState(new Date().getMonth());
  const [selectedReportServant, setSelectedReportServant] = useState<Servant | null>(null);
  const [selectedServant, setSelectedServant] = useState<Servant | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBirthMonth, setSelectedBirthMonth] = useState<number | 'all'>('all');
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isTripModalOpen, setIsTripModalOpen] = useState(false);
  const [isBatchWhatsAppModalOpen, setIsBatchWhatsAppModalOpen] = useState(false);
  const [autoSendAbsence, setAutoSendAbsence] = useState(true);
  const [editingTripId, setEditingTripId] = useState<string | null>(null);
  const [tripFormData, setTripFormData] = useState<Partial<Trip>>({ name: '', date: '', price: 0, subService: undefined });
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [bookingAmount, setBookingAmount] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState(toLocalDateString(getMostRecentFriday()));
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [profileFormData, setProfileFormData] = useState<User | null>(null);

  // Swipe state
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 70;
    const isRightSwipe = distance < -70;

    if (isLeftSwipe && !isSidebarOpen && touchStart > window.innerWidth - 80) {
      setIsSidebarOpen(true);
    } else if (isRightSwipe && isSidebarOpen) {
      setIsSidebarOpen(false);
    }
  };

  // Settings State
  const [settings, setSettings] = useState({
    language: 'ar' as 'ar' | 'en',
    darkMode: false,
    readingMode: false,
    theme: 'default' as 'default',
    layout: 'default' as 'default' | 'top-nav' | 'compact',
    fontSize: 'medium' as 'small' | 'medium' | 'large',
    fontFamily: 'sans' as 'sans' | 'serif' | 'mono',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24h',
    textColor: 'inherit'
  });

  const t = (key: keyof typeof TRANSLATIONS['ar']) => {
    return TRANSLATIONS[settings.language][key] || key;
  };

  const [showSettings, setShowSettings] = useState(false);
  const [showAgenda, setShowAgenda] = useState(false);

  // Form State
  const [formData, setFormData] = useState<Partial<Servant>>({
    name: '',
    birthDate: '',
    phone: '',
    whatsapp: '',
    gender: 'male',
    address: '',
    confession: '',
    father: { name: '', phone: '', confession: '', job: '' },
    mother: { name: '', phone: '', confession: '', job: '' },
    photo: '',
    facebook: '',
    telegram: '',
    instagram: '',
    gmail: '',
    landline: '',
    notes: ''
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('splashShown', 'true');
      }
    }, 3000);
    
    // Request notification permission
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission();
      }
    }

    return () => clearTimeout(timer);
  }, []);

  // --- Persistence ---
  useEffect(() => {
    try {
      const savedUsers = localStorage.getItem(USERS_STORAGE_KEY);
      if (savedUsers) {
        setUsers(JSON.parse(savedUsers));
      }
      
      const savedSettings = localStorage.getItem('servant_app_settings');
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
      
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const { servants: s, attendance: a, trips: t, serviceStructure: ss } = JSON.parse(saved);
        setServants(s || []);
        setAttendance(a || []);
        setTrips(t || []);
        if (ss) setServiceStructure(ss);
      }
    } catch (error) {
      console.error('Failed to load data from localStorage:', error);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
      localStorage.setItem('servant_app_settings', JSON.stringify(settings));
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ servants, attendance, trips, serviceStructure }));
    } catch (error) {
      console.error('Failed to save data to localStorage:', error);
    }
  }, [servants, attendance, trips, users, settings, serviceStructure]);

  useEffect(() => {
    const root = window.document.documentElement;
    if (settings.darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    
    // Font size
    const sizes = { small: '14px', medium: '16px', large: '18px' };
    root.style.fontSize = sizes[settings.fontSize as keyof typeof sizes];
    
    // Font family
    const families = { 
      sans: 'Inter, ui-sans-serif, system-ui', 
      serif: 'Georgia, serif', 
      mono: 'ui-monospace, SFMono-Regular' 
    };
    root.style.fontFamily = families[settings.fontFamily as keyof typeof families];
    
    // Language
    root.dir = settings.language === 'ar' ? 'rtl' : 'ltr';
    root.lang = settings.language;
  }, [settings]);

  // --- Handlers ---
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    const usernameLower = authForm.username.toLowerCase();
    const user = users.find(u => u.username.toLowerCase() === usernameLower && u.password === authForm.password);
    if (user) {
      setCurrentUser(user);
      setView('main');
      setSelectedMain(null);
      setSelectedSub(null);
    } else {
      setAuthError('اسم المستخدم أو كلمة المرور غير صحيحة');
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    
    // Name validation: at least 3 parts
    const nameParts = (authForm.fullName || '').trim().split(/\s+/);
    if (nameParts.length < 3) {
      setAuthError('يرجى إدخال الاسم ثلاثياً أو رباعياً على الأقل');
      return;
    }

    const usernameLower = authForm.username.toLowerCase();
    if (users.find(u => u.username.toLowerCase() === usernameLower)) {
      setAuthError('اسم المستخدم موجود بالفعل');
      return;
    }

    // Determine highest role
    const rolesOrder: Role[] = ['admin', 'priest', 'service_leader', 'servant'];
    const highestRole = authForm.assignments.reduce((prev, curr) => {
      const prevIdx = rolesOrder.indexOf(prev);
      const currIdx = rolesOrder.indexOf(curr.role);
      return currIdx < prevIdx ? curr.role : prev;
    }, 'servant' as Role);

    const newUser: User = {
      id: generateId(),
      ...authForm,
      role: highestRole
    };
    setUsers([...users, newUser]);
    setCurrentUser(newUser);
    setAuthForm({
      username: '',
      password: '',
      fullName: '',
      birthDate: '',
      email: '',
      phone: '',
      whatsapp: '',
      address: '',
      photo: '',
      assignments: [{ role: 'servant' as Role, main: '', sub: '' }]
    });
    setIsLoginView(true);
    setView('main');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setView('main');
    setSelectedMain(null);
    setSelectedSub(null);
    setAuthForm({
      username: '',
      password: '',
      fullName: '',
      birthDate: '',
      email: '',
      phone: '',
      whatsapp: '',
      address: '',
      photo: '',
      assignments: [{ role: 'servant' as Role, main: '', sub: '' }]
    });
  };

  const openAddServiceModal = () => {
    setNewServiceForm({
      id: '',
      label: '',
      alias: '',
      type: 'main',
      parentId: '',
      subServices: [''],
      subServiceAliases: ['']
    });
    setIsAddServiceModalOpen(true);
  };

  const handleCreateService = () => {
    if (!newServiceForm.label) return;
    
    if (newServiceForm.type === 'main') {
      const serviceId = newServiceForm.id || generateId();
      const subServices = newServiceForm.subServices.filter(s => s.trim() !== '');
      const subServiceAliases: Record<string, string> = {};
      
      newServiceForm.subServices.forEach((s, i) => {
        if (s.trim() !== '' && newServiceForm.subServiceAliases[i]?.trim() !== '') {
          subServiceAliases[s.trim()] = newServiceForm.subServiceAliases[i].trim();
        }
      });

      const newService: Service = {
        label: newServiceForm.label,
        icon: 'Users', // Store icon name as string
        color: 'text-blue-500',
        bg: 'bg-blue-50 dark:bg-blue-900/20',
        subServices: subServices,
        subServiceAliases: Object.keys(subServiceAliases).length > 0 ? subServiceAliases : undefined
      };

      setServiceStructure(prev => ({
        ...prev,
        [serviceId]: newService
      }));
    } else {
      if (!newServiceForm.parentId) return;
      
      setServiceStructure(prev => {
        const parent = prev[newServiceForm.parentId];
        if (!parent) return prev;
        
        // Check if sub-service already exists
        if (parent.subServices.includes(newServiceForm.label)) return prev;

        const newAliases = { ...(parent.subServiceAliases || {}) };
        if (newServiceForm.alias.trim() !== '') {
          newAliases[newServiceForm.label] = newServiceForm.alias.trim();
        }

        return {
          ...prev,
          [newServiceForm.parentId]: {
            ...parent,
            subServices: [...parent.subServices, newServiceForm.label],
            subServiceAliases: Object.keys(newAliases).length > 0 ? newAliases : undefined
          }
        };
      });
    }

    setIsAddServiceModalOpen(false);
    setNewServiceForm({ id: '', label: '', alias: '', type: 'main', parentId: '', subServices: [''], subServiceAliases: [''] });
  };

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        setAuthForm({
          ...authForm,
          location: {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          }
        });
        alert('تم تحديد الموقع بنجاح');
      }, (error) => {
        alert('فشل تحديد الموقع: ' + error.message);
      });
    } else {
      alert('المتصفح لا يدعم تحديد الموقع');
    }
  };

  const handleSaveServant = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Name validation: at least 3 parts
    const nameParts = (formData.name || '').trim().split(/\s+/);
    if (nameParts.length < 3) {
      alert('يرجى إدخال الاسم ثلاثياً أو رباعياً على الأقل');
      return;
    }

    if (editingId) {
      setServants(prev => prev.map(s => s.id === editingId ? {
        ...s,
        name: formData.name || '',
        birthDate: formData.birthDate,
        phone: formData.phone,
        whatsapp: formData.whatsapp || formData.phone,
        gender: formData.gender as 'male' | 'female',
        address: formData.address,
        confession: formData.confession,
        father: formData.father,
        mother: formData.mother,
        lat: formData.lat,
        lng: formData.lng,
        photo: formData.photo,
        facebook: formData.facebook,
        telegram: formData.telegram,
        instagram: formData.instagram,
        gmail: formData.gmail,
        landline: formData.landline,
        notes: formData.notes
      } : s));
      // Update selected servant if it's the one being edited
      if (selectedServant?.id === editingId) {
        setSelectedServant(prev => prev ? {
          ...prev,
          name: formData.name || '',
          birthDate: formData.birthDate,
          phone: formData.phone,
          whatsapp: formData.whatsapp || formData.phone,
          gender: formData.gender as 'male' | 'female',
          address: formData.address,
          confession: formData.confession,
          father: formData.father,
          mother: formData.mother,
          lat: formData.lat,
          lng: formData.lng,
          photo: formData.photo,
          facebook: formData.facebook,
          telegram: formData.telegram,
          instagram: formData.instagram,
          gmail: formData.gmail,
          landline: formData.landline,
          notes: formData.notes
        } : null);
      }
    } else {
      const newServant: Servant = {
        id: generateId(),
        name: formData.name || '',
        birthDate: formData.birthDate,
        phone: formData.phone,
        whatsapp: formData.whatsapp || formData.phone,
        address: formData.address,
        service: selectedMain!,
        subService: selectedSub!,
        gender: formData.gender as 'male' | 'female',
        confession: formData.confession,
        father: formData.father,
        mother: formData.mother,
        lat: formData.lat,
        lng: formData.lng,
        photo: formData.photo,
        facebook: formData.facebook,
        telegram: formData.telegram,
        instagram: formData.instagram,
        gmail: formData.gmail,
        landline: formData.landline,
        notes: formData.notes
      };
      setServants([...servants, newServant]);
    }
    
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({ 
      name: '', birthDate: '', phone: '', whatsapp: '', address: '', confession: '', 
      father: { name: '', phone: '', confession: '', job: '' }, mother: { name: '', phone: '', confession: '', job: '' }, 
      lat: undefined, lng: undefined, photo: '',
      facebook: '', telegram: '', instagram: '', gmail: '', landline: '', notes: ''
    });
  };

  const openEditModal = (servant: Servant) => {
    setFormData({
      name: servant.name,
      birthDate: servant.birthDate,
      phone: servant.phone,
      whatsapp: servant.whatsapp,
      gender: servant.gender,
      address: servant.address,
      confession: servant.confession,
      father: servant.father,
      mother: servant.mother,
      lat: servant.lat,
      lng: servant.lng,
      photo: servant.photo,
      facebook: servant.facebook,
      telegram: servant.telegram,
      instagram: servant.instagram,
      gmail: servant.gmail,
      landline: servant.landline,
      notes: servant.notes
    });
    setEditingId(servant.id);
    setIsModalOpen(true);
  };

  const handleNameChange = (name: string) => {
    const parts = name.trim().split(/\s+/);
    let fatherName = '';
    if (parts.length > 1) {
      fatherName = parts.slice(1).join(' ');
    }
    setFormData(prev => ({
      ...prev,
      name,
      father: { ...prev.father!, name: fatherName }
    }));
  };

  const exportToCSV = () => {
    const headers = ['الاسم', 'النوع', 'تاريخ الميلاد', 'رقم الهاتف', 'واتساب', 'العنوان', 'الخدمة', 'الفصل', 'أب الاعتراف', 'اسم الأب', 'وظيفة الأب', 'موبايل الأب', 'اعتراف الأب', 'اسم الأم', 'وظيفة الأم', 'موبايل الأم', 'اعتراف الأم', 'فيسبوك', 'تيلجرام', 'انستجرام', 'جيميل', 'تليفون أرضي', 'ملاحظات'];
    const rows = servants.map(s => [
      s.name, s.gender === 'male' ? 'ولد' : 'بنت', s.birthDate, s.phone, s.whatsapp, s.address, s.service, s.subService, s.confession,
      s.father?.name || '', s.father?.job || '', s.father?.phone || '', s.father?.confession || '',
      s.mother?.name || '', s.mother?.job || '', s.mother?.phone || '', s.mother?.confession || '',
      s.facebook || '', s.telegram || '', s.instagram || '', s.gmail || '', s.landline || '', s.notes || ''
    ]);
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob(["\ufeff" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `servants_${toLocalDateString(new Date())}.csv`;
    link.click();
  };

  const importFromCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split('\n').slice(1); // Skip header
      const newServants: Servant[] = lines.filter(line => line.trim()).map(line => {
        const cols = line.split(',');
        // This is a basic parser, might need improvement for quoted commas
        return {
          id: generateId(),
          name: cols[0],
          birthDate: cols[1],
          phone: cols[3],
          whatsapp: cols[4],
          gender: cols[1] === 'بنت' ? 'female' : 'male',
          address: cols[5],
          service: 'mlayka', // Default or try to match
          subService: cols[7],
          confession: cols[8],
          father: { name: cols[9], job: cols[10], phone: cols[11], confession: cols[12] },
          mother: { name: cols[13], job: cols[14], phone: cols[15], confession: cols[16] },
          facebook: cols[17],
          telegram: cols[18],
          instagram: cols[19],
          gmail: cols[20],
          landline: cols[21],
          notes: cols[22]
        };
      });
      setServants(prev => [...prev, ...newServants]);
      alert(`تم استيراد ${newServants.length} مخدوم بنجاح`);
    };
    reader.readAsText(file);
  };

  const getFridaysOfYear = (year: number) => {
    return utilsGetFridaysOfYear(year);
  };

  const getFridaysOfMonth = (year: number, month: number) => {
    return utilsGetFridaysOfMonth(year, month);
  };

  const getCurrentFriday = () => {
    const d = new Date();
    const day = d.getDay(); // 0: Sun, 1: Mon, ..., 5: Fri, 6: Sat
    const diff = (5 - day + 7) % 7;
    const friday = new Date(d.getTime() + diff * 24 * 60 * 60 * 1000);
    return toLocalDateString(friday);
  };

  useEffect(() => {
    setSelectedDate(getCurrentFriday());
  }, []);

  const handleSaveTrip = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMain) return;

    if (editingTripId) {
      setTrips(prev => prev.map(t => t.id === editingTripId ? { 
        ...t, 
        name: tripFormData.name!, 
        date: tripFormData.date!, 
        price: Number(tripFormData.price) || 0,
        subService: tripFormData.subService === 'all' ? undefined : tripFormData.subService
      } : t));
    } else {
      const newTrip: Trip = {
        id: generateId(),
        name: tripFormData.name!,
        date: tripFormData.date!,
        price: Number(tripFormData.price) || 0,
        service: selectedMain,
        subService: tripFormData.subService === 'all' ? undefined : tripFormData.subService,
        bookings: []
      };
      setTrips([...trips, newTrip]);
    }
    setIsTripModalOpen(false);
    setEditingTripId(null);
    setTripFormData({ name: '', date: '', price: 0, subService: undefined });
  };

  const handleAddBooking = (servantId: string, tripId: string) => {
    if (!bookingAmount) return;
    const amount = Number(bookingAmount);
    setTrips(prev => prev.map(t => t.id === tripId ? {
      ...t,
      bookings: [
        ...t.bookings.filter(b => b.servantId !== servantId),
        { servantId, amount: (t.bookings.find(b => b.servantId === servantId)?.amount || 0) + amount }
      ]
    } : t));
    setBookingAmount('');
  };

  const removeBooking = (servantId: string) => {
    if (!selectedTrip) return;
    setTrips(prev => prev.map(t => t.id === selectedTrip.id ? {
      ...t,
      bookings: t.bookings.filter(b => b.servantId !== servantId)
    } : t));
  };
  const captureLocation = () => {
    if (!navigator.geolocation) {
      alert('المتصفح لا يدعم تحديد الموقع');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData(prev => ({ ...prev, lat: position.coords.latitude, lng: position.coords.longitude }));
        alert('تم تحديد الموقع بنجاح');
      },
      (error) => {
        alert('فشل تحديد الموقع: ' + error.message);
      }
    );
  };

  const pickContact = async (field: 'phone' | 'fatherPhone' | 'motherPhone') => {
    console.log('Pick contact triggered for:', field);
    
    // Check if we are in an iframe (Contacts API strictly requires top frame)
    if (window.self !== window.top) {
      alert('عذراً، ميزة اختيار جهات الاتصال تتطلب فتح التطبيق في نافذة مستقلة للأمان. يرجى الضغط على زر "فتح في نافذة جديدة" (Open in new tab) الموجود أعلى اليمين لتتمكن من استخدام هذه الميزة.');
      return;
    }
    
    if (!('contacts' in navigator && 'select' in (navigator as any).contacts)) {
      alert('ميزة اختيار جهات الاتصال غير مدعومة في هذا المتصفح. يرجى التأكد من استخدام متصفح حديث يدعم هذه الميزة.');
      return;
    }

    try {
      const props = ['name', 'tel'];
      const opts = { multiple: false };
      const contacts = await (navigator as any).contacts.select(props, opts);
      
      if (contacts && contacts.length > 0) {
        const contact = contacts[0];
        const name = contact.name?.[0] || '';
        let phone = contact.tel?.[0] || '';
        
        console.log('Contact picked:', { name, phone });

        // Clean phone number (remove spaces, dashes, etc.)
        phone = phone.replace(/\s+/g, '').replace(/-/g, '').replace(/\+/g, '').replace(/\(/g, '').replace(/\)/g, '');
        // If it starts with 20, remove it
        if (phone.startsWith('20')) phone = phone.substring(2);
        // If it starts with 0020, remove it
        if (phone.startsWith('0020')) phone = phone.substring(4);
        
        if (field === 'phone') {
          setFormData(prev => ({ 
            ...prev, 
            phone,
            name: prev.name || name // Set name if empty
          }));
        } else if (field === 'fatherPhone') {
          setFormData(prev => ({ 
            ...prev, 
            father: { 
              ...prev.father!, 
              phone,
              name: prev.father?.name || name
            } 
          }));
        } else if (field === 'motherPhone') {
          setFormData(prev => ({ 
            ...prev, 
            mother: { 
              ...prev.mother!, 
              phone,
              name: prev.mother?.name || name
            } 
          }));
        }
      }
    } catch (err) {
      console.error('Contact picker error:', err);
      if (err instanceof Error && err.name !== 'AbortError') {
        if (err.message.includes('top frame') || (err as any).name === 'SecurityError') {
          alert('عذراً، ميزة اختيار جهات الاتصال تتطلب فتح التطبيق في نافذة مستقلة للأمان. يرجى الضغط على زر "فتح في نافذة جديدة" (Open in new tab) الموجود أعلى اليمين لتتمكن من استخدام هذه الميزة.');
        } else {
          alert('حدث خطأ أثناء محاولة الوصول لجهات الاتصال. تأكد من إعطاء الصلاحية اللازمة.');
        }
      }
    }
  };

  const toggleAttendance = (id: string, type: 'mass' | 'service', date?: string) => {
    const targetDate = date || selectedDate;
    const today = toLocalDateString(new Date());
    if (targetDate > today) return;

    setAttendance(prev => {
      const existing = prev.find(r => r.date === targetDate);
      if (existing) {
        const current = existing.records[id] || { mass: false, service: false };
        return prev.map(r => r.date === targetDate ? {
          ...r,
          records: { ...r.records, [id]: { ...current, [type]: !current[type] } }
        } : r);
      }
      return [...prev, { date: targetDate, records: { [id]: { mass: type === 'mass', service: type === 'service' } } }];
    });
  };

  const openWhatsApp = (phone: string) => {
    window.open(`https://wa.me/2${phone}`, '_blank');
  };

  const sendAbsenceMessage = async (phone: string, name: string, date: string) => {
    const today = toLocalDateString(new Date());
    const dateStr = date === today ? 'النهاردة' : `يوم الجمعة الموافق ${date}`;
    const msg = `سلام ونعمة، حابين نطمن على ${name} لأنه غايب ${dateStr} عن الخدمة. ربنا يبارك حياتكم.`;
    
    const instanceId = import.meta.env.VITE_ULTRAMSG_INSTANCE_ID;
    const token = import.meta.env.VITE_ULTRAMSG_TOKEN;

    if (instanceId && token) {
      try {
        const response = await fetch(`https://api.ultramsg.com/${instanceId}/messages/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            token,
            to: `2${phone}`,
            body: msg
          })
        });
        if (!response.ok) throw new Error('Failed to send via UltraMsg');
        console.log(`Message sent to ${name} via UltraMsg`);
      } catch (error) {
        console.error('UltraMsg Error:', error);
        // Fallback to window.open if API fails
        window.open(`https://wa.me/2${phone}?text=${encodeURIComponent(msg)}`, '_blank');
      }
    } else {
      // Standard fallback
      window.open(`https://wa.me/2${phone}?text=${encodeURIComponent(msg)}`, '_blank');
    }
  };

  // --- Helpers ---
  const getTodayRecord = () => {
    const today = toLocalDateString(new Date());
    return attendance.find(r => r.date === today)?.records || {};
  };

  const upcomingBirthdays = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);

    return servants.filter(s => {
      // Filter by user access
      if (currentUser?.role !== 'admin' && currentUser?.role !== 'priest') {
        const hasAccess = currentUser?.assignments.some(a => 
          a.main === s.service && (a.sub === s.subService || a.role === 'service_leader')
        );
        if (!hasAccess) return false;
      }

      if (!s.birthDate) return false;
      const bDate = new Date(s.birthDate);
      const bMonth = bDate.getMonth();
      const bDay = bDate.getDate();
      
      const thisYearBirthday = new Date(today.getFullYear(), bMonth, bDay);
      const nextYearBirthday = new Date(today.getFullYear() + 1, bMonth, bDay);
      
      return (thisYearBirthday >= today && thisYearBirthday <= nextWeek) ||
             (nextYearBirthday >= today && nextYearBirthday <= nextWeek);
    });
  }, [servants, currentUser]);

  const classServants = useMemo(() => {
    if (!selectedMain || !selectedSub) return [];
    
    if (currentUser?.role === 'admin' || currentUser?.role === 'priest') {
      return servants.filter(s => s.service === selectedMain && s.subService === selectedSub);
    }

    // Check if user has an assignment for this specific sub-service OR is a leader for the main service
    const hasAccess = currentUser?.assignments.some(a => 
      a.main === selectedMain && (a.sub === selectedSub || a.role === 'service_leader')
    );

    if (!hasAccess) return [];
    
    return servants.filter(s => s.service === selectedMain && s.subService === selectedSub);
  }, [servants, selectedMain, selectedSub, currentUser]);

  const filteredServices = useMemo(() => {
    if (!currentUser) return [];
    if (currentUser.role === 'admin' || currentUser.role === 'priest') {
      return Object.entries(serviceStructure);
    }
    // For others, return all main services they are assigned to
    const assignedMainKeys = new Set(currentUser.assignments.map(a => a.main));
    return Object.entries(serviceStructure).filter(([key]) => assignedMainKeys.has(key));
  }, [currentUser, serviceStructure]);

  const filteredServants = useMemo(() => {
    return classServants.filter(s => {
      const matchesGender = selectedGender === 'all' || s.gender === selectedGender;
      const matchesSearch = s.name.includes(searchQuery) || (s.phone && s.phone.includes(searchQuery));
      
      let matchesMonth = true;
      if (selectedBirthMonth !== 'all') {
        if (!s.birthDate) {
          matchesMonth = false;
        } else {
          const bDate = new Date(s.birthDate);
          matchesMonth = bDate.getMonth() === selectedBirthMonth;
        }
      }

      return matchesGender && matchesSearch && matchesMonth;
    });
  }, [classServants, selectedGender, searchQuery, selectedBirthMonth]);

  // --- Renderers ---
  if (showSplash) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col items-center justify-center p-6" dir="rtl">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="relative flex flex-col items-center"
        >
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="bg-emerald-50 dark:bg-emerald-900/20 p-8 rounded-[3rem] shadow-xl shadow-emerald-100 dark:shadow-none mb-8"
          >
            <Church size={120} className="text-emerald-600" />
          </motion.div>
          
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="text-center px-4"
          >
            <h1 className="text-xl md:text-4xl font-black text-emerald-800 mb-2 leading-tight whitespace-nowrap">
              كنيسة مارجرجس و الأنبا باخوميوس
            </h1>
            <h2 className="text-xl md:text-2xl font-bold text-emerald-600">
              بالعصافرة
            </h2>
          </motion.div>

          <motion.div 
            className="mt-12 flex gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
          >
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                className="w-3 h-3 bg-emerald-500 rounded-full"
              />
            ))}
          </motion.div>
        </motion.div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4 transition-colors" dir="rtl">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-950 p-8 rounded-3xl shadow-xl w-full max-w-md my-8 border border-slate-100 dark:border-slate-800/50"
        >
          <div className="flex flex-col items-center mb-8">
            <div className="flex items-center justify-between w-full mb-4">
              <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-2xl">
                <Church size={48} className="text-emerald-600 dark:text-emerald-400" />
              </div>
              {!isLoginView && (
                <button 
                  onClick={() => setIsLoginView(true)}
                  className="p-3 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-2xl text-slate-400 dark:text-slate-500 transition-colors flex items-center gap-2 font-bold text-sm"
                  title="رجوع"
                >
                  <span>رجوع</span>
                  <ArrowRight size={20} />
                </button>
              )}
            </div>
            <h1 className="text-2xl font-black text-slate-800 dark:text-slate-100">
              {isLoginView ? 'تسجيل الدخول' : 'حساب جديد'}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
              كنيسة مارجرجس و الأنبا باخوميوس بالعصافرة
            </p>
          </div>

          <form onSubmit={isLoginView ? handleLogin : handleRegister} className="space-y-4">
            {authError && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/40 text-red-600 dark:text-red-400 p-3 rounded-xl text-sm font-bold flex items-center gap-2"
              >
                <XCircle size={16} />
                {authError}
              </motion.div>
            )}
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">اسم المستخدم</label>
              <input
                type="text"
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                placeholder="أدخل اسم المستخدم"
                value={authForm.username}
                onChange={(e) => setAuthForm({ ...authForm, username: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">كلمة السر</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                  placeholder="أدخل كلمة السر"
                  value={authForm.password}
                  onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {!isLoginView && (
              <>
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">الاسم بالكامل</label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                    placeholder="الاسم ثلاثي أو رباعي"
                    value={authForm.fullName}
                    onChange={(e) => setAuthForm({ ...authForm, fullName: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">تاريخ الميلاد</label>
                    <input
                      type="date"
                      required
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                      value={authForm.birthDate}
                      onChange={(e) => setAuthForm({ ...authForm, birthDate: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">رقم التليفون</label>
                    <input
                      type="tel"
                      required
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                      value={authForm.phone}
                      onChange={(e) => setAuthForm({ ...authForm, phone: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">البريد الإلكتروني</label>
                  <input
                    type="email"
                    required
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                    value={authForm.email}
                    onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">واتساب</label>
                    <input
                      type="tel"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                      value={authForm.whatsapp}
                      onChange={(e) => setAuthForm({ ...authForm, whatsapp: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">العنوان</label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                      value={authForm.address}
                      onChange={(e) => setAuthForm({ ...authForm, address: e.target.value })}
                    />
                  </div>
                </div>
                
                <button
                  type="button"
                  onClick={handleGetLocation}
                  className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors font-bold"
                >
                  <MapPin size={20} />
                  تحديد الموقع الحالي
                </button>

                {/* Photo Upload */}
                <div className="flex flex-col items-center gap-4 mb-4">
                  <div className="w-24 h-24 rounded-full bg-slate-100 dark:bg-slate-900 border-2 border-dashed border-slate-300 dark:border-slate-800 flex items-center justify-center overflow-hidden relative group">
                    {authForm.photo ? (
                      <img src={authForm.photo} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <Camera className="text-slate-400" size={32} />
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => setAuthForm({ ...authForm, photo: reader.result as string });
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </div>
                  <span className="text-xs text-slate-500 font-bold">الصورة الشخصية</span>
                </div>

                {/* Assignments */}
                <div className="space-y-4 p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-black text-slate-700 dark:text-slate-300">الخدمات والمسؤوليات</h3>
                    <button
                      type="button"
                      onClick={() => setAuthForm({
                        ...authForm,
                        assignments: [...authForm.assignments, { role: 'servant', main: '', sub: '' }]
                      })}
                      className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 px-2 py-1 rounded-lg transition-all"
                    >
                      <Plus size={14} />
                      إضافة خدمة أخرى
                    </button>
                  </div>

                  {authForm.assignments.map((assignment, index) => (
                    <div key={index} className="space-y-3 p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800/50 relative">
                      {authForm.assignments.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setAuthForm({
                            ...authForm,
                            assignments: authForm.assignments.filter((_, i) => i !== index)
                          })}
                          className="absolute -top-2 -left-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow-md hover:bg-red-600 transition-all"
                        >
                          <X size={14} />
                        </button>
                      )}
                      
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">الصفة في هذه الخدمة</label>
                        <select
                          required
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                          value={assignment.role}
                          onChange={(e) => {
                            const newAssignments = [...authForm.assignments];
                            newAssignments[index].role = e.target.value as Role;
                            setAuthForm({ ...authForm, assignments: newAssignments });
                          }}
                        >
                          <option value="servant">خادم</option>
                          <option value="service_leader">أمين خدمة</option>
                          <option value="priest">كاهن</option>
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">الخدمة الرئيسية</label>
                          <select
                            required
                            className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                            value={assignment.main}
                            onChange={(e) => {
                              const newAssignments = [...authForm.assignments];
                              newAssignments[index].main = e.target.value;
                              newAssignments[index].sub = '';
                              setAuthForm({ ...authForm, assignments: newAssignments });
                            }}
                          >
                            <option value="">{t('select')}</option>
                            {Object.entries(serviceStructure).map(([key, value]) => (
                              <option key={key} value={key}>{(value as Service).label}</option>
                            ))}
                          </select>
                        </div>

                        {assignment.main && (
                          <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">{t('stage')}</label>
                            <select
                              required={assignment.role === 'servant'}
                              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                              value={assignment.sub}
                              onChange={(e) => {
                                const newAssignments = [...authForm.assignments];
                                newAssignments[index].sub = e.target.value;
                                setAuthForm({ ...authForm, assignments: newAssignments });
                              }}
                            >
                              <option value="">{assignment.role === 'service_leader' ? t('allStages') : t('select')}</option>
                              {assignment.role === 'service_leader' && <option value="all">{t('allStages')}</option>}
                              {assignment.main && serviceStructure[assignment.main]?.subServices.map(sub => (
                                <option key={sub} value={sub}>{serviceStructure[assignment.main]?.subServiceAliases?.[sub] || sub}</option>
                              ))}
                            </select>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            <button
              type="submit"
              className="w-full bg-emerald-600 text-white py-4 rounded-xl font-black text-lg shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all active:scale-95"
            >
              {isLoginView ? t('loginButton') : t('registerButton')}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button 
              onClick={() => setIsLoginView(!isLoginView)}
              className="text-emerald-600 font-bold hover:underline"
            >
              {isLoginView ? t('noAccount') : t('haveAccount')}
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div 
      data-theme={settings.theme}
      data-layout={settings.layout}
      className={`min-h-screen transition-all duration-300 ${
        settings.darkMode ? 'dark bg-[#020617] text-slate-200' : 'bg-slate-50 text-slate-900'
      } ${
        settings.readingMode ? 'bg-amber-50/90 text-amber-950 sepia-[0.1]' : ''
      } font-${settings.fontFamily} text-${settings.fontSize}`} 
      style={{ color: settings.textColor !== 'inherit' ? settings.textColor : undefined }}
      dir={settings.language === 'ar' ? 'rtl' : 'ltr'}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <AnimatePresence>
        {/* Splash and Login handled above */}
      </AnimatePresence>

      {/* Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside 
        initial={{ x: '100%' }}
        animate={{ x: isSidebarOpen ? 0 : '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed top-0 right-0 bottom-0 w-72 bg-white dark:bg-slate-950 shadow-2xl z-50 overflow-y-auto"
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-bold text-emerald-600">{t('services')}</h2>
            <button onClick={() => setIsSidebarOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-full transition-colors">
              <X size={20} className="text-slate-500 dark:text-slate-400" />
            </button>
          </div>
          
          <div className="space-y-2">
            {(currentUser?.role === 'admin' || currentUser?.role === 'priest' || currentUser?.role === 'service_leader') && (
              <button
                onClick={() => {
                  setView('servants_list');
                  setIsSidebarOpen(false);
                }}
                className={`w-full ${settings.language === 'ar' ? 'text-right' : 'text-left'} px-4 py-3 rounded-xl font-bold transition-all flex items-center gap-3 mb-2 ${
                  view === 'servants_list' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200' : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                <Users size={20} />
                {t('servantsList')}
              </button>
            )}

            {currentUser?.role === 'admin' && (
              <button
                onClick={() => {
                  openAddServiceModal();
                  setIsSidebarOpen(false);
                }}
                className={`w-full ${settings.language === 'ar' ? 'text-right' : 'text-left'} px-4 py-3 rounded-xl font-bold transition-all flex items-center gap-3 mb-4 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 border border-blue-100 dark:border-blue-800/50`}
              >
                <Plus size={20} />
                إضافة خدمة جديدة
              </button>
            )}

            {filteredServices.map(([key, service]) => (
              <div key={key} className="space-y-1">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setSelectedMain(key);
                      setSelectedSub(null);
                      setSelectedServant(null);
                      setView('sub');
                    }}
                    className={`flex-1 ${settings.language === 'ar' ? 'text-right' : 'text-left'} px-4 py-3 rounded-xl font-bold transition-all flex items-center gap-3 ${
                      selectedMain === key ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200 dark:shadow-emerald-900/20' : 'hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {React.createElement(ICON_MAP[service.icon as string] || Users, { size: 20 })}
                    {service.label}
                  </button>
                  {currentUser?.role === 'admin' && (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        const s = service as Service;
                        setNewServiceForm({
                          id: key,
                          label: s.label,
                          alias: '',
                          type: 'main',
                          parentId: '',
                          subServices: s.subServices.length > 0 ? s.subServices : [''],
                          subServiceAliases: s.subServices.map(sub => s.subServiceAliases?.[sub] || '')
                        });
                        setIsAddServiceModalOpen(true);
                      }}
                      className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-blue-500 transition-colors"
                    >
                      <Edit3 size={16} />
                    </button>
                  )}
                </div>
                
                {selectedMain === key && (
                  <div className={`${settings.language === 'ar' ? 'mr-8' : 'ml-8'} space-y-1 mt-1`}>
                    {service.subServices
                      .filter(sub => {
                        if (currentUser?.role === 'admin' || currentUser?.role === 'priest') return true;
                        return currentUser?.assignments.some(a => a.main === key && (a.sub === sub || a.role === 'service_leader'));
                      })
                      .map(sub => (
                        <button
                          key={sub}
                          onClick={() => {
                            setSelectedSub(sub);
                            setSelectedServant(null);
                            setView('list');
                            setIsSidebarOpen(false);
                          }}
                          className={`w-full ${settings.language === 'ar' ? 'text-right' : 'text-left'} px-4 py-2 rounded-lg text-sm transition-all ${
                            selectedSub === sub ? 'text-emerald-600 font-bold bg-emerald-50 dark:bg-emerald-900/20' : 'text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400'
                          }`}
                        >
                          {(service as Service).subServiceAliases?.[sub] || sub}
                        </button>
                      ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-12 pt-8 border-t border-slate-100 dark:border-slate-800 space-y-4">
            <button 
              onClick={() => {
                setShowSettings(true);
                setIsSidebarOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-3 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-xl transition-all"
            >
              <Settings size={18} />
              <span className="text-sm font-bold">{t('settings')}</span>
            </button>
            <button 
              onClick={() => {
                setShowAgenda(true);
                setIsSidebarOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-3 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-xl transition-all"
            >
              <CalendarDays size={18} />
              <span className="text-sm font-bold">{t('agenda')}</span>
            </button>
            <button 
              onClick={exportToCSV}
              className="w-full flex items-center gap-3 px-4 py-3 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-xl transition-all"
            >
              <Download size={18} />
              <span className="text-sm font-bold">{t('export')}</span>
            </button>
            <label className="w-full flex items-center gap-3 px-4 py-3 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-xl transition-all cursor-pointer">
              <Upload size={18} />
              <span className="text-sm font-bold">{t('import')}</span>
              <input type="file" accept=".csv" onChange={importFromCSV} className="hidden" />
            </label>
            <button 
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
            >
              <XCircle size={18} />
              <span className="text-sm font-bold">{t('logout')}</span>
            </button>
          </div>
        </div>
      </motion.aside>

      {/* Top Info Bar & Header */}
      {view !== 'chat' && (
        <div className="sticky top-0 z-40 bg-white/80 dark:bg-[#020617]/80 backdrop-blur-xl border-b border-slate-100 dark:border-sky-900/30 transition-colors">
          <TopInfoBar 
            settings={settings}
          />
          <Header 
            view={view}
            setView={setView}
            setIsSidebarOpen={setIsSidebarOpen}
            settings={settings}
            currentUser={currentUser}
            setProfileFormData={setProfileFormData}
            t={t}
          />
          {settings.layout === 'top-nav' && view === 'main' && (
            <div className="px-4 pb-4 flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth">
              {(currentUser?.role === 'admin' || currentUser?.role === 'priest' || currentUser?.role === 'service_leader') && (
                <button
                  onClick={() => setView('servants_list')}
                  className="px-4 py-2 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl font-bold text-xs whitespace-nowrap transition-all flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  <Users size={14} />
                  {t('servantsList')}
                </button>
              )}
              <button 
                onClick={() => setShowAgenda(true)}
                className="px-4 py-2 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl font-bold text-xs whitespace-nowrap transition-all flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                <CalendarDays size={14} />
                {t('agenda')}
              </button>
              <button 
                onClick={() => setShowSettings(true)}
                className="px-4 py-2 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl font-bold text-xs whitespace-nowrap transition-all flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                <Settings size={14} />
                {t('settings')}
              </button>
              <button 
                onClick={handleLogout}
                className="px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-xl font-bold text-xs whitespace-nowrap transition-all flex items-center gap-2 hover:bg-red-100 dark:hover:bg-red-900/30"
              >
                <XCircle size={14} />
                {t('logout')}
              </button>
            </div>
          )}
        </div>
      )}

      <main className="max-w-6xl mx-auto p-4 sm:p-6 pb-24 md:pb-6">
        <AnimatePresence mode="wait">

          {view === 'main' && (
            <motion.div 
              key="main"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {upcomingBirthdays.length > 0 && (
                <div className="bg-gradient-to-r from-pink-500 to-rose-500 p-6 rounded-[2.5rem] text-white shadow-xl shadow-pink-100 relative overflow-hidden group">
                  <div className="absolute -right-4 -top-4 opacity-10 group-hover:scale-110 transition-transform">
                    <Cake size={120} />
                  </div>
                  <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">
                        <Bell size={20} />
                      </div>
                      <h3 className="font-bold text-lg">{t('birthdaysThisWeek')}</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {upcomingBirthdays.map(s => {
                        const bDate = new Date(s.birthDate!);
                        const today = new Date();
                        const isToday = bDate.getMonth() === today.getMonth() && bDate.getDate() === today.getDate();
                        return (
                          <div 
                            key={s.id} 
                            onClick={() => { setSelectedServant(s); setView('details'); }}
                            className={`px-4 py-2 rounded-2xl backdrop-blur-md flex items-center gap-2 cursor-pointer transition-all hover:scale-105 ${isToday ? 'bg-white dark:bg-slate-950 text-rose-600 dark:text-rose-400 shadow-lg' : 'bg-white/20 text-white'}`}
                          >
                            <Cake size={14} />
                            <span className="text-sm font-bold">{s.name.split(' ')[0]}</span>
                            <span className="text-[10px] opacity-80">
                              ({bDate.getDate()} {bDate.toLocaleDateString(settings.language === 'ar' ? 'ar-EG' : 'en-US', { month: 'short' })})
                            </span>
                            {isToday && <span className="text-[10px] bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 px-2 py-0.5 rounded-full">{t('today')}</span>}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filteredServices.map(([key, s]) => {
                  const count = servants.filter(serv => {
                    if (serv.service !== key) return false;
                    if (currentUser?.role === 'admin' || currentUser?.role === 'priest') return true;
                    return currentUser?.assignments.some(a => 
                      a.main === key && (a.sub === serv.subService || a.role === 'service_leader')
                    );
                  }).length;

                  return (
                    <button 
                      key={key}
                      onClick={() => { setSelectedMain(key); setView('sub'); }}
                      className="bg-white dark:bg-sky-900/20 dark:backdrop-blur-md p-6 rounded-3xl border border-slate-200 dark:border-sky-800/30 shadow-sm hover:shadow-md dark:hover:bg-sky-800/40 transition-all flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-14 h-14 ${s.bg} ${s.color} rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110`}>
                          {React.createElement(ICON_MAP[s.icon as string] || Users, { size: 32 })}
                        </div>
                        <div className={settings.language === 'ar' ? 'text-right' : 'text-left'}>
                          <h3 className="font-bold text-lg dark:text-slate-100">{s.label}</h3>
                          <p className="text-slate-400 text-sm">{count} {t('servantsCount')}</p>
                        </div>
                      </div>
                      {settings.language === 'ar' ? <ChevronLeft className="text-slate-300 dark:text-slate-600" /> : <ChevronRight className="text-slate-300 dark:text-slate-600" />}
                    </button>
                  );
                })}
                {currentUser?.role === 'admin' && (
                  <button 
                    onClick={openAddServiceModal}
                    className="bg-white dark:bg-sky-900/20 dark:backdrop-blur-md p-6 rounded-3xl border-2 border-dashed border-slate-200 dark:border-sky-800/30 shadow-sm hover:shadow-md hover:border-emerald-500 dark:hover:bg-sky-800/40 transition-all flex items-center justify-center group"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110">
                        <Plus size={24} />
                      </div>
                      <span className="font-bold text-slate-600 dark:text-slate-300">إضافة خدمة جديدة</span>
                    </div>
                  </button>
                )}
              </div>
            </motion.div>
          )}

          {view === 'sub' && selectedMain && (
            <motion.div 
              key="sub"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className={`w-10 h-10 ${selectedMain && serviceStructure[selectedMain] ? serviceStructure[selectedMain].bg : 'bg-slate-100'} ${selectedMain && serviceStructure[selectedMain] ? serviceStructure[selectedMain].color : 'text-slate-500'} rounded-xl flex items-center justify-center`}>
                  {selectedMain && serviceStructure[selectedMain] && React.createElement(ICON_MAP[serviceStructure[selectedMain].icon as string] || Users, { size: 24 })}
                </div>
                <h2 className="text-2xl font-bold dark:text-slate-100">{selectedMain && serviceStructure[selectedMain] ? serviceStructure[selectedMain].label : ''}</h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {selectedMain && serviceStructure[selectedMain] && serviceStructure[selectedMain].subServices
                  .filter(sub => {
                    if (currentUser?.role === 'admin' || currentUser?.role === 'priest') return true;
                    return currentUser?.assignments.some(a => a.main === selectedMain && (a.sub === sub || a.role === 'service_leader'));
                  })
                  .map(sub => {
                  const count = servants.filter(serv => serv.service === selectedMain && serv.subService === sub).length;
                  return (
                    <button 
                      key={sub}
                      onClick={() => { setSelectedSub(sub); setView('list'); }}
                      className="bg-white dark:bg-sky-900/20 dark:backdrop-blur-md p-5 rounded-2xl border border-slate-200 dark:border-sky-800/30 text-center hover:border-emerald-500 transition-all group"
                    >
                      <p className="font-bold text-slate-700 dark:text-sky-100 group-hover:text-emerald-600 transition-colors">{sub}</p>
                      <p className="text-xs text-slate-400 dark:text-sky-400/60 mt-1">{count} {t('servantsCount')}</p>
                    </button>
                  );
                })}
                <button 
                  onClick={() => setView('trips')}
                  className="bg-white dark:bg-sky-900/20 dark:backdrop-blur-md p-5 rounded-2xl border border-slate-200 dark:border-sky-800/30 text-center hover:border-blue-500 transition-all flex flex-col items-center justify-center gap-2 group"
                >
                  <Plane className="text-blue-500 group-hover:scale-110 transition-transform" size={24} />
                  <p className="font-bold text-slate-700 dark:text-sky-100 group-hover:text-blue-600 transition-colors">{t('trips')}</p>
                </button>
              </div>
            </motion.div>
          )}

          {view === 'list' && selectedMain && selectedSub && (
            <motion.div 
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className={settings.language === 'ar' ? 'text-right' : 'text-left'}>
                  <h2 className="text-2xl font-bold dark:text-slate-100">{selectedSub} - {t(selectedMain as any)}</h2>
                  <p className="text-slate-400 dark:text-slate-500 text-sm">{filteredServants.length} {t('servantsCount')} {t('inThisClass')}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <div className="flex bg-white dark:bg-sky-900/20 dark:backdrop-blur-md p-1 rounded-xl border border-slate-200 dark:border-sky-800/30 shadow-sm">
                    <button 
                      onClick={() => setSelectedGender('all')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${selectedGender === 'all' ? 'bg-slate-900 dark:bg-slate-100 dark:text-slate-900 text-white' : 'text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900'}`}
                    >
                      {t('all')}
                    </button>
                    <button 
                      onClick={() => setSelectedGender('male')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${selectedGender === 'male' ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 dark:shadow-blue-900/20' : 'text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900'}`}
                    >
                      {t('male')}
                    </button>
                    <button 
                      onClick={() => setSelectedGender('female')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${selectedGender === 'female' ? 'bg-pink-600 text-white shadow-lg shadow-pink-200 dark:shadow-pink-900/20' : 'text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900'}`}
                    >
                      {t('female')}
                    </button>
                  </div>
                  <button 
                    onClick={() => setShowGeneralReport(true)}
                    className="bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-300 px-4 py-2 rounded-xl font-medium flex items-center gap-2 hover:bg-slate-200 dark:hover:bg-slate-900 transition-all"
                  >
                    <BarChart3 size={18} />
                    {t('classStats')}
                  </button>
                  <button 
                    onClick={() => setView('attendance')}
                    className="bg-blue-600 text-white px-4 py-2 rounded-xl font-medium flex items-center gap-2 hover:bg-blue-700 transition-all"
                  >
                    <ClipboardList size={18} />
                    {t('registerAttendance')}
                  </button>
                  <button 
                    onClick={() => setIsModalOpen(true)}
                    className="bg-emerald-600 text-white px-4 py-2 rounded-xl font-medium flex items-center gap-2 hover:bg-emerald-700 transition-all"
                  >
                    <UserPlus size={18} />
                    {t('add')}
                  </button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className={`absolute ${settings.language === 'ar' ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-slate-400`} size={20} />
                  <input 
                    type="text" 
                    placeholder={t('searchByName')}
                    className={`w-full bg-white dark:bg-sky-900/20 dark:backdrop-blur-md border border-slate-200 dark:border-sky-800/30 rounded-2xl py-3 ${settings.language === 'ar' ? 'pr-12 pl-4' : 'pl-12 pr-4'} focus:ring-2 focus:ring-emerald-500 outline-none transition-all dark:text-sky-100`}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="flex items-center gap-2 bg-white dark:bg-sky-900/20 dark:backdrop-blur-md border border-slate-200 dark:border-sky-800/30 rounded-2xl px-4 py-2">
                  <Cake size={18} className="text-slate-400" />
                  <select 
                    className="bg-transparent outline-none text-sm font-bold text-slate-600 dark:text-slate-300 cursor-pointer"
                    value={selectedBirthMonth}
                    onChange={(e) => setSelectedBirthMonth(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
                  >
                    <option value="all">{t('allBirthMonths')}</option>
                    {(settings.language === 'ar' ? ARABIC_MONTHS : ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']).map((month, idx) => (
                      <option key={idx} value={idx}>{month}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredServants.map(s => (
                  <div 
                    key={s.id} 
                    onClick={() => { setSelectedServant(s); setView('details'); }}
                    className="bg-white dark:bg-sky-900/20 dark:backdrop-blur-md p-5 rounded-3xl border border-slate-200 dark:border-sky-800/30 hover:border-emerald-500 hover:shadow-xl hover:shadow-emerald-50/50 dark:hover:shadow-sky-900/40 transition-all cursor-pointer group relative overflow-hidden"
                  >
                    <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        {s.photo ? (
                          <img src={s.photo} alt={s.name} className="w-16 h-16 rounded-2xl object-cover border-2 border-slate-100 dark:border-slate-800 shadow-sm group-hover:scale-105 transition-transform" referrerPolicy="no-referrer" />
                        ) : (
                          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-900 rounded-2xl flex items-center justify-center text-slate-400 font-bold text-2xl group-hover:bg-emerald-50 dark:group-hover:bg-emerald-900/20 group-hover:text-emerald-500 transition-colors">
                            {s.name[0]}
                          </div>
                        )}
                        <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center ${s.gender === 'male' ? 'bg-blue-500' : 'bg-pink-500'}`}>
                           <UserIcon size={10} className="text-white" />
                        </div>
                      </div>
                      <div className={`flex-1 min-w-0 ${settings.language === 'ar' ? 'text-right' : 'text-left'}`}>
                        <h4 className="font-black text-slate-800 dark:text-slate-100 group-hover:text-emerald-600 transition-colors">{s.name}</h4>
                        <div className="flex flex-col gap-1 mt-1">
                          <p className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                            <Phone size={10} /> 
                            <span dir="ltr">{s.phone || t('noNumber')}</span>
                          </p>
                          <p className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                            <Cake size={10} /> 
                            <span dir="ltr">{formatDate(s.birthDate)}</span>
                          </p>
                        </div>
                      </div>
                      {settings.language === 'ar' ? <ChevronLeft className="text-slate-300 group-hover:text-emerald-500 group-hover:-translate-x-1 transition-all" /> : <ChevronRight className="text-slate-300 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />}
                    </div>
                  </div>
                ))}
                {filteredServants.length === 0 && (
                  <div className="col-span-full text-center py-20 text-slate-400">
                    <Users size={48} className="mx-auto mb-4 opacity-20" />
                    <p>{t('noServants')}</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {view === 'trips' && selectedMain && (
            <motion.div 
              key="trips"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button onClick={() => setView('sub')} className={`p-2 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-full ${settings.language === 'ar' ? '' : 'rotate-180'}`}>
                    <ArrowLeft size={20} />
                  </button>
                  <h2 className="text-2xl font-bold">{t('tripsFor')} {t(selectedMain as any)}</h2>
                </div>
                <button 
                  onClick={() => { setEditingTripId(null); setTripFormData({ name: '', date: '', price: 0, subService: 'all' }); setIsTripModalOpen(true); }}
                  className="bg-blue-600 text-white px-4 py-2 rounded-xl font-medium flex items-center gap-2"
                >
                  <Plane size={18} />
                  {t('addTrip')}
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {trips.filter(t => t.service === selectedMain).map(trip => {
                  const isTripDay = trip.date === toLocalDateString(new Date());
                  return (
                        <div key={trip.id} className="bg-white dark:bg-sky-900/20 dark:backdrop-blur-md p-6 rounded-3xl border border-slate-200 dark:border-sky-800/30 shadow-sm space-y-4">
                          <div className="flex justify-between items-start">
                            <div className={settings.language === 'ar' ? 'text-right' : 'text-left'}>
                              <div className="flex items-center gap-2">
                                <h3 className="font-bold text-xl text-slate-800 dark:text-slate-100">{trip.name}</h3>
                                {trip.subService ? (
                                  <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                    {trip.subService}
                                  </span>
                                ) : (
                                  <span className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                    {t('general')}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-4 mt-1">
                                <p className="text-slate-400 flex items-center gap-2 text-sm">
                                  <Calendar size={16} />
                                  <span dir="ltr">{formatDate(trip.date)}</span>
                                </p>
                                <p className="text-emerald-600 flex items-center gap-2 text-sm font-bold">
                                  <DollarSign size={16} />
                                  {t('price')}: {trip.price} {t('currency')}
                                </p>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <button 
                                onClick={() => { setSelectedTrip(trip); }}
                                className="bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-4 py-2 rounded-xl text-sm font-bold"
                              >
                                {t('viewBookings')} ({trip.bookings.length})
                              </button>
                              <button 
                                onClick={() => { setEditingTripId(trip.id); setTripFormData({ name: trip.name, date: trip.date, price: trip.price, subService: trip.subService || 'all' }); setIsTripModalOpen(true); }}
                                className="p-2 text-slate-400 hover:text-blue-600"
                              >
                                <Edit3 size={18} />
                              </button>
                              <button 
                                onClick={() => { if(window.confirm(t('confirmDeleteTrip'))) setTrips(trips.filter(t => t.id !== trip.id)); }}
                                className="p-2 text-slate-400 hover:text-red-600"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-2xl">
                              <p className="text-[10px] font-bold text-emerald-600 uppercase">{t('totalCollected')}</p>
                              <p className="text-xl font-bold text-emerald-700 dark:text-emerald-400">
                                {trip.bookings.reduce((sum, b) => sum + b.amount, 0)} {t('currency')}
                              </p>
                            </div>
                            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-2xl">
                              <p className="text-[10px] font-bold text-blue-600 uppercase">{t('totalRemaining')}</p>
                              <p className="text-xl font-bold text-blue-700 dark:text-blue-400">
                                {trip.bookings.length * trip.price - trip.bookings.reduce((sum, b) => sum + b.amount, 0)} {t('currency')}
                              </p>
                            </div>
                          </div>

                          {selectedTrip?.id === trip.id && (
                            <motion.div 
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4"
                            >
                              <div className="flex gap-2">
                                <select 
                                  className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 outline-none text-slate-800 dark:text-slate-100"
                                  onChange={(e) => {
                                    const sId = e.target.value;
                                    if (sId) handleAddBooking(sId, trip.id);
                                  }}
                                  value=""
                                >
                                  <option value="">{t('selectServantToBook')}</option>
                                  {servants
                                    .filter(s => s.service === selectedMain && (!trip.subService || s.subService === trip.subService))
                                    .map(s => (
                                      <option key={s.id} value={s.id}>{s.name}</option>
                                    ))}
                                </select>
                                <div className="relative w-32">
                                  <DollarSign className={`absolute ${settings.language === 'ar' ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 text-slate-400`} size={16} />
                                  <input 
                                    type="number" 
                                    placeholder={t('amount')}
                                    className={`w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/50 rounded-xl ${settings.language === 'ar' ? 'pr-9 pl-4' : 'pl-9 pr-4'} py-2 outline-none text-slate-800 dark:text-slate-100`}
                                    value={bookingAmount}
                                    onChange={(e) => setBookingAmount(e.target.value)}
                                  />
                                </div>
                              </div>

                              <div className="space-y-2">
                                <h4 className="font-bold text-sm text-slate-500 dark:text-slate-400">{t('bookingsList')}:</h4>
                                {trip.bookings.map(b => {
                                  const s = servants.find(serv => serv.id === b.servantId);
                                  const remaining = trip.price - b.amount;
                                  return (
                                    <div key={b.servantId} className="flex justify-between items-center bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-transparent dark:border-slate-800">
                                      <div className={settings.language === 'ar' ? 'text-right' : 'text-left'}>
                                        <p className="font-medium text-slate-800 dark:text-slate-100">{s?.name || t('deletedServant')}</p>
                                        {remaining > 0 && <p className="text-[10px] font-bold text-red-500">{t('remaining')}: {remaining} {t('currency')}</p>}
                                      </div>
                                      <div className="flex items-center gap-4">
                                        <span className="text-emerald-600 font-bold">{b.amount} {t('currency')}</span>
                                        <button onClick={() => removeBooking(b.servantId)} className="text-red-400 hover:text-red-600">
                                          <Trash2 size={16} />
                                        </button>
                                      </div>
                                    </div>
                                  );
                                })}
                                {trip.bookings.length === 0 && <p className="text-center text-slate-400 dark:text-slate-500 text-sm py-4">{t('noBookings')}</p>}
                              </div>

                              {isTripDay && (
                                <div className="bg-blue-600 text-white p-4 rounded-2xl text-center font-bold">
                                  {t('tripDayMessage')}
                                </div>
                              )}
                            </motion.div>
                          )}
                        </div>
                  );
                })}
                {trips.filter(t => t.service === selectedMain).length === 0 && (
                  <div className="text-center py-20 text-slate-400 dark:text-slate-500">
                    <Plane size={48} className="mx-auto mb-4 opacity-20" />
                    <p>{t('noTripsAvailable')}</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {view === 'attendance' && selectedMain && selectedSub && (
            <motion.div 
              key="attendance"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <button onClick={() => setView('list')} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-full">
                    <ArrowLeft size={20} />
                  </button>
                  <h2 className="text-2xl font-bold">{t('registerAttendance')}</h2>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setSelectedDate(getPrevFriday(selectedDate))}
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-xl transition-all"
                    title="الجمعة السابقة"
                  >
                    <ChevronRight size={18} />
                  </button>
                  <div className="flex items-center gap-2 bg-white dark:bg-sky-900/20 dark:backdrop-blur-md px-4 py-2 rounded-xl border border-slate-200 dark:border-sky-800/30 shadow-sm relative hover:bg-slate-50 dark:hover:bg-sky-800/40 transition-colors">
                    <Calendar size={18} className="text-emerald-600" />
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{formatDate(selectedDate)}</span>
                    <input 
                      type="date" 
                      className="absolute inset-0 opacity-0 cursor-pointer w-full"
                      value={selectedDate}
                      max={toLocalDateString(new Date())}
                      onChange={(e) => setSelectedDate(e.target.value)}
                    />
                  </div>
                  <button 
                    onClick={() => {
                      const next = getNextFriday(selectedDate);
                      if (next <= toLocalDateString(new Date())) {
                        setSelectedDate(next);
                      }
                    }}
                    className={`p-2 rounded-xl transition-all ${getNextFriday(selectedDate) <= toLocalDateString(new Date()) ? 'hover:bg-slate-100 dark:hover:bg-slate-900' : 'opacity-20 cursor-not-allowed'}`}
                    title="الجمعة التالية"
                    disabled={getNextFriday(selectedDate) > toLocalDateString(new Date())}
                  >
                    <ChevronLeft size={18} />
                  </button>
                  {selectedDate !== toLocalDateString(getMostRecentFriday()) && (
                    <button 
                      onClick={() => setSelectedDate(toLocalDateString(getMostRecentFriday()))}
                      className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-all"
                    >
                      اليوم
                    </button>
                  )}
                </div>
              </div>

              <div className="bg-white dark:bg-sky-900/20 dark:backdrop-blur-md p-4 rounded-2xl border border-slate-200 dark:border-sky-800/30 flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-xl flex items-center justify-center">
                    <MessageSquare size={20} />
                  </div>
                  <div>
                    <p className="font-bold text-sm">إرسال رسائل الغياب تلقائياً</p>
                    <p className="text-[10px] text-slate-400">
                      {import.meta.env.VITE_ULTRAMSG_TOKEN ? 'سيتم الإرسال في الخلفية عبر UltraMsg' : 'سيتم فتح واتساب لكل غائب عند الحفظ'}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setAutoSendAbsence(!autoSendAbsence)}
                  className={`w-12 h-6 rounded-full transition-all relative ${autoSendAbsence ? 'bg-emerald-600' : 'bg-slate-200 dark:bg-slate-800'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${autoSendAbsence ? 'right-7' : 'right-1'}`} />
                </button>
              </div>

              <div className="bg-white dark:bg-sky-900/20 dark:backdrop-blur-md rounded-3xl border border-slate-200 dark:border-sky-800/30 overflow-x-auto shadow-sm">
                <table className="w-full text-right">
                  <thead className="bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 text-xs uppercase">
                    <tr>
                      <th className="px-6 py-4">{t('fullName')}</th>
                      <th className="px-4 py-4 text-center">{t('mass')}</th>
                      <th className="px-4 py-4 text-center">{t('service')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredServants.map(s => {
                      const record = (attendance.find(r => r.date === selectedDate)?.records || {})[s.id] || { mass: false, service: false };
                      return (
                        <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
                          <td className="px-6 py-4 font-medium">{s.name}</td>
                          <td className="px-4 py-4 text-center">
                            <button 
                              onClick={() => toggleAttendance(s.id, 'mass')}
                              className={`w-10 h-10 rounded-xl flex items-center justify-center mx-auto transition-all ${record.mass ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-100 dark:shadow-emerald-900/20' : 'bg-slate-100 dark:bg-slate-900 text-slate-300 dark:text-slate-600'}`}
                            >
                              <CheckCircle2 size={20} />
                            </button>
                          </td>
                          <td className="px-4 py-4 text-center">
                            <button 
                              onClick={() => toggleAttendance(s.id, 'service')}
                              className={`w-10 h-10 rounded-xl flex items-center justify-center mx-auto transition-all ${record.service ? 'bg-blue-600 text-white shadow-lg shadow-blue-100 dark:shadow-blue-900/20' : 'bg-slate-100 dark:bg-slate-900 text-slate-300 dark:text-slate-600'}`}
                            >
                              <CheckCircle2 size={20} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <button 
                  onClick={async () => {
                    if (autoSendAbsence) {
                      const records = attendance.find(r => r.date === selectedDate)?.records || {};
                      const absentees = filteredServants.filter(s => !records[s.id]?.service);
                      
                      if (absentees.length > 0) {
                        for (const s of absentees) {
                          if (s.father?.phone) {
                            await sendAbsenceMessage(s.father.phone, s.name, selectedDate);
                            await new Promise(r => setTimeout(r, 1200));
                          }
                          if (s.mother?.phone) {
                            await sendAbsenceMessage(s.mother.phone, s.name, selectedDate);
                            await new Promise(r => setTimeout(r, 1200));
                          }
                        }
                      }
                    }
                    setView('list');
                  }}
                  className="flex-1 bg-slate-900 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-xl"
                >
                  <Save size={20} />
                  {t('saveAttendance')}
                </button>
                <button 
                  onClick={() => setIsBatchWhatsAppModalOpen(true)}
                  className="flex-1 bg-emerald-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-xl"
                >
                  <MessageSquare size={20} />
                  إرسال تحذير غياب للكل
                </button>
              </div>
            </motion.div>
          )}

          {view === 'details' && selectedServant && (
            <motion.div 
              key="details"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-6 pb-20"
            >
              <div className="flex items-center gap-2 mb-2">
                <button onClick={() => setView('list')} className="p-2 hover:bg-white dark:hover:bg-slate-900 rounded-full shadow-sm transition-colors">
                  <ArrowLeft size={20} />
                </button>
                <span className="text-sm font-bold text-slate-400 dark:text-slate-500">{t('backToList')}</span>
              </div>

              <div className="bg-white dark:bg-sky-900/20 dark:backdrop-blur-md p-8 rounded-[2.5rem] border border-slate-200 dark:border-sky-800/30 shadow-sm text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-emerald-500"></div>
                {selectedServant.photo ? (
                  <button onClick={() => setPreviewImage(selectedServant.photo!)} className="block mx-auto mb-4">
                    <img src={selectedServant.photo} alt={selectedServant.name} className="w-24 h-24 rounded-full object-cover border-4 border-white dark:border-slate-900 shadow-sm hover:scale-105 transition-transform" referrerPolicy="no-referrer" />
                  </button>
                ) : (
                  <div className="w-24 h-24 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-4 border-4 border-white dark:border-slate-900 shadow-sm">
                    {selectedServant.name[0]}
                  </div>
                )}
                <h2 className="text-2xl font-bold dark:text-slate-100">{selectedServant.name}</h2>
                <p className="text-slate-400 dark:text-slate-500 mt-1">{selectedServant.subService} - {serviceStructure[selectedServant.service]?.label || selectedServant.service}</p>
                
                <div className="grid grid-cols-3 sm:grid-cols-7 gap-3 mt-8">
                  <button 
                    onClick={() => window.open(`tel:${selectedServant.phone}`)}
                    className="bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 p-3 rounded-2xl flex flex-col items-center gap-2 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                  >
                    <Phone size={20} />
                    <span className="text-[10px] font-bold">{t('call')}</span>
                  </button>
                  <button 
                    onClick={() => openWhatsApp(selectedServant.whatsapp || selectedServant.phone || '')}
                    className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 p-3 rounded-2xl flex flex-col items-center gap-2 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors"
                  >
                    <MessageSquare size={20} />
                    <span className="text-[10px] font-bold">{t('whatsapp')}</span>
                  </button>
                  <button 
                    onClick={() => setShowReport(selectedServant.id)}
                    className="bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 p-3 rounded-2xl flex flex-col items-center gap-2 hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-colors"
                  >
                    <BarChart3 size={20} />
                    <span className="text-[10px] font-bold">{t('report')}</span>
                  </button>
                  {selectedServant.facebook && (
                    <button 
                      onClick={() => window.open(selectedServant.facebook, '_blank')}
                      className="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 p-3 rounded-2xl flex flex-col items-center gap-2 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
                    >
                      <Facebook size={20} />
                      <span className="text-[10px] font-bold">{t('facebook')}</span>
                    </button>
                  )}
                  {selectedServant.telegram && (
                    <button 
                      onClick={() => {
                        const tel = selectedServant.telegram!;
                        const link = tel.startsWith('http') ? tel : `https://t.me/+2${tel.startsWith('0') ? tel : '0' + tel}`;
                        window.open(link, '_blank');
                      }}
                      className="bg-sky-50 dark:bg-sky-900/20 text-sky-600 dark:text-sky-400 p-3 rounded-2xl flex flex-col items-center gap-2 hover:bg-sky-100 dark:hover:bg-sky-900/40 transition-colors"
                    >
                      <Send size={20} />
                      <span className="text-[10px] font-bold">{t('telegram')}</span>
                    </button>
                  )}
                  {selectedServant.instagram && (
                    <button 
                      onClick={() => {
                        const insta = selectedServant.instagram!;
                        const link = insta.startsWith('http') ? insta : `https://instagram.com/${insta}`;
                        window.open(link, '_blank');
                      }}
                      className="bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 p-3 rounded-2xl flex flex-col items-center gap-2 hover:bg-purple-100 dark:hover:bg-purple-900/40 transition-colors"
                    >
                      <Instagram size={20} />
                      <span className="text-[10px] font-bold">{t('instagram')}</span>
                    </button>
                  )}
                  {selectedServant.gmail && (
                    <button 
                      onClick={() => window.open(`mailto:${selectedServant.gmail}`, '_blank')}
                      className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-2xl flex flex-col items-center gap-2 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                    >
                      <Mail size={20} />
                      <span className="text-[10px] font-bold">{t('gmail')}</span>
                    </button>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-3 mt-3">
                  {(() => {
                    const record = (attendance.find(r => r.date === selectedDate)?.records || {})[selectedServant.id] || { mass: false, service: false };
                    const isAbsent = !record.service;
                    
                    return (
                      <>
                        {selectedServant.father?.phone && (
                          <button 
                            onClick={() => isAbsent 
                              ? sendAbsenceMessage(selectedServant.father!.phone!, selectedServant.name, selectedDate)
                              : openWhatsApp(selectedServant.father!.phone!)
                            }
                            className="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 p-4 rounded-2xl flex flex-col items-center gap-2 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
                          >
                            <MessageSquare size={24} />
                            <span className="text-xs font-bold">{isAbsent ? t('absenceWarningFather') : t('whatsappFather')}</span>
                          </button>
                        )}
                        {selectedServant.mother?.phone && (
                          <button 
                            onClick={() => isAbsent 
                              ? sendAbsenceMessage(selectedServant.mother!.phone!, selectedServant.name, selectedDate)
                              : openWhatsApp(selectedServant.mother!.phone!)
                            }
                            className="bg-pink-50 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400 p-4 rounded-2xl flex flex-col items-center gap-2 hover:bg-pink-100 dark:hover:bg-pink-900/40 transition-colors"
                          >
                            <MessageSquare size={24} />
                            <span className="text-xs font-bold">{isAbsent ? t('absenceWarningMother') : t('whatsappMother')}</span>
                          </button>
                        )}
                      </>
                    );
                  })()}
                </div>
                <button 
                  onClick={() => openEditModal(selectedServant)}
                  className="absolute top-4 right-4 p-2 bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 rounded-full hover:bg-emerald-100 dark:hover:bg-emerald-900/40 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all"
                >
                  <Edit3 size={18} />
                </button>
              </div>

              <div className="bg-white dark:bg-slate-950 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
                <h3 className="font-bold border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center gap-2 text-slate-800 dark:text-slate-100">
                  <Info size={18} className="text-emerald-600" />
                  {t('personalData')}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-slate-400 dark:text-slate-500">{t('birthDate')}</p>
                    <p className="font-medium dark:text-slate-200" dir="ltr">{formatDate(selectedServant.birthDate)}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 dark:text-slate-500">{t('confession')}</p>
                    <p className="font-medium dark:text-slate-200">{selectedServant.confession || t('notSpecified')}</p>
                  </div>
                  {selectedServant.landline && (
                    <div>
                      <p className="text-slate-400 dark:text-slate-500">{t('landline')}</p>
                      <p className="font-medium dark:text-slate-200 flex items-center gap-1">
                        <Home size={14} className="text-slate-300 dark:text-slate-600" />
                        {selectedServant.landline}
                      </p>
                    </div>
                  )}
                  <div className="sm:col-span-2">
                    <p className="text-slate-400 dark:text-slate-500">{t('address')}</p>
                    <button 
                      onClick={() => {
                        if (selectedServant.lat && selectedServant.lng) {
                          window.open(`https://www.google.com/maps?q=${selectedServant.lat},${selectedServant.lng}`, '_blank');
                        }
                      }}
                      className={`font-medium flex items-center gap-1 text-right w-full ${selectedServant.lat ? 'text-emerald-600 dark:text-emerald-400 hover:underline' : 'dark:text-slate-200'}`}
                    >
                      <MapPin size={14} className={selectedServant.lat ? 'text-emerald-500 dark:text-emerald-400' : 'text-slate-300 dark:text-slate-600'} />
                      {selectedServant.address || t('notSpecified')}
                    </button>
                  </div>
                </div>
              </div>

                <div className="mt-8 p-6 bg-slate-50 dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-700">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                      <ClipboardList size={18} className="text-blue-600" />
                      {t('quickAttendance')}
                    </h3>
                    <div className="text-xs font-bold text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-950 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700" dir="ltr">
                      {formatDate(selectedDate)}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {(() => {
                      const record = (attendance.find(r => r.date === selectedDate)?.records || {})[selectedServant.id] || { mass: false, service: false };
                      return (
                        <>
                          <button 
                            onClick={() => toggleAttendance(selectedServant.id, 'mass')}
                            className={`flex items-center justify-center gap-2 p-4 rounded-2xl font-bold transition-all ${record.mass ? 'bg-emerald-600 text-white shadow-lg' : 'bg-white dark:bg-slate-950 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-800'}`}
                          >
                            <CheckCircle2 size={20} />
                            {t('attendMass')}
                          </button>
                          <button 
                            onClick={() => toggleAttendance(selectedServant.id, 'service')}
                            className={`flex items-center justify-center gap-2 p-4 rounded-2xl font-bold transition-all ${record.service ? 'bg-blue-600 text-white shadow-lg' : 'bg-white dark:bg-slate-950 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-800'}`}
                          >
                            <CheckCircle2 size={20} />
                            {t('attendService')}
                          </button>
                        </>
                      );
                    })()}
                  </div>
                </div>

                <div className="mt-4 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-3xl border border-blue-100 dark:border-blue-900/40">
                  <h3 className="font-bold text-blue-800 dark:text-blue-400 mb-4 flex items-center gap-2">
                    <Plane size={18} />
                    {t('tripBooking')}
                  </h3>
                  <div className="space-y-3">
                    {trips
                      .filter(t => t.service === selectedServant.service && (!t.subService || t.subService === selectedServant.subService))
                      .map(trip => {
                        const booking = trip.bookings.find(b => b.servantId === selectedServant.id);
                        const remaining = trip.price - (booking?.amount || 0);
                        
                        return (
                          <div key={trip.id} className="flex flex-col bg-white dark:bg-slate-950 p-3 rounded-xl border border-blue-100 dark:border-blue-900/40 gap-2">
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="flex items-center gap-2">
                                  <p className="font-bold text-sm dark:text-slate-100">{trip.name}</p>
                                  {trip.subService && (
                                    <span className="bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 text-[8px] font-bold px-1.5 py-0.5 rounded-full">
                                      {trip.subService}
                                    </span>
                                  )}
                                </div>
                                <p className="text-[10px] text-slate-400 dark:text-slate-500"><span dir="ltr">{formatDate(trip.date)}</span> • {t('price')}: {trip.price} {t('currency')}</p>
                              </div>
                            {booking ? (
                              <div className="flex items-center gap-2">
                                <div className="text-left">
                                  <p className="text-xs font-bold text-emerald-600">{t('paid')}: {booking.amount} {t('currency')}</p>
                                  {remaining > 0 && <p className="text-[10px] font-bold text-red-500">{t('remaining')}: {remaining} {t('currency')}</p>}
                                </div>
                                <button onClick={() => { setSelectedTrip(trip); setView('trips'); }} className="p-1 text-blue-400">
                                  <ChevronRight size={16} />
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <input 
                                  type="number"
                                  placeholder={t('amount')}
                                  className="w-20 px-2 py-1 text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-lg outline-none focus:ring-1 focus:ring-blue-400 dark:text-slate-100"
                                  value={selectedTrip?.id === trip.id ? bookingAmount : ''}
                                  onChange={(e) => {
                                    setSelectedTrip(trip);
                                    setBookingAmount(e.target.value);
                                  }}
                                />
                                <button 
                                  onClick={() => {
                                    if (!bookingAmount) {
                                      alert(t('enterAmountAlert'));
                                      return;
                                    }
                                    handleAddBooking(selectedServant.id, trip.id);
                                  }}
                                  className="bg-blue-600 text-white px-3 py-1 rounded-lg text-xs font-bold hover:bg-blue-700 transition-colors"
                                >
                                  {t('book')}
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                    {trips.filter(t => t.service === selectedServant.service).length === 0 && (
                      <p className="text-center text-blue-400 text-xs">{t('noTripsAvailable')}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-8 p-6 bg-slate-50 dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-700">
                  <div className="space-y-4">
                    <h3 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      {t('fatherData')}
                    </h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-slate-400">{t('nameLabel')}</p>
                        <p className="font-medium">{selectedServant.father.name || t('notSpecified')}</p>
                      </div>
                      <div>
                        <p className="text-slate-400">{t('jobLabel')}</p>
                        <p className="font-medium">{selectedServant.father.job || t('notSpecified')}</p>
                      </div>
                      <div>
                        <p className="text-slate-400">{t('phone')}</p>
                        <p className="font-medium text-blue-600 dark:text-blue-400">{selectedServant.father.phone}</p>
                      </div>
                      <div>
                        <p className="text-slate-400">{t('confession')}</p>
                        <p className="font-medium">{selectedServant.father.confession || t('notSpecified')}</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h3 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                      <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                      {t('motherData')}
                    </h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-slate-400">{t('nameLabel')}</p>
                        <p className="font-medium">{selectedServant.mother.name || t('notSpecified')}</p>
                      </div>
                      <div>
                        <p className="text-slate-400">{t('jobLabel')}</p>
                        <p className="font-medium">{selectedServant.mother.job || t('notSpecified')}</p>
                      </div>
                      <div>
                        <p className="text-slate-400">{t('phone')}</p>
                        <p className="font-medium text-pink-600 dark:text-pink-400">{selectedServant.mother.phone}</p>
                      </div>
                      <div>
                        <p className="text-slate-400">{t('confession')}</p>
                        <p className="font-medium">{selectedServant.mother.confession || t('notSpecified')}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {selectedServant.notes && (
                  <div className="mt-6 p-6 bg-amber-50 dark:bg-amber-900/20 rounded-3xl border border-amber-100 dark:border-amber-900/40">
                    <h3 className="font-bold text-amber-800 dark:text-amber-400 mb-2 flex items-center gap-2">
                      <FileText size={18} />
                      {t('notesLabel')}
                    </h3>
                    <p className="text-amber-900 dark:text-amber-300 text-sm leading-relaxed">{selectedServant.notes}</p>
                  </div>
                )}

              <button 
                onClick={() => {
                  if (window.confirm(t('confirmDeleteServant'))) {
                    setServants(servants.filter(s => s.id !== selectedServant.id));
                    setView('list');
                  }
                }}
                className="w-full text-red-500 py-4 font-bold flex items-center justify-center gap-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-2xl transition-colors"
              >
                <Trash2 size={20} />
                {t('deleteServantPermanently')}
              </button>
            </motion.div>
          )}

          {view === 'profile' && profileFormData && (
            <motion.div 
              key="profile"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6 pb-20"
            >
              <div className="bg-white dark:bg-sky-900/20 dark:backdrop-blur-md p-8 rounded-[2.5rem] border border-slate-200 dark:border-sky-800/30 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-emerald-500"></div>
                
                <div className="flex flex-col items-center gap-6 mb-8">
                  <div className="relative group">
                    {profileFormData.photo ? (
                      <img 
                        src={profileFormData.photo} 
                        alt="Profile" 
                        className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
                      />
                    ) : (
                      <div className="w-32 h-32 rounded-full bg-emerald-100 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 border-4 border-white dark:border-slate-800 shadow-lg">
                        <UserIcon size={48} />
                      </div>
                    )}
                    <label className="absolute bottom-0 right-0 bg-white dark:bg-slate-900 p-2 rounded-full shadow-md cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors border border-slate-100 dark:border-slate-700">
                      <Camera size={20} className="text-emerald-600" />
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => setProfileFormData({ ...profileFormData, photo: reader.result as string });
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                  </div>
                  <div className="text-center">
                    <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100">{profileFormData.fullName}</h2>
                    <p className="text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest text-xs mt-1">
                      {profileFormData.role === 'admin' ? t('adminRole') : profileFormData.role === 'priest' ? t('priestRole') : profileFormData.role === 'service_leader' ? t('serviceLeaderRole') : t('servantRole')}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-black text-slate-400 dark:text-slate-500 uppercase mb-1">{t('fullNameLabel')}</label>
                      <input 
                        type="text"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-bold"
                        value={profileFormData.fullName}
                        onChange={(e) => setProfileFormData({ ...profileFormData, fullName: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-black text-slate-400 dark:text-slate-500 uppercase mb-1">{t('phoneNumberLabel')}</label>
                      <input 
                        type="tel"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-bold"
                        value={profileFormData.phone}
                        onChange={(e) => setProfileFormData({ ...profileFormData, phone: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-black text-slate-400 dark:text-slate-500 uppercase mb-1">{t('emailLabel')}</label>
                      <input 
                        type="email"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-bold"
                        value={profileFormData.email}
                        onChange={(e) => setProfileFormData({ ...profileFormData, email: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-black text-slate-400 dark:text-slate-500 uppercase mb-1">{t('whatsappLabel')}</label>
                      <input 
                        type="tel"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-bold"
                        value={profileFormData.whatsapp}
                        onChange={(e) => setProfileFormData({ ...profileFormData, whatsapp: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-black text-slate-400 dark:text-slate-500 uppercase mb-1">{t('addressLabel')}</label>
                      <input 
                        type="text"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-bold"
                        value={profileFormData.address}
                        onChange={(e) => setProfileFormData({ ...profileFormData, address: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-black text-slate-400 dark:text-slate-500 uppercase mb-1">{t('birthDateLabel')}</label>
                      <input 
                        type="date"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-bold"
                        value={profileFormData.birthDate}
                        onChange={(e) => setProfileFormData({ ...profileFormData, birthDate: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800">
                  <h3 className="text-sm font-black text-slate-700 dark:text-slate-300 mb-4">{t('servicesAndResponsibilities')}</h3>
                  <div className="space-y-3">
                    {profileFormData.assignments.map((assignment, index) => (
                      <div key={index} className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-700 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="bg-white dark:bg-slate-950 p-2 rounded-xl border border-slate-200 dark:border-slate-800">
                            <Church size={20} className="text-emerald-600" />
                          </div>
                          <div>
                            <p className="font-bold text-slate-700 dark:text-slate-200">
                              {serviceStructure[assignment.main]?.label || assignment.main}
                            </p>
                            <p className="text-xs text-slate-400 dark:text-slate-500">
                              {assignment.sub === 'all' ? t('allStages') : assignment.sub} - {assignment.role === 'priest' ? t('priestRole') : assignment.role === 'service_leader' ? t('serviceLeaderRole') : t('servantRole')}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-8 flex gap-4">
                  <button 
                    onClick={() => {
                      const updatedUsers = users.map(u => u.username === currentUser?.username ? profileFormData : u);
                      setUsers(updatedUsers);
                      setCurrentUser(profileFormData);
                      alert(t('updateProfile'));
                      setView('main');
                    }}
                    className="flex-1 bg-emerald-600 text-white py-4 rounded-2xl font-black text-lg shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all active:scale-95 flex items-center justify-center gap-2"
                  >
                    <Save size={20} />
                    {t('saveChanges')}
                  </button>
                  <button 
                    onClick={() => setView('main')}
                    className="px-8 bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 py-4 rounded-2xl font-bold hover:bg-slate-200 dark:hover:bg-slate-800 transition-all"
                  >
                    {t('cancel')}
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {view === 'servants_list' && (
            <motion.div 
              key="servants_list"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6 pb-20"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100">{t('servantsList')}</h2>
                  <p className="text-slate-400 dark:text-slate-500 text-sm font-bold">{t('servantsInService')}</p>
                </div>
                <div className="bg-emerald-100 text-emerald-700 px-4 py-2 rounded-2xl font-black text-sm">
                  {users.filter(u => {
                    if (currentUser?.role === 'admin') return true;
                    return u.assignments.some(ua => 
                      currentUser?.assignments.some(ca => ca.main === ua.main && (ca.role === 'priest' || ca.role === 'service_leader'))
                    );
                  }).length} {t('servant')}
                </div>
              </div>

              <div className="space-y-4">
                {users
                  .filter(u => {
                    if (currentUser?.role === 'admin') return true;
                    // Show users who share a main service where current user is priest or service leader
                    return u.assignments.some(ua => 
                      currentUser?.assignments.some(ca => ca.main === ua.main && (ca.role === 'priest' || ca.role === 'service_leader'))
                    );
                  })
                  .map(user => (
                    <div key={user.username} className="bg-white dark:bg-sky-900/20 dark:backdrop-blur-md p-6 rounded-[2rem] border border-slate-200 dark:border-sky-800/30 shadow-sm hover:shadow-md transition-all">
                      <div className="flex items-center gap-4 mb-4">
                        {user.photo ? (
                          <img src={user.photo} alt={user.fullName} className="w-16 h-16 rounded-full object-cover border-2 border-slate-100 dark:border-slate-800 shadow-sm" />
                        ) : (
                          <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-slate-400 dark:text-slate-500">
                            <UserIcon size={32} />
                          </div>
                        )}
                        <div>
                          <h3 className="font-black text-lg text-slate-800 dark:text-slate-100">{user.fullName}</h3>
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1 text-slate-400 text-[10px] font-bold">
                              <Phone size={10} />
                              <span dir="ltr">{user.phone}</span>
                            </div>
                            <div className="flex items-center gap-1 text-slate-400 text-[10px] font-bold">
                              <Cake size={10} />
                              <span dir="ltr">{formatDate(user.birthDate)}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">{t('assignedServices')}</p>
                        <div className="flex flex-wrap gap-2">
                          {user.assignments.map((a, i) => (
                            <div key={i} className="bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 px-3 py-2 rounded-xl flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                              <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
                                {serviceStructure[a.main]?.label || a.main}
                                {a.sub && a.sub !== 'all' ? ` (${a.sub})` : ` (${t('allStages')})`}
                                <span className="mx-1 text-slate-300 dark:text-slate-600">|</span>
                                <span className="text-emerald-600">
                                  {a.role === 'priest' ? t('priestRole') : a.role === 'service_leader' ? t('serviceLeaderRole') : t('servantRole')}
                                </span>
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="mt-4 pt-4 border-t border-slate-50 dark:border-slate-800 flex gap-2">
                        <button 
                          onClick={() => window.open(`tel:${user.phone}`)}
                          className="flex-1 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 py-2 rounded-xl text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-700 transition-all flex items-center justify-center gap-2"
                        >
                          <Phone size={14} />
                          {t('call')}
                        </button>
                        <button 
                          onClick={() => openWhatsApp(user.whatsapp || user.phone)}
                          className="flex-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 py-2 rounded-xl text-xs font-bold hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-all flex items-center justify-center gap-2"
                        >
                          <MessageSquare size={14} />
                          {settings.language === 'ar' ? 'واتساب' : 'WhatsApp'}
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Add Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto border dark:border-slate-800"
            >
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center sticky top-0 bg-white dark:bg-slate-900/80 dark:backdrop-blur-md z-10">
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">{editingId ? t('editServantData') : t('addNewServant')}</h3>
                <button onClick={() => { setIsModalOpen(false); setEditingId(null); }} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                  <XCircle size={20} className="text-slate-400 dark:text-slate-500" />
                </button>
              </div>
              
              <form onSubmit={handleSaveServant} className="p-6 space-y-4">
                <div className="flex flex-col items-center gap-3 mb-6">
                  <div className="relative group">
                    {formData.photo ? (
                      <img src={formData.photo} alt="Preview" className="w-24 h-24 rounded-full object-cover border-4 border-emerald-50 dark:border-emerald-900/30 shadow-md" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-400 dark:text-slate-500 border-4 border-white dark:border-slate-900 shadow-sm">
                        <UserIcon size={40} />
                      </div>
                    )}
                    <label className="absolute bottom-0 right-0 bg-emerald-600 text-white p-2 rounded-full cursor-pointer shadow-lg hover:bg-emerald-700 transition-colors">
                      <Camera size={16} />
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setFormData({ ...formData, photo: reader.result as string });
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                  </div>
                  <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{t('servantPhoto')}</p>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400">{t('gender')}</label>
                  <div className="flex gap-2">
                    <button 
                      type="button"
                      onClick={() => setFormData({...formData, gender: 'male'})}
                      className={`flex-1 py-3 rounded-xl font-bold border transition-all ${formData.gender === 'male' ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 shadow-sm' : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500'}`}
                    >
                      {t('male')}
                    </button>
                    <button 
                      type="button"
                      onClick={() => setFormData({...formData, gender: 'female'})}
                      className={`flex-1 py-3 rounded-xl font-bold border transition-all ${formData.gender === 'female' ? 'bg-pink-50 dark:bg-pink-900/20 border-pink-200 dark:border-pink-800 text-pink-600 dark:text-pink-400 shadow-sm' : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500'}`}
                    >
                      {t('female')}
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400">{t('fullName')}</label>
                  <input 
                    required
                    type="text" 
                    placeholder={t('fullNamePlaceholder')}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                    value={formData.name}
                    onChange={e => handleNameChange(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400">{t('birthDate')}</label>
                    <input 
                      type="date" 
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-right"
                      value={formData.birthDate}
                      max={toLocalDateString(new Date())}
                      onChange={e => setFormData({...formData, birthDate: e.target.value})}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400">{t('phone')}</label>
                    <div className="flex gap-2">
                      <input 
                        type="tel" 
                        className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                        value={formData.phone}
                        onChange={e => setFormData({...formData, phone: e.target.value})}
                      />
                      <button 
                        type="button"
                        onClick={() => pickContact('phone')}
                        className="p-3 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                        title="اختر من جهات الاتصال"
                      >
                        <Contact size={20} />
                      </button>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-bold text-slate-500 dark:text-slate-400">{t('whatsapp')}</label>
                      <button 
                        type="button"
                        onClick={() => setFormData({...formData, whatsapp: formData.phone})}
                        className="text-[10px] text-emerald-600 font-bold hover:underline"
                      >
                        {t('whatsappSameAsPhone')}
                      </button>
                    </div>
                    <input 
                      type="tel" 
                      placeholder={t('optional')}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                      value={formData.whatsapp}
                      onChange={e => setFormData({...formData, whatsapp: e.target.value})}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400">{t('landline')}</label>
                    <input 
                      type="tel" 
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                      value={formData.landline}
                      onChange={e => setFormData({...formData, landline: e.target.value})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400">{t('facebook')}</label>
                    <input 
                      type="url" 
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                      value={formData.facebook}
                      onChange={e => setFormData({...formData, facebook: e.target.value})}
                    />
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-bold text-slate-500 dark:text-slate-400">{t('telegram')}</label>
                      <button 
                        type="button"
                        onClick={() => setFormData({...formData, telegram: formData.phone})}
                        className="text-[10px] text-emerald-600 font-bold hover:underline"
                      >
                        {t('whatsappSameAsPhone')}
                      </button>
                    </div>
                    <input 
                      type="tel" 
                      placeholder={t('telegramPlaceholder')}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                      value={formData.telegram}
                      onChange={e => setFormData({...formData, telegram: e.target.value})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400">{t('instagram')}</label>
                    <input 
                      type="text" 
                      placeholder={t('instagramPlaceholder')}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                      value={formData.instagram}
                      onChange={e => setFormData({...formData, instagram: e.target.value})}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400">{t('gmail')}</label>
                    <input 
                      type="email" 
                      placeholder={t('gmailPlaceholder')}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                      value={formData.gmail}
                      onChange={e => setFormData({...formData, gmail: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400">{t('address')}</label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                      value={formData.address}
                      onChange={e => setFormData({...formData, address: e.target.value})}
                    />
                    <button 
                      type="button"
                      onClick={captureLocation}
                      className={`p-3 rounded-xl transition-all ${formData.lat ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 dark:bg-slate-900 text-slate-400 dark:text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800'}`}
                      title={t('captureCurrentLocation')}
                    >
                      <MapPin size={20} />
                    </button>
                  </div>
                  {formData.lat && (
                    <p className="text-[10px] text-emerald-600 font-bold mt-1 flex items-center gap-1">
                      <CheckCircle2 size={10} /> {t('locationCaptured')}
                    </p>
                  )}
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400">{t('confession')}</label>
                  <input 
                    type="text" 
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                    value={formData.confession}
                    onChange={e => setFormData({...formData, confession: e.target.value})}
                  />
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
                  <p className="font-bold text-sm text-slate-400 dark:text-slate-500">{t('parentsData')}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
                      <p className="text-xs font-bold text-blue-600 dark:text-blue-400">{t('father')}</p>
                      <input 
                        placeholder={t('fatherName')}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm outline-none text-slate-800 dark:text-slate-100"
                        value={formData.father?.name}
                        onChange={e => setFormData({...formData, father: { ...formData.father!, name: e.target.value }})}
                      />
                      <input 
                        placeholder={t('fatherJob')}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm outline-none text-slate-800 dark:text-slate-100"
                        value={formData.father?.job}
                        onChange={e => setFormData({...formData, father: { ...formData.father!, job: e.target.value }})}
                      />
                      <div className="flex gap-2">
                        <input 
                          placeholder={t('fatherPhone')}
                          className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm outline-none text-slate-800 dark:text-slate-100"
                          value={formData.father?.phone}
                          onChange={e => setFormData({...formData, father: { ...formData.father!, phone: e.target.value }})}
                        />
                        <button 
                          type="button"
                          onClick={() => pickContact('fatherPhone')}
                          className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                          title="اختر من جهات الاتصال"
                        >
                          <Contact size={18} />
                        </button>
                      </div>
                      <input 
                        placeholder={t('fatherConfession')}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm outline-none text-slate-800 dark:text-slate-100"
                        value={formData.father?.confession}
                        onChange={e => setFormData({...formData, father: { ...formData.father!, confession: e.target.value }})}
                      />
                    </div>
                    <div className="space-y-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
                      <p className="text-xs font-bold text-pink-600 dark:text-pink-400">{t('mother')}</p>
                      <input 
                        placeholder={t('motherName')}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm outline-none text-slate-800 dark:text-slate-100"
                        value={formData.mother?.name}
                        onChange={e => setFormData({...formData, mother: { ...formData.mother!, name: e.target.value }})}
                      />
                      <input 
                        placeholder={t('motherJob')}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm outline-none text-slate-800 dark:text-slate-100"
                        value={formData.mother?.job}
                        onChange={e => setFormData({...formData, mother: { ...formData.mother!, job: e.target.value }})}
                      />
                      <div className="flex gap-2">
                        <input 
                          placeholder={t('motherPhone')}
                          className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm outline-none text-slate-800 dark:text-slate-100"
                          value={formData.mother?.phone}
                          onChange={e => setFormData({...formData, mother: { ...formData.mother!, phone: e.target.value }})}
                        />
                        <button 
                          type="button"
                          onClick={() => pickContact('motherPhone')}
                          className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                          title="اختر من جهات الاتصال"
                        >
                          <Contact size={18} />
                        </button>
                      </div>
                      <input 
                        placeholder={t('motherConfession')}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm outline-none text-slate-800 dark:text-slate-100"
                        value={formData.mother?.confession}
                        onChange={e => setFormData({...formData, mother: { ...formData.mother!, confession: e.target.value }})}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1 border-t border-slate-100 dark:border-slate-800 pt-6">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400">{t('servantNotes')}</label>
                  <textarea 
                    placeholder={t('servantNotesPlaceholder')}
                    rows={3}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none transition-all resize-none"
                    value={formData.notes}
                    onChange={e => setFormData({...formData, notes: e.target.value})}
                  />
                </div>
                
                <button 
                  type="submit"
                  className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100 mt-6"
                >
                  {editingId ? t('saveChanges') : t('addServantToService')}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Bottom Nav (Mobile Only) */}
      {view !== 'chat' && (
        <nav className="fixed bottom-0 left-0 w-full bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 px-6 py-3 flex justify-around items-center z-40 md:hidden transition-colors">
          <button onClick={() => setView('main')} className={`flex flex-col items-center gap-1 ${view === 'main' ? 'text-emerald-600' : 'text-slate-400'}`}>
            <LayoutDashboard size={20} />
            <span className="text-[10px] font-bold">الرئيسية</span>
          </button>
          <button onClick={() => { if(selectedMain && selectedSub) setView('attendance'); }} className={`flex flex-col items-center gap-1 ${view === 'attendance' ? 'text-emerald-600' : 'text-slate-400'}`}>
            <ClipboardList size={20} />
            <span className="text-[10px] font-bold">الحضور</span>
          </button>
          <button onClick={() => { if(selectedMain && selectedSub) setView('list'); }} className={`flex flex-col items-center gap-1 ${view === 'list' ? 'text-emerald-600' : 'text-slate-400'}`}>
            <Users size={20} />
            <span className="text-[10px] font-bold">المخدومين</span>
          </button>
        </nav>
      )}
      {/* Modals */}
      <AnimatePresence>
        {/* Image Preview Modal */}
        {previewImage && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setPreviewImage(null)}
              className="absolute inset-0 bg-black/90 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-4xl max-h-[90vh] z-10"
            >
              <img src={previewImage} alt="Preview" className="max-w-full max-h-[80vh] rounded-2xl shadow-2xl" referrerPolicy="no-referrer" />
              <button 
                onClick={() => setPreviewImage(null)}
                className="absolute -top-12 right-0 text-white hover:text-slate-300 transition-colors"
              >
                <X size={32} />
              </button>
            </motion.div>
          </div>
        )}

        {/* Trip Modal */}
        {isTripModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsTripModalOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border dark:border-slate-800"
            >
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-900/80 dark:backdrop-blur-md">
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">{editingTripId ? 'تعديل الرحلة' : 'إضافة رحلة جديدة'}</h3>
                <button onClick={() => setIsTripModalOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                  <X size={20} className="text-slate-400 dark:text-slate-500" />
                </button>
              </div>
              <form onSubmit={handleSaveTrip} className="p-6 space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400">اسم الرحلة</label>
                  <input 
                    required
                    type="text" 
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    value={tripFormData.name}
                    onChange={e => setTripFormData({...tripFormData, name: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400">تاريخ الرحلة</label>
                  <input 
                    required
                    type="date" 
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    value={tripFormData.date}
                    onChange={e => setTripFormData({...tripFormData, date: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400">الخدمة المستهدفة</label>
                  <select 
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    value={tripFormData.subService || 'all'}
                    onChange={e => setTripFormData({...tripFormData, subService: e.target.value})}
                  >
                    <option value="all">كل الخدمة ({selectedMain ? serviceStructure[selectedMain].label : ''})</option>
                    {selectedMain && serviceStructure[selectedMain].subServices.map(sub => (
                      <option key={sub} value={sub}>{serviceStructure[selectedMain].subServiceAliases?.[sub] || sub}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400">سعر الرحلة (للفرد)</label>
                  <div className="relative">
                    <DollarSign className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      required
                      type="number" 
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pr-10 pl-4 py-3 text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                      value={tripFormData.price}
                      onChange={e => setTripFormData({...tripFormData, price: Number(e.target.value)})}
                    />
                  </div>
                </div>
                <button type="submit" className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold">
                  حفظ الرحلة
                </button>
              </form>
            </motion.div>
          </div>
        )}

        {/* Settings Modal */}
        {showSettings && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" dir={settings.language === 'ar' ? 'rtl' : 'ltr'}>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSettings(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-white dark:bg-slate-950 w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-600 dark:text-slate-400">
                    <Settings size={24} />
                  </div>
                  <h2 className="text-2xl font-black text-slate-800 dark:text-white">{t('settings')}</h2>
                </div>
                <button onClick={() => setShowSettings(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-full transition-colors dark:text-white">
                  <X size={24} />
                </button>
              </div>

              <div className="p-8 space-y-8 overflow-y-auto max-h-[70vh]">
                {/* Language */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Languages size={18} />
                    <span className="text-xs font-black uppercase tracking-widest">{t('language')}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {['ar', 'en'].map(lang => (
                      <button
                        key={lang}
                        onClick={() => setSettings({ ...settings, language: lang })}
                        className={`py-3 rounded-2xl font-bold transition-all ${settings.language === lang ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200 dark:shadow-emerald-900/20' : 'bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                      >
                        {lang === 'ar' ? 'العربية' : 'English'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Layout Selector */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-slate-400">
                    <LayoutDashboard size={18} />
                    <span className="text-xs font-black uppercase tracking-widest">{t('layout')}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {(['default', 'topNav', 'compact'] as const).map(layoutKey => (
                      <button
                        key={layoutKey}
                        onClick={() => setSettings({ ...settings, layout: layoutKey === 'topNav' ? 'top-nav' : layoutKey as any })}
                        className={`py-3 rounded-2xl font-bold text-xs transition-all ${settings.layout === (layoutKey === 'topNav' ? 'top-nav' : layoutKey) ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200 dark:shadow-emerald-900/20' : 'bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                      >
                        {t(layoutKey as any)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Reading Mode */}
                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl ${settings.readingMode ? 'bg-amber-500 text-white' : 'bg-slate-200 text-slate-400'}`}>
                      <BookOpen size={20} />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 dark:text-white">{t('readingMode')}</p>
                      <p className="text-xs text-slate-400">{t('readingModeDesc')}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSettings({ ...settings, readingMode: !settings.readingMode })}
                    className={`w-14 h-8 rounded-full relative transition-all ${settings.readingMode ? 'bg-amber-600' : 'bg-slate-200'}`}
                  >
                    <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${settings.readingMode ? (settings.language === 'ar' ? 'right-7' : 'left-7') : (settings.language === 'ar' ? 'right-1' : 'left-1')}`} />
                  </button>
                </div>

                {/* Font Color */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Palette size={18} />
                    <span className="text-xs font-black uppercase tracking-widest">{t('fontColor')}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { name: 'Default', value: 'inherit' },
                      { name: 'Emerald', value: '#059669' },
                      { name: 'Blue', value: '#2563eb' },
                      { name: 'Indigo', value: '#4f46e5' },
                      { name: 'Rose', value: '#e11d48' },
                      { name: 'Amber', value: '#d97706' },
                      { name: 'Sky', value: '#0ea5e9' }
                    ].map(color => (
                      <button
                        key={color.value}
                        onClick={() => setSettings({ ...settings, textColor: color.value })}
                        className={`w-10 h-10 rounded-full border-2 transition-all flex items-center justify-center ${settings.textColor === color.value ? 'border-emerald-500 scale-110' : 'border-transparent'}`}
                        style={{ backgroundColor: color.value === 'inherit' ? (settings.darkMode ? '#e2e8f0' : '#1e293b') : color.value }}
                        title={color.name}
                      >
                        {settings.textColor === color.value && <Check size={16} className={color.value === 'inherit' ? (settings.darkMode ? 'text-slate-900' : 'text-white') : 'text-white'} />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Night Mode */}
                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl ${settings.darkMode ? 'bg-indigo-500 text-white' : 'bg-amber-500 text-white'}`}>
                      {settings.darkMode ? <Moon size={20} /> : <Sun size={20} />}
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 dark:text-white">{t('darkMode')}</p>
                      <p className="text-xs text-slate-400">{t('darkModeDesc')}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSettings({ ...settings, darkMode: !settings.darkMode })}
                    className={`w-14 h-8 rounded-full relative transition-all ${settings.darkMode ? 'bg-indigo-600' : 'bg-slate-200'}`}
                  >
                    <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${settings.darkMode ? (settings.language === 'ar' ? 'right-7' : 'left-7') : (settings.language === 'ar' ? 'right-1' : 'left-1')}`} />
                  </button>
                </div>

                {/* Font Size */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Type size={18} />
                    <span className="text-xs font-black uppercase tracking-widest">{t('fontSize')}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {['small', 'medium', 'large'].map(size => (
                      <button
                        key={size}
                        onClick={() => setSettings({ ...settings, fontSize: size })}
                        className={`py-3 rounded-2xl font-bold transition-all ${settings.fontSize === size ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200 dark:shadow-emerald-900/20' : 'bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                      >
                        {t(size as any)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Font Family */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Type size={18} />
                    <span className="text-xs font-black uppercase tracking-widest">{t('fontFamily')}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {['sans', 'serif', 'mono'].map(family => (
                      <button
                        key={family}
                        onClick={() => setSettings({ ...settings, fontFamily: family })}
                        className={`py-3 rounded-2xl font-bold transition-all ${settings.fontFamily === family ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200 dark:shadow-emerald-900/20' : 'bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                        style={{ fontFamily: family === 'sans' ? 'sans-serif' : family === 'serif' ? 'serif' : 'monospace' }}
                      >
                        {t(family as any)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Date & Time Settings */}
                <div className="space-y-6 pt-6 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Clock size={18} />
                    <span className="text-xs font-black uppercase tracking-widest">{t('dateTimeSettings')}</span>
                  </div>
                  
                  <div className="space-y-3">
                    <p className="text-xs font-bold text-slate-500 dark:text-slate-400">{t('dateFormat')}</p>
                    <div className="grid grid-cols-3 gap-2">
                      {['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD'].map(format => (
                        <button
                          key={format}
                          onClick={() => setSettings({ ...settings, dateFormat: format })}
                          className={`py-2 px-1 rounded-xl text-[10px] font-bold transition-all ${settings.dateFormat === format ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 dark:shadow-blue-900/20' : 'bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                        >
                          {format}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <p className="text-xs font-bold text-slate-500 dark:text-slate-400">{t('timeFormat')}</p>
                    <div className="grid grid-cols-2 gap-2">
                      {['12h', '24h'].map(format => (
                        <button
                          key={format}
                          onClick={() => setSettings({ ...settings, timeFormat: format })}
                          className={`py-3 rounded-2xl font-bold transition-all ${settings.timeFormat === format ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 dark:shadow-blue-900/20' : 'bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                        >
                          {format === '12h' ? t('h12') : t('h24')}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Floating Chat Toggle */}
                  <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-emerald-500 text-white rounded-xl">
                        <MessageSquare size={20} />
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 dark:text-white">إظهار أيقونة الدردشة دائماً</p>
                        <p className="text-[10px] text-slate-400">تكون أيقونة الدردشة العائمة ظاهرة دائماً على الشاشة</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setSettings({ ...settings, isFloatingChatEnabled: !settings.isFloatingChatEnabled })}
                      className={`w-14 h-8 rounded-full relative transition-all ${settings.isFloatingChatEnabled ? 'bg-emerald-600' : 'bg-slate-200'}`}
                    >
                      <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${settings.isFloatingChatEnabled ? (settings.language === 'ar' ? 'right-7' : 'left-7') : (settings.language === 'ar' ? 'right-1' : 'left-1')}`} />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Coptic Agenda Modal */}
        {showAgenda && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" dir={settings.language === 'ar' ? 'rtl' : 'ltr'}>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAgenda(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-white dark:bg-slate-950 w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
            >
              <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-indigo-600 text-white">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                    <CalendarDays size={24} />
                  </div>
                  <h2 className="text-2xl font-black">{t('agendaTitle')}</h2>
                </div>
                <button onClick={() => setShowAgenda(false)} className="p-2 hover:bg-white/20 rounded-full transition-colors">
                  <X size={24} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {COPTIC_HOLIDAYS.map((holiday, idx) => (
                    <div key={idx} className="p-4 bg-slate-50 dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 flex items-center justify-between group hover:border-indigo-200 dark:hover:border-indigo-900 transition-all">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform">
                          <Church size={20} />
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 dark:text-white">
                            {settings.language === 'ar' ? holiday.name : holiday.enName}
                          </p>
                          <div className="flex items-center gap-2">
                            <p className="text-xs text-slate-400">{t('copticFeast')}</p>
                            {(settings.language === 'ar' ? holiday.note : holiday.enNote) && (
                              <span className="text-[10px] bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-full font-bold">
                                {settings.language === 'ar' ? holiday.note : holiday.enNote}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="bg-white dark:bg-slate-700 px-3 py-1 rounded-xl text-xs font-black text-indigo-600 dark:text-indigo-400 shadow-sm">
                        {settings.language === 'ar' ? holiday.date : holiday.enDate}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Attendance Report Modal */}
        {showReport && (
          <ReportModal 
            showReport={showReport}
            setShowReport={setShowReport}
            servants={servants}
            attendance={attendance}
            reportType={reportType}
            setReportType={setReportType}
            reportMonth={reportMonth}
            setReportMonth={setReportMonth}
            settings={settings}
            t={t}
            getFridaysOfYear={getFridaysOfYear}
            getFridaysOfMonth={getFridaysOfMonth}
            toLocalDateString={toLocalDateString}
            formatDate={formatDate}
          />
        )}

        {/* General Report Modal */}
        {showGeneralReport && selectedMain && selectedSub && (
          <GeneralReportModal 
            showGeneralReport={showGeneralReport}
            setShowGeneralReport={setShowGeneralReport}
            selectedMain={selectedMain}
            selectedSub={selectedSub}
            SERVICE_STRUCTURE={serviceStructure}
            classServants={classServants}
            attendance={attendance}
            reportType={reportType}
            setReportType={setReportType}
            reportMonth={reportMonth}
            setReportMonth={setReportMonth}
            setShowReport={setShowReport}
            settings={settings}
            t={t}
            getFridaysOfYear={getFridaysOfYear}
            getFridaysOfMonth={getFridaysOfMonth}
            toLocalDateString={toLocalDateString}
            formatDate={formatDate}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isBatchWhatsAppModalOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setIsBatchWhatsAppModalOpen(false)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" 
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }} 
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={e => e.stopPropagation()}
              className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-2xl flex items-center justify-center shadow-inner">
                    <CheckCircle size={24} />
                  </div>
                  <div>
                    <h3 className="font-black text-xl text-slate-800 dark:text-slate-100">إرسال تحذير غياب جماعي</h3>
                    <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1">
                      {import.meta.env.VITE_ULTRAMSG_TOKEN ? 'سيتم الإرسال في الخلفية عبر UltraMsg' : 'سيتم فتح محادثات واتساب لكل الغائبين'}
                    </p>
                  </div>
                </div>
                <button onClick={() => setIsBatchWhatsAppModalOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
                  <X size={24} />
                </button>
              </div>

              <div className="p-8 overflow-y-auto flex-1 custom-scrollbar space-y-8">
                {!import.meta.env.VITE_ULTRAMSG_TOKEN && (
                  <div className="bg-amber-50 dark:bg-amber-900/20 p-6 rounded-3xl border border-amber-100 dark:border-amber-800/30">
                    <div className="flex gap-4">
                      <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/40 text-amber-600 rounded-xl flex items-center justify-center shrink-0">
                        <AlertCircle size={20} />
                      </div>
                      <div className="text-sm text-amber-900 dark:text-amber-200 leading-relaxed">
                        <p className="font-black text-base mb-2">تنبيه هام:</p>
                        <p className="font-medium">يرجى التأكد من السماح بفتح النوافذ المنبثقة (Pop-ups) في المتصفح ليتمكن التطبيق من فتح محادثات واتساب تلقائياً.</p>
                      </div>
                    </div>
                  </div>
                )}
                <div className="space-y-6">
                  {(() => {
                    const records = attendance.find(r => r.date === selectedDate)?.records || {};
                    const absentees = filteredServants.filter(s => !records[s.id]?.service);
                    
                    if (absentees.length === 0) {
                      return (
                        <div className="text-center py-16">
                          <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle size={40} className="text-slate-200 dark:text-slate-700" />
                          </div>
                          <p className="font-bold text-slate-400 dark:text-slate-500">لا يوجد غائبين في هذا اليوم</p>
                        </div>
                      );
                    }

                    return (
                      <>
                        <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                            <span className="text-sm font-black text-slate-600 dark:text-slate-300">عدد الغائبين: {absentees.length}</span>
                          </div>
                          <button 
                            onClick={async () => {
                              for (const s of absentees) {
                                if (s.father?.phone) {
                                  await sendAbsenceMessage(s.father.phone, s.name, selectedDate);
                                  await new Promise(r => setTimeout(r, 1200));
                                }
                                if (s.mother?.phone) {
                                  await sendAbsenceMessage(s.mother.phone, s.name, selectedDate);
                                  await new Promise(r => setTimeout(r, 1200));
                                }
                              }
                            }}
                            className="bg-emerald-600 text-white px-8 py-3 rounded-2xl font-black text-sm shadow-xl shadow-emerald-100 dark:shadow-none hover:scale-105 active:scale-95 transition-all"
                          >
                            إرسال للكل الآن
                          </button>
                        </div>
                        <div className="space-y-3">
                          {absentees.map(s => (
                            <div key={s.id} className="p-5 bg-white dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800 rounded-3xl flex items-center justify-between group hover:border-emerald-200 dark:hover:border-emerald-900/30 transition-all">
                              <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-2xl flex items-center justify-center font-black text-lg">
                                  {s.name[0]}
                                </div>
                                <div>
                                  <p className="font-black text-slate-800 dark:text-slate-100">{s.name}</p>
                                  <div className="flex gap-2 mt-1">
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${s.father?.phone ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20' : 'bg-slate-50 text-slate-400 dark:bg-slate-800'}`}>
                                      {s.father?.phone ? 'الأب متوفر' : 'الأب غير متوفر'}
                                    </span>
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${s.mother?.phone ? 'bg-pink-50 text-pink-600 dark:bg-pink-900/20' : 'bg-slate-50 text-slate-400 dark:bg-slate-800'}`}>
                                      {s.mother?.phone ? 'الأم متوفرة' : 'الأم غير متوفرة'}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                {s.father?.phone && (
                                  <button 
                                    onClick={() => sendAbsenceMessage(s.father!.phone!, s.name, selectedDate)}
                                    className="w-11 h-11 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
                                    title="إرسال للأب"
                                  >
                                    <UserIcon size={20} />
                                  </button>
                                )}
                                {s.mother?.phone && (
                                  <button 
                                    onClick={() => sendAbsenceMessage(s.mother!.phone!, s.name, selectedDate)}
                                    className="w-11 h-11 bg-pink-50 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400 rounded-xl flex items-center justify-center hover:bg-pink-100 dark:hover:bg-pink-900/40 transition-colors"
                                    title="إرسال للأم"
                                  >
                                    <Heart size={20} />
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Service Modal */}
      <AnimatePresence>
        {isAddServiceModalOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
              onClick={() => setIsAddServiceModalOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={e => e.stopPropagation()}
              className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center flex-shrink-0">
                <h3 className="font-black text-xl text-slate-800 dark:text-slate-100">{newServiceForm.id ? 'تعديل الخدمة' : 'إضافة خدمة جديدة'}</h3>
                <button onClick={() => setIsAddServiceModalOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
                  <X size={24} />
                </button>
              </div>
              <div className="p-8 space-y-6 overflow-y-auto flex-1 custom-scrollbar">
                <div className="flex gap-4 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl">
                  <button 
                    onClick={() => setNewServiceForm({ ...newServiceForm, type: 'main' })}
                    className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${newServiceForm.type === 'main' ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-sm' : 'text-slate-500'}`}
                  >
                    خدمة رئيسية
                  </button>
                  <button 
                    onClick={() => setNewServiceForm({ ...newServiceForm, type: 'sub' })}
                    className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${newServiceForm.type === 'sub' ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-sm' : 'text-slate-500'}`}
                  >
                    خدمة فرعية
                  </button>
                </div>

                {newServiceForm.type === 'sub' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase mb-2">الخدمة الرئيسية التابعة لها</label>
                      <select 
                        className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all dark:text-slate-100"
                        value={newServiceForm.parentId}
                        onChange={e => setNewServiceForm({ ...newServiceForm, parentId: e.target.value })}
                      >
                        <option value="">اختر الخدمة الرئيسية...</option>
                        {Object.entries(serviceStructure).map(([id, s]) => (
                          <option key={id} value={id}>{(s as Service).label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase mb-2">الاسم المستعار (اختياري)</label>
                      <input 
                        type="text"
                        className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all dark:text-slate-100"
                        placeholder="مثلاً: أولى إعدادي"
                        value={newServiceForm.alias}
                        onChange={e => setNewServiceForm({ ...newServiceForm, alias: e.target.value })}
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2">
                    {newServiceForm.type === 'main' ? 'اسم الخدمة الرئيسية' : 'اسم الخدمة الفرعية'}
                  </label>
                  <input 
                    type="text"
                    className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all dark:text-slate-100"
                    placeholder={newServiceForm.type === 'main' ? "مثلاً: خدمة إعداد خدام" : "مثلاً: فصل أولى إعدادي"}
                    value={newServiceForm.label}
                    onChange={e => setNewServiceForm({ ...newServiceForm, label: e.target.value })}
                  />
                </div>

                {newServiceForm.type === 'main' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-2">الفصول / المراحل الفرعية (اختياري)</label>
                    <div className="space-y-4">
                      {newServiceForm.subServices.map((sub, idx) => (
                        <div key={idx} className="flex gap-2">
                          <div className="flex-1 space-y-2">
                            <input 
                              type="text"
                              className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all dark:text-slate-100"
                              placeholder={`اسم الفصل ${idx + 1}`}
                              value={sub}
                              onChange={e => {
                                const newSubs = [...newServiceForm.subServices];
                                newSubs[idx] = e.target.value;
                                setNewServiceForm({ ...newServiceForm, subServices: newSubs });
                              }}
                            />
                            <input 
                              type="text"
                              className="w-full bg-slate-50/50 dark:bg-slate-800/50 border-none rounded-2xl px-4 py-2 text-xs outline-none focus:ring-2 focus:ring-blue-500 transition-all dark:text-slate-100"
                              placeholder={`الاسم المستعار للفصل ${idx + 1} (اختياري)`}
                              value={newServiceForm.subServiceAliases[idx] || ''}
                              onChange={e => {
                                const newAliases = [...newServiceForm.subServiceAliases];
                                newAliases[idx] = e.target.value;
                                setNewServiceForm({ ...newServiceForm, subServiceAliases: newAliases });
                              }}
                            />
                          </div>
                          {newServiceForm.subServices.length > 1 && (
                            <button 
                              onClick={() => {
                                setNewServiceForm({ 
                                  ...newServiceForm, 
                                  subServices: newServiceForm.subServices.filter((_, i) => i !== idx),
                                  subServiceAliases: newServiceForm.subServiceAliases.filter((_, i) => i !== idx)
                                });
                              }}
                              className="p-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors self-start"
                            >
                              <X size={18} />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                    <button 
                      onClick={() => setNewServiceForm({ 
                        ...newServiceForm, 
                        subServices: [...newServiceForm.subServices, ''],
                        subServiceAliases: [...newServiceForm.subServiceAliases, '']
                      })}
                      className="mt-3 text-xs font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1 hover:bg-blue-50 dark:hover:bg-blue-900/20 px-3 py-1.5 rounded-lg transition-all"
                    >
                      <Plus size={14} />
                      إضافة فصل آخر
                    </button>
                  </div>
                )}
              </div>
              <div className="p-8 border-t border-slate-100 dark:border-slate-800 flex-shrink-0">
                <button 
                  onClick={handleCreateService}
                  disabled={!newServiceForm.label || (newServiceForm.type === 'sub' && !newServiceForm.parentId)}
                  className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black shadow-lg shadow-blue-200 dark:shadow-none hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {newServiceForm.type === 'main' ? (newServiceForm.id ? 'حفظ التعديلات' : 'إنشاء الخدمة الرئيسية') : (newServiceForm.id ? 'حفظ التعديلات' : 'إضافة الخدمة الفرعية')}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
