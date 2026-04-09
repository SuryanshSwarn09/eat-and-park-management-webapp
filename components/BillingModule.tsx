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

      doc.setFontSize(22);
      doc.setTextColor(0, 0, 0); // Pure black
      doc.text("Eat & Park", 14, 22);
      
      doc.setFontSize(12);
      doc.setTextColor(75, 75, 75); // Dark gray
      doc.text(`Invoice - Table ${table.id}`, 14, 30);
      doc.text(`Date: ${dateStr} at ${timeStr}`, 14, 36);

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

      autoTable(doc, {
        startY: 45,
        head: [['Item Name', 'Qty', 'Rate', 'Amount']],
        body: tableData,
        theme: 'grid',
        headStyles: { 
          fillColor: [0, 0, 0], 
          textColor: [255, 255, 255], 
          fontSize: 10,
          fontStyle: 'bold' 
        },
        bodyStyles: { 
          fontSize: 10, 
          textColor: [0, 0, 0] 
        },
        foot: [['', '', 'Total Amount (Incl. GST)', `Rs. ${Math.round(total)}`]],
        footStyles: {
          fillColor: [239, 239, 239],
          textColor: [0, 0, 0],
          fontStyle: 'bold',
          fontSize: 12
        }
      });

      doc.save(`EatNPark_Table${table.id}_Bill.pdf`);
    } catch (error) {
      console.error('Failed to print bill:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  /**
   * Monochrome Slider Component
   */
  const SlideToConfirm = ({ onConfirm, disabled }: { onConfirm: () => void, disabled: boolean }) => {
    const [sliderPos, setSliderPos] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);
    const isDragging = useRef(false);

    const handleStart = () => { if (!disabled) isDragging.current = true; };
    
    const handleMove = (clientX: number) => {
      if (!isDragging.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const thumbWidth = 56; // w-14
      const maxPath = rect.width - thumbWidth - 8; // Subtract padding
      const currentPos = Math.max(0, Math.min(clientX - rect.left - thumbWidth / 2, maxPath));
      
      setSliderPos(currentPos);

      if (currentPos >= maxPath * 0.98) {
        isDragging.current = false;
        setSliderPos(maxPath);
        onConfirm();
      }
    };

    const handleEnd = () => {
      isDragging.current = false;
      if (sliderPos < (containerRef.current?.getBoundingClientRect().width || 0) * 0.8) {
        setSliderPos(0);
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
        className={`relative h-16 bg-[#efefef] rounded-full overflow-hidden flex items-center p-1 transition-opacity ${disabled ? 'opacity-50' : 'opacity-100'}`}
      >
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="text-[12px] font-bold uppercase tracking-widest text-[#4b4b4b]">
            Slide to Settle
          </span>
        </div>
        <div 
          className="absolute inset-0 bg-[#e2e2e2] transition-transform duration-300 pointer-events-none"
          style={{ transform: `translateX(${sliderPos > 0 ? sliderPos - 100 : -100}%)` }}
        ></div>
        <div 
          onMouseDown={handleStart}
          onTouchStart={handleStart}
          className="relative z-10 w-14 h-14 bg-[#000000] rounded-full shadow-[0_4px_12px_rgba(0,0,0,0.16)] flex items-center justify-center cursor-grab active:cursor-grabbing transition-transform duration-75 ease-out"
          style={{ transform: `translateX(${sliderPos}px)` }}
        >
          {disabled ? (
            <svg className="animate-spin h-5 w-5 text-[#ffffff]" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
          ) : (
            <svg className="w-5 h-5 text-[#ffffff]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-6 lg:gap-8 animate-fade-in pb-20 lg:pb-10 min-h-0">
      
      {/* Left Column: Receipt Display */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="bg-[#ffffff] rounded-2xl shadow-[0_4px_16px_rgba(0,0,0,0.06)] border border-[#e2e2e2] flex flex-col overflow-hidden h-full">
          
          <div className="p-6 sm:p-8 border-b border-[#efefef] shrink-0">
            <div className="flex items-center gap-4">
              <button 
                onClick={onBack} 
                className="w-10 h-10 bg-[#efefef] hover:bg-[#e2e2e2] rounded-full flex items-center justify-center text-[#000000] transition-colors shrink-0 lg:hidden"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
              </button>
              <div>
                <h3 className="text-[24px] font-bold text-[#000000] tracking-tight leading-none mb-1">Final Bill</h3>
                <p className="text-[12px] font-medium text-[#4b4b4b] uppercase tracking-wide">Table #{table.id} • GST Inclusive</p>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
            {table.currentOrder.map(item => {
              const menuInfo = menuItems.find(m => m.id === item.menuItemId);
              return (
                <div key={item.menuItemId} className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <p className="font-bold text-[#000000] text-[16px] leading-tight">{menuInfo?.name}</p>
                    <p className="text-[14px] text-[#4b4b4b] mt-1">{item.quantity} × ₹{menuInfo?.price}</p>
                  </div>
                  <span className="font-bold text-[#000000] text-[16px]">₹{(menuInfo?.price || 0) * item.quantity}</span>
                </div>
              );
            })}
          </div>

          <div className="p-6 sm:p-8 bg-[#fafafa] border-t border-[#e2e2e2] shrink-0 flex justify-between items-end">
            <span className="text-[14px] font-bold text-[#4b4b4b] uppercase tracking-wide">Total Payable</span>
            <span className="text-[40px] font-bold text-[#000000] tracking-tighter leading-none">₹{Math.round(total)}</span>
          </div>
        </div>
      </div>

      {/* Right Column: Settlement Controls */}
      <div className="w-full lg:w-[400px] flex flex-col shrink-0">
        <div className="bg-[#ffffff] rounded-2xl p-6 sm:p-8 shadow-[0_4px_16px_rgba(0,0,0,0.06)] border border-[#e2e2e2] flex flex-col">
          
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-[20px] font-bold text-[#000000]">Finalize Order</h3>
            <button onClick={onBack} className="hidden lg:flex w-10 h-10 bg-[#efefef] hover:bg-[#e2e2e2] rounded-full items-center justify-center text-[#000000] transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          <p className="text-[12px] font-bold text-[#afafaf] uppercase tracking-wide mb-3">Payment Method</p>
          
          {/* FIX: Replaced stacked grid with small horizontal pills */}
          <div className="flex gap-2 mb-8">
            {(['Cash', 'Card', 'UPI'] as const).map(method => (
              <button
                key={method}
                onClick={() => setPaymentMethod(method)}
                className={`flex-1 py-3 rounded-full text-[14px] font-medium transition-colors border border-transparent ${
                  paymentMethod === method 
                  ? 'bg-[#000000] text-[#ffffff]' 
                  : 'bg-[#efefef] text-[#000000] hover:bg-[#e2e2e2] border-[#e2e2e2]'
                }`}
              >
                {method}
              </button>
            ))}
          </div>

          <div className="mt-auto space-y-4">
            <button 
              onClick={handlePrintBill}
              disabled={isSettling}
              className="w-full h-14 bg-[#ffffff] border border-[#000000] hover:bg-[#efefef] disabled:opacity-50 text-[#000000] rounded-full font-medium text-[16px] transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
              Print Invoice
            </button>

            <div className="p-4 bg-[#efefef] rounded-xl text-center">
              <p className="text-[12px] text-[#4b4b4b] font-medium">
                Completing payment will clear Table {table.id} and archive the receipt.
              </p>
            </div>
            
            {/* The new Uber-style Black/White slider */}
            <SlideToConfirm onConfirm={handleCheckout} disabled={isSettling} />
          </div>

        </div>
      </div>
    </div>
  );
};

export default BillingModule;