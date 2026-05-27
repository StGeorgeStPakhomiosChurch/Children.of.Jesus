import React from 'react';
import { Menu, ArrowRight, ArrowLeft, User as UserIcon, Church } from 'lucide-react';
import { User } from '../types';

interface HeaderProps {
  view: string;
  setView: (view: any) => void;
  setIsSidebarOpen: (isOpen: boolean) => void;
  settings: {
    language: 'ar' | 'en';
    darkMode: boolean;
    layout: 'default' | 'top-nav' | 'compact';
    theme: 'default';
  };
  currentUser: User | null;
  setProfileFormData: (user: User | null) => void;
  t: (key: any) => string;
}

export const Header: React.FC<HeaderProps> = ({
  view,
  setView,
  setIsSidebarOpen,
  settings,
  currentUser,
  setProfileFormData,
  t
}) => {
  return (
    <header className="px-4 py-3 flex items-center justify-between transition-colors">
      <div className="flex items-center gap-3">
        {view !== 'main' ? (
          <button onClick={() => setView('main')} className="p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
            {settings.language === 'ar' ? <ArrowRight size={20} /> : <ArrowLeft size={20} />}
          </button>
        ) : settings.layout !== 'top-nav' ? (
          <button onClick={() => setIsSidebarOpen(true)} className="p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
            <Menu size={20} />
          </button>
        ) : null}
        
        <div className="min-w-0">
          <h1 className="font-black text-slate-800 dark:text-slate-100 leading-tight break-words text-base sm:text-lg">
            {t('churchName')}
          </h1>
          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mt-0.5">
            {t('churchSubName')}
          </p>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        {currentUser && (
          <button 
            onClick={() => { setProfileFormData(currentUser); setView('profile'); }}
            className="w-10 h-10 rounded-full border-2 border-emerald-100 dark:border-emerald-900/30 overflow-hidden shadow-sm hover:scale-105 transition-transform"
          >
            {currentUser.photo ? (
              <img src={currentUser.photo} alt={currentUser.fullName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              <div className="w-full h-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <UserIcon size={20} />
              </div>
            )}
          </button>
        )}
      </div>
    </header>
  );
};
