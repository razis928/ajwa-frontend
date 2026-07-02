/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Customer } from '../types';
import { Plus, Edit2, Trash2, Mail, Phone, Calendar, ShoppingBag, DollarSign } from 'lucide-react';
import { Modal } from './ui/Modal';
import { ConfirmDialog } from './ui/ConfirmDialog';
import { formatPKR } from '../lib/currency';

const EMPTY_CUSTOMER = { name: '', email: '', phone: '' };

export const CustomersView: React.FC = () => {
  const { customers, addCustomer, updateCustomer, deleteCustomer, searchQuery } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Customer | null>(null);
  const [form, setForm] = useState(EMPTY_CUSTOMER);

  const filteredCustomers = customers.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openAdd = () => {
    setEditingCustomer(null);
    setForm(EMPTY_CUSTOMER);
    setShowModal(true);
  };

  const openEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setForm({ name: customer.name, email: customer.email, phone: customer.phone });
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;

    if (editingCustomer) {
      updateCustomer(editingCustomer.id, form);
    } else {
      addCustomer({ ...form, ordersCount: 0, totalSpend: 0, lastOrderDate: 'N/A' });
    }
    setShowModal(false);
    setEditingCustomer(null);
    setForm(EMPTY_CUSTOMER);
  };

  return (
    <div className="p-6 pb-24">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
        <div>
          <h2 className="page-title">Customer Management</h2>
          <p className="page-subtitle">
            Store customer profiles, order history, and preferences for personalized service.
          </p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Customer
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCustomers.map(patron => (
          <div key={patron.id} className="card p-5 space-y-4 hover:border-amber-300 transition-all">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-zinc-800 text-sm font-sans">{patron.name}</h3>
                <span className="text-[9px] font-mono font-bold bg-zinc-100 text-zinc-600 px-2 py-0.5 rounded uppercase">
                  ID: {patron.id}
                </span>
              </div>
              <div className="flex gap-1">
                <button onClick={() => openEdit(patron)} className="btn-danger">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button onClick={() => setDeleteTarget(patron)} className="btn-danger">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-center text-xs">
              <div className="bg-zinc-50 p-2 rounded-xl border border-zinc-100">
                <div className="flex items-center justify-center gap-1 text-zinc-400 font-bold uppercase text-[9px]">
                  <ShoppingBag className="w-3 h-3" /> Visits
                </div>
                <p className="text-sm font-bold text-zinc-800 mt-1 font-mono">{patron.ordersCount}</p>
              </div>
              <div className="bg-amber-50 p-2 rounded-xl border border-amber-100">
                <div className="flex items-center justify-center gap-1 text-amber-700 font-bold uppercase text-[9px]">
                  <DollarSign className="w-3 h-3" /> Spend
                </div>
                <p className="text-sm font-bold text-amber-800 mt-1 font-mono">{formatPKR(patron.totalSpend)}</p>
              </div>
            </div>

            <div className="space-y-2 text-xs text-zinc-500 pt-1 border-t border-zinc-50">
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-amber-500" />
                <span className="font-mono truncate">{patron.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-amber-500" />
                <span className="font-mono">{patron.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-[10px]">
                <Calendar className="w-3.5 h-3.5 text-amber-500" />
                <span>Last visit: <strong className="text-zinc-600">{patron.lastOrderDate}</strong></span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <Modal
          title={editingCustomer ? `Edit Customer: ${editingCustomer.name}` : 'Add New Customer'}
          onClose={() => { setShowModal(false); setEditingCustomer(null); }}
        >
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="flex flex-col">
              <label className="label-field">Full Name</label>
              <input type="text" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="input-field" />
            </div>
            <div className="flex flex-col">
              <label className="label-field">Email</label>
              <input type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="input-field" />
            </div>
            <div className="flex flex-col">
              <label className="label-field">Phone</label>
              <input type="text" required value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="input-field" />
            </div>
            <div className="flex justify-end gap-2 pt-4 border-t border-zinc-100">
              <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
              <button type="submit" className="btn-primary">{editingCustomer ? 'Save Changes' : 'Add Customer'}</button>
            </div>
          </form>
        </Modal>
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Delete Customer"
          message={`Are you sure you want to remove "${deleteTarget.name}" from your customer database? This action cannot be undone.`}
          onConfirm={() => { deleteCustomer(deleteTarget.id); setDeleteTarget(null); }}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
};
