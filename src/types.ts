/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type MenuCategory =
  | 'مٹن کڑاہی'
  | 'بیف کڑاہی'
  | 'چکن کڑاہی'
  | 'چکن ہانڈی'
  | 'تندوری'
  | 'باربی کیو'
  | 'دیسی کھانے'
  | 'رائس'
  | 'کولڈ ڈرنکس'
  | 'مشروبات'
  | 'چائے'
  | 'سلاد اور رائتہ';

export const MENU_CATEGORIES: MenuCategory[] = [
  'مٹن کڑاہی',
  'بیف کڑاہی',
  'چکن کڑاہی',
  'چکن ہانڈی',
  'تندوری',
  'باربی کیو',
  'دیسی کھانے',
  'رائس',
  'کولڈ ڈرنکس',
  'مشروبات',
  'چائے',
  'سلاد اور رائتہ',
];

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  halfPrice?: number;
  category: MenuCategory;
  description: string;
  image: string;
  inStock: boolean;
  foodCost: number;
}

export interface OrderItem {
  id: string;
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  portion?: 'half' | 'full';
}

export interface Order {
  id: string;
  tableNumber: string;
  type: 'Dine-In' | 'Takeaway' | 'Delivery';
  items: OrderItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: 'Active' | 'Paid' | 'Voided';
  createdAt: string;
  customerId?: string;
  guestCount?: number;
  customerName?: string;
  contactPhone?: string;
  pickupTime?: string;
  deliveryAddress?: string;
  deliveryNotes?: string;
}

export interface Vendor {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  category: string;
  status: 'Active' | 'Inactive';
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  ordersCount: number;
  totalSpend: number;
  lastOrderDate: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  stock: number;
  unit: string;
  minThreshold: number;
  category: string;
}

export interface Activity {
  id: string;
  type: 'order' | 'stock' | 'staff' | 'payout';
  message: string;
  time: string;
  details: string;
}

export interface Invoice {
  id: string;
  vendorId?: string;
  vendorName: string;
  amount: number;
  dueDate: string;
  status: 'Paid' | 'Pending' | 'Overdue';
  category: string;
  description?: string;
}
