import React, { useState, useMemo } from 'react';
import { Table, TableStatus, OrderItem, Transaction, StaffMember, MenuItem } from './types';
import { MENU_ITEMS as DEFAULT_MENU } from './constants'; // Import defaults
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
    <div className="flex h-screen w-screen bg-slate-50 overflow-hidden relative">
      <Sidebar currentView={view} isOwner={isOwner} isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} onLogout={handleLogout} onNavigate={navigateTo} />
      
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <header className="lg:hidden bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between shrink-0">
          <button onClick={() => setIsSidebarOpen(true)} className="p-2 hover:bg-slate-100 rounded-xl">
            <svg className="w-6 h-6 text-slate-900" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
          <span className="font-black text-slate-900 text-lg tracking-tight">Eat & Park</span>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${isOwner ? 'bg-indigo-600' : 'bg-slate-800'}`}>
             <span className="text-[10px] font-bold">{isOwner ? 'O' : 'S'}</span>
          </div>
        </header>

        <main className="flex-1 flex flex-col p-4 sm:p-6 lg:p-8 min-h-0 overflow-hidden">
          <header className="hidden lg:flex mb-6 justify-between items-center shrink-0">
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">Eat & Park POS</h1>
              <p className="text-slate-500 text-sm font-medium">Terminal #01 • {view.charAt(0).toUpperCase() + view.slice(1).replace('-', ' ')}</p>
            </div>
          </header>

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