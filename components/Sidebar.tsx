import React from 'react';

interface SidebarProps {
  currentView: string;
  isOwner: boolean;
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
  // Added admin-dashboard to the valid views
  onNavigate: (view: 'dashboard' | 'order' | 'billing' | 'checkout-map' | 'bill-registry' | 'admin-dashboard') => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, isOwner, isOpen, onClose, onLogout, onNavigate }) => {
  return (
    <>
      {/* Backdrop for mobile */}
      <div 
        className={`fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      ></div>

      <aside className={`fixed lg:sticky top-0 left-0 h-screen w-72 bg-slate-900 text-white flex flex-col shadow-2xl z-50 transition-transform duration-300 transform ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-8 border-b border-slate-800/50 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl flex items-center justify-center font-black text-2xl shadow-lg shadow-orange-900/20 rotate-3">
              E
            </div>
            <div>
              <span className="block font-black text-xl tracking-tight leading-none">EAT&PARK</span>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em]">Management</span>
            </div>
          </div>
          <button onClick={onClose} className="lg:hidden p-2 hover:bg-white/10 rounded-lg">
             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
             </svg>
          </button>
        </div>
        
        <nav className="flex-1 py-8 px-5 space-y-1.5 overflow-y-auto no-scrollbar">
          <button 
            onClick={() => onNavigate('dashboard')}
            className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl transition-all group ${
              currentView === 'dashboard' 
                ? 'bg-white/10 text-white shadow-inner border border-white/5' 
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <div className="flex items-center space-x-4">
              <svg className={`w-5 h-5 transition-transform group-hover:scale-110 ${currentView === 'dashboard' ? 'text-orange-400' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              <span className="font-bold">Table Map</span>
            </div>
            {currentView === 'dashboard' && <div className="w-1.5 h-1.5 rounded-full bg-orange-400 shadow-[0_0_8px_rgba(251,146,60,0.8)]"></div>}
          </button>

          <div className="pt-8 pb-4 px-5 text-[11px] font-black text-slate-600 uppercase tracking-[0.2em]">
            Operations
          </div>

          <button 
            disabled={currentView !== 'order'}
            className={`w-full flex items-center space-x-4 px-5 py-4 rounded-2xl transition-all ${
              currentView === 'order' 
                ? 'bg-white/10 text-white border border-white/5 opacity-100' 
                : 'text-slate-600 opacity-50'
            }`}
          >
            <svg className={`w-5 h-5 ${currentView === 'order' ? 'text-orange-400' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <span className="font-bold">Active Ordering</span>
          </button>

          <div className="pt-8 pb-4 px-5 text-[11px] font-black text-slate-600 uppercase tracking-[0.2em]">
            Cashier
          </div>

          <button 
            onClick={() => onNavigate('checkout-map')}
            className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl transition-all group ${
              currentView === 'checkout-map' || currentView === 'billing'
                ? 'bg-white/10 text-white shadow-inner border border-white/5' 
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <div className="flex items-center space-x-4">
              <svg className={`w-5 h-5 transition-transform group-hover:scale-110 ${currentView === 'checkout-map' || currentView === 'billing' ? 'text-orange-400' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span className="font-bold">Final Checkout</span>
            </div>
            {(currentView === 'checkout-map' || currentView === 'billing') && <div className="w-1.5 h-1.5 rounded-full bg-orange-400 shadow-[0_0_8px_rgba(251,146,60,0.8)]"></div>}
          </button>

          <button 
            onClick={() => onNavigate('bill-registry')}
            className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl transition-all group ${
              currentView === 'bill-registry' 
                ? 'bg-white/10 text-white shadow-inner border border-white/5' 
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <div className="flex items-center space-x-4">
              <svg className={`w-5 h-5 transition-transform group-hover:scale-110 ${currentView === 'bill-registry' ? 'text-orange-400' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <span className="font-bold">Bill Registry</span>
            </div>
            {currentView === 'bill-registry' && <div className="w-1.5 h-1.5 rounded-full bg-orange-400 shadow-[0_0_8px_rgba(251,146,60,0.8)]"></div>}
          </button>

          {/* New Owner-Only Navigation Item */}
          {isOwner && (
            <>
              <div className="pt-8 pb-4 px-5 text-[11px] font-black text-slate-600 uppercase tracking-[0.2em]">
                Management
              </div>
              <button 
                onClick={() => onNavigate('admin-dashboard')}
                className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl transition-all group ${
                  currentView === 'admin-dashboard' 
                    ? 'bg-white/10 text-white shadow-inner border border-white/5' 
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <div className="flex items-center space-x-4">
                  <svg className={`w-5 h-5 transition-transform group-hover:scale-110 ${currentView === 'admin-dashboard' ? 'text-orange-400' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="font-bold">Admin Portal</span>
                </div>
                {currentView === 'admin-dashboard' && <div className="w-1.5 h-1.5 rounded-full bg-orange-400 shadow-[0_0_8px_rgba(251,146,60,0.8)]"></div>}
              </button>
            </>
          )}
        </nav>

        <div className="p-6 mt-auto">
          <div className="bg-slate-800/50 rounded-2xl p-4 mb-4 border border-white/5">
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">User Role</p>
            <p className="text-sm font-black text-white">{isOwner ? 'Restaurant Owner' : 'Server Staff'}</p>
          </div>
          <button 
            onClick={onLogout}
            className="w-full bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white border border-rose-500/20 rounded-2xl py-4 font-black transition-all flex items-center justify-center gap-3 active:scale-95"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;