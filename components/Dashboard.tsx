import React from 'react';
import { Table, TableStatus, MenuItem } from '../types';

interface DashboardProps {
  tables: Table[];
  onTableClick: (id: number, action?: 'order' | 'bill') => void;
  menuItems: MenuItem[];
}

const Dashboard: React.FC<DashboardProps> = ({ tables, onTableClick, menuItems }) => {
  const getStatusConfig = (status: TableStatus) => {
    switch (status) {
      case TableStatus.AVAILABLE:
        return {
          bg: 'bg-white hover:bg-emerald-50/20',
          border: 'border-slate-200',
          icon: 'bg-emerald-50 text-emerald-600',
          text: 'text-emerald-600',
          label: 'Ready',
        };
      case TableStatus.OCCUPIED:
        return {
          bg: 'bg-white hover:bg-orange-50/20',
          border: 'border-orange-100',
          icon: 'bg-orange-50 text-orange-600',
          text: 'text-orange-600',
          label: 'Dining',
        };
      case TableStatus.PENDING_PAYMENT:
        return {
          bg: 'bg-amber-50 hover:bg-amber-100',
          border: 'border-amber-200',
          icon: 'bg-amber-500 text-white',
          text: 'text-amber-700',
          label: 'Payment Pending',
        };
      default:
        return {
            bg: 'bg-white', border: 'border-slate-200', icon: 'bg-slate-400', text: 'text-slate-500', label: 'Reserved'
        }
    }
  };

  const calculateTableTotal = (table: Table) => {
    return table.currentOrder.reduce((acc, orderItem) => {
      const menuInfo = menuItems.find(m => m.id === orderItem.menuItemId);
      return acc + (menuInfo?.price || 0) * orderItem.quantity;
    }, 0);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
      {tables.map((table) => {
        const config = getStatusConfig(table.status);
        const total = calculateTableTotal(table);
        
        return (
          <div
            key={table.id}
            className={`group relative p-6 rounded-[2.5rem] border-2 transition-all duration-500 hover:shadow-xl flex flex-col h-[18rem] overflow-hidden ${config.bg} ${config.border}`}
          >
            {/* Table Number & Status */}
            <div className="flex justify-between items-start mb-4">
              <div className={`w-12 h-12 rounded-2xl ${config.icon} flex items-center justify-center font-black text-xl shadow-sm border border-black/5`}>
                {table.id}
              </div>
              <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl border ${config.text} ${config.border} bg-white/80 backdrop-blur-sm`}>
                {config.label}
              </span>
            </div>
            
            {/* Table Details */}
            <div className="flex-1">
                <h3 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                    Table {table.id}
                </h3>
                
                {table.currentOrder.length > 0 ? (
                  <div className="mt-2 space-y-1">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Current Bill</p>
                    <p className="text-3xl font-black text-slate-900 tracking-tighter">₹{total}</p>
                    <p className="text-[10px] font-bold text-orange-500 animate-pulse uppercase tracking-wider">Kitchen Processing {table.currentOrder.length} items</p>
                  </div>
                ) : (
                  <p className="text-sm font-medium text-slate-400 mt-2">Ready for service</p>
                )}
            </div>

            {/* Quick Actions */}
            <div className="mt-4 flex gap-2">
               {table.status === TableStatus.AVAILABLE ? (
                 <button 
                   onClick={() => onTableClick(table.id, 'order')}
                   className="flex-1 bg-slate-900 text-white h-12 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all active:scale-95"
                 >
                   Open Table
                 </button>
               ) : (
                 <>
                   <button 
                     onClick={() => onTableClick(table.id, 'order')}
                     className="flex-1 bg-white border border-slate-200 text-slate-900 h-12 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all active:scale-95"
                   >
                     Add Food
                   </button>
                   <button 
                     onClick={() => onTableClick(table.id, 'bill')}
                     className="flex-1 bg-orange-500 text-white h-12 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/20 active:scale-95"
                   >
                     View Bill
                   </button>
                 </>
               )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Dashboard;