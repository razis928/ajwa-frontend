import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { TopAppBar } from '../components/TopAppBar';
import { useApp } from '../context/AppContext';
import { Info, CheckCircle, AlertTriangle, X, MapPin, Phone } from 'lucide-react';

export const AppLayout: React.FC = () => {
  const { toast, clearToast } = useApp();
  const location = useLocation();
  const isPos = location.pathname === '/pos';

  return (
    <div className="min-h-screen content-bg flex font-sans">
      <Sidebar />

      <div className="flex-1 ml-64 flex flex-col min-h-screen relative overflow-hidden">
        <TopAppBar />

        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>

        {!isPos && (
          <footer className="shrink-0 border-t border-ajwa-gold/25 bg-gradient-to-r from-ajwa-forest-dark via-ajwa-forest to-ajwa-forest-light flex justify-between items-center px-8 py-4 text-xs font-medium text-white/60 z-10 select-none">
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-ajwa-gold" />
              <p>Jallandhar Pull, Gojra Road, Faisalabad</p>
            </div>
            <p className="font-bold text-ajwa-gold-light hidden sm:block" style={{ fontFamily: 'var(--font-display)' }}>
              Ajwa Family Restaurant
            </p>
            <div className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-ajwa-gold" />
              <span className="text-ajwa-gold-light font-semibold">0300-1190267</span>
            </div>
          </footer>
        )}
      </div>

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-ajwa-forest border border-ajwa-gold/30 rounded-2xl shadow-2xl shadow-ajwa-gold/10 p-4 flex items-start gap-3 w-80 animate-slide-in-right">
          {toast.type === 'success' && (
            <span className="p-1 rounded-lg bg-ajwa-gold/20 text-ajwa-gold mt-0.5">
              <CheckCircle className="w-4 h-4" />
            </span>
          )}
          {toast.type === 'error' && (
            <span className="p-1 rounded-lg bg-red-500/20 text-red-400 mt-0.5">
              <AlertTriangle className="w-4 h-4" />
            </span>
          )}
          {toast.type === 'info' && (
            <span className="p-1 rounded-lg bg-ajwa-forest-light text-white/70 mt-0.5">
              <Info className="w-4 h-4" />
            </span>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-ajwa-gold-light">{toast.message}</p>
          </div>
          <button onClick={clearToast} className="text-white/40 hover:text-white transition-all cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
