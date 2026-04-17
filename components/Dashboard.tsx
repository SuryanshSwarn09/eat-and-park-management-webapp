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
          badgeBg: 'bg-[#f1f5f9]',
          badgeText: 'text-[#475569]',
          label: 'Empty',
        };
      case TableStatus.OCCUPIED:
        return {
          badgeBg: 'bg-[#253b80]',
          badgeText: 'text-[#ffffff]',
          label: 'Dining',
        };
      case TableStatus.PENDING_PAYMENT:
        return {
          badgeBg: 'bg-[#e2e8f0]',
          badgeText: 'text-[#0f172a]',
          label: 'Pending',
        };
      default:
        return { badgeBg: 'bg-[#f1f5f9]', badgeText: 'text-[#475569]', label: 'Reserved' };
    }
  };

  const calculateTableTotal = (table: Table) => {
    return table.currentOrder.reduce((acc, orderItem) => {
      const menuInfo = menuItems.find(m => m.id === orderItem.menuItemId);
      return acc + (menuInfo?.price || 0) * orderItem.quantity;
    }, 0);
  };

  return (
    <div className="h-full flex flex-col pb-4 lg:pb-0">
      
      <div className="mb-4 sm:mb-6 shrink-0">
        <h2 className="text-[24px] sm:text-[28px] font-bold text-[#0f172a] tracking-tight leading-none">Floor Plan</h2>
        <p className="text-[12px] sm:text-[14px] text-[#475569] mt-1">Manage tables and active orders.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 flex-1 min-h-0">
        {tables.map((table) => {
          const config = getStatusConfig(table.status);
          const total = calculateTableTotal(table);
          const itemsCount = table.currentOrder.reduce((sum, item) => sum + item.quantity, 0);
          
          return (
            <div
              key={table.id}
              className="bg-[#ffffff] rounded-xl border border-[#e2e8f0] shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.12)] transition-shadow p-3 sm:p-4 flex flex-col h-full"
            >
              <div className="flex justify-between items-start mb-2">
                <span className="text-[18px] sm:text-[20px] font-bold text-[#0f172a] leading-none">T{table.id}</span>
                <span className={`text-[10px] sm:text-[11px] font-bold px-2 py-1 rounded-full uppercase tracking-wide ${config.badgeBg} ${config.badgeText}`}>
                  {config.label}
                </span>
              </div>
              
              <div className="flex-1 flex flex-col justify-center my-2">
                  {table.status === TableStatus.AVAILABLE ? (
                    <p className="text-[12px] text-[#94a3b8] font-medium leading-tight">Ready for guests</p>
                  ) : (
                    <div>
                      <p className="text-[20px] sm:text-[24px] font-bold text-[#0f172a] leading-none mb-1">₹{total}</p>
                      <p className="text-[11px] sm:text-[12px] font-medium text-[#475569]">{itemsCount} items</p>
                    </div>
                  )}
              </div>

              <div className="flex gap-2 mt-auto shrink-0">
                 {table.status === TableStatus.AVAILABLE ? (
                   <button 
                     onClick={() => onTableClick(table.id, 'order')}
                     className="w-full bg-[#253b80] hover:bg-[#0093d5] text-[#ffffff] h-9 sm:h-10 rounded-full font-medium text-[12px] sm:text-[13px] transition-colors"
                   >
                     Open Order
                   </button>
                 ) : (
                   <>
                     <button 
                       onClick={() => onTableClick(table.id, 'order')}
                       className="flex-1 bg-[#f1f5f9] hover:bg-[#e2e8f0] text-[#0f172a] h-9 sm:h-10 rounded-full font-medium text-[12px] sm:text-[13px] transition-colors"
                     >
                       Add
                     </button>
                     <button 
                       onClick={() => onTableClick(table.id, 'bill')}
                       className="flex-1 bg-[#253b80] hover:bg-[#0093d5] text-[#ffffff] h-9 sm:h-10 rounded-full font-medium text-[12px] sm:text-[13px] transition-colors"
                     >
                       Pay
                     </button>
                   </>
                 )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Dashboard;