/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { MenuItem, MenuCategory, Vendor, Customer, Activity, InventoryItem, Invoice } from './types';

const IMG = {
  mutton: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&q=80&w=600',
  beef: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=600',
  chicken: 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?auto=format&fit=crop&q=80&w=600',
  handi: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&q=80&w=600',
  tandoori: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&q=80&w=600',
  bbq: 'https://images.unsplash.com/photo-1529042410759-befb1204b468?auto=format&fit=crop&q=80&w=600',
  desi: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&q=80&w=600',
  rice: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&q=80&w=600',
  drinks: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&q=80&w=600',
  shake: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&q=80&w=600',
  tea: 'https://images.unsplash.com/photo-1571934811356-5cc061b6821f?auto=format&fit=crop&q=80&w=600',
  salad: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=600',
};

function karahi(
  id: string,
  name: string,
  category: MenuCategory,
  half: number,
  full: number,
  image: string,
): MenuItem {
  return {
    id,
    name,
    price: full,
    halfPrice: half,
    category,
    description: 'تازہ مسالوں کے ساتھ تیار کردہ خاص کڑاہی۔',
    image,
    inStock: true,
    foodCost: Math.round(full * 0.35),
  };
}

function item(
  id: string,
  name: string,
  category: MenuCategory,
  price: number,
  image: string,
  description: string,
  inStock = true,
): MenuItem {
  return {
    id,
    name,
    price,
    category,
    description,
    image,
    inStock,
    foodCost: Math.round(price * 0.3),
  };
}

