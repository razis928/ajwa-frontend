/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { 
  DollarSign, Receipt, TrendingUp, AlertTriangle, FileText, ArrowRight,
  Filter, ShoppingBag, UserCheck, CheckCircle2, Download, Calendar,
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { REVENUE_DATA_30_DAYS } from '../data';
import { computeTopSellingItems } from '../lib/reports';
import { formatPKR, formatPKRCompact } from '../lib/currency';

export const DashboardOverview: React.FC = () => {
  const { 
    grossRevenue, totalOrdersCount, avgOrderValue, netProfit,
    lowStockItems, reorderItem, activities, ordersHistory, menuItems,
    invoices, showToast,
  } = useApp();
  const navigate = useNavigate();

  const topItems = useMemo(
    () => computeTopSellingItems(ordersHistory, menuItems, 5),
    [ordersHistory, menuItems]
  );

  const pendingInvoices = invoices.filter(i => i.status === 'Pending' || i.status === 'Overdue').length;

  const chartData = useMemo(() => {
    const dynamic = ordersHistory
      .filter(o => o.status === 'Paid')
      .reduce((sum, o) => sum + o.total, 0);
    if (dynamic === 0) return REVENUE_DATA_30_DAYS;
    return REVENUE_DATA_30_DAYS.map((d, i) =>
      i === REVENUE_DATA_30_DAYS.length - 1
        ? { ...d, revenue: d.revenue + dynamic }
        : d
    );
  }, [ordersHistory]);

  const handleExport = () => {
    showToast('Exporting business operations CSV report...', 'success');
  };

  return (
    <div className="px-6 pt-6 pb-24">
      <div className="flex flex-col sm:flex-row justify-between sm:items-end mb-6 gap-4">
        <div>
          <h2 className="page-title">Dashboard & Analytics</h2>
          <p className="page-subtitle">
            Real-time overview of your restaurant's performance and operational insights.
          </p>
        </div>
        <div className="flex gap-2">
          <button className="btn-secondary flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5" />
            Last 30 Days
          </button>
          <button onClick={handleExport} className="btn-primary flex items-center gap-2">
            <Download className="w-3.5 h-3.5" />
            Export Report
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { label: 'Gross Revenue', value: formatPKR(grossRevenue), icon: DollarSign, trend: '+12.5%' },
          { label: 'Total Orders', value: totalOrdersCount.toLocaleString('en-PK'), icon: Receipt, trend: '+4.2%' },
          { label: 'Avg. Order Value', value: formatPKR(avgOrderValue), icon: TrendingUp, trend: '-2.1%', down: true },
          { label: 'Net Profit', value: formatPKR(netProfit), icon: TrendingUp, trend: '+18.3%' },
        ].map((kpi) => (
          <div key={kpi.label} className="card p-5">
            <div className="flex justify-between items-start mb-3">
              <span className="p-2.5 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-500 text-black">
                <kpi.icon className="w-5 h-5" />
              </span>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${kpi.down ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-700'}`}>
                {kpi.trend}
              </span>
            </div>
            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">{kpi.label}</p>
            <h3 className="text-2xl font-bold text-zinc-900 mt-1.5">{kpi.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
        <div className="lg:col-span-8 card p-5 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h4 className="text-sm font-bold text-zinc-950">Revenue Trends (30 Days)</h4>
            <div className="flex items-center gap-4 text-xs font-medium text-zinc-500">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                Revenue
              </span>
            </div>
          </div>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#fbbf24" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
                <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fill: '#a1a1aa', fontSize: 10 }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fill: '#a1a1aa', fontSize: 10 }} tickFormatter={v => formatPKRCompact(v)} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#18181b', borderRadius: '12px', border: '1px solid #fbbf24', color: '#fef3c7' }}
                  formatter={(value: number | undefined) => formatPKR(value ?? 0)}
                />
                <Area type="monotone" dataKey="revenue" stroke="#f59e0b" strokeWidth={2.5} fillOpacity={1} fill="url(#revenueGrad)" name="Revenue" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                Low Stock Alerts
              </h4>
              <span className="badge-danger">{lowStockItems.length} Items</span>
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {lowStockItems.length === 0 ? (
                <div className="text-center py-6 text-xs text-zinc-400">All items adequately stocked.</div>
              ) : (
                lowStockItems.map(item => (
                  <div key={item.id} className="flex items-center justify-between p-2 hover:bg-amber-50 rounded-lg transition-all">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-zinc-900 flex items-center justify-center font-bold text-amber-400 text-xs">
                        {item.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-zinc-800">{item.name}</p>
                        <p className="text-[10px] text-amber-600 font-semibold">{item.stock} {item.unit} left</p>
                      </div>
                    </div>
                    <button onClick={() => reorderItem(item.id)} className="text-xs text-amber-600 font-semibold underline hover:text-amber-700 cursor-pointer">
                      Reorder
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="card-dark p-5 flex flex-col justify-between relative overflow-hidden group min-h-[140px]">
            <div className="relative z-10">
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Pending Invoices</p>
              <h4 className="text-xl font-bold">{pendingInvoices} Actionable</h4>
              <button
                onClick={() => navigate('/accounts')}
                className="mt-4 font-semibold text-xs flex items-center gap-2 text-amber-300 bg-amber-500/10 px-3.5 py-2 rounded-xl hover:bg-amber-500/20 transition-all cursor-pointer"
              >
                Review Billing <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <FileText className="w-28 h-28 absolute -right-4 -bottom-4 text-amber-500/5 rotate-12 group-hover:rotate-6 transition-transform duration-500" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6 card p-5">
          <div className="flex justify-between items-center mb-6">
            <h4 className="text-sm font-bold text-zinc-900">Top Selling Items</h4>
            <button onClick={() => navigate('/reports')} className="text-amber-600 font-semibold text-xs hover:underline cursor-pointer">
              View Full Reports
            </button>
          </div>
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-zinc-100 text-zinc-400 font-bold uppercase tracking-wider">
                <th className="pb-3">Dish Name</th>
                <th className="pb-3 text-right">Qty Sold</th>
                <th className="pb-3 text-right">Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50 font-medium">
              {topItems.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-6 text-center text-zinc-400">Complete POS orders to see top sellers.</td>
                </tr>
              ) : (
                topItems.map(item => (
                  <tr key={item.menuItemId} className="hover:bg-amber-50/30 transition-colors">
                    <td className="py-3 font-bold text-zinc-800">{item.name}</td>
                    <td className="py-3 text-right text-zinc-600">{item.qtySold}</td>
                    <td className="py-3 text-right text-zinc-900 font-bold">{formatPKR(item.revenue)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="lg:col-span-6 card p-5 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h4 className="text-sm font-bold text-zinc-900">Recent Activity</h4>
            <button className="text-zinc-400 hover:text-zinc-600 p-1.5 hover:bg-zinc-50 rounded-lg">
              <Filter className="w-4 h-4" />
            </button>
          </div>
          <div className="flex-1 space-y-4 max-h-72 overflow-y-auto pr-1">
            {activities.map((act) => {
              let bg = 'bg-zinc-50 text-zinc-600';
              let Icon = ShoppingBag;
              if (act.type === 'order') { bg = 'bg-amber-50 text-amber-700'; Icon = ShoppingBag; }
              else if (act.type === 'stock') { bg = 'bg-red-50 text-red-700'; Icon = AlertTriangle; }
              else if (act.type === 'staff') { bg = 'bg-zinc-100 text-zinc-800'; Icon = UserCheck; }
              else if (act.type === 'payout') { bg = 'bg-amber-50 text-amber-700'; Icon = CheckCircle2; }

              return (
                <div key={act.id} className="flex gap-4 items-start pb-4 border-b border-zinc-50 last:border-b-0">
                  <div className={`w-8 h-8 rounded-full ${bg} flex items-center justify-center shrink-0`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-zinc-800">
                      <span className="font-bold">{act.message}</span>
                      {act.details && ` - ${act.details}`}
                    </p>
                    <p className="text-[10px] text-zinc-400 mt-1">{act.time}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
