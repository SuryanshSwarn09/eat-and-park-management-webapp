import React, { useState } from 'react';
import { StaffMember } from '../types';

interface AuthProps {
  onLogin: (role: 'owner' | 'staff') => void;
  staffMembers: StaffMember[];
}

const Auth: React.FC<AuthProps> = ({ onLogin, staffMembers }) => {
  const [role, setRole] = useState<'owner' | 'staff'>('staff');
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsProcessing(true);

    setTimeout(() => {
      if (role === 'owner' && userId === 'admin' && password === 'owner123') {
        onLogin('owner');
      } else if (role === 'staff') {
        // Validate against the dynamic staff list
        const validStaff = staffMembers.find(s => s.userId === userId && s.password === password);
        
        if (validStaff) {
          if (validStaff.isActive) {
            onLogin('staff');
          } else {
            setError('Access Denied. Your account has been disabled.');
            setPassword('');
            setIsProcessing(false);
          }
        } else {
          setError('Invalid User ID or Password. Please try again.');
          setPassword('');
          setIsProcessing(false);
        }
      } else {
        setError('Invalid User ID or Password. Please try again.');
        setPassword('');
        setIsProcessing(false);
      }
    }, 600);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 overflow-hidden relative">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange-500/10 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[120px]"></div>
      
      <div className="w-full max-w-md relative z-10 animate-fade-in">
        <div className="bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-slate-100 flex flex-col">
          <div className="p-10 pt-12 text-center shrink-0">
            <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-orange-600 rounded-3xl flex items-center justify-center font-black text-white text-4xl shadow-2xl shadow-orange-500/20 mx-auto mb-8 rotate-3">
              E
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Eat & Park</h1>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">System Authentication</p>
          </div>

          <form onSubmit={handleLogin} className="px-10 pb-12 flex-1 flex flex-col">
            <div className="flex bg-slate-100 p-1.5 rounded-2xl mb-8 shrink-0">
              <button
                type="button"
                onClick={() => { setRole('staff'); setError(''); }}
                className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${role === 'staff' ? 'bg-white text-slate-900 shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
              >
                Staff Access
              </button>
              <button
                type="button"
                onClick={() => { setRole('owner'); setError(''); }}
                className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${role === 'owner' ? 'bg-white text-slate-900 shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
              >
                Owner Portal
              </button>
            </div>

            <div className="space-y-4 mb-8 flex-1">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">User ID</label>
                <input
                  type="text"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  placeholder={role === 'owner' ? "Enter Owner ID" : "Enter Staff ID"}
                  required
                  disabled={isProcessing}
                  className="w-full h-14 bg-slate-50 border border-slate-200 rounded-2xl px-5 font-bold text-slate-900 outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  disabled={isProcessing}
                  className="w-full h-14 bg-slate-50 border border-slate-200 rounded-2xl px-5 font-bold text-slate-900 outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all disabled:opacity-50"
                />
              </div>

              <div className="h-6 flex items-center justify-center">
                {error && <p className="text-rose-500 text-[10px] font-black uppercase tracking-wider animate-shake text-center">{error}</p>}
              </div>
            </div>

            <button
              type="submit"
              disabled={isProcessing || !userId || !password}
              className="w-full h-16 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white rounded-2xl font-black shadow-xl shadow-slate-900/10 transition-all active:scale-95 flex items-center justify-center gap-3 mt-auto shrink-0"
            >
              {isProcessing ? (
                 <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              ) : (
                <>
                  <span>Sign In</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Auth;