export const INITIAL_MENU_ITEMS: MenuItem[] = [
  // مٹن کڑاہی
  karahi('mk1', 'مٹن کڑاہی (ریگولر)', 'مٹن کڑاہی', 1900, 3800, IMG.mutton),
  karahi('mk2', 'مٹن اچاری کڑاہی', 'مٹن کڑاہی', 1950, 3880, IMG.mutton),
  karahi('mk3', 'مٹن وائٹ کڑاہی (اسپیشل)', 'مٹن کڑاہی', 2000, 4000, IMG.mutton),
  karahi('mk4', 'مٹن شنواری', 'مٹن کڑاہی', 2000, 4000, IMG.mutton),
  karahi('mk5', 'عجوہ اسپیشل مٹن کڑاہی', 'مٹن کڑاہی', 2000, 4000, IMG.mutton),

  // بیف کڑاہی
  karahi('bk1', 'بیف کڑاہی', 'بیف کڑاہی', 1300, 2500, IMG.beef),
  karahi('bk2', 'بیف وائٹ کڑاہی', 'بیف کڑاہی', 2550, 2550, IMG.beef),
  karahi('bk3', 'بیف اچاری کڑاہی', 'بیف کڑاہی', 1350, 2600, IMG.beef),
  karahi('bk4', 'عجوہ اسپیشل بیف کڑاہی', 'بیف کڑاہی', 1350, 2650, IMG.beef),

  // چکن کڑاہی
  karahi('ck1', 'چکن کڑاہی (ریگولر)', 'چکن کڑاہی', 850, 1600, IMG.chicken),
  karahi('ck2', 'چکن اچاری کڑاہی', 'چکن کڑاہی', 850, 1650, IMG.chicken),
  karahi('ck3', 'چکن وائٹ کڑاہی', 'چکن کڑاہی', 950, 1800, IMG.chicken),
  karahi('ck4', 'عجوہ اسپیشل کڑاہی', 'چکن کڑاہی', 950, 1800, IMG.chicken),

  // چکن ہانڈی
  karahi('ch1', 'چکن ہانڈی', 'چکن ہانڈی', 800, 1500, IMG.handi),
  karahi('ch2', 'چکن اچاری ہانڈی', 'چکن ہانڈی', 800, 1500, IMG.handi),
  karahi('ch3', 'چکن وائٹ کریمی ہانڈی', 'چکن ہانڈی', 800, 1500, IMG.handi),
  karahi('ch4', 'چکن مدراسی ہانڈی', 'چکن ہانڈی', 850, 1600, IMG.handi),
  karahi('ch5', 'چکن ہرا مصالحہ ہانڈی', 'چکن ہانڈی', 850, 1600, IMG.handi),
  karahi('ch6', 'چکن توا ہانڈی', 'چکن ہانڈی', 850, 1600, IMG.handi),

  // تندوری (نان اور روٹی)
  item('tn1', 'سادہ نان', 'تندوری', 20, IMG.tandoori, 'تندور میں پکا ہوا سادہ نان۔'),
  item('tn2', 'روغنی نان', 'تندوری', 60, IMG.tandoori, 'مکھن اور تل کے ساتھ روغنی نان۔'),
  item('tn3', 'گارلک نان', 'تندوری', 80, IMG.tandoori, 'لہسن اور دھنیا کے ساتھ خاص نان۔'),
  item('tn4', 'افغانی نان', 'تندوری', 150, IMG.tandoori, 'افغانی انداز کا بڑا نان۔'),
  item('tn5', 'اسپیشل نان', 'تندوری', 150, IMG.tandoori, 'عجوہ کا خاص نان۔'),
  item('tn6', 'آلو والا نان', 'تندوری', 100, IMG.tandoori, 'آلو کے ساتھ بھرا ہوا نان۔'),
  item('tn7', 'قیمہ والا نان', 'تندوری', 250, IMG.tandoori, 'قیمے سے بھرا ہوا نان۔'),
  item('tn8', 'پیزا نان', 'تندوری', 600, IMG.tandoori, 'پیزا ٹاپنگز کے ساتھ خاص نان۔'),
  item('tn9', 'سادہ روٹی', 'تندوری', 14, IMG.tandoori, 'تندور میں پکی سادہ روٹی۔'),
  item('tn10', 'خمیری روٹی', 'تندوری', 20, IMG.tandoori, 'خمیر والی نرم روٹی۔'),
  item('tn11', 'تندوری پراٹھا', 'تندوری', 50, IMG.tandoori, 'تندور میں پکا ہوا پراٹھا۔'),
  item('tn12', 'خمیری پراٹھا', 'تندوری', 60, IMG.tandoori, 'خمیر والا تندوری پراٹھا۔'),

  // باربی کیو
  item('bbq1', 'چیسٹ پیس', 'باربی کیو', 450, IMG.bbq, 'گرل کیا ہوا چکن چیسٹ پیس۔'),
  item('bbq2', 'لیگ پیس', 'باربی کیو', 400, IMG.bbq, 'مسالیدار چکن لیگ پیس۔'),
  item('bbq3', 'ملائی بوٹی (پلیٹ)', 'باربی کیو', 300, IMG.bbq, 'کریمی ملائی بوٹی کی پلیٹ۔'),
  item('bbq4', 'کباب (1 سیخ)', 'باربی کیو', 150, IMG.bbq, 'ایک سیخ کباب۔'),
  item('bbq5', 'کستوری بوٹی', 'باربی کیو', 250, IMG.bbq, 'کستوری مسالے والی بوٹی۔'),
  item('bbq6', 'عجوہ اسپیشل بوٹی', 'باربی کیو', 300, IMG.bbq, 'عجوہ کا خاص اسپیشل بوٹی۔'),
  item('bbq7', 'تکہ بوٹی', 'باربی کیو', 150, IMG.bbq, 'چکن تکہ بوٹی۔'),

  // دیسی کھانے
  item('df1', 'دال چنا', 'دیسی کھانے', 150, IMG.desi, 'دیسی گھی میں پکی دال چنا۔'),
  item('df2', 'دال ماش', 'دیسی کھانے', 200, IMG.desi, 'نرم اور لذیذ دال ماش۔'),
  item('df3', 'سبزی (ریگولر)', 'دیسی کھانے', 200, IMG.desi, 'موسمی سبزیوں کا سالن۔'),
  item('df4', 'دال ماش مکھنی', 'دیسی کھانے', 250, IMG.desi, 'مکھن اور کریم والی دال ماش۔'),
  item('df5', 'شاہی دال', 'دیسی کھانے', 250, IMG.desi, 'شاہی انداز کی خاص دال۔'),
  item('df6', 'اسپیشل سبزی', 'دیسی کھانے', 250, IMG.desi, 'عجوہ کی خاص سبزی۔'),
  item('df7', 'حلیم', 'دیسی کھانے', 200, IMG.desi, 'صرف جمعہ اور اتوار کو دستیاب۔'),
  item('df8', 'کڑھی پکوڑا', 'دیسی کھانے', 200, IMG.desi, 'صرف منگل اور بدھ کو دستیاب۔', false),

  // رائس
  item('rc1', 'چکن پلاؤ', 'رائس', 300, IMG.rice, 'خوشبودار چکن پلاؤ۔'),
  item('rc2', 'بریانی', 'رائس', 350, IMG.rice, 'عجوہ اسپیشل بریانی۔'),
  item('rc3', 'چائنیز رائس', 'رائس', 650, IMG.rice, 'چکن چائنیز فرائیڈ رائس۔'),

  // کولڈ ڈرنکس (رگولر، ہاف لیٹر، 1.5 لیٹر)
  item('cd1', 'کوکا کولا (رگولر)', 'کولڈ ڈرنکس', 80, IMG.drinks, '345ml کین۔'),
  item('cd2', 'کوکا کولا (ہاف لیٹر)', 'کولڈ ڈرنکس', 100, IMG.drinks, 'ہاف لیٹر بوتل۔'),
  item('cd3', 'کوکا کولا (1.5 لیٹر)', 'کولڈ ڈرنکس', 200, IMG.drinks, 'فیملی پیک 1.5 لیٹر۔'),
  item('cd4', 'سپرائٹ (رگولر)', 'کولڈ ڈرنکس', 80, IMG.drinks, '345ml کین۔'),
  item('cd5', 'سپرائٹ (ہاف لیٹر)', 'کولڈ ڈرنکس', 100, IMG.drinks, 'ہاف لیٹر بوتل۔'),
  item('cd6', 'فانٹا (رگولر)', 'کولڈ ڈرنکس', 80, IMG.drinks, '345ml کین۔'),
  item('cd7', 'پیپسی (رگولر)', 'کولڈ ڈرنکس', 80, IMG.drinks, '345ml کین۔'),
  item('cd8', 'سیون اپ (رگولر)', 'کولڈ ڈرنکس', 80, IMG.drinks, '345ml کین۔'),
  item('cd9', 'ڈیو (رگولر)', 'کولڈ ڈرنکس', 80, IMG.drinks, '345ml کین۔'),
  item('cd10', 'معدنی پانی', 'کولڈ ڈرنکس', 60, IMG.drinks, '500ml معدنی پانی۔'),

  // مشروبات
  item('ds1', 'منٹ مارگریٹا', 'مشروبات', 150, IMG.shake, 'تازہ پودینے کی مارگریٹا۔'),
  item('ds2', 'میٹھی لسی', 'مشروبات', 150, IMG.shake, 'روایتی میٹھی دہی لسی۔'),
  item('ds3', 'نمکین لسی', 'مشروبات', 50, IMG.shake, 'نمک اور مسالے والی لسی۔'),
  item('ds4', 'ملک شیک', 'مشروبات', 180, IMG.shake, 'کریمی دودھ شیک۔'),
  item('ds5', 'چاکلیٹ شیک', 'مشروبات', 200, IMG.shake, 'چاکلیٹ میلک شیک۔'),
  item('ds6', 'وریو شیک', 'مشروبات', 220, IMG.shake, 'وریو بسکٹ شیک۔'),

  // چائے
  item('t1', 'کڑک چائے', 'چائے', 70, IMG.tea, 'مضبوط کڑک چائے۔'),
  item('t2', 'دودھ پتی', 'چائے', 80, IMG.tea, 'دودھ والی کڑک چائے۔'),

  // سلاد اور رائتہ
  item('sr1', 'رائتہ', 'سلاد اور رائتہ', 60, IMG.salad, 'تازہ دہی رائتہ۔'),
  item('sr2', 'تازہ سلاد', 'سلاد اور رائتہ', 60, IMG.salad, 'تازہ سبزیوں کا سلاد۔'),
];

