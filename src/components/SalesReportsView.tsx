/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  BarChart3,
  TrendingUp,
  Calendar,
  Download,
  DollarSign,
  ShoppingBag,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LineChart,
  Line,
} from 'recharts';
import {
  computeTopSellingItems,
  computeRevenueByDay,
  computePeriodRevenue,
} from '../lib/reports';
import { formatPKR, formatPKRCompact } from '../lib/currency';

export const SalesReportsView: React.FC = () => {
  const { ordersHistory, menuItems, grossRevenue, totalOrdersCount, showToast } = useApp();

  const topItems = useMemo(
    () => computeTopSellingItems(ordersHistory, menuItems, 10),
    [ordersHistory, menuItems]
  );

  const dailyRevenue = useMemo(
    () => computeRevenueByDay(ordersHistory, 30),
    [ordersHistory]
  );

  const weeklyRevenue = useMemo(() => computePeriodRevenue(ordersHistory, 7), [ordersHistory]);
  const monthlyRevenue = useMemo(() => computePeriodRevenue(ordersHistory, 30), [ordersHistory]);

  const handleExport = () => {
    const rows = [
      ['Item', 'Qty Sold', 'Revenue (PKR)'],
      ...topItems.map(i => [i.name, i.qtySold, formatPKR(i.revenue)]),
    ];
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sales-report.csv';
    a.click();
    URL.revokeObjectURL(url);
    showToast('Sales report exported successfully', 'success');
  };

  return (
    <div className="px-6 pt-6 pb-24">
      <div className="flex flex-col sm:flex-row justify-between sm:items-end mb-6 gap-4">
        <div>
          <h2 className="page-title">Sales & Revenue Reports</h2>
          <p className="page-subtitle">
            Detailed daily, weekly, and monthly sales performance analytics.
          </p>
        </div>
        <button onClick={handleExport} className="btn-primary flex items-center gap-2">
          <Download className="w-3.5 h-3.5" />
          Export CSV
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <div className="card p-5">
          <div className="flex justify-between items-start mb-3">
            <span className="p-2.5 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-500 text-black">
              <DollarSign className="w-5 h-5" />
            </span>
          </div>
          <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Total Revenue</p>
          <h3 className="text-2xl font-bold text-zinc-900 mt-1.5">
            {formatPKR(grossRevenue)}
          </h3>
        </div>

        <div className="card p-5">
          <div className="flex justify-between items-start mb-3">
            <span className="p-2.5 rounded-xl bg-zinc-100 text-zinc-700">
              <Calendar className="w-5 h-5" />
            </span>
          </div>
          <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">This Week</p>
          <h3 className="text-2xl font-bold text-zinc-900 mt-1.5">
            {formatPKR(weeklyRevenue)}
          </h3>
        </div>

        <div className="card p-5">
          <div className="flex justify-between items-start mb-3">
            <span className="p-2.5 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-500 text-black">
              <TrendingUp className="w-5 h-5" />
            </span>
          </div>
          <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">This Month</p>
          <h3 className="text-2xl font-bold text-zinc-900 mt-1.5">
            {formatPKR(monthlyRevenue)}
          </h3>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
        <div className="lg:col-span-7 card p-5">
          <h4 className="text-sm font-bold text-zinc-900 mb-4 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-amber-500" />
            Daily Revenue
          </h4>
          <div className="h-[260px]">
            {dailyRevenue.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
                  <XAxis dataKey="date" tick={{ fill: '#a1a1aa', fontSize: 10 }} />
                  <YAxis tick={{ fill: '#a1a1aa', fontSize: 10 }} tickFormatter={v => formatPKRCompact(v)} />
                  <Tooltip formatter={(value: number | undefined) => formatPKR(value ?? 0)} />
                  <Bar dataKey="revenue" fill="#fbbf24" radius={[4, 4, 0, 0]} name="Revenue" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-zinc-400">
                Process POS orders to see daily revenue data.
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-5 card p-5">
          <h4 className="text-sm font-bold text-zinc-900 mb-4 flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-amber-500" />
            Order Volume
          </h4>
          <div className="h-[260px]">
            {dailyRevenue.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dailyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
                  <XAxis dataKey="date" tick={{ fill: '#a1a1aa', fontSize: 10 }} />
                  <YAxis tick={{ fill: '#a1a1aa', fontSize: 10 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="orders" stroke="#eab308" strokeWidth={2} name="Orders" />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-zinc-400">
                No order data yet.
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="p-4 border-b border-zinc-100 bg-gradient-to-r from-zinc-900 to-zinc-800 flex justify-between items-center">
          <h3 className="text-xs font-bold text-amber-300 uppercase tracking-wider">Top Selling Items</h3>
          <span className="text-xs text-zinc-400">{totalOrdersCount.toLocaleString()} total orders</span>
        </div>
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-zinc-200 text-zinc-400 font-bold uppercase tracking-wider bg-zinc-50">
              <th className="px-6 py-3">#</th>
              <th className="px-6 py-3">Dish Name</th>
              <th className="px-6 py-3 text-right">Qty Sold</th>
              <th className="px-6 py-3 text-right">Revenue</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {topItems.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-8 text-zinc-400">
                  No sales data yet. Complete POS orders to populate reports.
                </td>
              </tr>
            ) : (
              topItems.map((item, idx) => (
                <tr key={item.menuItemId} className="hover:bg-amber-50/30 transition-colors">
                  <td className="px-6 py-3 font-bold text-amber-600">{idx + 1}</td>
                  <td className="px-6 py-3 font-bold text-zinc-800">{item.name}</td>
                  <td className="px-6 py-3 text-right text-zinc-600">{item.qtySold}</td>
                  <td className="px-6 py-3 text-right font-bold font-mono text-zinc-900">
                    {formatPKR(item.revenue)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
