import React, { useState, useRef, useEffect } from 'react';
import { Table, Transaction, MenuItem } from '../types';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface BillingModuleProps {
  table: Table;
  onFinalize: (transaction: Transaction) => void;
  onBack: () => void;
  menuItems: MenuItem[];
}

const BillingModule: React.FC<BillingModuleProps> = ({ table, onFinalize, onBack, menuItems }) => {
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Card' | 'UPI'>('UPI');
  const [isSettling, setIsSettling] = useState(false);

  // Constants for inclusive pricing
  const total = table.currentOrder.reduce((acc, orderItem) => {
    const menuInfo = menuItems.find(m => m.id === orderItem.menuItemId);
    return acc + (menuInfo?.price || 0) * orderItem.quantity;
  }, 0);

  const handleCheckout = () => {
    setIsSettling(true);
    const transaction: Transaction = {
      id: Math.random().toString(36).substring(7).toUpperCase(),
      tableId: table.id,
      items: [...table.currentOrder],
      subtotal: total,
      tax: 0,
      serviceCharge: 0,
      total,
      timestamp: new Date(),
      paymentMethod,
    };
    
    setTimeout(() => {
      onFinalize(transaction);
    }, 1200);
  };

  const handlePrintBill = () => {
    try {
      const doc = new jsPDF();
      const dateStr = new Date().toLocaleDateString();
      const timeStr = new Date().toLocaleTimeString();

      // Header
      doc.setFontSize(22);
      doc.setTextColor(44, 62, 80);
      doc.text("EAT 'N' PARK RESTAURANT", 14, 22);
      
      doc.setFontSize(12);
      doc.setTextColor(100);
      doc.text(`Invoice - Table ${table.id}`, 14, 30);
      doc.text(`Date: ${dateStr} at ${timeStr}`, 14, 36);

      // Prepare items for the table
      const tableData = table.currentOrder.map(item => {
        const menuInfo = menuItems.find(m => m.id === item.menuItemId);
        const price = menuInfo?.price || 0;
        return [
          menuInfo?.name || 'Unknown Item',
          item.quantity.toString(),
          `Rs. ${price}`,
          `Rs. ${price * item.quantity}`
        ];
      });

      // Generate Table
      autoTable(doc, {
        startY: 45,
        head: [['Item Name', 'Qty', 'Rate', 'Amount']],
        body: tableData,
        theme: 'grid',
        headStyles: { 
          fillColor: [15, 23, 42], 
          textColor: [255, 255, 255], 
          fontSize: 10,
          fontStyle: 'bold' 
        },
        bodyStyles: { 
          fontSize: 10, 
          textColor: [51, 65, 85] 
        },
        foot: [['', '', 'Total Amount (Incl. GST)', `Rs. ${Math.round(total)}`]],
        footStyles: {
          fillColor: [248, 250, 252],
          textColor: [15, 23, 42],
          fontStyle: 'bold',
          fontSize: 12
        }
      });

      // Save PDF
      doc.save(`EatNPark_Table${table.id}_Bill.pdf`);
    } catch (error) {
      console.error('Failed to print bill:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  /**
   * Internal Slider Component
   */
  const SlideToConfirm = ({ onConfirm, disabled }: { onConfirm: () => void, disabled: boolean }) => {
    const [sliderPos, setSliderPos] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);
    const isDragging = useRef(false);

    const handleStart = () => { if (!disabled) isDragging.current = true; };
    
    const handleMove = (clientX: number) => {
      if (!isDragging.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const thumbWidth = 64; // w-16
      const maxPath = rect.width - thumbWidth - 8; // Subtract padding
      const currentPos = Math.max(0, Math.min(clientX - rect.left - thumbWidth / 2, maxPath));
      
      setSliderPos(currentPos);

      // If they reach 98% of the path, trigger confirm
      if (currentPos >= maxPath * 0.98) {
        isDragging.current = false;
        setSliderPos(maxPath);
        onConfirm();
      }
    };

    const handleEnd = () => {
      isDragging.current = false;
      if (sliderPos < (containerRef.current?.getBoundingClientRect().width || 0) * 0.8) {
        setSliderPos(0); // Reset if not far enough
      }
    };

    useEffect(() => {
      const mouseMove = (e: MouseEvent) => handleMove(e.clientX);
      const touchMove = (e: TouchEvent) => handleMove(e.touches[0].clientX);
      window.addEventListener('mousemove', mouseMove);
      window.addEventListener('mouseup', handleEnd);
      window.addEventListener('touchmove', touchMove);
      window.addEventListener('touchend', handleEnd);
      return () => {
        window.removeEventListener('mousemove', mouseMove);
        window.removeEventListener('mouseup', handleEnd);
        window.removeEventListener('touchmove', touchMove);
        window.removeEventListener('touchend', handleEnd);
      };
    }, [sliderPos]);

    return (
      <div 
        ref={containerRef}
        className={`relative h-20 bg-slate-100 rounded-3xl border-2 border-slate-200 overflow-hidden flex items-center p-1 px-1.5 transition-opacity ${disabled ? 'opacity-50' : 'opacity-100'}`}
      >
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
            Slide to Settlement →
          </span>
        </div>
        <div 
          className="absolute inset-0 bg-emerald-500 transition-transform duration-300 pointer-events-none flex items-center justify-center"
          style={{ transform: `translateX(${sliderPos > 0 ? sliderPos - 100 : -100}%)`, opacity: sliderPos / 200 }}
        ></div>
        <div 
          onMouseDown={handleStart}
          onTouchStart={handleStart}
          className="relative z-10 w-16 h-16 bg-slate-900 rounded-2xl shadow-xl flex items-center justify-center cursor-grab active:cursor-grabbing transition-transform duration-75 ease-out"
          style={{ transform: `translateX(${sliderPos}px)` }}
        >
          {disabled ? (
            <svg className="animate-spin h-6 w-6 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
          ) : (
            <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-6 animate-fade-in pb-10">
      {/* Left Column: Receipt Display */}
      <div className="flex-1">
        <div className="bg-white rounded-[2.5rem] shadow-xl overflow-hidden flex flex-col border border-slate-100">
          <div className="p-8 border-b border-dashed border-slate-200">
            <div className="flex justify-between items-start mb-10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center font-black text-white text-xl">E</div>
                <div>
                  <h3 className="text-xl font-black text-slate-900 tracking-tight leading-none mb-1">Final Bill</h3>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Table #{table.id} • GST Inclusive</p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {table.currentOrder.map(item => {
                const menuInfo = menuItems.find(m => m.id === item.menuItemId);
                return (
                  <div key={item.menuItemId} className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <p className="font-bold text-slate-800 text-base">{menuInfo?.name}</p>
                      <p className="text-[10px] font-bold text-slate-400 mt-0.5">{item.quantity} &times; ₹{menuInfo?.price}</p>
                    </div>
                    <span className="font-black text-slate-900 text-base">₹{(menuInfo?.price || 0) * item.quantity}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="p-8 bg-slate-50/50">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Final Amount</span>
            <span className="text-4xl font-black text-orange-600 tracking-tighter leading-none">₹{Math.round(total)}</span>
          </div>
        </div>
      </div>

      {/* Right Column: Settlement Controls */}
      <div className="w-full lg:w-96 flex flex-col gap-6">
        <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 h-full flex flex-col">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-black text-slate-900 tracking-tight">Finalize Order</h3>
            <button onClick={onBack} className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl text-slate-400 hover:text-slate-900">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Payment Method</p>
          <div className="grid grid-cols-1 gap-3 mb-8">
            {(['Cash', 'Card', 'UPI'] as const).map(method => (
              <button
                key={method}
                onClick={() => setPaymentMethod(method)}
                className={`flex items-center gap-4 px-6 py-4 rounded-2xl border-2 transition-all ${
                  paymentMethod === method ? 'bg-slate-900 border-slate-900 text-white' : 'bg-white border-slate-100 text-slate-600'
                }`}
              >
                <span className="font-black text-xs uppercase tracking-widest">{method}</span>
              </button>
            ))}
          </div>

          <div className="mt-auto space-y-4">
            <button 
              onClick={handlePrintBill}
              disabled={isSettling}
              className="w-full h-14 bg-white border-2 border-slate-200 hover:border-slate-300 disabled:opacity-50 text-slate-700 rounded-2xl font-bold shadow-sm transition-all active:scale-95 flex items-center justify-center gap-3"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
              Print Invoice PDF
            </button>

            <div className="p-4 bg-orange-50 border border-orange-100 rounded-2xl">
              <p className="text-[10px] text-orange-600 font-bold">
                Notice: Sliding will clear Table {table.id} and archive the transaction permanently.
              </p>
            </div>
            
            <SlideToConfirm onConfirm={handleCheckout} disabled={isSettling} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BillingModule;