export const INITIAL_VENDORS: Vendor[] = [
  {
    id: 'v1',
    name: 'Faisalabad Meat Market',
    contactPerson: 'Ahmed Khan',
    email: 'orders@fsdmeat.com',
    phone: '0300-1122334',
    category: 'Meats & Poultry',
    status: 'Active',
  },
  {
    id: 'v2',
    name: 'Punjab Spices Co.',
    contactPerson: 'Hassan Raza',
    email: 'hassan@punjabspices.pk',
    phone: '0300-2233445',
    category: 'Spices & Masala',
    status: 'Active',
  },
  {
    id: 'v3',
    name: 'Gojra Road Produce',
    contactPerson: 'Fatima Bibi',
    email: 'fatima@gojraproduce.com',
    phone: '0300-3344556',
    category: 'Produce',
    status: 'Active',
  },
  {
    id: 'v4',
    name: 'Beverage Distributors FSD',
    contactPerson: 'Usman Ali',
    email: 'usman@bevfsd.pk',
    phone: '0300-4455667',
    category: 'Beverages',
    status: 'Active',
  },
  {
    id: 'v5',
    name: 'Tandoor Supplies',
    contactPerson: 'Imran Sheikh',
    email: 'imran@tandoorsupplies.com',
    phone: '0300-5566778',
    category: 'Bakery & Flour',
    status: 'Active',
  },
];

