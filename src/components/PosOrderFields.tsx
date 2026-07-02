import React from 'react';
import { useApp } from '../context/AppContext';
import { Customer } from '../types';
import { Utensils, ShoppingBag, Truck, UserPlus } from 'lucide-react';

const fieldClass =
  'w-full border border-zinc-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500';

const labelClass = 'text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-1.5 block';

function applySavedCustomer(
  customer: Customer | undefined,
  updateOrderDetails: (details: Partial<import('../types').Order>) => void,
  setSelectedCustomerId: (id: string | null) => void,
  customerId: string
) {
  setSelectedCustomerId(customerId || null);
  if (customer) {
    updateOrderDetails({ customerName: customer.name, contactPhone: customer.phone });
  }
}

interface ManualCustomerFieldsProps {
  activeOrder: import('../types').Order;
  selectedCustomerId: string | null;
  setSelectedCustomerId: (id: string | null) => void;
  updateOrderDetails: (details: Partial<import('../types').Order>) => void;
  nameRequired?: boolean;
  phoneRequired?: boolean;
}

const ManualCustomerFields: React.FC<ManualCustomerFieldsProps> = ({
  activeOrder,
  selectedCustomerId,
  setSelectedCustomerId,
  updateOrderDetails,
  nameRequired = false,
  phoneRequired = false,
}) => {
  const clearSavedSelection = () => {
    if (selectedCustomerId) setSelectedCustomerId(null);
  };

  return (
    <>
      <div>
        <label className={labelClass}>
          Customer Name {nameRequired ? '*' : '(optional)'}
        </label>
        <input
          type="text"
          required={nameRequired}
          value={activeOrder.customerName ?? ''}
          onChange={e => {
            clearSavedSelection();
            updateOrderDetails({ customerName: e.target.value });
          }}
          placeholder="Enter customer name"
          className={fieldClass}
        />
      </div>
      <div>
        <label className={labelClass}>
          Phone Number {phoneRequired ? '*' : '(optional)'}
        </label>
        <input
          type="tel"
          required={phoneRequired}
          value={activeOrder.contactPhone ?? ''}
          onChange={e => {
            clearSavedSelection();
            updateOrderDetails({ contactPhone: e.target.value });
          }}
          placeholder="03XX-XXXXXXX"
          className={fieldClass}
        />
      </div>
    </>
  );
};

interface SavedCustomerSelectProps {
  customers: Customer[];
  selectedCustomerId: string | null;
  onSelect: (id: string) => void;
}

const SavedCustomerSelect: React.FC<SavedCustomerSelectProps> = ({
  customers,
  selectedCustomerId,
  onSelect,
}) => (
  <div>
    <label className={labelClass}>Saved Customer (optional)</label>
    <select
      value={selectedCustomerId ?? ''}
      onChange={e => onSelect(e.target.value)}
      className={fieldClass}
    >
      <option value="">— Enter new customer manually —</option>
      {customers.map(c => (
        <option key={c.id} value={c.id}>{c.name} — {c.phone}</option>
      ))}
    </select>
    {!selectedCustomerId && (
      <p className="text-[10px] text-zinc-400 mt-1.5 flex items-center gap-1">
        <UserPlus className="w-3 h-3" />
        Type any name & phone below — saved on checkout
      </p>
    )}
  </div>
);

export const PosOrderFields: React.FC = () => {
  const {
    activeOrder,
    customers,
    selectedCustomerId,
    setSelectedCustomerId,
    setOrderType,
    updateOrderDetails,
  } = useApp();

  const orderType = activeOrder.type;

  const handleSavedCustomerSelect = (id: string) => {
    const customer = customers.find(c => c.id === id);
    applySavedCustomer(customer, updateOrderDetails, setSelectedCustomerId, id);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-1 bg-zinc-50 border border-zinc-100 p-1 rounded-xl">
        {([
          { type: 'Dine-In' as const, icon: Utensils },
          { type: 'Takeaway' as const, icon: ShoppingBag },
          { type: 'Delivery' as const, icon: Truck },
        ]).map(({ type, icon: Icon }) => (
          <button
            key={type}
            type="button"
            onClick={() => setOrderType(type)}
            className={`py-2 rounded-lg font-semibold text-xs transition-all cursor-pointer flex flex-col items-center gap-0.5 ${
              orderType === type
                ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-black shadow-sm'
                : 'text-zinc-500 hover:text-zinc-800'
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            {type}
          </button>
        ))}
      </div>

      {orderType === 'Takeaway' && (
        <div className="space-y-3 p-3 bg-amber-50/50 border border-amber-100 rounded-xl">
          <p className="text-xs font-semibold text-amber-800">Takeaway Details</p>

          <SavedCustomerSelect
            customers={customers}
            selectedCustomerId={selectedCustomerId}
            onSelect={handleSavedCustomerSelect}
          />
          <ManualCustomerFields
            activeOrder={activeOrder}
            selectedCustomerId={selectedCustomerId}
            setSelectedCustomerId={setSelectedCustomerId}
            updateOrderDetails={updateOrderDetails}
            nameRequired
            phoneRequired
          />

          <div>
            <label className={labelClass}>Pickup Time *</label>
            <input
              type="datetime-local"
              required
              value={activeOrder.pickupTime ?? ''}
              onChange={e => updateOrderDetails({ pickupTime: e.target.value })}
              className={fieldClass}
            />
          </div>
        </div>
      )}

      {orderType === 'Delivery' && (
        <div className="space-y-3 p-3 bg-amber-50/50 border border-amber-100 rounded-xl">
          <p className="text-xs font-semibold text-amber-800">Delivery Details</p>

          <SavedCustomerSelect
            customers={customers}
            selectedCustomerId={selectedCustomerId}
            onSelect={handleSavedCustomerSelect}
          />
          <ManualCustomerFields
            activeOrder={activeOrder}
            selectedCustomerId={selectedCustomerId}
            setSelectedCustomerId={setSelectedCustomerId}
            updateOrderDetails={updateOrderDetails}
            nameRequired
            phoneRequired
          />

          <div>
            <label className={labelClass}>Delivery Address *</label>
            <textarea
              required
              rows={2}
              value={activeOrder.deliveryAddress ?? ''}
              onChange={e => updateOrderDetails({ deliveryAddress: e.target.value })}
              placeholder="Street, building, apartment, city..."
              className={fieldClass + ' resize-none'}
            />
          </div>

          <div>
            <label className={labelClass}>Delivery Notes (optional)</label>
            <textarea
              rows={2}
              value={activeOrder.deliveryNotes ?? ''}
              onChange={e => updateOrderDetails({ deliveryNotes: e.target.value })}
              placeholder="Gate code, landmarks, etc."
              className={fieldClass + ' resize-none'}
            />
          </div>
        </div>
      )}
    </div>
  );
};
