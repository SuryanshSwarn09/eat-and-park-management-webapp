import React from 'react';

interface SidebarProps {
  currentView: string;
  isOwner: boolean;
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
  onNavigate: (view: 'dashboard' | 'order' | 'billing' | 'checkout-map' | 'bill-registry' | 'admin-dashboard') => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, isOwner, isOpen, onClose, onLogout, onNavigate }) => {
  return (
    <>
      <div 
        className={`fixed inset-0 bg-[#000000] bg-opacity-40 z-40 lg:hidden transition-opacity duration-200 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      ></div>

      {/* FIX 1: h-[100dvh] instead of h-screen */}
      <aside className={`fixed lg:sticky top-0 left-0 h-[100dvh] w-[280px] bg-[#ffffff] text-[#000000] flex flex-col z-50 transition-transform duration-200 transform ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} border-r border-[#e2e2e2]`}>
        
        <div className="h-20 flex items-center justify-between px-6 shrink-0">
          <span className="font-bold text-[24px] tracking-tight text-[#000000]">Eat & Park</span>
          <button onClick={onClose} className="lg:hidden p-2 text-[#000000] rounded-full hover:bg-[#efefef]">
             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        
        {/* FIX 2: min-h-0 added to the flex-1 scrolling nav to prevent it from pushing the footer off screen */}
        <nav className="flex-1 min-h-0 py-4 px-4 space-y-1 overflow-y-auto">
          <button onClick={() => onNavigate('dashboard')} className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-full transition-colors text-[16px] font-medium ${currentView === 'dashboard' ? 'bg-[#000000] text-[#ffffff]' : 'text-[#4b4b4b] hover:bg-[#efefef] hover:text-[#000000]'}`}>
            Floor Plan
          </button>

          <div className="pt-6 pb-2 px-5 text-[12px] font-bold text-[#afafaf] uppercase tracking-wide">Operations</div>
          <button disabled={currentView !== 'order'} className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-full text-[16px] font-medium ${currentView === 'order' ? 'bg-[#000000] text-[#ffffff]' : 'text-[#afafaf] cursor-not-allowed'}`}>
            Active Order
          </button>

          <button onClick={() => onNavigate('checkout-map')} className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-full transition-colors text-[16px] font-medium ${currentView === 'checkout-map' || currentView === 'billing' ? 'bg-[#000000] text-[#ffffff]' : 'text-[#4b4b4b] hover:bg-[#efefef] hover:text-[#000000]'}`}>
            Checkout
          </button>

          <button onClick={() => onNavigate('bill-registry')} className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-full transition-colors text-[16px] font-medium ${currentView === 'bill-registry' ? 'bg-[#000000] text-[#ffffff]' : 'text-[#4b4b4b] hover:bg-[#efefef] hover:text-[#000000]'}`}>
            Registry
          </button>

          {isOwner && (
            <>
              <div className="pt-6 pb-2 px-5 text-[12px] font-bold text-[#afafaf] uppercase tracking-wide">Management</div>
              <button onClick={() => onNavigate('admin-dashboard')} className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-full transition-colors text-[16px] font-medium ${currentView === 'admin-dashboard' ? 'bg-[#000000] text-[#ffffff]' : 'text-[#4b4b4b] hover:bg-[#efefef] hover:text-[#000000]'}`}>
                Admin Portal
              </button>
            </>
          )}
        </nav>

        {/* FIX 3: Replaced standard padding with safe-area padding at the bottom for iOS home bars */}
        <div className="p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] bg-[#000000] text-[#ffffff] shrink-0">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-[#ffffff] flex items-center justify-center text-[14px] font-bold text-[#000000]">
              {isOwner ? 'AD' : 'ST'}
            </div>
            <div>
              <p className="text-[16px] font-bold leading-tight">{isOwner ? 'Admin' : 'Staff'}</p>
              <p className="text-[14px] text-[#afafaf]">Active Session</p>
            </div>
          </div>
          <button onClick={onLogout} className="w-full flex items-center justify-center py-3 bg-[#ffffff] text-[#000000] hover:bg-[#e2e2e2] rounded-full font-bold text-[16px] transition-colors">
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;