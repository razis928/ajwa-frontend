/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Boxes,
  Utensils,
  Calculator,
  CreditCard,
  Truck,
  Users,
  UserCheck,
  Wallet,
  Settings,
  BarChart3,
  Crown,
} from 'lucide-react';
import { navItems } from '../routes';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  '/': LayoutDashboard,
  '/inventory': Boxes,
  '/menu': Utensils,
  '/pos': Calculator,
  '/accounts': CreditCard,
  '/vendors': Truck,
  '/customers': Users,
  '/employees': UserCheck,
  '/credits': Wallet,
  '/reports': BarChart3,
};

export const Sidebar: React.FC = () => {
  return (
    <aside className="fixed left-0 top-0 h-screen w-64 border-r border-ajwa-gold/25 bg-gradient-to-b from-ajwa-forest-dark via-ajwa-forest to-ajwa-forest-light flex flex-col z-40">
      <div className="p-6 flex flex-col gap-2 border-b border-ajwa-gold/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-ajwa-gold to-ajwa-gold-light flex items-center justify-center shadow-lg shadow-ajwa-gold/20 border border-ajwa-gold/50">
            <Crown className="w-5 h-5 text-ajwa-forest-dark" />
          </div>
          <div>
            <h1
              className="ajwa-urdu text-lg font-bold tracking-tight text-ajwa-gold-light leading-tight"
            >
              عجوہ
            </h1>
            <p className="ajwa-urdu text-[10px] font-semibold text-white/60">
              فیملی ریسٹورنٹ
            </p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 mt-6 flex flex-col gap-1">
        {navItems.map((item) => {
          const IconComponent = iconMap[item.path];
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${
                  isActive ? 'nav-active' : 'nav-inactive'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <IconComponent className={`w-5 h-5 ${isActive ? 'text-ajwa-gold' : 'text-white/40'}`} />
                  <span>{item.label}</span>
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      <div className="p-6 border-t border-ajwa-gold/20 bg-ajwa-forest-dark/60">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-ajwa-gold to-ajwa-gold-light flex items-center justify-center font-bold text-ajwa-forest-dark shadow-lg shadow-ajwa-gold/20">
            AK
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-ajwa-gold-light truncate">Ahmed Khan</p>
            <p className="text-xs text-white/50 truncate">Manager</p>
          </div>
          <button className="text-white/40 hover:text-ajwa-gold transition-colors">
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
