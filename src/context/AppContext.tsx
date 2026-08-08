/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { MenuItem, Order, OrderItem, Vendor, Customer, Activity, InventoryItem, Invoice, Employee, CreditSale, CreditDetailsInput, CreditCollectionAccount } from '../types';
import { 
  INITIAL_MENU_ITEMS, 
  INITIAL_VENDORS, 
  INITIAL_CUSTOMERS, 
  INITIAL_ACTIVITIES, 
  INITIAL_INVENTORY,
  INITIAL_INVOICES,
  INITIAL_EMPLOYEES,
  INITIAL_CREDITS,
} from '../data';
import { STORAGE_KEYS, loadFromStorage } from '../lib/storage';
import { formatPKR } from '../lib/currency';

export type AppView = 'dashboard' | 'inventory' | 'menu' | 'pos' | 'accounts' | 'vendors' | 'customers' | 'employees' | 'credits' | 'reports';

export interface ToastMessage {
  message: string;
  type: 'success' | 'error' | 'info';
}

interface AppContextType {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  toast: ToastMessage | null;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  clearToast: () => void;

  menuItems: MenuItem[];
  addMenuItem: (item: Omit<MenuItem, 'id'>) => void;
  updateMenuItem: (id: string, item: Partial<MenuItem>) => void;
  deleteMenuItem: (id: string) => void;
  viewMargins: boolean;
  setViewMargins: (show: boolean) => void;

  activeOrder: Order;
  selectedCustomerId: string | null;
  setSelectedCustomerId: (id: string | null) => void;
  addToOrder: (menuItem: MenuItem, portion?: 'half' | 'full') => void;
  updateOrderQty: (itemId: string, delta: number) => void;
  removeFromOrder: (itemId: string) => void;
  voidOrder: () => void;
  applyDiscount: (percentage: number) => void;
  discountPercentage: number;
  setOrderType: (type: 'Dine-In' | 'Takeaway' | 'Delivery') => void;
  setTableNumber: (table: string) => void;
  updateOrderDetails: (details: Partial<Order>) => void;
  processPayment: (method?: 'Pay' | 'Credit', creditDetails?: CreditDetailsInput) => boolean;
  printedReceipt: Order | null;
  setPrintedReceipt: (order: Order | null) => void;

  credits: CreditSale[];
  settleCredit: (id: string, receivedVia: CreditCollectionAccount) => void;
  deleteCredit: (id: string) => void;

  inventoryItems: InventoryItem[];
  addInventoryItem: (item: Omit<InventoryItem, 'id'>) => void;
  updateInventoryItem: (id: string, item: Partial<InventoryItem>) => void;
  deleteInventoryItem: (id: string) => void;
  reorderItem: (id: string) => void;
  lowStockItems: InventoryItem[];

  vendors: Vendor[];
  addVendor: (vendor: Omit<Vendor, 'id'>) => void;
  updateVendor: (id: string, vendor: Partial<Vendor>) => void;
  deleteVendor: (id: string) => void;

