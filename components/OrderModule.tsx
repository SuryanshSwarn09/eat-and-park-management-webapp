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
  const [searchQuery, setSearchQuery] = useState('');
  const [dietaryFilter, setDietaryFilter] = useState<'All' | 'Veg' | 'Non-Veg'>('All');
  
  const [draftOrder, setDraftOrder] = useState<OrderItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Filter Logic Chain
  const activeMenuItems = menuItems.filter(m => m.status === 'current');
  const categories = ['All', ...Array.from(new Set(activeMenuItems.map(item => item.category)))];
  
  let filteredMenu = activeMenuItems;
  
  // 1. Category Filter
  if (filter !== 'All') {
      filteredMenu = filteredMenu.filter(item => item.category === filter);
  }
  // 2. Search Filter
  if (searchQuery.trim() !== '') {
      filteredMenu = filteredMenu.filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }
  // 3. Dietary Filter
  if (dietaryFilter === 'Veg') {
      filteredMenu = filteredMenu.filter(item => item.isVeg);
  } else if (dietaryFilter === 'Non-Veg') {
      filteredMenu = filteredMenu.filter(item => !item.isVeg);
  }

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
      newItems = [...draftOrder, { menuItemId: itemId, quantity: 1 }];
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

  const runningTotal = draftOrder.reduce((acc, orderItem) => {
    const menuInfo = menuItems.find(m => m.id === orderItem.menuItemId);
    return acc + (menuInfo?.price || 0) * orderItem.quantity;
  }, 0);

  return (
    <div className="flex flex-col lg:flex-row h-full gap-6 lg:gap-8 bg-[#ffffff] pb-24 lg:pb-0">
      
      {/* Left Column: Menu Layout */}
      <div className="flex-1 flex flex-col min-w-0 min-h-0 bg-[#ffffff]">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-4 sm:mb-6 shrink-0">
          <button onClick={onBack} className="w-10 h-10 bg-[#efefef] hover:bg-[#e2e2e2] rounded-full flex items-center justify-center text-[#000000] transition-colors shrink-0">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          </button>
          <div>
            <h2 className="text-[24px] sm:text-[32px] font-bold text-[#000000] leading-none tracking-tight">Table {table.id}</h2>
            <p className="text-[12px] sm:text-[14px] text-[#4b4b4b] mt-1">Add items to order</p>
          </div>
        </div>

        {/* Filters: Search Bar & Veg/Non-Veg Toggle */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4 shrink-0">
          <div className="relative flex-1">
             <input 
               type="text" 
               placeholder="Search menu..." 
               value={searchQuery}
               onChange={e => setSearchQuery(e.target.value)}
               className="w-full h-12 bg-[#ffffff] border border-[#000000] rounded-lg pl-10 pr-4 text-[14px] font-medium text-[#000000] focus:outline-none focus:ring-1 focus:ring-[#000000] transition-shadow"
             />
             <svg className="w-5 h-5 absolute left-3 top-3.5 text-[#afafaf]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
             </svg>
          </div>
          <div className="flex bg-[#efefef] p-1 rounded-full shrink-0 self-start sm:self-auto w-full sm:w-auto">
            {(['All', 'Veg', 'Non-Veg'] as const).map(d => (
              <button
                key={d}
                onClick={() => setDietaryFilter(d)}
                className={`flex-1 sm:flex-none px-3 py-2 sm:px-5 text-[12px] font-bold rounded-full transition-colors ${
                  dietaryFilter === d 
                  ? 'bg-[#ffffff] text-[#000000] shadow-[0_2px_8px_rgba(0,0,0,0.08)]' 
                  : 'text-[#4b4b4b] hover:text-[#000000]'
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        {/* Categories (Pills) */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar mb-4 pb-2 shrink-0">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-4 py-2 sm:py-2.5 rounded-full text-[12px] sm:text-[14px] font-medium transition-colors whitespace-nowrap shrink-0 ${
                filter === cat 
                ? 'bg-[#000000] text-[#ffffff]' 
                : 'bg-[#efefef] text-[#000000] hover:bg-[#e2e2e2]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Menu Grid - UPDATED: grid-cols-2 for mobile, tight gaps */}
        <div className="flex-1 overflow-y-auto pr-1 sm:pr-2 min-h-0">
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6 auto-rows-max pb-8">
            {filteredMenu.length === 0 ? (
                <div className="col-span-full py-10 text-center">
                    <p className="text-[14px] font-bold text-[#4b4b4b]">No dishes found.</p>
                    <p className="text-[12px] text-[#afafaf] mt-1">Try adjusting your search or filters.</p>
                </div>
            ) : (
                filteredMenu.map(item => {
                  const qty = getItemQuantity(item.id);
                  const existingQty = getExistingQuantity(item.id);
                  
                  return (
                    <div key={item.id} className="group bg-[#ffffff] rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] overflow-hidden flex flex-col border border-[#efefef]">
                      {/* Reduced image height on mobile (h-28) */}
                      <div className="relative h-28 sm:h-40 bg-[#efefef] shrink-0 overflow-hidden">
                        <img src={item.image} alt={item.name} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                        <div className="absolute top-2 left-2 sm:top-3 sm:left-3 bg-[#ffffff] px-1.5 py-0.5 sm:px-2 sm:py-1 rounded text-[10px] sm:text-[12px] font-bold text-[#000000]">
                          ₹{item.price}
                        </div>
                        {existingQty > 0 && (
                          <div className="absolute top-2 right-2 sm:top-3 sm:right-3 bg-[#000000] text-[#ffffff] px-1.5 py-0.5 sm:px-2 sm:py-1 rounded text-[9px] sm:text-[10px] font-bold tracking-wide">
                            {existingQty} SENT
                          </div>
                        )}
                      </div>
                      
                      {/* Tighter padding and text on mobile */}
                      <div className="p-2.5 sm:p-4 flex flex-col flex-1">
                        <div className="flex items-start justify-between gap-1.5 sm:gap-2 mb-3">
                          {/* line-clamp-2 prevents long names from breaking layout */}
                          <h4 className="font-bold text-[#000000] text-[13px] sm:text-[16px] leading-tight line-clamp-2">{item.name}</h4>
                          <span className={`w-1.5 h-1.5 sm:w-2 sm:h-2 shrink-0 rounded-full mt-1 sm:mt-1.5 ${item.isVeg ? 'bg-green-600' : 'bg-red-600'}`}></span>
                        </div>
                        
                        <div className="mt-auto">
                          {qty === 0 ? (
                            <button 
                              onClick={() => handleUpdateQty(item.id, 1)}
                              className="w-full py-1.5 sm:py-2 bg-[#efefef] hover:bg-[#e2e2e2] text-[#000000] rounded-full font-bold text-[12px] sm:text-[14px] transition-colors"
                            >
                              Add
                            </button>
                          ) : (
                            <div className="flex items-center justify-between bg-[#000000] rounded-full p-0.5 sm:p-1">
                              <button onClick={() => handleUpdateQty(item.id, -1)} className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center bg-[#333333] hover:bg-[#4b4b4b] rounded-full text-[#ffffff] font-bold transition-colors">-</button>
                              <span className="text-[#ffffff] font-bold text-[12px] sm:text-[14px] px-1 sm:px-2">{qty}</span>
                              <button onClick={() => handleUpdateQty(item.id, 1)} className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center bg-[#ffffff] hover:bg-[#efefef] rounded-full text-[#000000] font-bold transition-colors">+</button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
            )}
          </div>
        </div>
      </div>

      {/* Right Column: Order Queue Modal (Remains untouched for structural integrity) */}
      <div className={`fixed inset-0 lg:relative lg:inset-auto lg:w-[360px] lg:shrink-0 z-50 lg:z-10 flex flex-col justify-end bg-[#000000] bg-opacity-40 lg:bg-transparent transition-opacity duration-300 ${isCartOpen ? 'opacity-100' : 'opacity-0 pointer-events-none lg:opacity-100 lg:pointer-events-auto'}`} onClick={() => setIsCartOpen(false)}>
        <div 
          className={`w-full h-full bg-[#ffffff] rounded-t-2xl lg:rounded-xl shadow-[0_-4px_24px_rgba(0,0,0,0.12)] lg:shadow-[0_4px_16px_rgba(0,0,0,0.12)] border lg:border-[#e2e2e2] flex flex-col transition-transform duration-300 max-h-[85vh] lg:max-h-full overflow-hidden ${isCartOpen ? 'translate-y-0' : 'translate-y-full lg:translate-y-0'}`}
          onClick={e => e.stopPropagation()}
        >
          <div className="p-6 border-b border-[#efefef] flex items-center justify-between shrink-0">
            <h3 className="font-bold text-[#000000] text-[20px]">Order Queue</h3>
            <button onClick={() => setIsCartOpen(false)} className="lg:hidden p-2 bg-[#efefef] rounded-full text-[#000000]">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 min-h-0">
            {draftOrder.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
                <p className="text-[16px] text-[#4b4b4b] font-medium">No items queued</p>
                <p className="text-[14px] text-[#afafaf] mt-1">Select items from the menu to add to table</p>
              </div>
            ) : (
              <div className="space-y-6">
                {draftOrder.map(item => {
                  const menuInfo = menuItems.find(m => m.id === item.menuItemId);
                  return (
                    <div key={item.menuItemId} className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <p className="font-medium text-[#000000] text-[16px] leading-tight">{menuInfo?.name}</p>
                        <p className="text-[14px] text-[#4b4b4b] mt-1">{item.quantity} × ₹{menuInfo?.price}</p>
                      </div>
                      <p className="font-bold text-[#000000] text-[16px]">₹{(menuInfo?.price || 0) * item.quantity}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="p-6 pb-12 lg:pb-6 border-t border-[#efefef] bg-[#ffffff] shrink-0">
            <div className="flex justify-between items-center mb-6">
              <span className="text-[16px] text-[#4b4b4b] font-medium">Subtotal</span>
              <span className="text-[24px] font-bold text-[#000000]">₹{runningTotal}</span>
            </div>
            
            <div className="space-y-3">
              <button 
                disabled={draftOrder.length === 0 || isProcessing}
                onClick={handleConfirm}
                className="w-full bg-[#000000] hover:bg-[#333333] disabled:opacity-50 text-[#ffffff] font-bold py-4 rounded-full text-[16px] transition-colors flex items-center justify-center"
              >
                {isProcessing ? "Processing..." : "Send to Kitchen"}
              </button>
              
              {table.currentOrder.length > 0 && (
                <button 
                  onClick={onGenerateBill} 
                  className="w-full bg-[#efefef] hover:bg-[#e2e2e2] text-[#000000] font-medium py-4 rounded-full text-[16px] transition-colors"
                >
                  View Bill
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile Sticky Footer Toggle */}
      <div className="fixed bottom-0 left-0 right-0 p-4 pb-8 lg:pb-4 bg-[#ffffff] border-t border-[#e2e2e2] lg:hidden z-40 shadow-[0_-4px_16px_rgba(0,0,0,0.05)]">
        <button 
          onClick={() => setIsCartOpen(true)} 
          className="w-full bg-[#000000] text-[#ffffff] h-14 rounded-full px-6 flex items-center justify-between"
        >
          <span className="font-medium text-[16px]">Review Queue ({draftOrder.length})</span>
          <span className="font-bold text-[18px]">₹{runningTotal}</span>
        </button>
      </div>
    </div>
  );
};

export default OrderModule;