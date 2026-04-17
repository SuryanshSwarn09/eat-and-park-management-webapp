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
  transactions, tables, staffMembers, setStaffMembers, menuItems, setMenuItems 
}) => {
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [isTableModalOpen, setIsTableModalOpen] = useState(false);
  const [isMenuModalOpen, setIsMenuModalOpen] = useState(false);
  
  const getLocalYMD = (d: Date) => {
    const date = new Date(d);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  const [filterDate, setFilterDate] = useState(getLocalYMD(new Date()));
  
  const [newName, setNewName] = useState('');
  const [newUserId, setNewUserId] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const [activeMenuTab, setActiveMenuTab] = useState<MenuStatus>('current');
  const [menuSearchQuery, setMenuSearchQuery] = useState('');
  const [newItemName, setNewItemName] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('');
  const [newItemIsVeg, setNewItemIsVeg] = useState(true);

  const todayYMD = getLocalYMD(new Date());
  const todayTransactions = transactions.filter(tx => getLocalYMD(tx.timestamp) === todayYMD);
  const totalRevenueToday = todayTransactions.reduce((acc, t) => acc + t.total, 0);
  const activeTablesCount = tables.filter(t => t.status !== TableStatus.AVAILABLE).length;
  
  let totalItemsSoldToday = todayTransactions.reduce((acc, t) => acc + t.items.reduce((sum, item) => sum + item.quantity, 0), 0);
  tables.forEach(t => { totalItemsSoldToday += t.currentOrder.reduce((acc, item) => acc + item.quantity, 0); });

  const handleAddStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newUserId || !newPassword) return;
    if (staffMembers.some(s => s.userId === newUserId)) return alert("User ID already exists!");
    setStaffMembers([...staffMembers, { id: Math.random().toString(36).substring(7), name: newName, userId: newUserId, password: newPassword, isActive: true, dateAdded: new Date() }]);
    setNewName(''); setNewUserId(''); setNewPassword('');
  };

  const toggleStaffAccess = (id: string) => setStaffMembers(staffMembers.map(staff => staff.id === id ? { ...staff, isActive: !staff.isActive } : staff));
  const deleteStaffMember = (id: string, name: string) => { if (window.confirm(`Delete account for ${name}?`)) setStaffMembers(staffMembers.filter(staff => staff.id !== id)); };
  const handleMoveMenu = (id: string, newStatus: MenuStatus) => setMenuItems(prev => prev.map(item => item.id === id ? { ...item, status: newStatus } : item));

  const handleAddNewMenuItem = (e: React.FormEvent) => {
      e.preventDefault();
      if (!newItemName || !newItemPrice || !newItemCategory) return;
      setMenuItems([{ id: `menu_${Math.random().toString(36).substr(2, 9)}`, name: newItemName, price: Number(newItemPrice), category: newItemCategory, isVeg: newItemIsVeg, image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=200&q=80', status: 'pending' }, ...menuItems]);
      setNewItemName(''); setNewItemPrice(''); setNewItemCategory(''); setNewItemIsVeg(true);
      alert('Added to Pending list!');
  };

  const pendingMenuItems = menuItems.filter(m => m.status === 'pending');
  const notSellingMenuItems = menuItems.filter(m => m.status === 'not_selling');
  const currentMenuItems = menuItems.filter(m => m.status === 'current');
  const searchedCurrentItems = currentMenuItems.filter(item => item.name.toLowerCase().includes(menuSearchQuery.toLowerCase()) || item.category.toLowerCase().includes(menuSearchQuery.toLowerCase()));
  const searchedCategories = Array.from(new Set(searchedCurrentItems.map(m => m.category)));
  const existingAllCategories = Array.from(new Set(menuItems.map(m => m.category)));

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
                itemsMap[menuInfo?.name || 'Unknown'] = (itemsMap[menuInfo?.name || 'Unknown'] || 0) + item.quantity;
            });
        });

        if (isToday) {
            const liveTable = tables.find(t => t.id === tableId);
            if (liveTable && liveTable.currentOrder.length > 0) {
                liveTable.currentOrder.forEach(item => {
                    totalItems += item.quantity;
                    const menuInfo = menuItems.find(m => m.id === item.menuItemId);
                    itemsMap[menuInfo?.name || 'Unknown'] = (itemsMap[menuInfo?.name || 'Unknown'] || 0) + item.quantity;
                    liveRev += (menuInfo?.price || 0) * item.quantity;
                });
            }
        }
        return { tableId, collectedRev, liveRev, totalItems, itemsMap };
    });
    return { stats, dayTotalRevenue };
  }, [filterDate, transactions, tables, todayYMD, menuItems]);

  return (
    <div className="space-y-6 sm:space-y-8 pb-10">
      <div className="mb-2">
        <h2 className="text-[32px] font-bold text-[#0f172a] tracking-tight">Admin Portal</h2>
        <p className="text-[#475569] text-[16px] mt-1">Management overview and system configuration.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#253b80] rounded-xl p-6 sm:p-8 text-[#ffffff] shadow-[0_4px_16px_rgba(0,0,0,0.12)]">
          <p className="text-[12px] font-bold text-[#f1f5f9] uppercase tracking-wide mb-2">Total Revenue Today</p>
          <p className="text-[36px] font-bold tracking-tight">₹{Math.round(totalRevenueToday)}</p>
        </div>
        <div className="bg-[#ffffff] rounded-xl p-6 sm:p-8 border border-[#e2e8f0] shadow-[0_4px_16px_rgba(0,0,0,0.04)]">
          <p className="text-[12px] font-bold text-[#94a3b8] uppercase tracking-wide mb-2">Active Tables</p>
          <p className="text-[36px] font-bold text-[#0f172a] tracking-tight">{activeTablesCount} <span className="text-[20px] text-[#94a3b8]">/ {tables.length}</span></p>
        </div>
        <div className="bg-[#ffffff] rounded-xl p-6 sm:p-8 border border-[#e2e8f0] shadow-[0_4px_16px_rgba(0,0,0,0.04)]">
          <p className="text-[12px] font-bold text-[#94a3b8] uppercase tracking-wide mb-2">Items Sold Today</p>
          <p className="text-[36px] font-bold text-[#0f172a] tracking-tight">{totalItemsSoldToday}</p>
        </div>
      </div>

      <div className="bg-[#ffffff] border border-[#e2e8f0] rounded-xl p-6 sm:p-8 shadow-[0_4px_16px_rgba(0,0,0,0.04)]">
         <h3 className="text-[20px] font-bold text-[#0f172a] mb-6">Quick Actions</h3>
         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <button onClick={() => setIsTableModalOpen(true)} className="h-14 sm:h-16 rounded-full bg-[#f1f5f9] hover:bg-[#e2e8f0] text-[#0f172a] font-medium transition-colors text-[16px]">
                Orders From Tables
            </button>
            <button onClick={() => setIsMenuModalOpen(true)} className="h-14 sm:h-16 rounded-full bg-[#f1f5f9] hover:bg-[#e2e8f0] text-[#0f172a] font-medium transition-colors text-[16px]">
                Manage Menu
            </button>
            <button onClick={() => setIsStaffModalOpen(true)} className="h-14 sm:h-16 rounded-full bg-[#f1f5f9] hover:bg-[#e2e8f0] text-[#0f172a] font-medium transition-colors text-[16px]">
                Staff Access
            </button>
            <button className="h-14 sm:h-16 rounded-full bg-[#f1f5f9] hover:bg-[#e2e8f0] text-[#0f172a] font-medium transition-colors text-[16px]">
                System Settings
            </button>
         </div>
      </div>

      {isMenuModalOpen && (
        <div className="fixed inset-0 bg-[#0f172a] bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-[#ffffff] rounded-2xl w-full max-w-6xl h-[90dvh] flex flex-col min-h-0 overflow-hidden shadow-2xl">
            
            <div className="relative p-6 border-b border-[#e2e8f0] flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 bg-[#ffffff] shrink-0">
               <div className="pr-10 sm:pr-0">
                  <h3 className="text-[24px] font-bold text-[#0f172a] tracking-tight">Menu Configuration</h3>
               </div>
               <button onClick={() => setIsMenuModalOpen(false)} className="absolute top-6 right-6 sm:static shrink-0 w-10 h-10 bg-[#f1f5f9] rounded-full flex items-center justify-center text-[#0f172a] hover:bg-[#e2e8f0] transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
               </button>
            </div>

            <div className="pt-2 border-b border-[#e2e8f0] flex w-full shrink-0 px-2 sm:px-6">
                {(['current', 'pending', 'not_selling'] as MenuStatus[]).map((tab) => (
                    <button 
                        key={tab}
                        onClick={() => setActiveMenuTab(tab)}
                        className={`flex-1 pb-3 pt-2 font-bold transition-colors border-b-2 flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 ${
                            activeMenuTab === tab ? 'border-[#2563eb] text-[#0f172a]' : 'border-transparent text-[#475569] hover:text-[#0f172a]'
                        }`}
                    >
                        <span className="text-[12px] sm:text-[14px]">
                            {tab === 'current' && 'Active'}
                            {tab === 'pending' && 'Pending'}
                            {tab === 'not_selling' && 'Inactive'}
                        </span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${activeMenuTab === tab ? 'bg-[#253b80] text-[#ffffff]' : 'bg-[#f1f5f9] text-[#475569]'}`}>
                            {menuItems.filter(m => m.status === tab).length}
                        </span>
                    </button>
                ))}
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto p-6 bg-[#f1f5f9]">
                {activeMenuTab === 'current' && (
                    <div className="flex flex-col h-full min-h-0">
                        <div className="mb-6 shrink-0">
                            <input 
                                type="text" 
                                placeholder="Search dishes..." 
                                value={menuSearchQuery}
                                onChange={(e) => setMenuSearchQuery(e.target.value)}
                                className="w-full max-w-md h-12 px-4 bg-[#ffffff] border border-[#2563eb] rounded-lg font-medium text-[#0f172a] outline-none focus:ring-1 focus:ring-[#2563eb]"
                            />
                        </div>
                        <div className="space-y-6 flex-1">
                            {searchedCategories.map(category => (
                                <div key={category} className="bg-[#ffffff] p-6 rounded-xl border border-[#e2e8f0]">
                                    <h4 className="text-[20px] font-bold text-[#0f172a] mb-4">{category}</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {searchedCurrentItems.filter(m => m.category === category).map(item => (
                                            <div key={item.id} className="p-4 border border-[#e2e8f0] rounded-xl flex flex-col justify-between">
                                                <div className="flex justify-between items-start mb-4">
                                                    <div>
                                                        <p className="font-bold text-[#0f172a] text-[16px] flex items-center gap-2">
                                                            <span className={`w-2 h-2 rounded-full shrink-0 ${item.isVeg ? 'bg-green-600' : 'bg-red-600'}`}></span>
                                                            {item.name}
                                                        </p>
                                                        <p className="text-[18px] font-bold text-[#0f172a] mt-1">₹{item.price}</p>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button onClick={() => handleMoveMenu(item.id, 'pending')} className="flex-1 py-2 bg-[#f1f5f9] text-[#0f172a] hover:bg-[#e2e8f0] rounded-full text-[12px] font-medium transition-colors">Make Pending</button>
                                                    <button onClick={() => handleMoveMenu(item.id, 'not_selling')} className="flex-1 py-2 bg-[#f1f5f9] text-[#0f172a] hover:bg-[#e2e8f0] rounded-full text-[12px] font-medium transition-colors">Stop Selling</button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeMenuTab === 'pending' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-1 bg-[#ffffff] p-6 rounded-xl border border-[#e2e8f0] h-fit">
                            <h4 className="text-[14px] font-bold text-[#0f172a] mb-4">Add Menu Item</h4>
                            <form onSubmit={handleAddNewMenuItem} className="space-y-4">
                                <input type="text" value={newItemName} onChange={e => setNewItemName(e.target.value)} required placeholder="Dish Name" className="w-full h-12 border border-[#e2e8f0] rounded-lg px-4 text-[14px] outline-none focus:border-[#2563eb]"/>
                                <div className="flex gap-4">
                                    <input type="number" value={newItemPrice} onChange={e => setNewItemPrice(e.target.value)} required placeholder="Price" className="w-full h-12 border border-[#e2e8f0] rounded-lg px-4 text-[14px] outline-none focus:border-[#2563eb]"/>
                                    <select value={newItemIsVeg ? 'veg' : 'nonveg'} onChange={e => setNewItemIsVeg(e.target.value === 'veg')} className="w-full h-12 border border-[#e2e8f0] rounded-lg px-4 text-[14px] outline-none focus:border-[#2563eb]">
                                        <option value="veg">Veg</option>
                                        <option value="nonveg">Non-Veg</option>
                                    </select>
                                </div>
                                <input type="text" list="categories" value={newItemCategory} onChange={e => setNewItemCategory(e.target.value)} required placeholder="Category" className="w-full h-12 border border-[#e2e8f0] rounded-lg px-4 text-[14px] outline-none focus:border-[#2563eb]"/>
                                <button type="submit" className="w-full h-12 bg-[#253b80] hover:bg-[#0093d5] text-[#ffffff] rounded-full font-bold text-[14px] mt-2 transition-colors">Add to Pending</button>
                            </form>
                        </div>
                        <div className="lg:col-span-2 space-y-4">
                            {pendingMenuItems.length === 0 ? (
                                <p className="text-[#94a3b8] text-[14px] font-medium py-10 text-center">No pending items.</p>
                            ) : (
                                pendingMenuItems.map(item => (
                                    <div key={item.id} className="bg-[#ffffff] p-4 border border-[#e2e8f0] rounded-xl flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                                        <div>
                                            <p className="font-bold text-[#0f172a] text-[16px]">{item.name}</p>
                                            <div className="flex items-center gap-3 mt-1">
                                                <p className="text-[14px] font-bold text-[#475569]">₹{item.price}</p>
                                                <p className="text-[12px] font-medium text-[#94a3b8] bg-[#f1f5f9] px-2 py-0.5 rounded-md">{item.category}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={() => handleMoveMenu(item.id, 'current')} className="px-4 py-2 bg-[#253b80] hover:bg-[#0093d5] transition-colors text-[#ffffff] rounded-full text-[12px] font-medium">Publish</button>
                                            <button onClick={() => handleMoveMenu(item.id, 'not_selling')} className="px-4 py-2 bg-[#f1f5f9] hover:bg-[#e2e8f0] transition-colors text-[#0f172a] rounded-full text-[12px] font-medium">Drop</button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}
                {activeMenuTab === 'not_selling' && (
                  <div className="space-y-4">
                    {notSellingMenuItems.length === 0 ? (
                        <p className="text-[#94a3b8] text-[14px] font-medium py-10 text-center">No inactive items.</p>
                    ) : (
                        notSellingMenuItems.map(item => (
                            <div key={item.id} className="bg-[#ffffff] p-4 border border-[#e2e8f0] rounded-xl flex flex-col sm:flex-row justify-between sm:items-center gap-4 opacity-75">
                                <div>
                                    <p className="font-bold text-[#475569] line-through text-[16px]">{item.name}</p>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => handleMoveMenu(item.id, 'current')} className="px-4 py-2 bg-[#253b80] hover:bg-[#0093d5] transition-colors text-[#ffffff] rounded-full text-[12px] font-medium">Republish</button>
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

      {/* --- STAFF MANAGEMENT MODAL --- */}
      {isStaffModalOpen && (
        <div className="fixed inset-0 bg-[#0f172a] bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-[#ffffff] rounded-2xl w-full max-w-4xl h-[90dvh] flex flex-col min-h-0 overflow-hidden shadow-2xl">
            
            {/* STANDARDIZED HEADER */}
            <div className="relative p-6 border-b border-[#e2e8f0] flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 bg-[#ffffff] shrink-0">
               <div className="pr-10 sm:pr-0">
                 <h3 className="text-[24px] font-bold text-[#0f172a] tracking-tight">Staff Management</h3>
               </div>
               <button onClick={() => setIsStaffModalOpen(false)} className="absolute top-6 right-6 sm:static shrink-0 w-10 h-10 bg-[#f1f5f9] rounded-full flex items-center justify-center text-[#0f172a] hover:bg-[#e2e8f0] transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
               </button>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-2 gap-8 bg-[#f1f5f9]">
               <div>
                 <h4 className="text-[14px] font-bold text-[#0f172a] mb-4">Active Directory</h4>
                 <div className="space-y-3">
                    {staffMembers.map(staff => (
                        <div key={staff.id} className="p-4 border border-[#e2e8f0] rounded-xl flex items-center justify-between bg-[#ffffff]">
                           <div>
                              <p className="font-bold text-[#0f172a] text-[16px]">{staff.name}</p>
                              <p className="text-[12px] text-[#475569] mt-1">ID: {staff.userId}</p>
                           </div>
                           <div className="flex gap-2">
                               <button onClick={() => toggleStaffAccess(staff.id)} className={`px-4 py-2 rounded-full text-[12px] font-medium ${staff.isActive ? 'bg-[#253b80] text-[#ffffff]' : 'bg-[#f1f5f9] text-[#475569]'}`}>
                                  {staff.isActive ? 'Active' : 'Revoked'}
                               </button>
                               <button onClick={() => deleteStaffMember(staff.id, staff.name)} className="w-8 h-8 rounded-full bg-[#f1f5f9] text-[#0f172a] hover:bg-[#e2e8f0] flex items-center justify-center">
                                   X
                               </button>
                           </div>
                        </div>
                    ))}
                 </div>
               </div>
               <div>
                 <div className="bg-[#ffffff] border border-[#e2e8f0] p-6 rounded-xl">
                    <h4 className="text-[14px] font-bold text-[#0f172a] mb-4">Create New Account</h4>
                    <form onSubmit={handleAddStaff} className="space-y-4">
                       <input type="text" value={newName} onChange={e => setNewName(e.target.value)} required placeholder="Full Name" className="w-full h-12 border border-[#e2e8f0] rounded-lg px-4 text-[14px] outline-none focus:border-[#2563eb]"/>
                       <input type="text" value={newUserId} onChange={e => setNewUserId(e.target.value)} required placeholder="User ID" className="w-full h-12 border border-[#e2e8f0] rounded-lg px-4 text-[14px] outline-none focus:border-[#2563eb]"/>
                       <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required placeholder="Password" className="w-full h-12 border border-[#e2e8f0] rounded-lg px-4 text-[14px] outline-none focus:border-[#2563eb]"/>
                       <button type="submit" className="w-full h-12 bg-[#253b80] hover:bg-[#0093d5] transition-colors text-[#ffffff] rounded-full font-bold text-[14px]">Add Staff Member</button>
                    </form>
                 </div>
               </div>
            </div>
          </div>
        </div>
      )}

      {/* --- TABLE ANALYTICS MODAL --- */}
      {isTableModalOpen && (
        <div className="fixed inset-0 bg-[#0f172a] bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-[#ffffff] rounded-2xl w-full max-w-6xl h-[90dvh] flex flex-col min-h-0 overflow-hidden shadow-2xl">
            
            {/* STANDARDIZED HEADER */}
            <div className="relative p-6 border-b border-[#e2e8f0] flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 bg-[#ffffff] shrink-0">
               <div className="pr-10 sm:pr-0">
                  <h3 className="text-[24px] font-bold text-[#0f172a] tracking-tight">Table Insights</h3>
               </div>
               <div className="flex gap-4 items-center">
                  <input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} max={todayYMD} className="w-full sm:w-auto h-10 px-4 border border-[#e2e8f0] focus:border-[#2563eb] rounded-lg text-[14px] font-medium outline-none"/>
               </div>
               <button onClick={() => setIsTableModalOpen(false)} className="absolute top-6 right-6 sm:static shrink-0 w-10 h-10 bg-[#f1f5f9] rounded-full flex items-center justify-center text-[#0f172a] hover:bg-[#e2e8f0] transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
               </button>
            </div>
            
            <div className="flex-1 min-h-0 overflow-y-auto p-6 bg-[#f1f5f9] pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {tableAnalytics.stats.map(stat => (
                      <div key={stat.tableId} className="bg-[#ffffff] rounded-xl p-6 border border-[#e2e8f0] flex flex-col">
                          <div className="flex justify-between items-start mb-6">
                              <h4 className="text-[20px] font-bold text-[#0f172a]">Table {stat.tableId}</h4>
                              <p className="text-[20px] font-bold text-[#0f172a]">{stat.totalItems} Items</p>
                          </div>
                          <div className="mb-6 space-y-2">
                              <div className="flex justify-between items-center">
                                  <p className="text-[12px] font-medium text-[#475569] uppercase">Collected</p>
                                  <p className="font-bold text-[16px] text-[#0f172a]">₹{stat.collectedRev}</p>
                              </div>
                              {filterDate === todayYMD && stat.liveRev > 0 && (
                                  <div className="flex justify-between items-center">
                                      <p className="text-[12px] font-medium text-[#475569] uppercase">Pending</p>
                                      <p className="font-bold text-[16px] text-[#0f172a]">₹{stat.liveRev}</p>
                                  </div>
                              )}
                          </div>
                          <div className="flex-1">
                              <p className="text-[12px] font-bold text-[#94a3b8] uppercase border-b border-[#e2e8f0] pb-2 mb-3">Itemized</p>
                              <div className="flex flex-wrap gap-2">
                                  {Object.entries(stat.itemsMap).map(([itemName, qty]) => (
                                      <div key={itemName} className="bg-[#f1f5f9] rounded px-2 py-1 flex items-center gap-2">
                                          <span className="text-[12px] font-medium text-[#0f172a]">{itemName}</span>
                                          <span className="text-[12px] font-bold text-[#475569]">x{qty}</span>
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
    </div>
  );
};

export default AdminDashboard;