export const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 'c1',
    name: 'Ali Hassan',
    email: 'ali.hassan@email.com',
    phone: '0300-9876543',
    ordersCount: 42,
    totalSpend: 185040,
    lastOrderDate: '2026-06-28',
  },
  {
    id: 'c2',
    name: 'Sana Malik',
    email: 'sana.malik@email.com',
    phone: '0301-8765432',
    ordersCount: 28,
    totalSpend: 124050,
    lastOrderDate: '2026-06-27',
  },
  {
    id: 'c3',
    name: 'Dr. Kamran Shah',
    email: 'kamran@email.com',
    phone: '0302-7654321',
    ordersCount: 19,
    totalSpend: 73000,
    lastOrderDate: '2026-06-29',
  },
  {
    id: 'c4',
    name: 'Bilal Ahmed',
    email: 'bilal@email.com',
    phone: '0303-6543210',
    ordersCount: 12,
    totalSpend: 41250,
    lastOrderDate: '2026-06-24',
  },
  {
    id: 'c5',
    name: 'Ayesha Khan',
    email: 'ayesha@email.com',
    phone: '0304-5432109',
    ordersCount: 5,
    totalSpend: 11500,
    lastOrderDate: '2026-06-15',
  },
];

export const INITIAL_ACTIVITIES: Activity[] = [
  {
    id: 'a1',
    type: 'order',
    message: 'نیا آرڈر #8294',
    time: '2 mins ago',
    details: 'ٹیبل 7 • Rs 4,850 • مٹن کڑاہی + نان',
  },
  {
    id: 'a2',
    type: 'stock',
    message: 'اسٹاک الرٹ',
    time: '15 mins ago',
    details: 'چکن کا اسٹاک کم ہو گیا ہے۔',
  },
  {
    id: 'a3',
    type: 'staff',
    message: 'اسٹاف لاگ ان',
    time: '45 mins ago',
    details: 'مینیجر احمد • POS ٹرمینل 1',
  },
  {
    id: 'a4',
    type: 'payout',
    message: 'ادائیگی مکمل',
    time: '1 hour ago',
    details: 'Faisalabad Meat Market کو ادائیگی بھیجی گئی۔',
  },
];

export const REVENUE_DATA_30_DAYS = [
  { date: 'Jun 01', revenue: 32000, projection: 31000 },
  { date: 'Jun 04', revenue: 34500, projection: 33000 },
  { date: 'Jun 07', revenue: 33000, projection: 35000 },
  { date: 'Jun 10', revenue: 37200, projection: 36000 },
  { date: 'Jun 13', revenue: 38900, projection: 38000 },
  { date: 'Jun 16', revenue: 41200, projection: 40000 },
  { date: 'Jun 19', revenue: 39500, projection: 41000 },
  { date: 'Jun 22', revenue: 42100, projection: 42000 },
  { date: 'Jun 25', revenue: 44300, projection: 43000 },
  { date: 'Jun 28', revenue: 42850, projection: 44000 },
];

export const INITIAL_INVOICES: Invoice[] = [
  { id: 'inv-1024', vendorId: 'v1', vendorName: 'Faisalabad Meat Market', amount: 124050, dueDate: '2026-07-15', status: 'Pending', category: 'Ingredients' },
  { id: 'inv-1025', vendorId: 'v2', vendorName: 'Punjab Spices Co.', amount: 24500, dueDate: '2026-07-02', status: 'Pending', category: 'Ingredients' },
  { id: 'inv-1026', vendorName: 'FESCO Utilities', amount: 41200, dueDate: '2026-06-25', status: 'Overdue', category: 'Utilities' },
  { id: 'inv-1027', vendorId: 'v5', vendorName: 'Tandoor Supplies', amount: 18000, dueDate: '2026-06-28', status: 'Paid', category: 'Ingredients' },
  { id: 'inv-1028', vendorName: 'EcoSanitation Services', amount: 32000, dueDate: '2026-06-30', status: 'Paid', category: 'Maintenance' },
];

export const INITIAL_INVENTORY: InventoryItem[] = [
  {
    id: 'i1',
    name: 'Chicken (Whole)',
    stock: 25,
    unit: 'kg',
    minThreshold: 40,
    category: 'Meats',
  },
  {
    id: 'i2',
    name: 'Mutton',
    stock: 18,
    unit: 'kg',
    minThreshold: 25,
    category: 'Meats',
  },
  {
    id: 'i3',
    name: 'Basmati Rice',
    stock: 50,
    unit: 'kg',
    minThreshold: 30,
    category: 'Dry Goods',
  },
  {
    id: 'i4',
    name: 'Cooking Oil',
    stock: 12,
    unit: 'liters',
    minThreshold: 20,
    category: 'Pantry',
  },
  {
    id: 'i5',
    name: 'Fresh Vegetables',
    stock: 15,
    unit: 'kg',
    minThreshold: 10,
    category: 'Produce',
  },
];
