import React, { useState } from 'react';
import { Table, OrderItem, MenuItem } from '../types';

interface OrderModuleProps {
  table: Table;
  onConfirmOrder: (items: OrderItem[]) => void;
  onGenerateBill: () => void;
  onBack: () => void;
  menuItems: MenuItem[];
}

const OrderModule: React.FC<OrderModuleProps> = ({ table, onConfirmOrder, onGenerateBill, onBack, menuItems }) => {
  const [filter, setFilter] = useState<string>('All');
  const [activeNotes, setActiveNotes] = useState<{ [key: string]: string }>({});
  // draftOrder should start empty to only show new things being added to the existing order
  const [draftOrder, setDraftOrder] = useState<OrderItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // 1. Filter the global menu to only show active items in the ordering grid
  const activeMenuItems = menuItems.filter(m => m.status === 'current');

  // 2. Extract categories only from active items
  const categories = ['All', ...Array.from(new Set(activeMenuItems.map(item => item.category)))];
  
  // 3. Filter based on selected category tab
  const filteredMenu = filter === 'All' ? activeMenuItems : activeMenuItems.filter(item => item.category === filter);

  const getItemQuantity = (itemId: string) => draftOrder.find(o => o.menuItemId === itemId)?.quantity || 0;
  const getExistingQuantity = (itemId: string) => table.currentOrder.find(o => o.menuItemId === itemId)?.quantity || 0;

  const handleUpdateQty = (itemId: string, delta: number) => {
    const existing = draftOrder.find(o => o.menuItemId === itemId);
    let newItems: OrderItem[] = [];

    if (existing) {
      const newQty = Math.max(0, existing.quantity + delta);
      newItems = newQty === 0 
        ? draftOrder.filter(o => o.menuItemId !== itemId)
        : draftOrder.map(o => o.menuItemId === itemId ? { ...o, quantity: newQty } : o);
    } else if (delta > 0) {
      newItems = [...draftOrder, { menuItemId: itemId, quantity: 1, notes: activeNotes[itemId] || '' }];
    } else {
      return;
    }
    setDraftOrder(newItems);
  };

  const handleConfirm = () => {
    if (draftOrder.length === 0) return;
    setIsProcessing(true);
    setTimeout(() => {
      onConfirmOrder(draftOrder);
      setIsProcessing(false);
    }, 600);
  };

  // We search the full menuItems list here just in case an item was ordered and then archived
  const runningTotal = draftOrder.reduce((acc, orderItem) => {
    const menuInfo = menuItems.find(m => m.id === orderItem.menuItemId);
    return acc + (menuInfo?.price || 0) * orderItem.quantity;
  }, 0);

  const VegIcon = ({ isVeg }: { isVeg: boolean }) => (
    <div className={`w-3.5 h-3.5 border-2 flex items-center justify-center ${isVeg ? 'border-emerald-600' : 'border-rose-600'} rounded-sm p-[1px] bg-white`}>
      <div className={`w-2 h-2 rounded-full ${isVeg ? 'bg-emerald-600' : 'bg-rose-600'}`}></div>
    </div>
  );

  return (
    <div className="flex flex-col lg:flex-row h-full gap-5 lg:gap-6 animate-fade-in overflow-hidden">
      
      {/* Left Column: Menu Section */}
      <div className="flex-1 flex flex-col min-h-0 bg-white rounded-[2rem] lg:rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-4 sm:p-6 border-b border-slate-100 bg-slate-50/50 shrink-0">
          <div className="flex items-center gap-4 mb-4">
            <button onClick={onBack} className="p-2.5 bg-white border border-slate-200 rounded-xl shadow-sm hover:bg-slate-50 transition-all active:scale-95">
              <svg className="w-5 h-5 text-slate-900" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            </button>
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">Table {table.id} • Order Pad</h2>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Adding items to running bill</p>
            </div>
          </div>
          <div className="flex gap-2 overflow-x-auto no-scrollbar scroll-smooth pb-1">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-4 py-2 rounded-xl text-[11px] font-black transition-all whitespace-nowrap uppercase tracking-widest ${filter === cat ? 'bg-orange-500 text-white shadow-md' : 'bg-white text-slate-500 border border-slate-200 hover:border-slate-300'}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 auto-rows-max">
          {filteredMenu.map(item => {
            const qty = getItemQuantity(item.id);
            const existingQty = getExistingQuantity(item.id);
            return (
              <div 
                key={item.id} 
                onClick={() => handleUpdateQty(item.id, 1)}
                className={`group bg-white rounded-3xl border transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer overflow-hidden flex flex-col h-full ${qty > 0 ? 'border-orange-500 ring-4 ring-orange-500/10' : 'border-slate-100 shadow-sm'}`}
              >
                <div className="relative h-28 shrink-0">
                  <img src={item.image} alt={item.name} className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                  <div className="absolute top-2 left-2 flex gap-1.5">
                    <div className="bg-white p-1 rounded-lg shadow-sm"><VegIcon isVeg={item.isVeg} /></div>
                    {qty > 0 && <div className="bg-orange-500 text-white w-7 h-7 rounded-full flex items-center justify-center font-black text-xs border-2 border-white animate-pop">{qty}</div>}
                    {existingQty > 0 && <div className="bg-slate-800 text-white px-2 h-6 rounded-lg flex items-center justify-center font-black text-[9px] border-2 border-white">{existingQty} Sent</div>}
                  </div>
                  <div className="absolute bottom-2 right-2 bg-white/95 px-2 py-0.5 rounded-lg font-black text-orange-600 text-xs shadow-sm">₹{item.price}</div>
                </div>
                <div className="p-3.5 flex flex-col flex-1" onClick={e => e.stopPropagation()}>
                  <h4 className="font-black text-slate-800 text-sm line-clamp-1 mb-2 leading-tight">{item.name}</h4>
                  <div className="mt-auto">
                    <div className="flex items-center gap-1.5 bg-slate-100 rounded-xl p-0.5 border border-slate-200">
                      <button onClick={() => handleUpdateQty(item.id, -1)} className="w-7 h-7 flex items-center justify-center bg-white rounded-lg shadow-sm text-slate-900 font-bold active:scale-90">-</button>
                      <span className="flex-1 text-center font-black text-xs">{qty}</span>
                      <button onClick={() => handleUpdateQty(item.id, 1)} className="w-7 h-7 flex items-center justify-center bg-slate-900 text-white rounded-lg shadow-sm font-bold active:scale-90">+</button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Column: New Kitchen Queue */}
      <div className={`fixed inset-0 lg:relative lg:inset-auto z-50 lg:z-10 flex flex-col justify-end bg-slate-900/40 backdrop-blur-sm lg:bg-transparent lg:backdrop-blur-none transition-opacity duration-300 ${isCartOpen ? 'opacity-100' : 'opacity-0 pointer-events-none lg:opacity-100 lg:pointer-events-auto'}`} onClick={() => setIsCartOpen(false)}>
        <div 
          className={`w-full lg:w-80 xl:w-96 bg-white rounded-t-[2.5rem] lg:rounded-[2.5rem] shadow-2xl lg:shadow-sm border lg:border-slate-200 flex flex-col transition-transform duration-500 max-h-[90vh] lg:h-full overflow-hidden ${isCartOpen ? 'translate-y-0' : 'translate-y-full lg:translate-y-0'}`}
          onClick={e => e.stopPropagation()}
        >
          <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div>
              <h3 className="font-black text-slate-900 text-base">New Items</h3>
              <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mt-0.5">Kitchen Transmission Queue</p>
            </div>
            <button onClick={() => setIsCartOpen(false)} className="lg:hidden p-2 bg-slate-100 rounded-xl text-slate-500">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" /></svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            {draftOrder.length === 0 ? (
              <div className="py-16 text-center opacity-30 flex flex-col items-center">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                </div>
                <p className="font-black text-[10px] uppercase tracking-widest">Select items to send</p>
              </div>
            ) : (
              draftOrder.map(item => {
                // Search the global menu Items for the cart lookup
                const menuInfo = menuItems.find(m => m.id === item.menuItemId);
                return (
                  <div key={item.menuItemId} className="flex gap-3 animate-fade-in group">
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-900 text-xs truncate leading-tight">{menuInfo?.name}</p>
                      <p className="text-[10px] font-bold text-slate-400 mt-0.5">{item.quantity} &times; ₹{menuInfo?.price}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-black text-slate-900 text-xs">₹{(menuInfo?.price || 0) * item.quantity}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="p-6 bg-slate-50 border-t border-slate-200 shrink-0">
            <div className="flex justify-between items-center mb-5">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Queue Value</span>
              <span className="text-2xl font-black text-slate-900 tracking-tighter">₹{runningTotal}</span>
            </div>
            <div className="flex flex-col gap-2.5">
              <button 
                disabled={draftOrder.length === 0 || isProcessing}
                onClick={handleConfirm}
                className="w-full bg-slate-900 hover:bg-slate-800 disabled:bg-slate-200 text-white font-black py-4 rounded-2xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-3"
              >
                {isProcessing ? (
                   <span className="flex items-center gap-2">
                     <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                     Sending...
                   </span>
                ) : (
                  <>
                    <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                    <span>Send to Kitchen</span>
                  </>
                )}
              </button>
              {table.currentOrder.length > 0 && (
                <button onClick={onGenerateBill} className="w-full bg-white border border-slate-200 text-slate-500 font-bold py-3 rounded-2xl active:scale-95 text-[10px] uppercase tracking-widest">
                  Review Running Bill
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile Floating Action Bar */}
      <div className="fixed bottom-6 left-6 right-6 lg:hidden z-40">
        <button onClick={() => setIsCartOpen(true)} className="w-full bg-slate-900 text-white h-14 rounded-2xl shadow-2xl flex items-center justify-between px-6 border border-slate-700">
          <span className="font-bold text-sm">Review Queue ({draftOrder.length})</span>
          <span className="text-lg font-black text-orange-400 tracking-tighter">₹{runningTotal}</span>
        </button>
      </div>
    </div>
  );
};

export default OrderModule;