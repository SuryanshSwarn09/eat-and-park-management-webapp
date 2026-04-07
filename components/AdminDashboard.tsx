import React, { useState, useMemo } from 'react';
import { Transaction, Table, TableStatus, StaffMember, MenuItem } from '../types';

interface AdminDashboardProps {
  transactions: Transaction[];
  tables: Table[];
  staffMembers: StaffMember[];
  setStaffMembers: React.Dispatch<React.SetStateAction<StaffMember[]>>;
  menuItems: MenuItem[];
  setMenuItems: React.Dispatch<React.SetStateAction<MenuItem[]>>;
}

type MenuStatus = 'current' | 'pending' | 'not_selling';

const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
  transactions, 
  tables, 
  staffMembers, 
  setStaffMembers, 
  menuItems, 
  setMenuItems 
}) => {
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [isTableModalOpen, setIsTableModalOpen] = useState(false);
  const [isMenuModalOpen, setIsMenuModalOpen] = useState(false);
  
  // Date Formatter
  const getLocalYMD = (d: Date) => {
    const date = new Date(d);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  const [filterDate, setFilterDate] = useState(getLocalYMD(new Date()));
  
  // Staff Form States
  const [newName, setNewName] = useState('');
  const [newUserId, setNewUserId] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // Menu Management States
  const [activeMenuTab, setActiveMenuTab] = useState<MenuStatus>('current');
  const [menuSearchQuery, setMenuSearchQuery] = useState(''); // NEW: Search state
  const [newItemName, setNewItemName] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('');
  const [newItemIsVeg, setNewItemIsVeg] = useState(true);

  // Dashboard Metrics
  const todayYMD = getLocalYMD(new Date());
  const todayTransactions = transactions.filter(tx => getLocalYMD(tx.timestamp) === todayYMD);
  const totalRevenueToday = todayTransactions.reduce((acc, t) => acc + t.total, 0);
  const activeTablesCount = tables.filter(t => t.status !== TableStatus.AVAILABLE).length;
  
  let totalItemsSoldToday = todayTransactions.reduce((acc, t) => acc + t.items.reduce((sum, item) => sum + item.quantity, 0), 0);
  tables.forEach(t => {
      totalItemsSoldToday += t.currentOrder.reduce((acc, item) => acc + item.quantity, 0);
  });

  // --- Staff Logic ---
  const handleAddStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newUserId || !newPassword) return;
    if (staffMembers.some(s => s.userId === newUserId)) {
        alert("A staff member with this User ID already exists!");
        return;
    }
    const newStaff: StaffMember = {
        id: Math.random().toString(36).substring(7), name: newName, userId: newUserId, password: newPassword, isActive: true, dateAdded: new Date()
    };
    setStaffMembers([...staffMembers, newStaff]);
    setNewName(''); setNewUserId(''); setNewPassword('');
  };

  const toggleStaffAccess = (id: string) => {
      setStaffMembers(staffMembers.map(staff => staff.id === id ? { ...staff, isActive: !staff.isActive } : staff));
  };

  const deleteStaffMember = (id: string, name: string) => {
      if (window.confirm(`Are you sure you want to permanently delete the account for ${name}?`)) {
          setStaffMembers(staffMembers.filter(staff => staff.id !== id));
      }
  };

  // --- Menu Logic ---
  const handleMoveMenu = (id: string, newStatus: MenuStatus) => {
      setMenuItems(prev => prev.map(item => item.id === id ? { ...item, status: newStatus } : item));
  };

  const handleAddNewMenuItem = (e: React.FormEvent) => {
      e.preventDefault();
      if (!newItemName || !newItemPrice || !newItemCategory) return;

      const newItem: MenuItem = {
          id: `menu_${Math.random().toString(36).substr(2, 9)}`,
          name: newItemName,
          price: Number(newItemPrice),
          category: newItemCategory,
          isVeg: newItemIsVeg,
          image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=200&q=80',
          status: 'pending'
      };

      setMenuItems([newItem, ...menuItems]);
      setNewItemName(''); setNewItemPrice(''); setNewItemCategory(''); setNewItemIsVeg(true);
      alert('Item added to Pending list successfully!');
  };

  const pendingMenuItems = menuItems.filter(m => m.status === 'pending');
  const notSellingMenuItems = menuItems.filter(m => m.status === 'not_selling');
  
  // NEW: Search Filtering Logic for Currently Selling Menu
  const currentMenuItems = menuItems.filter(m => m.status === 'current');
  const searchedCurrentItems = currentMenuItems.filter(item => 
      item.name.toLowerCase().includes(menuSearchQuery.toLowerCase()) || 
      item.category.toLowerCase().includes(menuSearchQuery.toLowerCase())
  );
  
  const searchedCategories = Array.from(new Set(searchedCurrentItems.map(m => m.category)));
  const existingAllCategories = Array.from(new Set(menuItems.map(m => m.category)));

  // --- Table Analytics Logic ---
  const tableAnalytics = useMemo(() => {
    const isToday = filterDate === todayYMD;
    let dayTotalRevenue = 0;
    
    const stats = Array.from({ length: 6 }, (_, i) => {
        const tableId = i + 1;
        let collectedRev = 0, liveRev = 0, totalItems = 0;
        const itemsMap: Record<string, number> = {};

        const dayTxs = transactions.filter(tx => tx.tableId === tableId && getLocalYMD(tx.timestamp) === filterDate);
        dayTxs.forEach(tx => {
            collectedRev += tx.total; dayTotalRevenue += tx.total;
            tx.items.forEach(item => {
                totalItems += item.quantity;
                const menuInfo = menuItems.find(m => m.id === item.menuItemId);
                const name = menuInfo?.name || 'Unknown Item';
                itemsMap[name] = (itemsMap[name] || 0) + item.quantity;
            });
        });

        if (isToday) {
            const liveTable = tables.find(t => t.id === tableId);
            if (liveTable && liveTable.currentOrder.length > 0) {
                liveTable.currentOrder.forEach(item => {
                    totalItems += item.quantity;
                    const menuInfo = menuItems.find(m => m.id === item.menuItemId);
                    const name = menuInfo?.name || 'Unknown Item';
                    itemsMap[name] = (itemsMap[name] || 0) + item.quantity;
                    liveRev += (menuInfo?.price || 0) * item.quantity;
                });
            }
        }
        return { tableId, collectedRev, liveRev, totalItems, itemsMap };
    });
    return { stats, dayTotalRevenue };
  }, [filterDate, transactions, tables, todayYMD, menuItems]);

  return (
    <div className="animate-fade-in space-y-8 pb-10">
      <div className="mb-2">
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">Admin Portal</h2>
        <p className="text-slate-500 font-medium">Owner's high-level performance overview.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900 rounded-[2rem] p-8 text-white shadow-xl shadow-slate-900/20 relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Total Revenue Today</p>
          <p className="text-4xl font-black tracking-tighter">₹{Math.round(totalRevenueToday)}</p>
          <p className="text-[10px] font-bold text-emerald-400 mt-4 flex items-center gap-1">
             <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
             Live Updated
          </p>
        </div>

        <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm">
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Active Tables</p>
          <p className="text-4xl font-black text-slate-900 tracking-tighter">{activeTablesCount} <span className="text-xl text-slate-300">/ {tables.length}</span></p>
        </div>

        <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm">
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Items Sold Today</p>
          <p className="text-4xl font-black text-slate-900 tracking-tighter">{totalItemsSoldToday}</p>
        </div>
      </div>

      <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm">
         <h3 className="text-xl font-black text-slate-900 mb-6">Quick Actions</h3>
         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <button 
                onClick={() => setIsTableModalOpen(true)}
                className="h-16 rounded-2xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 text-indigo-700 font-bold flex items-center justify-center gap-3 transition-all active:scale-95 shadow-sm"
            >
                <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                Orders From Tables
            </button>
            <button 
                onClick={() => setIsMenuModalOpen(true)}
                className="h-16 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold flex items-center justify-center gap-3 transition-all active:scale-95 shadow-sm"
            >
                <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" /></svg>
                Manage Menu
            </button>
            <button 
                onClick={() => setIsStaffModalOpen(true)}
                className="h-16 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold flex items-center justify-center gap-3 transition-all active:scale-95 shadow-sm"
            >
                <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                Staff Access
            </button>
            <button className="h-16 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold flex items-center justify-center gap-3 transition-all active:scale-95">
                <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                System Settings
            </button>
         </div>
      </div>

      {/* --- MENU MANAGEMENT MODAL --- */}
      {isMenuModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-[2.5rem] w-full max-w-6xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
            
            <div className="p-8 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50/50">
               <div>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">Menu Configuration</h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Manage active listings, pending additions, and archived items</p>
               </div>
               <button onClick={() => setIsMenuModalOpen(false)} className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-slate-50 transition-all active:scale-95">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
               </button>
            </div>

            {/* Tabs */}
            <div className="px-8 pt-4 border-b border-slate-100 flex gap-4">
                {(['current', 'pending', 'not_selling'] as MenuStatus[]).map((tab) => (
                    <button 
                        key={tab}
                        onClick={() => setActiveMenuTab(tab)}
                        className={`pb-4 px-2 font-black text-sm tracking-wide transition-all border-b-2 ${
                            activeMenuTab === tab 
                            ? 'border-slate-900 text-slate-900' 
                            : 'border-transparent text-slate-400 hover:text-slate-600'
                        }`}
                    >
                        {tab === 'current' && 'Currently Selling'}
                        {tab === 'pending' && 'Pending Approval'}
                        {tab === 'not_selling' && 'Not Selling'}
                        <span className="ml-2 text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
                            {menuItems.filter(m => m.status === tab).length}
                        </span>
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto p-8 bg-slate-50">
                
                {/* 1. CURRENTLY SELLING TAB */}
                {activeMenuTab === 'current' && (
                    <div className="animate-fade-in flex flex-col h-full">
                        {/* Search Bar for Current Menu */}
                        <div className="mb-6">
                            <div className="relative max-w-md">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                                </div>
                                <input 
                                    type="text" 
                                    placeholder="Search dishes or categories..." 
                                    value={menuSearchQuery}
                                    onChange={(e) => setMenuSearchQuery(e.target.value)}
                                    className="w-full h-12 pl-12 pr-4 bg-white border border-slate-200 rounded-xl font-bold text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all text-sm shadow-sm"
                                />
                            </div>
                        </div>

                        <div className="space-y-8 flex-1">
                            {searchedCategories.map(category => (
                                <div key={category} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                                    <h4 className="text-lg font-black text-slate-900 mb-4">{category}</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {searchedCurrentItems.filter(m => m.category === category).map(item => (
                                            <div key={item.id} className="p-4 border border-slate-100 rounded-2xl flex flex-col justify-between bg-slate-50 hover:bg-white transition-all group">
                                                <div className="flex justify-between items-start mb-4">
                                                    <div>
                                                        <p className="font-bold text-slate-800 flex items-center gap-1.5">
                                                            <span className={`w-2 h-2 rounded-full ${item.isVeg ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                                                            {item.name}
                                                        </p>
                                                        <p className="text-xl font-black text-slate-900 mt-1">₹{item.price}</p>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button onClick={() => handleMoveMenu(item.id, 'pending')} className="flex-1 px-3 py-2 bg-amber-50 text-amber-600 hover:bg-amber-100 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
                                                        Make Pending
                                                    </button>
                                                    <button onClick={() => handleMoveMenu(item.id, 'not_selling')} className="flex-1 px-3 py-2 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
                                                        Stop Selling
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                            {searchedCategories.length === 0 && (
                                <p className="text-center text-slate-400 font-bold py-10">
                                    {menuSearchQuery ? "No dishes match your search." : "No items are currently selling."}
                                </p>
                            )}
                        </div>
                    </div>
                )}

                {/* 2. PENDING TAB */}
                {activeMenuTab === 'pending' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
                        {/* Add New Form */}
                        <div className="lg:col-span-1 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm h-fit">
                            <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-6">Create New Menu Item</h4>
                            <form onSubmit={handleAddNewMenuItem} className="space-y-4">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Dish Name</label>
                                    <input type="text" value={newItemName} onChange={e => setNewItemName(e.target.value)} required placeholder="e.g. Paneer Tikka" className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 font-bold text-slate-900 outline-none focus:border-indigo-500"/>
                                </div>
                                <div className="flex gap-4">
                                    <div className="flex-1">
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Price (₹)</label>
                                        <input type="number" value={newItemPrice} onChange={e => setNewItemPrice(e.target.value)} required placeholder="150" min="0" className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 font-bold text-slate-900 outline-none focus:border-indigo-500"/>
                                    </div>
                                    <div className="flex-1">
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Dietary</label>
                                        <select value={newItemIsVeg ? 'veg' : 'nonveg'} onChange={e => setNewItemIsVeg(e.target.value === 'veg')} className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 font-bold text-slate-900 outline-none focus:border-indigo-500">
                                            <option value="veg">Veg</option>
                                            <option value="nonveg">Non-Veg</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Category</label>
                                    <input type="text" list="categories" value={newItemCategory} onChange={e => setNewItemCategory(e.target.value)} required placeholder="Select or type new..." className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 font-bold text-slate-900 outline-none focus:border-indigo-500"/>
                                    <datalist id="categories">
                                        {existingAllCategories.map(cat => <option key={cat} value={cat} />)}
                                    </datalist>
                                </div>
                                <button type="submit" className="w-full h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black text-sm uppercase tracking-widest shadow-lg shadow-indigo-600/20 transition-all active:scale-95 mt-4">
                                    Add to Pending
                                </button>
                            </form>
                        </div>

                        {/* Pending List */}
                        <div className="lg:col-span-2 space-y-4">
                            {pendingMenuItems.length === 0 ? (
                                <div className="p-10 text-center border-2 border-dashed border-slate-200 rounded-3xl">
                                    <p className="text-sm font-bold text-slate-400">No pending items.</p>
                                </div>
                            ) : (
                                pendingMenuItems.map(item => (
                                    <div key={item.id} className="bg-white p-4 border border-slate-100 rounded-2xl flex justify-between items-center shadow-sm hover:shadow-md transition-all">
                                        <div>
                                            <p className="font-bold text-slate-800 flex items-center gap-1.5">
                                                <span className={`w-2 h-2 rounded-full ${item.isVeg ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                                                {item.name}
                                            </p>
                                            <div className="flex gap-3 mt-1">
                                                <p className="text-sm font-black text-slate-900">₹{item.price}</p>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-100 px-2 py-0.5 rounded-lg">{item.category}</p>
                                            </div>
                                        </div>
                                        <div className="flex flex-col sm:flex-row gap-2">
                                            <button onClick={() => handleMoveMenu(item.id, 'current')} className="px-4 py-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
                                                Publish to Menu
                                            </button>
                                            <button onClick={() => handleMoveMenu(item.id, 'not_selling')} className="px-4 py-2 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
                                                Reject / Drop
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}

                {/* 3. NOT SELLING TAB */}
                {activeMenuTab === 'not_selling' && (
                    <div className="space-y-4 animate-fade-in max-w-4xl mx-auto">
                        {notSellingMenuItems.length === 0 ? (
                            <div className="p-10 text-center border-2 border-dashed border-slate-200 rounded-3xl">
                                <p className="text-sm font-bold text-slate-400">All items are currently active or pending.</p>
                            </div>
                        ) : (
                            notSellingMenuItems.map(item => (
                                <div key={item.id} className="bg-white p-4 border border-slate-100 rounded-2xl flex justify-between items-center shadow-sm opacity-75 hover:opacity-100 transition-all">
                                    <div>
                                        <p className="font-bold text-slate-500 line-through decoration-slate-300">{item.name}</p>
                                        <div className="flex gap-3 mt-1">
                                            <p className="text-sm font-black text-slate-400">₹{item.price}</p>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-100 px-2 py-0.5 rounded-lg">{item.category}</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col sm:flex-row gap-2">
                                        <button onClick={() => handleMoveMenu(item.id, 'current')} className="px-4 py-2 bg-slate-900 text-white hover:bg-slate-800 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
                                            Republish
                                        </button>
                                        <button onClick={() => handleMoveMenu(item.id, 'pending')} className="px-4 py-2 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
                                            Review in Pending
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
          </div>
        </div>
      )}

      {/* --- TABLE ANALYTICS MODAL --- */}
      {isTableModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-slate-50 rounded-[2.5rem] w-full max-w-6xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="p-8 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white">
               <div>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">Table Insights & Orders</h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Live overview of dish quantities and table revenue</p>
               </div>
               <div className="flex items-center gap-4">
                  <div className="flex flex-col">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Filter Date</label>
                      <input 
                          type="date" 
                          value={filterDate}
                          onChange={(e) => setFilterDate(e.target.value)}
                          max={todayYMD}
                          className="h-10 px-4 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:border-indigo-500"
                      />
                  </div>
                  <button onClick={() => setIsTableModalOpen(false)} className="mt-4 sm:mt-0 w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-slate-200 transition-all active:scale-95">
                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
               </div>
            </div>
            <div className="flex-1 overflow-y-auto p-8">
               <div className="bg-indigo-600 text-white p-6 rounded-3xl shadow-lg mb-8 flex justify-between items-center bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
                   <div>
                       <p className="text-[10px] font-black text-indigo-200 uppercase tracking-widest mb-1">Total Daily Revenue (Finalized)</p>
                       <p className="text-3xl font-black tracking-tighter">₹{Math.round(tableAnalytics.dayTotalRevenue)}</p>
                   </div>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {tableAnalytics.stats.map(stat => (
                      <div key={stat.tableId} className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm flex flex-col h-full">
                          <div className="flex justify-between items-start mb-6">
                              <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 bg-slate-100 text-slate-700 rounded-xl flex items-center justify-center font-black text-lg">{stat.tableId}</div>
                                  <h4 className="text-lg font-black text-slate-900">Table {stat.tableId}</h4>
                              </div>
                              <div className="text-right">
                                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Dishes</p>
                                  <p className="font-black text-xl text-slate-800">{stat.totalItems}</p>
                              </div>
                          </div>
                          <div className="flex gap-2 mb-6">
                              <div className="flex-1 bg-emerald-50 rounded-xl p-3 border border-emerald-100">
                                  <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest mb-0.5">Collected</p>
                                  <p className="font-black text-lg text-emerald-700">₹{stat.collectedRev}</p>
                              </div>
                              {filterDate === todayYMD && stat.liveRev > 0 && (
                                  <div className="flex-1 bg-amber-50 rounded-xl p-3 border border-amber-100 relative overflow-hidden">
                                      <div className="absolute top-0 right-0 w-1.5 h-full bg-amber-400 animate-pulse"></div>
                                      <p className="text-[9px] font-black text-amber-600 uppercase tracking-widest mb-0.5">Live/Pending</p>
                                      <p className="font-black text-lg text-amber-700">₹{stat.liveRev}</p>
                                  </div>
                              )}
                          </div>
                          <div className="flex-1">
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2 mb-3">Itemized Breakdown</p>
                              <div className="flex flex-wrap gap-1.5">
                                  {Object.entries(stat.itemsMap).map(([itemName, qty]) => (
                                      <div key={itemName} className="bg-slate-50 border border-slate-100 rounded-lg px-2.5 py-1.5 flex items-center gap-2">
                                          <span className="text-[11px] font-bold text-slate-600 max-w-[120px] truncate">{itemName}</span>
                                          <span className="text-[10px] font-black text-slate-900 bg-slate-200 px-1.5 rounded-md">x{qty}</span>
                                      </div>
                                  ))}
                              </div>
                          </div>
                      </div>
                  ))}
               </div>
            </div>
          </div>
        </div>
      )}

      {/* --- STAFF MANAGEMENT MODAL --- */}
      {isStaffModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-[2.5rem] w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
               <div>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">Staff Management</h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Control terminal access & monitor accounts</p>
               </div>
               <button onClick={() => setIsStaffModalOpen(false)} className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-slate-50 transition-all active:scale-95">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
               </button>
            </div>
            <div className="flex-1 overflow-y-auto p-8 grid grid-cols-1 lg:grid-cols-2 gap-10">
               <div>
                 <div className="flex justify-between items-end mb-4">
                     <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Active Directory</h4>
                     <span className="text-[10px] font-bold text-slate-400">{staffMembers.length} Accounts</span>
                 </div>
                 <div className="space-y-3">
                    {staffMembers.map(staff => (
                        <div key={staff.id} className="p-4 border border-slate-100 rounded-2xl flex items-center justify-between bg-white shadow-sm hover:shadow-md transition-all group">
                           <div>
                              <p className="font-black text-slate-800 flex items-center gap-2">{staff.name}{!staff.isActive && <span className="w-2 h-2 rounded-full bg-rose-500"></span>}</p>
                              <p className="text-[10px] font-bold text-slate-400 mt-0.5">ID: {staff.userId}</p>
                           </div>
                           <div className="flex items-center gap-2">
                               <button onClick={() => toggleStaffAccess(staff.id)} className={`px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${staff.isActive ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                                  {staff.isActive ? 'Active' : 'Revoked'}
                               </button>
                               <button onClick={() => deleteStaffMember(staff.id, staff.name)} className="w-8 h-8 rounded-xl bg-white border border-rose-100 text-rose-400 flex items-center justify-center hover:bg-rose-500 hover:text-white">
                                   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                               </button>
                           </div>
                        </div>
                    ))}
                 </div>
               </div>
               <div>
                 <div className="bg-slate-50 border border-slate-100 p-8 rounded-[2rem]">
                    <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-6">Create New Account</h4>
                    <form onSubmit={handleAddStaff} className="space-y-4">
                       <input type="text" value={newName} onChange={e => setNewName(e.target.value)} required placeholder="Full Name" className="w-full h-12 bg-white border border-slate-200 rounded-xl px-4 font-bold text-sm"/>
                       <input type="text" value={newUserId} onChange={e => setNewUserId(e.target.value)} required placeholder="User ID" className="w-full h-12 bg-white border border-slate-200 rounded-xl px-4 font-bold text-sm"/>
                       <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required placeholder="Password" className="w-full h-12 bg-white border border-slate-200 rounded-xl px-4 font-bold text-sm"/>
                       <button type="submit" className="w-full h-14 bg-slate-900 text-white rounded-xl font-black text-sm uppercase">Add Staff Member</button>
                    </form>
                 </div>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;