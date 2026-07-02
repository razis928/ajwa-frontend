/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { InventoryItem } from '../types';
import { Plus, Trash2, Edit2, AlertTriangle } from 'lucide-react';
import { Modal } from './ui/Modal';
import { ConfirmDialog } from './ui/ConfirmDialog';

const EMPTY_FORM = {
  name: '',
  stock: 0,
  unit: 'units',
  minThreshold: 10,
  category: 'Meats',
};

const CATEGORIES = ['Meats', 'Dairy', 'Bakery', 'Produce', 'Beverages', 'Dry Goods'];

export const InventoryView: React.FC = () => {
  const {
    inventoryItems,
    addInventoryItem,
    updateInventoryItem,
    deleteInventoryItem,
    reorderItem,
    searchQuery,
  } = useApp();

  const [showFormModal, setShowFormModal] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<InventoryItem | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const filteredInventory = inventoryItems.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openAdd = () => {
    setEditingItem(null);
    setForm(EMPTY_FORM);
    setShowFormModal(true);
  };

  const openEdit = (item: InventoryItem) => {
    setEditingItem(item);
    setForm({
      name: item.name,
      stock: item.stock,
      unit: item.unit,
      minThreshold: item.minThreshold,
      category: item.category,
    });
    setShowFormModal(true);
  };

  const closeFormModal = () => {
    setShowFormModal(false);
    setEditingItem(null);
    setForm(EMPTY_FORM);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;

    if (editingItem) {
      updateInventoryItem(editingItem.id, form);
    } else {
      addInventoryItem(form);
    }
    closeFormModal();
  };

  return (
    <div className="p-6 pb-24">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
        <div>
          <h2 className="page-title">Inventory Management</h2>
          <p className="page-subtitle">
            Track stock levels, monitor consumption, and receive low inventory alerts.
          </p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Inventory Item
        </button>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 font-semibold uppercase tracking-wider text-xs">
              <th className="px-6 py-3.5">Ingredient</th>
              <th className="px-6 py-3.5">Category</th>
              <th className="px-6 py-3.5 text-center">Current Stock</th>
              <th className="px-6 py-3.5 text-center">Min Threshold</th>
              <th className="px-6 py-3.5 text-center">Status</th>
              <th className="px-6 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {filteredInventory.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-8 text-sm text-zinc-400">
                  No matching ingredients found in inventory.
                </td>
              </tr>
            ) : (
              filteredInventory.map((item) => {
                const isCritical = item.stock <= item.minThreshold;
                return (
                  <tr key={item.id} className="hover:bg-amber-50/30 transition-colors">
                    <td className="px-6 py-4 font-semibold text-zinc-800">{item.name}</td>
                    <td className="px-6 py-4 text-zinc-500">{item.category}</td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => updateInventoryItem(item.id, { stock: Math.max(0, item.stock - 1) })}
                          className="w-6 h-6 flex items-center justify-center bg-zinc-100 hover:bg-zinc-200 text-zinc-600 rounded font-bold text-xs"
                        >
                          -
                        </button>
                        <span className={`font-bold ${isCritical ? 'text-red-600' : 'text-zinc-900'}`}>
                          {item.stock}
                        </span>
                        <span className="text-xs text-zinc-400">{item.unit}</span>
                        <button
                          type="button"
                          onClick={() => updateInventoryItem(item.id, { stock: item.stock + 1 })}
                          className="w-6 h-6 flex items-center justify-center bg-zinc-100 hover:bg-zinc-200 text-zinc-600 rounded font-bold text-xs"
                        >
                          +
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center font-medium text-zinc-600">{item.minThreshold}</td>
                    <td className="px-6 py-4 text-center">
                      {isCritical ? (
                        <span className="badge-danger inline-flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          Critical
                        </span>
                      ) : (
                        <span className="badge-success">Adequate</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2 items-center">
                        <button
                          type="button"
                          onClick={() => reorderItem(item.id)}
                          className="px-2 py-1 bg-amber-50 border border-amber-200 text-amber-800 hover:bg-amber-100 rounded-lg text-xs font-semibold cursor-pointer"
                        >
                          Reorder
                        </button>
                        <button type="button" onClick={() => openEdit(item)} className="btn-danger">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button type="button" onClick={() => setDeleteTarget(item)} className="btn-danger">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {showFormModal && (
        <Modal
          title={editingItem ? `Edit: ${editingItem.name}` : 'Add Inventory Item'}
          onClose={closeFormModal}
          maxWidth="max-w-md"
        >
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="flex flex-col">
              <label className="label-field">Item Name</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Fresh Truffles"
                className="input-field"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col">
                <label className="label-field">Stock Level</label>
                <input
                  type="number"
                  min="0"
                  required
                  value={form.stock}
                  onChange={e => setForm({ ...form, stock: Number(e.target.value) })}
                  className="input-field"
                />
              </div>
              <div className="flex flex-col">
                <label className="label-field">Unit</label>
                <input
                  type="text"
                  required
                  value={form.unit}
                  onChange={e => setForm({ ...form, unit: e.target.value })}
                  placeholder="units, oz"
                  className="input-field"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col">
                <label className="label-field">Min Alert Level</label>
                <input
                  type="number"
                  min="0"
                  required
                  value={form.minThreshold}
                  onChange={e => setForm({ ...form, minThreshold: Number(e.target.value) })}
                  className="input-field"
                />
              </div>
              <div className="flex flex-col">
                <label className="label-field">Category</label>
                <select
                  value={form.category}
                  onChange={e => setForm({ ...form, category: e.target.value })}
                  className="input-field"
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4 border-t border-zinc-100">
              <button type="button" onClick={closeFormModal} className="btn-secondary">Cancel</button>
              <button type="submit" className="btn-primary">
                {editingItem ? 'Save Changes' : 'Add Item'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Delete Inventory Item"
          message={`Are you sure you want to remove "${deleteTarget.name}" from inventory? This action cannot be undone.`}
          onConfirm={() => { deleteInventoryItem(deleteTarget.id); setDeleteTarget(null); }}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
};
