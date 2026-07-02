import { Order, MenuItem } from '../types';

export interface TopSellingItem {
  menuItemId: string;
  name: string;
  qtySold: number;
  revenue: number;
}

export interface RevenueDataPoint {
  date: string;
  revenue: number;
  orders: number;
}

export function computeTopSellingItems(
  orders: Order[],
  menuItems: MenuItem[],
  limit = 5
): TopSellingItem[] {
  const paidOrders = orders.filter(o => o.status === 'Paid');
  const salesMap = new Map<string, { qty: number; revenue: number; name: string }>();

  paidOrders.forEach(order => {
    order.items.forEach(item => {
      const existing = salesMap.get(item.menuItemId) ?? {
        qty: 0,
        revenue: 0,
        name: item.name,
      };
      existing.qty += item.quantity;
      existing.revenue += item.price * item.quantity;
      salesMap.set(item.menuItemId, existing);
    });
  });

  return Array.from(salesMap.entries())
    .map(([menuItemId, data]) => ({
      menuItemId,
      name: menuItems.find(m => m.id === menuItemId)?.name ?? data.name,
      qtySold: data.qty,
      revenue: data.revenue,
    }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, limit);
}

export function computeRevenueByDay(orders: Order[], days = 30): RevenueDataPoint[] {
  const paidOrders = orders.filter(o => o.status === 'Paid');
  const dayMap = new Map<string, { revenue: number; orders: number }>();

  paidOrders.forEach(order => {
    const date = new Date(order.createdAt);
    const key = date.toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
    const existing = dayMap.get(key) ?? { revenue: 0, orders: 0 };
    existing.revenue += order.total;
    existing.orders += 1;
    dayMap.set(key, existing);
  });

  if (dayMap.size === 0) return [];

  return Array.from(dayMap.entries())
    .map(([date, data]) => ({ date, revenue: data.revenue, orders: data.orders }))
    .slice(-days);
}

export function computePeriodRevenue(orders: Order[], days: number): number {
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  return orders
    .filter(o => o.status === 'Paid' && new Date(o.createdAt).getTime() >= cutoff)
    .reduce((sum, o) => sum + o.total, 0);
}
