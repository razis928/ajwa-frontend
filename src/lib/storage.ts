export const STORAGE_KEYS = {
  menu: 'mep_menu_ajwa_urdu_v1',
  inventory: 'mep_inventory',
  vendors: 'mep_vendors',
  customers: 'mep_customers',
  activities: 'mep_activities',
  ordersHistory: 'mep_orders_history',
  invoices: 'mep_invoices',
  employees: 'mep_employees_v2',
  credits: 'mep_credits_v2',
} as const;

export function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const saved = localStorage.getItem(key);
    return saved ? (JSON.parse(saved) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function saveToStorage<T>(key: string, data: T): void {
  localStorage.setItem(key, JSON.stringify(data));
}
