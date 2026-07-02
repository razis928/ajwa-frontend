/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { MenuItem, Order, MENU_CATEGORIES } from '../types';
import { PosOrderFields } from './PosOrderFields';
import { formatPKR, formatPKRPrecise } from '../lib/currency';
import { 
  ShoppingBasket, 
  Minus, 
  Plus, 
  Trash2, 
  Percent, 
  Trash, 
  Columns, 
  Printer, 
  DollarSign, 
  Flame, 
  Soup, 
  Sparkles, 
  GlassWater, 
  Coffee, 
  Utensils, 
  CheckCircle,
  X 
} from 'lucide-react';

export const POSView: React.FC = () => {
  const {
    menuItems,
    activeOrder,
    addToOrder,
    updateOrderQty,
    removeFromOrder,
    voidOrder,
    applyDiscount,
    discountPercentage,
    processPayment,
    printedReceipt,
    setPrintedReceipt,
  } = useApp();

  const [posCategory, setPosCategory] = useState<string>('تمام آئٹمز');
  const [showDiscountModal, setShowDiscountModal] = useState(false);
  const [showSplitModal, setShowSplitModal] = useState(false);
  const [splitCount, setSplitCount] = useState(2);
  const [showSuccessPaymentModal, setShowSuccessPaymentModal] = useState(false);
  const [lastProcessedOrder, setLastProcessedOrder] = useState<Order | null>(null);

  const categories = ['تمام آئٹمز', ...MENU_CATEGORIES];

  const getDishIcon = (item: MenuItem) => {
    const cat = item.category;

    if (cat.includes('کڑاہی') || cat === 'باربی کیو' || cat.includes('ہانڈی')) {
      return Flame;
    }
    if (cat === 'تندوری') {
      return Soup;
    }
    if (cat === 'چائے') {
      return Coffee;
    }
    if (cat === 'کولڈ ڈرنکس' || cat === 'مشروبات') {
      return GlassWater;
    }
    if (cat === 'رائس') {
      return Utensils;
    }
    if (cat === 'سلاد اور رائتہ' || cat === 'دیسی کھانے') {
      return Sparkles;
    }
    return Utensils;
  };

  const filteredMenuItems = useMemo(() => {
    return menuItems.filter(item => {
      if (posCategory === 'تمام آئٹمز') return true;
      return item.category === posCategory;
    });
  }, [menuItems, posCategory]);

  const handlePayNow = () => {
    if (activeOrder.items.length === 0) return;
    const orderToRecord = { ...activeOrder };
    const success = processPayment();
    if (success) {
      setLastProcessedOrder(orderToRecord);
      setShowSuccessPaymentModal(true);
    }
  };

  const handlePrint = () => {
    if (activeOrder.items.length === 0) return;
    setPrintedReceipt({ ...activeOrder });
  };

  return (
    <div className="flex flex-1 h-[calc(100vh-4rem)] overflow-hidden">
      {/* Left Column: Menu Items Selection Grid */}
      <section className="flex-1 flex flex-col p-4 gap-3 overflow-hidden">
        {/* Horizontal Category Switcher */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 shrink-0 scrollbar-thin" dir="rtl">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setPosCategory(cat)}
              className={`pos-category-pill rounded-full whitespace-nowrap transition-all cursor-pointer ${
                posCategory === cat
                  ? 'bg-gradient-to-r from-ajwa-gold to-ajwa-gold-light text-ajwa-forest-dark shadow-md border border-ajwa-gold/40'
                  : 'bg-ajwa-card border border-ajwa-gold/25 text-ajwa-ink hover:bg-ajwa-cream'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Dynamic Grid: Selectable Dishes */}
        <div className="flex-1 overflow-y-auto pr-1" dir="rtl">
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2">
            {filteredMenuItems.map(item => {
              const IconComponent = getDishIcon(item);
              const isOutOfStock = !item.inStock;
              const hasPortions = item.halfPrice != null;

              if (hasPortions) {
                return (
                  <div
                    key={item.id}
                    className={`pos-item-tile bg-ajwa-card border border-ajwa-gold/25 rounded-xl flex flex-col items-stretch text-center transition-all relative ${
                      isOutOfStock ? 'opacity-50 bg-ajwa-cream' : 'shadow-sm hover:border-ajwa-gold hover:shadow-md'
                    }`}
                  >
                    {isOutOfStock && (
                      <span className="absolute top-2 left-2 bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded ajwa-urdu-pos">
                        ختم
                      </span>
                    )}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 shrink-0 mx-auto ${
                      isOutOfStock ? 'bg-ajwa-ink/10 text-ajwa-ink/30' : 'bg-ajwa-forest/10 text-ajwa-forest'
                    }`}>
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <h3 className="pos-item-name text-center flex-1 min-h-0">
                      {item.name}
                    </h3>
                    <div className="grid grid-cols-2 gap-1.5 pt-1.5 border-t border-ajwa-gold/15">
                      <button
                        type="button"
                        disabled={isOutOfStock}
                        onClick={() => addToOrder(item, 'half')}
                        className="flex flex-col items-center justify-center py-1.5 px-1 rounded-lg border border-ajwa-gold/30 bg-ajwa-cream/80 hover:bg-ajwa-gold/20 hover:border-ajwa-gold transition-all cursor-pointer active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <span className="ajwa-urdu-pos text-xs font-bold text-ajwa-forest leading-tight">ہاف</span>
                        <span className="font-mono text-[10px] font-semibold text-ajwa-ink leading-tight">
                          {formatPKR(item.halfPrice!)}
                        </span>
                      </button>
                      <button
                        type="button"
                        disabled={isOutOfStock}
                        onClick={() => addToOrder(item, 'full')}
                        className="flex flex-col items-center justify-center py-1.5 px-1 rounded-lg border border-ajwa-forest/30 bg-ajwa-forest/10 hover:bg-ajwa-forest/20 hover:border-ajwa-forest transition-all cursor-pointer active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <span className="ajwa-urdu-pos text-xs font-bold text-ajwa-forest leading-tight">فل</span>
                        <span className="font-mono text-[10px] font-bold text-ajwa-forest leading-tight">
                          {formatPKR(item.price)}
                        </span>
                      </button>
                    </div>
                  </div>
                );
              }

              return (
                <button
                  key={item.id}
                  type="button"
                  disabled={isOutOfStock}
                  onClick={() => addToOrder(item)}
                  className={`pos-item-tile bg-ajwa-card border border-ajwa-gold/25 rounded-xl flex flex-col items-stretch text-center transition-all relative cursor-pointer active:scale-[0.98] hover:border-ajwa-gold hover:shadow-md group ${
                    isOutOfStock ? 'opacity-50 cursor-not-allowed bg-ajwa-cream' : 'shadow-sm'
                  }`}
                >
                  {isOutOfStock && (
                    <span className="absolute top-2 left-2 bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded ajwa-urdu-pos">
                      ختم
                    </span>
                  )}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 shrink-0 mx-auto ${
                    isOutOfStock ? 'bg-ajwa-ink/10 text-ajwa-ink/30' : 'bg-ajwa-forest/10 text-ajwa-forest'
                  }`}>
                    <IconComponent className="w-4 h-4" />
                  </div>
                  <div className="w-full flex-1 flex flex-col justify-between gap-1">
                    <h3 className="pos-item-name text-center min-h-0">
                      {item.name}
                    </h3>
                    <div className="text-center pt-1 border-t border-ajwa-gold/15">
                      <p className="font-mono text-xs font-bold text-ajwa-forest leading-tight">
                        {formatPKR(item.price)}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Bottom Generic Controls Bar */}
        <div className="grid grid-cols-4 gap-4 mt-auto shrink-0 border-t border-zinc-100 pt-4">
          <button 
            onClick={() => setShowDiscountModal(true)}
            className="flex items-center justify-center gap-2 bg-zinc-50 hover:bg-zinc-100 p-4 rounded-xl font-bold text-xs text-zinc-700 border border-zinc-200 transition-all active:scale-[0.98] cursor-pointer"
          >
            <Percent className="w-4 h-4 text-zinc-500" />
            Discount {discountPercentage > 0 && `(${discountPercentage}%)`}
          </button>
          <button 
            onClick={voidOrder}
            className="flex items-center justify-center gap-2 bg-rose-50 hover:bg-rose-100 p-4 rounded-xl font-bold text-xs text-rose-700 border border-rose-100 transition-all active:scale-[0.98] cursor-pointer"
          >
            <Trash className="w-4 h-4 text-rose-500" />
            Void Order
          </button>
          <button 
            onClick={() => setShowSplitModal(true)}
            className="flex items-center justify-center gap-2 bg-zinc-50 hover:bg-zinc-100 p-4 rounded-xl font-bold text-xs text-zinc-700 border border-zinc-200 transition-all active:scale-[0.98] cursor-pointer"
          >
            <Columns className="w-4 h-4 text-zinc-500" />
            Split Bill
          </button>
          <button 
            onClick={handlePrint}
            className="flex items-center justify-center gap-2 bg-zinc-50 hover:bg-zinc-100 p-4 rounded-xl font-bold text-xs text-zinc-700 border border-zinc-200 transition-all active:scale-[0.98] cursor-pointer"
          >
            <Printer className="w-4 h-4 text-zinc-500" />
            Print Receipt
          </button>
        </div>
      </section>

      {/* Right Column: Order Side Panel */}
      <aside className="w-[400px] bg-ajwa-card border-l border-ajwa-gold/25 flex flex-col shrink-0">
        <div className="p-3 border-b border-zinc-100 shrink-0 max-h-[45vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-3">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                Current Ticket
              </span>
              <span className="text-lg font-bold text-zinc-900 font-sans mt-0.5">
                {activeOrder.id}
              </span>
            </div>
            <div className="px-2.5 py-1 bg-ajwa-forest/10 text-ajwa-forest rounded-lg text-xs font-bold border border-ajwa-gold/25">
              Active Session
            </div>
          </div>

          <PosOrderFields />
        </div>

        {/* Scrollable Order Items List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {activeOrder.items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-zinc-400 text-center opacity-70">
              <ShoppingBasket className="w-12 h-12 mb-3 text-zinc-300 animate-pulse" />
              <p className="font-bold text-sm text-zinc-700 font-sans">Order Is Empty</p>
              <p className="text-xs text-zinc-400 mt-1">Select items from the catalog</p>
            </div>
          ) : (
            activeOrder.items.map(item => (
              <div 
                key={item.id} 
                className="flex items-start gap-2 p-2 hover:bg-ajwa-cream/60 border border-transparent hover:border-ajwa-gold/20 rounded-lg transition-all group"
                dir="rtl"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-1.5">
                    <h4 className="pos-item-name text-xs font-semibold text-ajwa-ink line-clamp-2 min-h-0 flex-1 text-right leading-snug">
                      {item.name}
                    </h4>
                    <span className="font-bold text-ajwa-forest font-mono text-xs shrink-0">
                      {formatPKR(item.price * item.quantity)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-1.5">
                    <div className="pos-qty-control">
                      <button 
                        type="button"
                        onClick={() => updateOrderQty(item.id, -1)}
                        className="pos-qty-btn"
                      >
                        <Minus className="w-2.5 h-2.5" />
                      </button>
                      <span className="text-[11px] font-bold text-zinc-800 px-1 min-w-[16px] text-center">
                        {item.quantity}
                      </span>
                      <button 
                        type="button"
                        onClick={() => updateOrderQty(item.id, 1)}
                        className="pos-qty-btn"
                      >
                        <Plus className="w-2.5 h-2.5" />
                      </button>
                    </div>
                    <button 
                      onClick={() => removeFromOrder(item.id)}
                      className="text-zinc-400 hover:text-rose-600 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Totals Summary & Checkout */}
        <div className="p-5 border-t border-zinc-200 bg-zinc-50 shrink-0">
          <div className="space-y-1.5 mb-5 text-xs font-medium">
            <div className="flex justify-between text-zinc-500">
              <span>Subtotal</span>
              <span className="font-mono">{formatPKR(activeOrder.subtotal)}</span>
            </div>
            {discountPercentage > 0 && (
              <div className="flex justify-between text-rose-600 font-bold">
                <span>Discount ({discountPercentage}%)</span>
                <span className="font-mono">-{formatPKR((activeOrder.subtotal / (1 - discountPercentage / 100)) * (discountPercentage / 100))}</span>
              </div>
            )}
            <div className="flex justify-between pt-2 border-t border-zinc-200 text-zinc-800 font-bold text-sm">
              <span>Grand Total</span>
              <span className="text-ajwa-forest font-mono text-base">
                {formatPKR(activeOrder.total)}
              </span>
            </div>
          </div>

          <button 
            onClick={handlePayNow}
            disabled={activeOrder.items.length === 0}
            className={`w-full py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg cursor-pointer active:scale-[0.98] transition-all ${
              activeOrder.items.length === 0
                ? 'bg-zinc-200 text-zinc-400 shadow-none cursor-not-allowed'
                : 'bg-gradient-to-r from-ajwa-gold to-ajwa-gold-light hover:from-ajwa-gold-dark hover:to-ajwa-gold text-ajwa-forest-dark'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            Pay & Checkout Now
          </button>
        </div>
      </aside>

      {/* MODAL 1: Discount Applicator */}
      {showDiscountModal && (
        <div className="fixed inset-0 bg-zinc-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl border border-zinc-100">
            <div className="px-6 py-4 border-b border-zinc-100 flex justify-between items-center bg-zinc-50">
              <h3 className="font-bold text-zinc-800 text-sm">Apply Promotion Discount</h3>
              <button onClick={() => setShowDiscountModal(false)} className="text-zinc-400 hover:text-zinc-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-xs text-zinc-500">
                Choose a pre-approved percentage reduction for the current ticket subtotal.
              </p>
              <div className="grid grid-cols-4 gap-2">
                {[0, 5, 10, 15, 20, 25, 30, 50].map(pct => (
                  <button
                    key={pct}
                    onClick={() => { applyDiscount(pct); setShowDiscountModal(false); }}
                    className={`py-3 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                      discountPercentage === pct
                        ? 'bg-amber-700 text-white border-amber-700 shadow-sm'
                        : 'bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50'
                    }`}
                  >
                    {pct === 0 ? 'Clear' : `${pct}%`}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Split Billing Simulator */}
      {showSplitModal && (
        <div className="fixed inset-0 bg-zinc-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl border border-zinc-100">
            <div className="px-6 py-4 border-b border-zinc-100 flex justify-between items-center bg-zinc-50">
              <h3 className="font-bold text-zinc-800 text-sm">Split Order Bill</h3>
              <button onClick={() => setShowSplitModal(false)} className="text-zinc-400 hover:text-zinc-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="text-center py-2">
                <p className="text-xs text-zinc-400 uppercase tracking-wider">Per Person Shares</p>
                <h4 className="text-3xl font-bold text-amber-700 font-mono mt-1">
                  {formatPKR(activeOrder.total / splitCount)}
                </h4>
                <p className="text-[10px] text-zinc-400 mt-1">divided across {splitCount} diners</p>
              </div>

              {/* Adjusters */}
              <div className="flex items-center justify-between bg-zinc-50 p-3 rounded-xl border border-zinc-200">
                <span className="text-xs font-semibold text-zinc-500">Diner Count</span>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setSplitCount(Math.max(2, splitCount - 1))}
                    className="w-8 h-8 flex items-center justify-center bg-white border border-zinc-200 rounded-lg font-bold"
                  >
                    -
                  </button>
                  <span className="font-bold text-zinc-800 px-2">{splitCount}</span>
                  <button 
                    onClick={() => setSplitCount(splitCount + 1)}
                    className="w-8 h-8 flex items-center justify-center bg-white border border-zinc-200 rounded-lg font-bold"
                  >
                    +
                  </button>
                </div>
              </div>

              <button
                onClick={() => setShowSplitModal(false)}
                className="w-full bg-amber-700 text-white py-2.5 rounded-xl font-bold text-xs hover:bg-amber-800 cursor-pointer"
              >
                Accept Split Portions
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Success Payment Animation Visualizer */}
      {showSuccessPaymentModal && (
        <div className="fixed inset-0 bg-zinc-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl p-6 text-center space-y-4 border border-zinc-100">
            <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto border border-amber-100 animate-bounce">
              <CheckCircle className="w-8 h-8" />
            </div>
            <div>
              <h3 className="font-sans font-bold text-zinc-900 text-base">Payment Complete!</h3>
              <p className="text-xs text-zinc-500 mt-1.5">
                Transaction recorded. POS workstation reset for the next seating ticket.
              </p>
            </div>
            {lastProcessedOrder && (
              <div className="bg-zinc-50 p-3 rounded-xl border border-zinc-200/50 text-left space-y-1 text-xs">
                <div className="flex justify-between font-bold text-zinc-700">
                  <span>Ticket Reference</span>
                  <span className="font-mono">{lastProcessedOrder.id}</span>
                </div>
                <div className="flex justify-between text-zinc-500">
                  <span>Total Settled</span>
                  <span className="font-mono text-amber-700 font-bold">{formatPKR(lastProcessedOrder.total)}</span>
                </div>
              </div>
            )}
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setShowSuccessPaymentModal(false);
                  if (lastProcessedOrder) setPrintedReceipt(lastProcessedOrder);
                }}
                className="flex-1 py-2 border border-zinc-200 text-zinc-600 rounded-xl text-xs font-semibold hover:bg-zinc-100 cursor-pointer"
              >
                Print Voucher
              </button>
              <button
                onClick={() => setShowSuccessPaymentModal(false)}
                className="flex-1 py-2 bg-zinc-900 hover:bg-zinc-850 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                New Ticket
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MOCK RECEIPT MODAL: Thermal paper effect */}
      {printedReceipt && (
        <div className="fixed inset-0 bg-zinc-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-amber-50/20 rounded-xl shadow-2xl max-w-xs w-full overflow-hidden border border-zinc-800 flex flex-col p-4 relative font-mono text-xs text-zinc-900" style={{ backgroundImage: 'linear-gradient(to right, #f8fafc, #f1f5f9, #f8fafc)' }}>
            {/* Tear off zig zag representation */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-zinc-300 flex overflow-hidden">
              <div className="w-4 h-4 rotate-45 bg-zinc-900 -mt-2 mx-0.5" />
              <div className="w-4 h-4 rotate-45 bg-zinc-900 -mt-2 mx-0.5" />
              <div className="w-4 h-4 rotate-45 bg-zinc-900 -mt-2 mx-0.5" />
              <div className="w-4 h-4 rotate-45 bg-zinc-900 -mt-2 mx-0.5" />
              <div className="w-4 h-4 rotate-45 bg-zinc-900 -mt-2 mx-0.5" />
              <div className="w-4 h-4 rotate-45 bg-zinc-900 -mt-2 mx-0.5" />
              <div className="w-4 h-4 rotate-45 bg-zinc-900 -mt-2 mx-0.5" />
              <div className="w-4 h-4 rotate-45 bg-zinc-900 -mt-2 mx-0.5" />
            </div>

            {/* Receipt Header */}
            <div className="text-center mt-4 mb-4">
              <h4 className="ajwa-urdu text-sm font-bold">عجوہ فیملی ریسٹورنٹ</h4>
              <p className="text-[10px] text-zinc-500">Jallandhar Pull, Gojra Road, Faisalabad</p>
              <p className="text-[10px] text-zinc-500">فون: 0300-1190267</p>
              <div className="border-b border-dashed border-zinc-400 my-2"></div>
              <p className="text-[10px] text-left">Date: {new Date(printedReceipt.createdAt).toLocaleDateString()}</p>
              <p className="text-[10px] text-left">Time: {new Date(printedReceipt.createdAt).toLocaleTimeString()}</p>
              <p className="text-[10px] text-left font-bold">Ticket: {printedReceipt.id}</p>
              <p className="text-[10px] text-left">Service: {printedReceipt.type}</p>
              {printedReceipt.type === 'Takeaway' && (
                <>
                  <p className="text-[10px] text-left">Customer: {printedReceipt.customerName || 'Guest'}</p>
                  <p className="text-[10px] text-left">Phone: {printedReceipt.contactPhone}</p>
                  {printedReceipt.pickupTime && (
                    <p className="text-[10px] text-left">Pickup: {new Date(printedReceipt.pickupTime).toLocaleString()}</p>
                  )}
                </>
              )}
              {printedReceipt.type === 'Delivery' && (
                <>
                  <p className="text-[10px] text-left">Customer: {printedReceipt.customerName || 'Guest'}</p>
                  <p className="text-[10px] text-left">Phone: {printedReceipt.contactPhone}</p>
                  <p className="text-[10px] text-left">Address: {printedReceipt.deliveryAddress}</p>
                  {printedReceipt.deliveryNotes && (
                    <p className="text-[10px] text-left">Notes: {printedReceipt.deliveryNotes}</p>
                  )}
                </>
              )}
            </div>

            {/* Items Column */}
            <div className="space-y-1.5 flex-1 max-h-52 overflow-y-auto pr-1">
              {printedReceipt.items.map(item => (
                <div key={item.id} className="flex justify-between text-[11px]">
                  <span>{item.quantity}x {item.name}</span>
                  <span>{formatPKRPrecise(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>

            {/* Price Calculations */}
            <div className="border-t border-dashed border-zinc-400 my-3"></div>
            <div className="space-y-1 text-right text-[11px]">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatPKRPrecise(printedReceipt.subtotal)}</span>
              </div>
              <div className="flex justify-between font-bold text-xs pt-1.5 border-t border-zinc-300">
                <span>Total Amount</span>
                <span>{formatPKRPrecise(printedReceipt.total)}</span>
              </div>
            </div>

            {/* Footer Bar Code imitation */}
            <div className="text-center mt-6">
              <div className="bg-zinc-800 text-white h-8 w-44 mx-auto flex items-center justify-center tracking-[0.3em] font-sans text-xs">
                |||||||||||||||||||||
              </div>
              <p className="text-[9px] text-zinc-400 mt-1">Thank you for dining with us!</p>
              <button
                onClick={() => setPrintedReceipt(null)}
                className="mt-4 px-3 py-1 bg-zinc-900 text-white hover:bg-zinc-800 rounded font-sans text-[10px] cursor-pointer"
              >
                Close Voucher
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
