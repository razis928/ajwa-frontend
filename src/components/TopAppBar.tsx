/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Search, MapPin, Bell, Phone, Settings, X, Info } from 'lucide-react';

export const TopAppBar: React.FC = () => {
  const { searchQuery, setSearchQuery, activities, lowStockItems, showToast } = useApp();
  const [showLocationMenu, setShowLocationMenu] = useState(false);
  const [currentLocation, setCurrentLocation] = useState('Jallandhar Pull, Faisalabad');
  const [showNotifications, setShowNotifications] = useState(false);

  const locations = [
    'Jallandhar Pull, Faisalabad',
    'Gojra Road Branch',
    'D-Ground Branch',
  ];

  const handleLocationSwitch = (loc: string) => {
    setCurrentLocation(loc);
    setShowLocationMenu(false);
    showToast(`Switched to: ${loc}`, 'info');
  };

  const stockAlerts = activities.filter(a => a.type === 'stock');
  const alertCount = lowStockItems.length + stockAlerts.length;

  return (
    <header className="sticky top-0 right-0 z-30 flex justify-between items-center px-6 w-full h-16 bg-gradient-to-r from-ajwa-forest-dark via-ajwa-forest to-ajwa-forest-light border-b border-ajwa-gold/25">
      <div className="flex items-center gap-4">
        <div className="relative w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search menu, orders, or staff..."
            className="w-full pl-9 pr-4 py-1.5 bg-ajwa-forest-dark/60 border border-ajwa-gold/20 rounded-xl text-sm font-sans text-white/90 placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-ajwa-gold/30 focus:border-ajwa-gold transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-ajwa-forest-dark/50 border border-ajwa-gold/20 rounded-full">
          <Phone className="w-3.5 h-3.5 text-ajwa-gold" />
          <span className="text-[11px] font-sans font-semibold text-white/70">
            0300-1190267
          </span>
        </div>

        <div className="relative">
          <button
            onClick={() => setShowLocationMenu(!showLocationMenu)}
            className="flex items-center gap-1.5 text-white/60 hover:text-ajwa-gold-light px-3 py-1.5 rounded-xl hover:bg-ajwa-forest-dark/50 transition-all cursor-pointer"
          >
            <MapPin className="w-4 h-4 text-ajwa-gold" />
            <span className="text-xs font-semibold font-sans max-w-[180px] truncate">{currentLocation}</span>
          </button>

          {showLocationMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-ajwa-forest border border-ajwa-gold/25 rounded-xl shadow-lg z-50 p-1">
              <div className="px-3 py-1.5 text-[10px] font-bold text-white/40 uppercase tracking-wider">
                Select Branch
              </div>
              {locations.map(loc => (
                <button
                  key={loc}
                  onClick={() => handleLocationSwitch(loc)}
                  className={`w-full text-left px-3 py-2 text-xs rounded-lg transition-all cursor-pointer ${
                    currentLocation === loc
                      ? 'bg-ajwa-gold/20 text-ajwa-gold-light font-semibold'
                      : 'text-white/70 hover:bg-ajwa-forest-dark/60'
                  }`}
                >
                  {loc}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="w-9 h-9 flex items-center justify-center text-white/50 hover:text-ajwa-gold-light hover:bg-ajwa-forest-dark/50 rounded-full cursor-pointer transition-all relative"
            >
              <Bell className="w-4 h-4" />
              {alertCount > 0 && (
                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-ajwa-gold rounded-full ring-2 ring-ajwa-forest" />
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-ajwa-forest border border-ajwa-gold/25 rounded-xl shadow-lg z-50 p-1">
                <div className="flex items-center justify-between px-3 py-2 border-b border-ajwa-gold/15">
                  <span className="text-[10px] font-bold text-ajwa-gold uppercase tracking-wider">
                    Alerts ({alertCount})
                  </span>
                  <button onClick={() => setShowNotifications(false)} className="text-white/40 hover:text-white/70 text-xs">
                    Close
                  </button>
                </div>
                <div className="max-h-60 overflow-y-auto p-1 space-y-1">
                  {lowStockItems.map(item => (
                    <div key={item.id} className="p-2 hover:bg-ajwa-gold/10 rounded-lg flex gap-2 border border-transparent hover:border-ajwa-gold/20 transition-all">
                      <Info className="w-4 h-4 text-ajwa-gold shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-bold text-ajwa-gold-light">Low Stock: {item.name}</p>
                        <p className="text-[10px] text-white/50 mt-0.5">{item.stock} {item.unit} remaining (min: {item.minThreshold})</p>
                      </div>
                    </div>
                  ))}
                  {stockAlerts.map(alert => (
                    <div key={alert.id} className="p-2 hover:bg-ajwa-gold/10 rounded-lg flex gap-2">
                      <Info className="w-4 h-4 text-ajwa-gold shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-bold text-ajwa-gold-light">{alert.message}</p>
                        <p className="text-[10px] text-white/50 mt-0.5">{alert.details}</p>
                      </div>
                    </div>
                  ))}
                  {alertCount === 0 && (
                    <div className="p-4 text-center text-xs text-white/40">
                      No inventory alerts.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <button className="w-9 h-9 flex items-center justify-center text-white/50 hover:text-ajwa-gold-light hover:bg-ajwa-forest-dark/50 rounded-full cursor-pointer transition-all">
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
