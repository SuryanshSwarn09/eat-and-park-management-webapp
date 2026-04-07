
import React from 'react';

interface SidebarProps {
  currentView: string;
  isOwner: boolean;
  onToggleOwner: () => void;
  onNavigate: (view: 'dashboard' | 'order' | 'billing' | 'checkout-map' | 'sales-history') => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, isOwner, onToggleOwner, onNavigate }) => {
  return (
    <aside className="w-72 bg-slate-900 text-white flex flex-col shadow-2xl z-50">
      <div className="p-8 border-b border-slate-800/50">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl flex items-center justify-center font-black text-2xl shadow-lg shadow-orange-900/20 rotate-3">
            E
          </div>
          <div>
            <span className="block font-black text-xl tracking-tight leading-none">EAT&PARK</span>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em]">Management</span>
          </div>
        </div>
      </div>
      
      <nav className="flex-1 py-8 px-5 space-y-1.5 overflow-y-auto">
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
          Current Task
        </div>

        <button 
          disabled={currentView === 'dashboard' || currentView === 'checkout-map' || currentView === 'sales-history'}
          className={`w-full flex items-center space-x-4 px-5 py-4 rounded-2xl transition-all ${
            currentView === 'order' 
              ? 'bg-white/10 text-white border border-white/5 opacity-100' 
              : 'text-slate-600 opacity-50'
          }`}
        >
          <svg className={`w-5 h-5 ${currentView === 'order' ? 'text-orange-400' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
          <span className="font-bold">Active Ordering</span>
        </button>

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

        <div className="pt-8 pb-4 px-5 text-[11px] font-black text-slate-600 uppercase tracking-[0.2em]">
          Analytics
        </div>

        <button 
          onClick={() => onNavigate('sales-history')}
          className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl transition-all group ${
            currentView === 'sales-history' 
              ? 'bg-white/10 text-white shadow-inner border border-white/5' 
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <div className="flex items-center space-x-4">
            <svg className={`w-5 h-5 transition-transform group-hover:scale-110 ${currentView === 'sales-history' ? 'text-orange-400' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 17v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2m32 4v-2a4 4 0 00-4-4h-5a4 4 0 00-4 4v2m-9-10a4 4 0 11-8 0 4 4 0 018 0zM10 7a3 3 0 11-6 0 3 3 0 016 0zm12 7a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <span className="font-bold">Sales History</span>
          </div>
          {currentView === 'sales-history' && <div className="w-1.5 h-1.5 rounded-full bg-orange-400 shadow-[0_0_8px_rgba(251,146,60,0.8)]"></div>}
        </button>
      </nav>

      <div className="p-6 mt-auto">
        <div className="bg-slate-800/50 rounded-[2rem] p-6 border border-white/5">
          <div className="flex items-center justify-between mb-4">
            <div>
               <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-0.5">Role</p>
               <p className="text-sm font-black text-white">{isOwner ? 'Owner' : 'Staff'}</p>
            </div>
            <button 
              onClick={onToggleOwner}
              className={`w-12 h-6 rounded-full relative transition-colors duration-300 focus:outline-none ${isOwner ? 'bg-orange-500' : 'bg-slate-600'}`}
            >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 ${isOwner ? 'left-7' : 'left-1'}`}></div>
            </button>
          </div>
          <div className="w-full h-1 bg-slate-700 rounded-full overflow-hidden">
             <div className="h-full bg-orange-500 w-1/3"></div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
