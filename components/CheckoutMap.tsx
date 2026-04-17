import React from 'react';
import { Table, TableStatus, MenuItem } from '../types';

interface CheckoutMapProps {
  tables: Table[];
  onSelectTable: (id: number) => void;
  menuItems: MenuItem[];
}

const CheckoutMap: React.FC<CheckoutMapProps> = ({ tables, onSelectTable, menuItems }) => {
  const tablesWithOrders = tables.filter(t => t.currentOrder.length > 0);

  const calculateTotal = (table: Table) => {
    return table.currentOrder.reduce((acc, orderItem) => {
      const menuInfo = menuItems.find(m => m.id === orderItem.menuItemId);
      return acc + (menuInfo?.price || 0) * orderItem.quantity;
    }, 0);
  };

  return (
    <div className="animate-fade-in pb-10">
      <div className="mb-6 sm:mb-8 shrink-0">
        <h2 className="text-[24px] sm:text-[32px] font-bold text-[#0f172a] tracking-tight leading-none">Final Checkout</h2>
        <p className="text-[14px] text-[#475569] mt-1 sm:mt-2">Manage pending bills and finalize settlements.</p>
      </div>

      {tablesWithOrders.length === 0 ? (
        <div className="bg-[#ffffff] rounded-xl p-16 flex flex-col items-center justify-center border border-[#e2e8f0] shadow-[0_4px_16px_rgba(0,0,0,0.04)] text-center">
            <div className="w-16 h-16 bg-[#f1f5f9] rounded-full flex items-center justify-center mb-6 text-[#94a3b8]">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
            </div>
            <h3 className="text-[20px] font-bold text-[#0f172a] mb-2">No Active Bills</h3>
            <p className="text-[#475569] text-[14px] font-medium">All tables are clear. Pending transactions will appear here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {tablesWithOrders.map((table) => {
            const total = calculateTotal(table);
            const itemsCount = table.currentOrder.reduce((acc, o) => acc + o.quantity, 0);

            return (
              <div 
                key={table.id}
                className="bg-[#ffffff] rounded-xl border border-[#e2e8f0] p-6 shadow-[0_4px_16px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)] flex flex-col transition-shadow relative overflow-hidden"
              >
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h4 className="text-[24px] font-bold text-[#0f172a] tracking-tight leading-none">Table {table.id}</h4>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${table.status === TableStatus.PENDING_PAYMENT ? 'bg-[#e2e8f0] text-[#0f172a]' : 'bg-[#253b80] text-[#ffffff]'}`}>
                        {table.status === TableStatus.PENDING_PAYMENT ? "Pending" : "Dining"}
                    </span>
                </div>

                <div className="bg-[#f1f5f9] border border-[#f1f5f9] p-5 rounded-xl mb-6 flex justify-between items-center">
                    <div>
                        <p className="text-[11px] font-bold text-[#94a3b8] uppercase tracking-wide mb-1">Payable</p>
                        <p className="text-[28px] font-bold text-[#0f172a] leading-none">₹{total}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-[11px] font-bold text-[#94a3b8] uppercase tracking-wide mb-1">Items</p>
                        <p className="text-[18px] font-bold text-[#0f172a]">{itemsCount}</p>
                    </div>
                </div>

                <button 
                    onClick={() => onSelectTable(table.id)}
                    className="w-full h-12 bg-[#253b80] hover:bg-[#0093d5] text-[#ffffff] rounded-full font-bold text-[14px] flex items-center justify-center gap-2 transition-colors mt-auto"
                >
                    <span>Finalize Bill</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CheckoutMap;