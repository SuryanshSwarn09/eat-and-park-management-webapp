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
    <div className="animate-fade-in">
      <div className="mb-8">
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">Final Checkout Overview</h2>
        <p className="text-slate-500 font-medium">Manage pending bills and finalize settlements.</p>
      </div>

      {tablesWithOrders.length === 0 ? (
        <div className="bg-white rounded-[3rem] p-20 flex flex-col items-center justify-center border border-slate-200 shadow-sm text-center">
            <div className="w-32 h-32 bg-slate-50 rounded-full flex items-center justify-center mb-8 text-slate-200">
                <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
            </div>
            <h3 className="text-2xl font-black text-slate-800 mb-2">No Active Bills</h3>
            <p className="text-slate-400 max-w-sm font-medium">All tables are either free or haven't ordered yet. Pending transactions will appear here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {tablesWithOrders.map((table) => {
            const total = calculateTotal(table);
            const itemsCount = table.currentOrder.reduce((acc, o) => acc + o.quantity, 0);

            return (
              <div 
                key={table.id}
                className="bg-white rounded-[2.5rem] border-2 border-slate-100 p-8 shadow-sm flex flex-col hover:shadow-xl transition-all duration-300 relative group overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                    <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                </div>

                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h4 className="text-3xl font-black text-slate-900 tracking-tighter">Table {table.id}</h4>
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest mt-1">
                            Standard Seating
                        </p>
                    </div>
                    <span className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest ${table.status === TableStatus.PENDING_PAYMENT ? 'bg-amber-100 text-amber-600' : 'bg-orange-100 text-orange-600'}`}>
                        {table.status === TableStatus.PENDING_PAYMENT ? "Waiting for Bill" : "Dining"}
                    </span>
                </div>

                <div className="bg-slate-50 p-6 rounded-3xl mb-8 flex justify-between items-center">
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount Payable</p>
                        <p className="text-3xl font-black text-slate-900 tracking-tighter">₹{total}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Items</p>
                        <p className="text-xl font-black text-slate-700">{itemsCount}</p>
                    </div>
                </div>

                <button 
                    onClick={() => onSelectTable(table.id)}
                    className="w-full h-16 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-black shadow-lg shadow-slate-900/10 flex items-center justify-center gap-3 transition-all active:scale-95 group"
                >
                    <span>Finalize Bill</span>
                    <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3" />
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