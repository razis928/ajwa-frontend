/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Invoice } from '../types';
import { Plus, Check, FileText, AlertCircle, Edit2, Trash2 } from 'lucide-react';
import { Modal } from './ui/Modal';
import { ConfirmDialog } from './ui/ConfirmDialog';
import { formatPKR } from '../lib/currency';

const EMPTY_INVOICE = {
  vendorName: '',
  vendorId: '',
  amount: 0,
  dueDate: '',
  status: 'Pending' as const,
  category: 'Ingredients',
  description: '',
};

export const AccountsView: React.FC = () => {
  const { invoices, vendors, addInvoice, updateInvoice, deleteInvoice } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Invoice | null>(null);
  const [form, setForm] = useState(EMPTY_INVOICE);

  const openAdd = () => {
    setEditingInvoice(null);
    setForm(EMPTY_INVOICE);
    setShowModal(true);
  };

  const openEdit = (invoice: Invoice) => {
    setEditingInvoice(invoice);
    setForm({
      vendorName: invoice.vendorName,
      vendorId: invoice.vendorId ?? '',
      amount: invoice.amount,
      dueDate: invoice.dueDate,
      status: invoice.status,
      category: invoice.category,
      description: invoice.description ?? '',
    });
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.vendorName.trim()) return;

    const payload = {
      vendorName: form.vendorName,
      vendorId: form.vendorId || undefined,
      amount: form.amount,
      dueDate: form.dueDate,
      status: form.status,
      category: form.category,
      description: form.description || undefined,
    };

    if (editingInvoice) {
      updateInvoice(editingInvoice.id, payload);
    } else {
      addInvoice(payload);
    }
    setShowModal(false);
    setEditingInvoice(null);
    setForm(EMPTY_INVOICE);
  };

  const handleVendorSelect = (vendorId: string) => {
    const vendor = vendors.find(v => v.id === vendorId);
    if (vendor) {
      setForm(prev => ({ ...prev, vendorId, vendorName: vendor.name }));
    }
  };

  const totals = invoices.reduce((acc, inv) => {
    if (inv.status === 'Paid') acc.paid += inv.amount;
    else if (inv.status === 'Pending') acc.pending += inv.amount;
    else if (inv.status === 'Overdue') acc.overdue += inv.amount;
    return acc;
  }, { paid: 0, pending: 0, overdue: 0 });

  const pendingCount = invoices.filter(i => i.status === 'Pending' || i.status === 'Overdue').length;

  const statusBadge = (status: Invoice['status']) => {
    if (status === 'Paid') return 'badge-success';
    if (status === 'Pending') return 'badge-warning';
    return 'badge-danger';
  };

  return (
    <div className="p-6 pb-24">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
        <div>
          <h2 className="page-title">Accounts Management</h2>
          <p className="page-subtitle">
            Manage income, expenses, invoices, and financial records in one place.
          </p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Invoice
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card p-5">
          <div className="flex justify-between items-start mb-3">
            <span className="p-2.5 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-500 text-black">
              <Check className="w-5 h-5" />
            </span>
            <span className="text-zinc-400 text-[10px] font-bold uppercase">Settled</span>
          </div>
          <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Paid Out</p>
          <h3 className="text-xl font-bold text-zinc-900 mt-1">{formatPKR(totals.paid)}</h3>
        </div>

        <div className="card p-5">
          <div className="flex justify-between items-start mb-3">
            <span className="p-2.5 rounded-xl bg-yellow-50 text-yellow-700">
              <FileText className="w-5 h-5" />
            </span>
            <span className="text-zinc-400 text-[10px] font-bold uppercase">Pending</span>
          </div>
          <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Outstanding</p>
          <h3 className="text-xl font-bold text-zinc-900 mt-1">{formatPKR(totals.pending)}</h3>
        </div>

        <div className="card p-5">
          <div className="flex justify-between items-start mb-3">
            <span className="p-2.5 rounded-xl bg-red-50 text-red-700">
              <AlertCircle className="w-5 h-5" />
            </span>
            <span className="text-red-600 text-[10px] font-bold uppercase">Overdue</span>
          </div>
          <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Critical</p>
          <h3 className="text-xl font-bold text-red-600 mt-1">{formatPKR(totals.overdue)}</h3>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="p-4 border-b border-zinc-100 bg-gradient-to-r from-zinc-900 to-zinc-800 flex justify-between items-center">
          <h3 className="text-xs font-bold text-amber-300 uppercase tracking-wider">Accounts Payable</h3>
          <span className="text-xs text-zinc-400">{invoices.length} invoices · {pendingCount} actionable</span>
        </div>
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-zinc-200 text-zinc-400 font-bold uppercase tracking-wider bg-zinc-50">
              <th className="px-6 py-3">Invoice ID</th>
              <th className="px-6 py-3">Vendor</th>
              <th className="px-6 py-3">Category</th>
              <th className="px-6 py-3 text-center">Due Date</th>
              <th className="px-6 py-3 text-right">Amount</th>
              <th className="px-6 py-3 text-center">Status</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 font-medium">
            {invoices.map((inv) => (
              <tr key={inv.id} className="hover:bg-amber-50/30 transition-colors">
                <td className="px-6 py-4 font-mono text-zinc-500">{inv.id}</td>
                <td className="px-6 py-4 font-bold text-zinc-800">{inv.vendorName}</td>
                <td className="px-6 py-4 text-zinc-500">{inv.category}</td>
                <td className="px-6 py-4 text-center text-zinc-600">{inv.dueDate}</td>
                <td className="px-6 py-4 text-right font-bold font-mono text-zinc-900">{formatPKR(inv.amount)}</td>
                <td className="px-6 py-4 text-center">
                  <span className={statusBadge(inv.status)}>{inv.status}</span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-1">
                    <button onClick={() => openEdit(inv)} className="btn-danger">
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => setDeleteTarget(inv)} className="btn-danger">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <Modal
          title={editingInvoice ? `Edit Invoice: ${editingInvoice.id}` : 'Add New Invoice'}
          onClose={() => { setShowModal(false); setEditingInvoice(null); }}
          maxWidth="max-w-md"
        >
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {vendors.length > 0 && (
              <div className="flex flex-col">
                <label className="label-field">Link to Vendor</label>
                <select
                  value={form.vendorId}
                  onChange={e => handleVendorSelect(e.target.value)}
                  className="input-field"
                >
                  <option value="">Select vendor (optional)</option>
                  {vendors.map(v => (
                    <option key={v.id} value={v.id}>{v.name}</option>
                  ))}
                </select>
              </div>
            )}
            <div className="flex flex-col">
              <label className="label-field">Vendor Name</label>
              <input type="text" required value={form.vendorName} onChange={e => setForm({ ...form, vendorName: e.target.value })} className="input-field" />
            </div>
            <div className="flex flex-col">
              <label className="label-field">Amount (PKR)</label>
              <input type="number" step="0.01" required value={form.amount} onChange={e => setForm({ ...form, amount: Number(e.target.value) })} className="input-field" />
            </div>
            <div className="flex flex-col">
              <label className="label-field">Due Date</label>
              <input type="date" required value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} className="input-field" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col">
                <label className="label-field">Category</label>
                <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="input-field">
                  <option value="Ingredients">Ingredients</option>
                  <option value="Utilities">Utilities</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Marketing">Marketing</option>
                </select>
              </div>
              <div className="flex flex-col">
                <label className="label-field">Status</label>
                <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value as Invoice['status'] })} className="input-field">
                  <option value="Pending">Pending</option>
                  <option value="Paid">Paid</option>
                  <option value="Overdue">Overdue</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4 border-t border-zinc-100">
              <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
              <button type="submit" className="btn-primary">{editingInvoice ? 'Save Changes' : 'Add Invoice'}</button>
            </div>
          </form>
        </Modal>
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Delete Invoice"
          message={`Are you sure you want to remove invoice ${deleteTarget.id} for ${deleteTarget.vendorName}? This action cannot be undone.`}
          onConfirm={() => { deleteInvoice(deleteTarget.id); setDeleteTarget(null); }}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
};