  customers: Customer[];
  addCustomer: (customer: Omit<Customer, 'id'>) => void;
  updateCustomer: (id: string, customer: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;

  invoices: Invoice[];
  addInvoice: (invoice: Omit<Invoice, 'id'>) => void;
  updateInvoice: (id: string, invoice: Partial<Invoice>) => void;
  deleteInvoice: (id: string) => void;

  employees: Employee[];
  addEmployee: (employee: Omit<Employee, 'id'>) => void;
  updateEmployee: (id: string, employee: Partial<Employee>) => void;
  deleteEmployee: (id: string) => void;
  markSalaryPaid: (id: string) => void;
  markAllSalariesPaid: () => void;

  grossRevenue: number;
  totalOrdersCount: number;
  avgOrderValue: number;
  netProfit: number;
  activities: Activity[];
  ordersHistory: Order[];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const createEmptyOrder = (): Order => ({
  id: `#${Math.floor(100 + Math.random() * 900)}-${Math.floor(10 + Math.random() * 90)}`,
  tableNumber: '1',
  type: 'Dine-In',
  items: [],
  subtotal: 0,
  tax: 0,
  total: 0,
  status: 'Active',
  createdAt: new Date().toISOString(),
  guestCount: 2,
});

function formatOrderActivityDetails(order: Order): string {
  const parts = [`${order.type}`, formatPKR(order.total)];
  if (order.type === 'Takeaway') {
    parts.push(order.customerName || 'Guest', order.pickupTime ? `Pickup ${order.pickupTime}` : '');
  } else if (order.type === 'Delivery') {
    parts.push(order.customerName || 'Guest', order.deliveryAddress?.slice(0, 30) || '');
  }
  return parts.filter(Boolean).join(' • ');
}

function validateOrderForPayment(order: Order, customerId: string | null): string | null {
  if (order.items.length === 0) return 'Cannot check out an empty order!';
  if (order.type === 'Dine-In') {
    return null;
  }
  const name = order.customerName?.trim();
  const phone = order.contactPhone?.trim();
  if (!name && !customerId) return 'Please enter customer name.';
  if (!phone && !customerId) return 'Please enter a contact phone number.';
  if (order.type === 'Takeaway' && !order.pickupTime?.trim()) {
    return 'Please set a pickup time for takeaway orders.';
  }
  if (order.type === 'Delivery' && !order.deliveryAddress?.trim()) {
    return 'Please enter a delivery address.';
  }
  return null;
}

function resolveCustomerForOrder(
  customers: Customer[],
  customerId: string | null,
  customerName: string | undefined,
  contactPhone: string | undefined,
  orderTotal: number
): { id: string; name: string; phone: string; isNew: boolean } | null {
  if (customerId) {
    const saved = customers.find(c => c.id === customerId);
    if (saved) return { id: saved.id, name: saved.name, phone: saved.phone, isNew: false };
  }

  const name = customerName?.trim();
  const phone = contactPhone?.trim();
  if (!name || !phone) return null;

  const byPhone = customers.find(c => c.phone.replace(/\D/g, '') === phone.replace(/\D/g, ''));
  if (byPhone) return { id: byPhone.id, name: byPhone.name, phone: byPhone.phone, isNew: false };

  const newId = `c-${Date.now()}`;
  return { id: newId, name, phone, isNew: true };
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
  };

  const clearToast = () => setToast(null);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const [menuItems, setMenuItems] = useState<MenuItem[]>(() =>
    loadFromStorage(STORAGE_KEYS.menu, INITIAL_MENU_ITEMS)
  );
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>(() =>
    loadFromStorage(STORAGE_KEYS.inventory, INITIAL_INVENTORY)
  );
  const [vendors, setVendors] = useState<Vendor[]>(() =>
    loadFromStorage(STORAGE_KEYS.vendors, INITIAL_VENDORS)
  );
  const [customers, setCustomers] = useState<Customer[]>(() =>
    loadFromStorage(STORAGE_KEYS.customers, INITIAL_CUSTOMERS)
  );
  const [activities, setActivities] = useState<Activity[]>(() =>
    loadFromStorage(STORAGE_KEYS.activities, INITIAL_ACTIVITIES)
  );
  const [ordersHistory, setOrdersHistory] = useState<Order[]>(() =>
    loadFromStorage(STORAGE_KEYS.ordersHistory, [])
  );
  const [invoices, setInvoices] = useState<Invoice[]>(() =>
    loadFromStorage(STORAGE_KEYS.invoices, INITIAL_INVOICES)
  );
  const [employees, setEmployees] = useState<Employee[]>(() =>
    loadFromStorage(STORAGE_KEYS.employees, INITIAL_EMPLOYEES)
  );
  const [credits, setCredits] = useState<CreditSale[]>(() =>
    loadFromStorage(STORAGE_KEYS.credits, INITIAL_CREDITS)
  );

  const [grossRevenue, setGrossRevenue] = useState(42850.00);
  const [totalOrdersCount, setTotalOrdersCount] = useState(1284);
  const [avgOrderValue, setAvgOrderValue] = useState(33.37);
  const [netProfit, setNetProfit] = useState(14210.00);

  useEffect(() => { localStorage.setItem(STORAGE_KEYS.menu, JSON.stringify(menuItems)); }, [menuItems]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.inventory, JSON.stringify(inventoryItems)); }, [inventoryItems]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.vendors, JSON.stringify(vendors)); }, [vendors]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.customers, JSON.stringify(customers)); }, [customers]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.activities, JSON.stringify(activities)); }, [activities]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.ordersHistory, JSON.stringify(ordersHistory)); }, [ordersHistory]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.invoices, JSON.stringify(invoices)); }, [invoices]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.employees, JSON.stringify(employees)); }, [employees]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.credits, JSON.stringify(credits)); }, [credits]);

  const lowStockItems = inventoryItems.filter(item => item.stock <= item.minThreshold);

  useEffect(() => {
    const baseRevenue = 42850.00;
    const baseOrders = 1284;
    const baseProfit = 14210.00;

    const paidOrders = ordersHistory.filter(o => o.status === 'Paid');
    const newRevenueSum = paidOrders.reduce((sum, o) => sum + o.total, 0);
    const newOrdersCount = paidOrders.length;

    let totalCogs = 0;
    paidOrders.forEach(order => {
      order.items.forEach(item => {
        const menuItem = menuItems.find(m => m.id === item.menuItemId);
        totalCogs += (menuItem?.foodCost || item.price * 0.3) * item.quantity;
      });
    });

    const newProfitSum = newRevenueSum - totalCogs;
    const finalRevenue = baseRevenue + newRevenueSum;
    const finalOrders = baseOrders + newOrdersCount;
    const finalProfit = baseProfit + newProfitSum;

    setGrossRevenue(finalRevenue);
    setTotalOrdersCount(finalOrders);
    setNetProfit(finalProfit);
    setAvgOrderValue(finalOrders > 0 ? finalRevenue / finalOrders : 0);
  }, [ordersHistory, menuItems]);

  const [viewMargins, setViewMargins] = useState(false);
  const [activeOrder, setActiveOrder] = useState<Order>(createEmptyOrder);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [discountPercentage, setDiscountPercentage] = useState(0);
  const [printedReceipt, setPrintedReceipt] = useState<Order | null>(null);

  const recalculateOrderTotals = (items: OrderItem[], discountPct: number) => {
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const discountAmount = subtotal * (discountPct / 100);
    const adjustedSubtotal = subtotal - discountAmount;
    return {
      subtotal: Number(adjustedSubtotal.toFixed(2)),
      tax: 0,
      total: Number(adjustedSubtotal.toFixed(2)),
    };
  };

  const addMenuItem = (item: Omit<MenuItem, 'id'>) => {
    const newItem: MenuItem = { ...item, id: `m-${Date.now()}` };
    setMenuItems(prev => [...prev, newItem]);
    showToast(`Added "${newItem.name}" to menu`, 'success');
  };

  const updateMenuItem = (id: string, updated: Partial<MenuItem>) => {
    setMenuItems(prev => prev.map(item => item.id === id ? { ...item, ...updated } : item));
    showToast('Updated menu item details', 'success');
  };

  const deleteMenuItem = (id: string) => {
    const item = menuItems.find(m => m.id === id);
    setMenuItems(prev => prev.filter(item => item.id !== id));
    showToast(`Deleted "${item?.name || 'item'}" from menu`, 'info');
  };

  const addToOrder = (menuItem: MenuItem, portion?: 'half' | 'full') => {
    if (!menuItem.inStock) {
      showToast(`"${menuItem.name}" is currently out of stock!`, 'error');
      return;
    }

    const hasPortions = menuItem.halfPrice != null;
    if (hasPortions && !portion) {
      showToast('براہ کرم ہاف یا فل پورشن منتخب کریں', 'info');
      return;
    }

    const effectivePortion = hasPortions ? portion! : undefined;
    const price =
      effectivePortion === 'half' && menuItem.halfPrice != null
        ? menuItem.halfPrice
        : menuItem.price;
    const displayName = hasPortions
      ? `${menuItem.name} (${effectivePortion === 'half' ? 'ہاف' : 'فل'})`
      : menuItem.name;

    const existingIndex = activeOrder.items.findIndex(
      item =>
        item.menuItemId === menuItem.id &&
        (item.portion ?? 'full') === (effectivePortion ?? 'full'),
    );

    let newItems: OrderItem[] = [...activeOrder.items];

    if (existingIndex > -1) {
      newItems[existingIndex] = {
        ...newItems[existingIndex],
        quantity: newItems[existingIndex].quantity + 1,
      };
    } else {
      newItems.push({
        id: `oi-${Date.now()}-${effectivePortion ?? 'single'}`,
        menuItemId: menuItem.id,
        name: displayName,
        price,
        quantity: 1,
        portion: effectivePortion,
      });
    }

    const totals = recalculateOrderTotals(newItems, discountPercentage);
    setActiveOrder(prev => ({ ...prev, items: newItems, ...totals }));
  };

  const updateOrderQty = (itemId: string, delta: number) => {
    const newItems = activeOrder.items
      .map(item => item.id === itemId ? { ...item, quantity: Math.max(0, item.quantity + delta) } : item)
      .filter(item => item.quantity > 0);
    const totals = recalculateOrderTotals(newItems, discountPercentage);
    setActiveOrder(prev => ({ ...prev, items: newItems, ...totals }));
  };

  const removeFromOrder = (itemId: string) => {
    const newItems = activeOrder.items.filter(item => item.id !== itemId);
    const totals = recalculateOrderTotals(newItems, discountPercentage);
    setActiveOrder(prev => ({ ...prev, items: newItems, ...totals }));
  };

  const voidOrder = () => {
    setActiveOrder(createEmptyOrder());
    setDiscountPercentage(0);
    setSelectedCustomerId(null);
    showToast('Current active order has been voided', 'info');
  };

  const applyDiscount = (percentage: number) => {
    setDiscountPercentage(percentage);
    const totals = recalculateOrderTotals(activeOrder.items, percentage);
    setActiveOrder(prev => ({ ...prev, ...totals }));
    showToast(`Applied ${percentage}% discount`, 'success');
  };

  const setOrderType = (type: 'Dine-In' | 'Takeaway' | 'Delivery') => {
    setActiveOrder(prev => {
      const base = { ...prev, type };
      if (type === 'Dine-In') {
        return {
          ...base,
          tableNumber: prev.tableNumber || '1',
          guestCount: prev.guestCount ?? 2,
          pickupTime: undefined,
          deliveryAddress: undefined,
          deliveryNotes: undefined,
        };
      }
      if (type === 'Takeaway') {
        const defaultPickup = new Date(Date.now() + 30 * 60 * 1000).toISOString().slice(0, 16);
        return {
          ...base,
          tableNumber: '',
          guestCount: undefined,
          deliveryAddress: undefined,
          deliveryNotes: undefined,
          pickupTime: prev.pickupTime || defaultPickup,
        };
      }
      return {
        ...base,
        tableNumber: '',
        guestCount: undefined,
        pickupTime: undefined,
        deliveryAddress: prev.deliveryAddress || '',
        deliveryNotes: prev.deliveryNotes || '',
      };
    });
  };

  const setTableNumber = (table: string) => {
    setActiveOrder(prev => ({ ...prev, tableNumber: table }));
  };

  const updateOrderDetails = (details: Partial<Order>) => {
    setActiveOrder(prev => ({ ...prev, ...details }));
  };

  const processPayment = (
    method: 'Pay' | 'Credit' = 'Pay',
    creditDetails?: CreditDetailsInput
  ): boolean => {
    const validationError = validateOrderForPayment(activeOrder, selectedCustomerId);
    if (validationError) {
      showToast(validationError, 'error');
      return false;
    }

    if (method === 'Credit') {
      const creditName = creditDetails?.customerName?.trim();
      const creditPhone = creditDetails?.phone?.trim();
      if (!creditName) {
        showToast('Please enter credit customer name.', 'error');
        return false;
      }
      if (!creditPhone) {
        showToast('Please enter credit customer phone.', 'error');
        return false;
      }
      if (!creditDetails?.dueDate) {
        showToast('Please select a due date.', 'error');
        return false;
      }
    }

    const selectedCustomer = selectedCustomerId
      ? customers.find(c => c.id === selectedCustomerId)
      : undefined;

    let resolvedCustomerId = selectedCustomerId;
    let resolvedName =
      method === 'Credit'
        ? creditDetails?.customerName?.trim()
        : activeOrder.customerName || selectedCustomer?.name;
    let resolvedPhone =
      method === 'Credit'
        ? creditDetails?.phone?.trim()
        : activeOrder.contactPhone || selectedCustomer?.phone;
    let wasNewCustomer = false;

    const shouldTrackCustomer =
      method === 'Credit' ||
      activeOrder.type !== 'Dine-In' ||
      Boolean(activeOrder.customerName?.trim() && activeOrder.contactPhone?.trim()) ||
      Boolean(selectedCustomerId);

    if (shouldTrackCustomer) {
      const resolved = resolveCustomerForOrder(
        customers,
        selectedCustomerId,
        resolvedName || activeOrder.customerName || selectedCustomer?.name,
        resolvedPhone || activeOrder.contactPhone || selectedCustomer?.phone,
        activeOrder.total
      );

      if (resolved) {
        resolvedCustomerId = resolved.id;
        resolvedName = resolved.name;
        resolvedPhone = resolved.phone;

        if (resolved.isNew) {
          wasNewCustomer = true;
          const newCustomer: Customer = {
            id: resolved.id,
            name: resolved.name,
            phone: resolved.phone,
            email: '',
            ordersCount: 1,
            totalSpend: activeOrder.total,
            lastOrderDate: new Date().toISOString().split('T')[0],
          };
          setCustomers(prev => [...prev, newCustomer]);
        } else {
          setCustomers(prev => prev.map(c => {
            if (c.id !== resolved.id) return c;
            return {
              ...c,
              ordersCount: c.ordersCount + 1,
              totalSpend: c.totalSpend + activeOrder.total,
              lastOrderDate: new Date().toISOString().split('T')[0],
            };
          }));
        }
      }
    }

    const completedOrder: Order = {
      ...activeOrder,
      status: method === 'Credit' ? 'Credit' : 'Paid',
      paymentMethod: method,
      createdAt: new Date().toISOString(),
      customerId: resolvedCustomerId ?? undefined,
      customerName: resolvedName,
      contactPhone: resolvedPhone,
    };

    if (method === 'Credit' && creditDetails) {
      const credit: CreditSale = {
        id: `cr-${Date.now()}`,
        orderId: completedOrder.id,
        customerName: creditDetails.customerName.trim(),
        phone: creditDetails.phone.trim(),
        cnic: creditDetails.cnic?.trim() || '',
        address: creditDetails.address?.trim() || '',
        notes: creditDetails.notes?.trim() || '',
        amount: completedOrder.total,
        dueDate: creditDetails.dueDate,
        status: 'Unpaid',
        createdAt: completedOrder.createdAt,
        orderType: completedOrder.type,
        itemsSummary: completedOrder.items.map(i => `${i.quantity}x ${i.name}`).join(', '),
      };
      setCredits(prev => [credit, ...prev]);
    }

    setOrdersHistory(prev => [completedOrder, ...prev]);

    const newActivity: Activity = {
      id: `act-${Date.now()}`,
      type: 'order',
      message: method === 'Credit'
        ? `Credit sale ${completedOrder.id}`
        : `Completed Order ${completedOrder.id}`,
      time: 'Just now',
      details: method === 'Credit'
        ? `${completedOrder.customerName} · ${formatPKR(completedOrder.total)} due ${creditDetails?.dueDate}`
        : formatOrderActivityDetails(completedOrder),
    };
    setActivities(prev => [newActivity, ...prev]);

    setInventoryItems(prevInv => prevInv.map(inv => {
      let deductAmount = 0;
      completedOrder.items.forEach(item => {
        const name = item.name.toLowerCase();
        const invName = inv.name.toLowerCase();
        if (name.includes('wine') && invName.includes('wine')) deductAmount += item.quantity;
        if (name.includes('burger') && invName.includes('beef')) deductAmount += item.quantity;
        if (name.includes('pasta') && invName.includes('truffle')) deductAmount += item.quantity * 0.5;
        if (name.includes('steak') && invName.includes('beef')) deductAmount += item.quantity;
        if (name.includes('egg') && invName.includes('egg')) deductAmount += item.quantity * 0.5;
      });

      if (deductAmount > 0) {
        const newStock = Math.max(0, inv.stock - deductAmount);
        if (newStock <= inv.minThreshold && inv.stock > inv.minThreshold) {
          const stockAlert: Activity = {
            id: `act-alert-${Date.now()}-${inv.id}`,
            type: 'stock',
            message: `Stock Alert: ${inv.name}`,
            time: 'Just now',
            details: `${inv.name} reached critical level (${newStock} ${inv.unit} left).`,
          };
          setTimeout(() => setActivities(prevAct => [stockAlert, ...prevAct]), 500);
        }
        return { ...inv, stock: newStock };
      }
      return inv;
    }));

    setActiveOrder(createEmptyOrder());
    setDiscountPercentage(0);
    setSelectedCustomerId(null);
    const newCustomerMsg = wasNewCustomer ? ` New customer "${resolvedName}" saved.` : '';
    if (method === 'Credit') {
      showToast(`Credit of ${formatPKR(completedOrder.total)} recorded for ${completedOrder.customerName}.${newCustomerMsg}`, 'success');
    } else {
      showToast(`Payment of ${formatPKR(completedOrder.total)} processed successfully.${newCustomerMsg}`, 'success');
    }
    return true;
  };

  const settleCredit = (id: string, receivedVia: CreditCollectionAccount) => {
    const credit = credits.find(c => c.id === id);
    if (!credit) return;
    setCredits(prev => prev.map(c => c.id === id ? {
      ...c,
      status: 'Paid',
      receivedVia,
      collectedAt: new Date().toISOString(),
    } : c));
    setOrdersHistory(prev => prev.map(o =>
      o.id === credit.orderId ? { ...o, status: 'Paid' } : o
    ));
    setActivities(prev => [{
      id: `act-${Date.now()}`,
      type: 'payout',
      message: `Credit collected: ${credit.customerName}`,
      time: 'Just now',
      details: `${credit.orderId} · ${formatPKR(credit.amount)} via ${receivedVia}`,
    }, ...prev]);
    showToast(`Collected ${formatPKR(credit.amount)} via ${receivedVia} from ${credit.customerName}`, 'success');
  };

  const deleteCredit = (id: string) => {
    const credit = credits.find(c => c.id === id);
    setCredits(prev => prev.filter(c => c.id !== id));
    showToast(`Removed credit record for "${credit?.customerName || 'customer'}"`, 'info');
  };

  const addInventoryItem = (item: Omit<InventoryItem, 'id'>) => {
    const newItem: InventoryItem = { ...item, id: `i-${Date.now()}` };
    setInventoryItems(prev => [...prev, newItem]);
    showToast(`Added stock item "${newItem.name}"`, 'success');
  };

  const updateInventoryItem = (id: string, updated: Partial<InventoryItem>) => {
    setInventoryItems(prev => prev.map(i => i.id === id ? { ...i, ...updated } : i));
    showToast('Updated inventory item', 'success');
  };

  const deleteInventoryItem = (id: string) => {
    const item = inventoryItems.find(i => i.id === id);
    setInventoryItems(prev => prev.filter(i => i.id !== id));
    showToast(`Deleted "${item?.name || 'item'}" from inventory`, 'info');
  };

  const reorderItem = (id: string) => {
    const item = inventoryItems.find(i => i.id === id);
    if (!item) return;

    const orderQty = item.minThreshold * 2;
    setInventoryItems(prev => prev.map(i =>
      i.id === id ? { ...i, stock: i.stock + orderQty } : i
    ));
    showToast(`Ordered ${orderQty} ${item.unit} of "${item.name}"`, 'success');

    const reorderLog: Activity = {
      id: `act-${Date.now()}`,
      type: 'stock',
      message: 'Reorder Dispatched',
      time: 'Just now',
      details: `Auto-stocked ${orderQty} ${item.unit} of ${item.name}`,
    };
    setActivities(prev => [reorderLog, ...prev]);
  };

  const addVendor = (vendor: Omit<Vendor, 'id'>) => {
    const newVendor: Vendor = { ...vendor, id: `v-${Date.now()}` };
    setVendors(prev => [...prev, newVendor]);
    showToast(`Registered vendor "${newVendor.name}"`, 'success');
  };

  const updateVendor = (id: string, updated: Partial<Vendor>) => {
    setVendors(prev => prev.map(v => v.id === id ? { ...v, ...updated } : v));
    showToast('Updated vendor file', 'success');
  };

  const deleteVendor = (id: string) => {
    const vendor = vendors.find(v => v.id === id);
    setVendors(prev => prev.filter(v => v.id !== id));
    showToast(`Removed vendor "${vendor?.name || 'vendor'}"`, 'info');
  };

  const addCustomer = (customer: Omit<Customer, 'id'>) => {
    const newCustomer: Customer = {
      ...customer,
      id: `c-${Date.now()}`,
      ordersCount: customer.ordersCount ?? 0,
      totalSpend: customer.totalSpend ?? 0,
      lastOrderDate: customer.lastOrderDate ?? 'N/A',
    };
    setCustomers(prev => [...prev, newCustomer]);
    showToast(`Enrolled customer "${newCustomer.name}"`, 'success');
  };

  const updateCustomer = (id: string, updated: Partial<Customer>) => {
    setCustomers(prev => prev.map(c => c.id === id ? { ...c, ...updated } : c));
    showToast('Updated customer card', 'success');
  };

  const deleteCustomer = (id: string) => {
    const customer = customers.find(c => c.id === id);
    setCustomers(prev => prev.filter(c => c.id !== id));
    showToast(`Removed customer "${customer?.name || 'customer'}"`, 'info');
  };

  const addInvoice = (invoice: Omit<Invoice, 'id'>) => {
    const newInvoice: Invoice = { ...invoice, id: `inv-${Date.now()}` };
    setInvoices(prev => [newInvoice, ...prev]);
    showToast(`Invoice issued for ${newInvoice.vendorName}: ${formatPKR(newInvoice.amount)}`, 'success');
  };

  const updateInvoice = (id: string, updated: Partial<Invoice>) => {
    setInvoices(prev => prev.map(inv => inv.id === id ? { ...inv, ...updated } : inv));
    showToast('Updated invoice', 'success');
  };

  const deleteInvoice = (id: string) => {
    const invoice = invoices.find(i => i.id === id);
    setInvoices(prev => prev.filter(i => i.id !== id));
    showToast(`Deleted invoice ${invoice?.id || ''}`, 'info');
  };

  const addEmployee = (employee: Omit<Employee, 'id'>) => {
    const newEmployee: Employee = { ...employee, id: `e-${Date.now()}` };
    setEmployees(prev => [...prev, newEmployee]);
    setActivities(prev => [{
      id: `act-${Date.now()}`,
      type: 'staff',
      message: `New staff hired: ${newEmployee.name}`,
      time: 'Just now',
      details: `${newEmployee.role} · ${formatPKR(newEmployee.salary)} / month`,
    }, ...prev]);
    showToast(`Added employee "${newEmployee.name}"`, 'success');
  };

  const updateEmployee = (id: string, updated: Partial<Employee>) => {
    setEmployees(prev => prev.map(e => e.id === id ? { ...e, ...updated } : e));
    showToast('Updated employee details', 'success');
  };

  const deleteEmployee = (id: string) => {
    const employee = employees.find(e => e.id === id);
    setEmployees(prev => prev.filter(e => e.id !== id));
    showToast(`Removed employee "${employee?.name || 'employee'}"`, 'info');
  };

  const markSalaryPaid = (id: string) => {
    const employee = employees.find(e => e.id === id);
    if (!employee) return;
    setEmployees(prev => prev.map(e => e.id === id ? { ...e, salaryStatus: 'Paid' } : e));
    setActivities(prev => [{
      id: `act-${Date.now()}`,
      type: 'payout',
      message: `Salary paid: ${employee.name}`,
      time: 'Just now',
      details: `${employee.role} · ${formatPKR(employee.salary)}`,
    }, ...prev]);
    showToast(`Marked salary paid for ${employee.name}`, 'success');
  };

  const markAllSalariesPaid = () => {
    const pending = employees.filter(e => e.salaryStatus === 'Pending' && e.status === 'Active');
    if (pending.length === 0) {
      showToast('No pending salaries to pay', 'info');
      return;
    }
    setEmployees(prev => prev.map(e =>
      e.status === 'Active' && e.salaryStatus === 'Pending' ? { ...e, salaryStatus: 'Paid' } : e
    ));
    const total = pending.reduce((sum, e) => sum + e.salary, 0);
    setActivities(prev => [{
      id: `act-${Date.now()}`,
      type: 'payout',
      message: `Payroll run completed`,
      time: 'Just now',
      details: `${pending.length} staff paid · ${formatPKR(total)}`,
    }, ...prev]);
    showToast(`Paid salaries for ${pending.length} employees (${formatPKR(total)})`, 'success');
  };

  return (
    <AppContext.Provider
      value={{
        searchQuery,
        setSearchQuery,
        toast,
        showToast,
        clearToast,
        menuItems,
        addMenuItem,
        updateMenuItem,
        deleteMenuItem,
        viewMargins,
        setViewMargins,
        activeOrder,
        selectedCustomerId,
        setSelectedCustomerId,
        addToOrder,
        updateOrderQty,
        removeFromOrder,
        voidOrder,
        applyDiscount,
        discountPercentage,
        setOrderType,
        setTableNumber,
        updateOrderDetails,
        processPayment,
        printedReceipt,
        setPrintedReceipt,
        credits,
        settleCredit,
        deleteCredit,
        inventoryItems,
        addInventoryItem,
        updateInventoryItem,
        deleteInventoryItem,
        reorderItem,
        lowStockItems,
        vendors,
        addVendor,
        updateVendor,
        deleteVendor,
        customers,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        invoices,
        addInvoice,
        updateInvoice,
        deleteInvoice,
        employees,
        addEmployee,
        updateEmployee,
        deleteEmployee,
        markSalaryPaid,
        markAllSalariesPaid,
        grossRevenue,
        totalOrdersCount,
        avgOrderValue,
        netProfit,
        activities,
        ordersHistory,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
