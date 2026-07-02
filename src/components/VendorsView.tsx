/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Vendor } from '../types';
import { Plus, Edit2, Trash2, Mail, Phone, Tag } from 'lucide-react';
import { Modal } from './ui/Modal';
import { ConfirmDialog } from './ui/ConfirmDialog';

const EMPTY_VENDOR = {
  name: '',
  contactPerson: '',
  email: '',
  phone: '',
  category: 'Produce',
  status: 'Active' as const,
};

export const VendorsView: React.FC = () => {
  const { vendors, addVendor, updateVendor, deleteVendor } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Vendor | null>(null);
  const [form, setForm] = useState(EMPTY_VENDOR);

  const openAdd = () => {
    setEditingVendor(null);
    setForm(EMPTY_VENDOR);
    setShowModal(true);
  };

  const openEdit = (vendor: Vendor) => {
    setEditingVendor(vendor);
    setForm({
      name: vendor.name,
      contactPerson: vendor.contactPerson,
      email: vendor.email,
      phone: vendor.phone,
      category: vendor.category,
      status: vendor.status,
    });
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;

    if (editingVendor) {
      updateVendor(editingVendor.id, form);
    } else {
      addVendor(form);
    }
    setShowModal(false);
    setEditingVendor(null);
    setForm(EMPTY_VENDOR);
  };

  const handleToggleStatus = (id: string, current: 'Active' | 'Inactive') => {
    updateVendor(id, { status: current === 'Active' ? 'Inactive' : 'Active' });
  };

  return (
    <div className="p-6 pb-24">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
        <div>
          <h2 className="page-title">Vendor Management</h2>
          <p className="page-subtitle">
            Maintain supplier information, purchase orders, and payment records.
          </p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Vendor
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {vendors.map((vendor) => (
          <div
            key={vendor.id}
            className={`card p-5 space-y-4 relative hover:border-amber-300 transition-all ${
              vendor.status === 'Inactive' ? 'opacity-70' : ''
            }`}
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-zinc-800 text-sm font-sans">{vendor.name}</h3>
                <span className="text-[10px] text-zinc-400 font-semibold uppercase">{vendor.category}</span>
              </div>
              <button
                onClick={() => handleToggleStatus(vendor.id, vendor.status)}
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border cursor-pointer transition-all ${
                  vendor.status === 'Active'
                    ? 'badge-success'
                    : 'bg-zinc-100 text-zinc-500 border-zinc-200'
                }`}
              >
                {vendor.status}
              </button>
            </div>

            <div className="space-y-2 text-xs text-zinc-600 border-t border-b border-zinc-50 py-3">
              <div className="flex items-center gap-2">
                <Tag className="w-3.5 h-3.5 text-amber-500" />
                <span className="font-semibold text-zinc-700">{vendor.contactPerson}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-amber-500" />
                <span className="font-mono text-zinc-500 truncate">{vendor.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-amber-500" />
                <span className="font-mono text-zinc-500">{vendor.phone}</span>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button onClick={() => openEdit(vendor)} className="btn-danger">
                <Edit2 className="w-4 h-4" />
              </button>
              <button onClick={() => setDeleteTarget(vendor)} className="btn-danger">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <Modal
          title={editingVendor ? `Edit Vendor: ${editingVendor.name}` : 'Add New Vendor'}
          onClose={() => { setShowModal(false); setEditingVendor(null); }}
        >
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="flex flex-col">
              <label className="label-field">Company Name</label>
              <input type="text" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="input-field" />
            </div>
            <div className="flex flex-col">
              <label className="label-field">Contact Person</label>
              <input type="text" required value={form.contactPerson} onChange={e => setForm({ ...form, contactPerson: e.target.value })} className="input-field" />
            </div>
            <div className="flex flex-col">
              <label className="label-field">Email</label>
              <input type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="input-field" />
            </div>
            <div className="flex flex-col">
              <label className="label-field">Phone</label>
              <input type="text" required value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="input-field" />
            </div>
            <div className="flex flex-col">
              <label className="label-field">Category</label>
              <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="input-field">
                <option value="Meats & Poultry">Meats & Poultry</option>
                <option value="Seafood">Seafood</option>
                <option value="Produce">Produce</option>
                <option value="Beverages & Wine">Beverages & Wine</option>
                <option value="Dairy">Dairy</option>
                <option value="Bakery">Bakery</option>
              </select>
            </div>
            <div className="flex justify-end gap-2 pt-4 border-t border-zinc-100">
              <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
              <button type="submit" className="btn-primary">{editingVendor ? 'Save Changes' : 'Add Vendor'}</button>
            </div>
          </form>
        </Modal>
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Delete Vendor"
          message={`Are you sure you want to remove "${deleteTarget.name}"? This action cannot be undone.`}
          onConfirm={() => { deleteVendor(deleteTarget.id); setDeleteTarget(null); }}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
};
