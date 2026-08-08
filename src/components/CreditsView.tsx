/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import { CreditSale, CreditCollectionAccount, CREDIT_COLLECTION_ACCOUNTS } from '../types';
import { Wallet, Clock, CheckCircle2, Phone, Trash2, BadgeCheck, MapPin, Banknote, Smartphone, Landmark } from 'lucide-react';
import { ConfirmDialog } from './ui/ConfirmDialog';
import { Modal } from './ui/Modal';
import { formatPKR } from '../lib/currency';

type Filter = 'all' | 'Unpaid' | 'Paid';

export const CreditsView: React.FC = () => {
  const { credits, settleCredit, deleteCredit, searchQuery } = useApp();
  const [filter, setFilter] = useState<Filter>('all');
  const [deleteTarget, setDeleteTarget] = useState<CreditSale | null>(null);
  const [settleTarget, setSettleTarget] = useState<CreditSale | null>(null);
  const [receivedVia, setReceivedVia] = useState<CreditCollectionAccount>('Cash');

  const accountIcon = (account: CreditCollectionAccount) => {
    if (account === 'JazzCash') return Smartphone;
    if (account === 'Bank Account') return Landmark;
    return Banknote;
  };

  const query = searchQuery.toLowerCase();
  const filteredCredits = useMemo(() => {
    return credits.filter(credit => {
      const matchesFilter = filter === 'all' || credit.status === filter;
      const matchesSearch =
        credit.customerName.toLowerCase().includes(query) ||
        credit.phone.includes(searchQuery) ||
        credit.orderId.toLowerCase().includes(query) ||
        credit.address.toLowerCase().includes(query);
      return matchesFilter && matchesSearch;
    });
  }, [credits, filter, query, searchQuery]);

  const totals = useMemo(() => {
    return credits.reduce(
      (acc, credit) => {
        acc.total += credit.amount;
        if (credit.status === 'Paid') acc.paid += credit.amount;
        else acc.unpaid += credit.amount;
        return acc;
      },
      { total: 0, paid: 0, unpaid: 0 }
    );
  }, [credits]);

  const unpaidCount = credits.filter(c => c.status === 'Unpaid').length;
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="p-6 pb-24">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
        <div>
          <h2 className="page-title">Credit Listing</h2>
          <p className="page-subtitle">
            Track udhaar customers from POS checkout and collect outstanding payments.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="card p-5">
          <div className="flex justify-between items-start mb-3">
            <span className="p-2.5 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-500 text-black">
              <Wallet className="w-5 h-5" />
            </span>
            <span className="text-zinc-400 text-[10px] font-bold uppercase">All credits</span>
          </div>
          <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Total Issued</p>
          <h3 className="text-xl font-bold text-zinc-900 mt-1">{formatPKR(totals.total)}</h3>
        </div>
        <div className="card p-5">
          <div className="flex justify-between items-start mb-3">
            <span className="p-2.5 rounded-xl bg-yellow-50 text-yellow-700">
              <Clock className="w-5 h-5" />
            </span>
            <span className="text-yellow-700 text-[10px] font-bold uppercase">{unpaidCount} open</span>
          </div>
          <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Outstanding</p>
          <h3 className="text-xl font-bold text-yellow-700 mt-1">{formatPKR(totals.unpaid)}</h3>
        </div>
        <div className="card p-5">
          <div className="flex justify-between items-start mb-3">
            <span className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700">
              <CheckCircle2 className="w-5 h-5" />
            </span>
            <span className="text-zinc-400 text-[10px] font-bold uppercase">Collected</span>
          </div>
          <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Paid Credits</p>
          <h3 className="text-xl font-bold text-zinc-900 mt-1">{formatPKR(totals.paid)}</h3>
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        {(['all', 'Unpaid', 'Paid'] as Filter[]).map(tab => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              filter === tab
                ? 'bg-ajwa-forest text-ajwa-gold-light shadow-sm'
                : 'bg-white text-zinc-600 border border-zinc-200 hover:border-amber-300'
            }`}
          >
            {tab === 'all' ? 'All' : tab}
          </button>
        ))}
      </div>

      <div className="card overflow-hidden">
        <div className="p-4 border-b border-zinc-100 bg-gradient-to-r from-zinc-900 to-zinc-800 flex justify-between items-center">
          <h3 className="text-xs font-bold text-amber-300 uppercase tracking-wider">Credit Customers</h3>
          <span className="text-xs text-zinc-400">{filteredCredits.length} records</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-zinc-200 text-zinc-400 font-bold uppercase tracking-wider bg-zinc-50">
                <th className="px-6 py-3">Customer</th>
                <th className="px-6 py-3">Order</th>
                <th className="px-6 py-3">Items</th>
                <th className="px-6 py-3 text-center">Due Date</th>
                <th className="px-6 py-3 text-right">Amount</th>
                <th className="px-6 py-3 text-center">Received Via</th>
                <th className="px-6 py-3 text-center">Status</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 font-medium">
              {filteredCredits.map(credit => {
                const overdue = credit.status === 'Unpaid' && credit.dueDate < today;
                return (
                  <tr key={credit.id} className="hover:bg-amber-50/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-zinc-800">{credit.customerName}</div>
                      <div className="flex items-center gap-1 text-[10px] text-zinc-400 font-mono mt-0.5">
                        <Phone className="w-3 h-3" />
                        {credit.phone}
                      </div>
                      {credit.address && (
                        <div className="flex items-center gap-1 text-[10px] text-zinc-400 mt-0.5">
                          <MapPin className="w-3 h-3" />
                          {credit.address}
                        </div>
                      )}
                      {credit.cnic && (
                        <div className="text-[10px] text-zinc-400 font-mono mt-0.5">CNIC: {credit.cnic}</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-mono text-zinc-600">{credit.orderId}</div>
                      <div className="text-[10px] text-zinc-400">{credit.orderType}</div>
                    </td>
                    <td className="px-6 py-4 text-zinc-500 max-w-[220px]">
                      <span className="line-clamp-2">{credit.itemsSummary || '—'}</span>
                      {credit.notes && (
                        <p className="text-[10px] text-zinc-400 mt-1 italic">{credit.notes}</p>
                      )}
                    </td>
                    <td className={`px-6 py-4 text-center ${overdue ? 'text-red-600 font-bold' : 'text-zinc-600'}`}>
                      {credit.dueDate}
                      {overdue && <div className="text-[9px] uppercase">Overdue</div>}
                    </td>
                    <td className="px-6 py-4 text-right font-bold font-mono text-zinc-900">
                      {formatPKR(credit.amount)}
                    </td>
                    <td className="px-6 py-4 text-center text-zinc-600">
                      {credit.receivedVia || '—'}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={credit.status === 'Paid' ? 'badge-success' : overdue ? 'badge-danger' : 'badge-warning'}>
                        {credit.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-1">
                        {credit.status === 'Unpaid' && (
                          <button
                            onClick={() => {
                              setReceivedVia('Cash');
                              setSettleTarget(credit);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-[10px] font-bold hover:bg-emerald-100 flex items-center gap-1"
                          >
                            <BadgeCheck className="w-3 h-3" />
                            Collect
                          </button>
                        )}
                        <button onClick={() => setDeleteTarget(credit)} className="btn-danger">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredCredits.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-10 text-center text-zinc-400">
                    No credit records found. Checkout on POS with Credit to add one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {settleTarget && (
        <Modal
          title="Collect Credit Payment"
          onClose={() => setSettleTarget(null)}
          maxWidth="max-w-md"
        >
          <div className="p-6 space-y-4">
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-amber-800">Customer</span>
                <span className="font-bold text-amber-900">{settleTarget.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-amber-800">Amount</span>
                <span className="font-mono font-bold text-amber-900">{formatPKR(settleTarget.amount)}</span>
              </div>
            </div>

            <div>
              <p className="label-field mb-2">Payment received via</p>
              <div className="grid grid-cols-3 gap-2">
                {CREDIT_COLLECTION_ACCOUNTS.map(account => {
                  const Icon = accountIcon(account);
                  const selected = receivedVia === account;
                  return (
                    <button
                      key={account}
                      type="button"
                      onClick={() => setReceivedVia(account)}
                      className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-center transition-all cursor-pointer ${
                        selected
                          ? 'border-ajwa-gold bg-amber-50 shadow-sm'
                          : 'border-zinc-200 bg-white hover:border-amber-300'
                      }`}
                    >
                      <span className={`w-9 h-9 rounded-full flex items-center justify-center ${
                        selected ? 'bg-ajwa-forest text-ajwa-gold-light' : 'bg-zinc-100 text-zinc-500'
                      }`}>
                        <Icon className="w-4 h-4" />
                      </span>
                      <span className={`text-[11px] font-bold ${selected ? 'text-ajwa-forest' : 'text-zinc-600'}`}>
                        {account}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-zinc-100">
              <button type="button" onClick={() => setSettleTarget(null)} className="btn-secondary">
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  settleCredit(settleTarget.id, receivedVia);
                  setSettleTarget(null);
                }}
                className="btn-primary"
              >
                Collect via {receivedVia}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Delete Credit"
          message={`Remove credit record for "${deleteTarget.customerName}"? This action cannot be undone.`}
          onConfirm={() => { deleteCredit(deleteTarget.id); setDeleteTarget(null); }}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
};
