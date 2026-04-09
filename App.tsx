import React, { useState, useMemo } from 'react';
import { Table, TableStatus, OrderItem, Transaction, StaffMember, MenuItem } from './types';
import { MENU_ITEMS as DEFAULT_MENU } from './constants';
import Dashboard from './components/Dashboard';
import OrderModule from './components/OrderModule';
import BillingModule from './components/BillingModule';
import CheckoutMap from './components/CheckoutMap';
import SalesHistory from './components/SalesHistory';
import AdminDashboard from './components/AdminDashboard';
import Sidebar from './components/Sidebar';
import Auth from './components/Auth';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isOwner, setIsOwner] = useState<boolean>(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  
  // GLOBAL MENU STATE
  const [menuItems, setMenuItems] = useState<MenuItem[]>(() => 
    DEFAULT_MENU.map(item => ({ ...item, status: 'current' }))
  );

  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([
    { id: '1', name: 'Default Staff', userId: 'staff01', password: 'staff123', isActive: true, dateAdded: new Date() }
  ]);
  
  const [tables, setTables] = useState<Table[]>(
    Array.from({ length: 6 }, (_, i) => ({ id: i + 1, status: TableStatus.AVAILABLE, currentOrder: [] }))
  );
  
  const [selectedTableId, setSelectedTableId] = useState<number | null>(null);
  const [view, setView] = useState<'dashboard' | 'order' | 'billing' | 'checkout-map' | 'bill-registry' | 'admin-dashboard'>('dashboard');
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const navigateTo = (v: any) => {
    if (v !== 'order' && v !== 'billing') setSelectedTableId(null);
    setView(v);
    setIsSidebarOpen(false);
  };

  const selectedTable = useMemo(() => tables.find(t => t.id === selectedTableId) || null, [tables, selectedTableId]);

  const handleLogin = (role: 'owner' | 'staff') => {
    setIsOwner(role === 'owner');
    setIsAuthenticated(true);
    if (role === 'owner') setView('admin-dashboard'); 
  };

  const handleLogout = () => {
    setIsAuthenticated(false); setView('dashboard'); setSelectedTableId(null); setIsSidebarOpen(false);
  };

  const handleTableClick = (id: number, action?: 'order' | 'bill') => {
    const table = tables.find(t => t.id === id);
    if (!table) return;
    setSelectedTableId(id);
    if (action === 'bill') setView('billing');
    else setView('order');
  };

  const updateTableOrder = (tableId: number, newItems: OrderItem[]) => {
    setTables(prev => prev.map(t => {
      if (t.id !== tableId) return t;
      const mergedOrder = [...t.currentOrder];
      newItems.forEach(newItem => {
        const existingIdx = mergedOrder.findIndex(o => o.menuItemId === newItem.menuItemId);
        if (existingIdx > -1) {
          mergedOrder[existingIdx].quantity += newItem.quantity;
          if (newItem.notes) mergedOrder[existingIdx].notes = newItem.notes;
        } else mergedOrder.push(newItem);
      });
      return { ...t, currentOrder: mergedOrder, status: mergedOrder.length > 0 ? TableStatus.OCCUPIED : TableStatus.AVAILABLE };
    }));
    setSelectedTableId(null);
    setView('dashboard');
  };

  const finalizeTransaction = (transaction: Transaction) => {
    setTransactions(prev => [...prev, transaction]);
    setTables(prev => prev.map(t => t.id === transaction.tableId ? { ...t, status: TableStatus.AVAILABLE, currentOrder: [] } : t));
    setSelectedTableId(null);
    setView('bill-registry');
  };

  if (!isAuthenticated) return <Auth onLogin={handleLogin} staffMembers={staffMembers} />;

  return (
    // FIX 1: Changed h-screen to h-[100dvh] for proper mobile browser height.
    // Changed bg-slate-50 to bg-[#ffffff] for the Uber-style B2B theme.
    <div className="flex h-[100dvh] w-screen bg-[#ffffff] overflow-hidden relative font-sans">
      <Sidebar 
        currentView={view} 
        isOwner={isOwner} 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        onLogout={handleLogout} 
        onNavigate={navigateTo} 
      />
      
      {/* FIX 2: Added min-w-0 and min-h-0 to prevent flexbox children from breaking layout boundaries */}
      <div className="flex-1 flex flex-col min-w-0 min-h-0 h-full overflow-hidden">
        
        {/* Mobile Header */}
        <header className="lg:hidden bg-[#ffffff] border-b border-[#e2e2e2] px-5 py-4 flex items-center justify-between shrink-0 z-10">
          <button onClick={() => setIsSidebarOpen(true)} className="p-2 -ml-2 hover:bg-[#efefef] rounded-full text-[#000000] transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
          <span className="font-bold text-[#000000] text-[18px] tracking-tight">Eat & Park</span>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-bold ${isOwner ? 'bg-[#000000] text-[#ffffff]' : 'bg-[#efefef] text-[#000000]'}`}>
             {isOwner ? 'AD' : 'ST'}
          </div>
        </header>

        {/* Main Content Area Wrapper */}
        <main className="flex-1 flex flex-col p-4 sm:p-6 lg:p-8 min-h-0 overflow-hidden">
          
          {/* Desktop Header */}
          <header className="hidden lg:flex mb-8 justify-between items-center shrink-0">
            <div>
              <h1 className="text-[32px] font-bold text-[#000000] tracking-tight leading-tight">Eat & Park POS</h1>
              <p className="text-[#4b4b4b] text-[14px] font-medium mt-1">Terminal #01 • {view.charAt(0).toUpperCase() + view.slice(1).replace('-', ' ')}</p>
            </div>
          </header>

          {/* View Routing - min-h-0 ensures internal components can scroll properly */}
          <div className="flex-1 min-h-0 relative">
            {view === 'dashboard' && <div className="h-full overflow-y-auto pr-1"><Dashboard tables={tables} onTableClick={handleTableClick} menuItems={menuItems} /></div>}
            
            {view === 'checkout-map' && <div className="h-full overflow-y-auto pr-1"><CheckoutMap tables={tables} onSelectTable={(id) => { setSelectedTableId(id); setView('billing'); }} menuItems={menuItems} /></div>}
            
            {view === 'bill-registry' && <SalesHistory transactions={transactions} menuItems={menuItems} />}

            {view === 'admin-dashboard' && isOwner && (
              <div className="h-full overflow-y-auto pr-1">
                <AdminDashboard 
                  transactions={transactions} 
                  tables={tables} 
                  staffMembers={staffMembers} setStaffMembers={setStaffMembers}
                  menuItems={menuItems} setMenuItems={setMenuItems} 
                />
              </div>
            )}
            
            {view === 'order' && selectedTable && <OrderModule table={selectedTable} onConfirmOrder={(items) => updateTableOrder(selectedTable.id, items)} onGenerateBill={() => { setView('billing'); }} onBack={() => { setSelectedTableId(null); setView('dashboard'); }} menuItems={menuItems} />}
            
            {view === 'billing' && selectedTable && <div className="h-full overflow-y-auto"><BillingModule table={selectedTable} onFinalize={finalizeTransaction} onBack={() => { setView('dashboard'); }} menuItems={menuItems} /></div>}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;