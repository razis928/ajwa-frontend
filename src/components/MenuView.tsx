/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { MenuItem, MENU_CATEGORIES, MenuCategory } from '../types';
import {
  Plus, Edit2, Trash2, Image as ImageIcon,
  Beef, Bird, Drumstick, Flame, Wheat, Salad, CupSoda, Coffee, GlassWater,
} from 'lucide-react';
import { Modal } from './ui/Modal';
import { ConfirmDialog } from './ui/ConfirmDialog';
import { formatPKR } from '../lib/currency';

const ALL_CATEGORY = 'سب';

const CATEGORY_ICONS: Record<MenuCategory, React.ComponentType<{ className?: string }>> = {
  'مٹن کڑاہی': Beef,
  'بیف کڑاہی': Beef,
  'چکن کڑاہی': Bird,
  'چکن ہانڈی': Drumstick,
  'تندوری': Wheat,
  'باربی کیو': Flame,
  'دیسی کھانے': Salad,
  'رائس': Salad,
  'کولڈ ڈرنکس': CupSoda,
  'مشروبات': GlassWater,
  'چائے': Coffee,
  'سلاد اور رائتہ': Salad,
};

const categories = [ALL_CATEGORY, ...MENU_CATEGORIES] as const;

export const MenuView: React.FC = () => {
  const {
    menuItems,
    addMenuItem,
    updateMenuItem,
    deleteMenuItem,
    viewMargins,
    setViewMargins,
    searchQuery,
  } = useApp();

  const [activeCategory, setActiveCategory] = useState<string>(ALL_CATEGORY);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

  const [name, setName] = useState('');
  const [price, setPrice] = useState(0);
  const [halfPrice, setHalfPrice] = useState<number | undefined>(undefined);
  const [category, setCategory] = useState<MenuCategory>('چکن کڑاہی');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [foodCost, setFoodCost] = useState(0);
  const [inStock, setInStock] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<MenuItem | null>(null);

  const filteredItems = menuItems.filter(item => {
    const matchesCategory = activeCategory === ALL_CATEGORY || item.category === activeCategory;
    const matchesSearch =
      item.name.includes(searchQuery) ||
      item.description.includes(searchQuery) ||
      item.category.includes(searchQuery);
    return matchesCategory && matchesSearch;
  });

  const groupedByCategory = useMemo(() => {
    const groups = new Map<MenuCategory, MenuItem[]>();
    for (const cat of MENU_CATEGORIES) {
      const items = filteredItems.filter(i => i.category === cat);
      if (items.length > 0) groups.set(cat, items);
    }
    return groups;
  }, [filteredItems]);

  const openAddModal = () => {
    setName('');
    setPrice(0);
    setHalfPrice(undefined);
    setCategory('چکن کڑاہی');
    setDescription('');
    setImage('');
    setFoodCost(0);
    setInStock(true);
    setShowAddModal(true);
  };

  const openEditModal = (item: MenuItem) => {
    setEditingItem(item);
    setName(item.name);
    setPrice(item.price);
    setHalfPrice(item.halfPrice);
    setCategory(item.category);
    setDescription(item.description);
    setImage(item.image);
    setFoodCost(item.foodCost);
    setInStock(item.inStock);
  };

  const closeFormModal = () => {
    setShowAddModal(false);
    setEditingItem(null);
  };

  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    const finalImage =
      image.trim() ||
      'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=600';

    const payload = {
      name,
      price,
      halfPrice: halfPrice || undefined,
      category,
      description,
      image: finalImage,
      foodCost,
      inStock,
    };

    if (editingItem) {
      updateMenuItem(editingItem.id, payload);
    } else {
      addMenuItem(payload);
    }
    closeFormModal();
  };

  const renderCategoryCard = (cat: MenuCategory, items: MenuItem[]) => {
    const Icon = CATEGORY_ICONS[cat];
    const hasHalfFull = items.some(i => i.halfPrice != null);
    const categoryImage = items[0]?.image;

    return (
      <div key={cat} className="ajwa-category-card flex flex-col" dir="rtl">
        <div className="ajwa-category-header">
          <Icon className="w-5 h-5 text-ajwa-gold shrink-0" />
          <h3 className="ajwa-urdu font-bold text-white text-base leading-relaxed">{cat}</h3>
        </div>

        <div className="flex-1 p-3">
          <table className="w-full text-xs ajwa-urdu">
            <thead>
              <tr className="border-b border-ajwa-gold/20 text-ajwa-gold-dark">
                <th className="text-right py-1.5 font-bold text-[11px]">آئٹم</th>
                {hasHalfFull && (
                  <th className="text-center py-1.5 font-bold text-[11px] w-16">ہاف</th>
                )}
                <th className="text-center py-1.5 font-bold text-[11px] w-16">
                  {hasHalfFull ? 'فل' : 'قیمت'}
                </th>
                <th className="w-10"></th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr
                  key={item.id}
                  className={`border-b border-ajwa-gold/10 last:border-0 group ${
                    !item.inStock ? 'opacity-50' : ''
                  }`}
                >
                  <td className="py-2 pl-2 text-right">
                    <span className="font-semibold text-ajwa-ink text-sm leading-relaxed">{item.name}</span>
                    {!item.inStock && (
                      <span className="mr-1 text-[9px] text-red-600 font-bold">غیر دستیاب</span>
                    )}
                  </td>
                  {hasHalfFull && (
                    <td className="text-center py-2 font-mono text-ajwa-ink/80 text-[11px]">
                      {item.halfPrice != null ? formatPKR(item.halfPrice) : '—'}
                    </td>
                  )}
                  <td className="text-center py-2 font-mono font-bold text-ajwa-forest text-[11px]">
                    {formatPKR(item.price)}
                  </td>
                  <td className="py-2">
                    <div className="flex items-center justify-start gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => openEditModal(item)}
                        className="p-1 text-ajwa-ink/30 hover:text-ajwa-gold hover:bg-ajwa-gold/10 rounded"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(item)}
                        className="p-1 text-ajwa-ink/30 hover:text-red-600 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {viewMargins && (
            <div className="mt-2 pt-2 border-t border-ajwa-gold/15 space-y-1">
              {items.map(item => {
                const margin = item.price > 0 ? Math.round(((item.price - item.foodCost) / item.price) * 100) : 0;
                return (
                  <div key={item.id} className="flex justify-between text-[9px] text-ajwa-ink/50 ajwa-urdu">
                    <span className="truncate pl-2">{item.name}</span>
                    <span className="text-ajwa-gold-dark font-bold shrink-0">{margin}% منافع</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {categoryImage && (
          <div className="px-3 pb-3">
            <div className="h-24 rounded-lg overflow-hidden border border-ajwa-gold/20">
              <img
                referrerPolicy="no-referrer"
                src={categoryImage}
                alt={cat}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-6 pb-24" dir="rtl">
      {/* Header */}
      <div className="mb-6 rounded-xl overflow-hidden border border-ajwa-gold/30 shadow-sm">
        <div className="bg-gradient-to-r from-ajwa-forest-dark via-ajwa-forest to-ajwa-forest-light px-6 py-5 flex items-center justify-between">
          <div className="hidden md:block w-16 h-16 rounded-full border-2 border-ajwa-gold overflow-hidden shadow-lg shadow-ajwa-gold/20 shrink-0">
            <img
              referrerPolicy="no-referrer"
              src="https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&q=80&w=200"
              alt="عجوہ"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="text-center flex-1">
            <h2 className="ajwa-urdu text-3xl font-bold text-ajwa-gold-light leading-relaxed">
              عجوہ فیملی ریسٹورنٹ
            </h2>
            <p className="ajwa-urdu text-white/70 text-sm mt-1">لذت بھی، معیار بھی</p>
            <p className="text-white/50 text-xs mt-2 font-sans">
              Jallandhar Pull, Gojra Road, Faisalabad • 0300-1190267
            </p>
          </div>
          <div className="hidden md:block w-16 shrink-0" />
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 gap-4">
        <nav className="flex gap-1.5 flex-wrap ajwa-urdu">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold cursor-pointer transition-all ${
                activeCategory === cat ? 'ajwa-pill-active' : 'ajwa-pill-inactive'
              }`}
            >
              {cat}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5 bg-ajwa-card px-3 py-2 rounded-xl border border-ajwa-gold/25">
            <span className="ajwa-urdu font-bold text-[11px] text-ajwa-ink/50">
              منافع دیکھیں
            </span>
            <button
              onClick={() => setViewMargins(!viewMargins)}
              className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-200 focus:outline-none ${
                viewMargins ? 'bg-ajwa-forest' : 'bg-ajwa-ink/20'
              }`}
            >
              <div
                className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform duration-200 ${
                  viewMargins ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <button onClick={openAddModal} className="btn-primary flex items-center gap-1.5 ajwa-urdu">
            <Plus className="w-4 h-4" />
            نیا آئٹم
          </button>
        </div>
      </div>

      {/* Category Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-5">
        {activeCategory === ALL_CATEGORY
          ? Array.from(groupedByCategory.entries()).map(([cat, items]) =>
              renderCategoryCard(cat, items),
            )
          : renderCategoryCard(activeCategory as MenuCategory, filteredItems)}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-16 text-ajwa-ink/40 ajwa-urdu">
          <p className="text-sm font-semibold">کوئی آئٹم نہیں ملا</p>
          <p className="text-xs mt-1">دوسری کیٹیگری یا تلاش آزمائیں</p>
        </div>
      )}

      {(showAddModal || editingItem) && (
        <Modal
          title={editingItem ? `ترمیم: ${editingItem.name}` : 'نیا آئٹم شامل کریں'}
          onClose={closeFormModal}
          maxWidth="max-w-md"
        >
          <form onSubmit={handleSaveItem} className="p-6 space-y-4 ajwa-urdu" dir="rtl">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col col-span-2">
                <label className="label-field">آئٹم کا نام</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="مثلاً چکن کڑاہی (ریگولر)"
                  className="input-field text-sm ajwa-urdu"
                />
              </div>

              <div className="flex flex-col">
                <label className="label-field">فل قیمت (روپے)</label>
                <input
                  type="number"
                  step="1"
                  min="0"
                  required
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  className="input-field text-xs"
                />
              </div>

              <div className="flex flex-col">
                <label className="label-field">ہاف قیمت (روپے)</label>
                <input
                  type="number"
                  step="1"
                  min="0"
                  value={halfPrice ?? ''}
                  onChange={(e) => setHalfPrice(e.target.value ? Number(e.target.value) : undefined)}
                  placeholder="اختیاری"
                  className="input-field text-xs"
                />
              </div>

              <div className="flex flex-col">
                <label className="label-field">لاگت (روپے)</label>
                <input
                  type="number"
                  step="1"
                  min="0"
                  required
                  value={foodCost}
                  onChange={(e) => setFoodCost(Number(e.target.value))}
                  className="input-field text-xs"
                />
              </div>

              <div className="flex flex-col">
                <label className="label-field">کیٹیگری</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as MenuCategory)}
                  className="input-field text-sm ajwa-urdu"
                >
                  {MENU_CATEGORIES.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col col-span-2">
                <label className="label-field">تفصیل</label>
                <textarea
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="input-field text-sm ajwa-urdu h-16 resize-none"
                />
              </div>

              <div className="flex flex-col col-span-2">
                <label className="label-field">تصویر URL</label>
                <div className="relative">
                  <ImageIcon className="w-4 h-4 absolute right-3 top-2.5 text-ajwa-ink/30" />
                  <input
                    type="text"
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    className="input-field text-xs pr-9"
                    dir="ltr"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-ajwa-gold/15">
              <button type="button" onClick={closeFormModal} className="btn-secondary ajwa-urdu">منسوخ</button>
              <button type="submit" className="btn-primary ajwa-urdu">
                {editingItem ? 'محفوظ کریں' : 'شامل کریں'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="آئٹم حذف کریں"
          message={`"${deleteTarget.name}" مینو سے حذف کریں؟ یہ واپس نہیں ہو سکتا۔`}
          onConfirm={() => { deleteMenuItem(deleteTarget.id); setDeleteTarget(null); }}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
};
