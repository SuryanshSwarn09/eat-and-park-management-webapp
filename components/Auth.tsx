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
        const validStaff = staffMembers.find(s => s.userId === userId && s.password === password);
        if (validStaff) {
          if (validStaff.isActive) onLogin('staff');
          else setError('Access Denied. Account disabled by administrator.');
        } else setError('Invalid credentials. Please try again.');
      } else {
        setError('Invalid credentials. Please try again.');
      }
      if (!isProcessing) setPassword('');
      setIsProcessing(false);
    }, 600);
  };

  return (
    <div className="min-h-[100dvh] bg-[#ffffff] flex flex-col items-center justify-center p-6 font-sans">
      <div className="w-full max-w-sm">
        
        <div className="mb-10 text-center">
          <h1 className="text-[32px] font-bold text-[#0f172a] tracking-tight leading-tight">Eat & Park</h1>
          <p className="text-[#475569] text-[16px] font-medium mt-2">Sign in to your terminal</p>
        </div>

        <div className="flex gap-2 mb-8 bg-[#ffffff]">
          <button
            type="button"
            onClick={() => { setRole('staff'); setError(''); }}
            className={`flex-1 py-3 px-4 text-[16px] font-medium rounded-full transition-colors ${
              role === 'staff' ? 'bg-[#253b80] text-[#ffffff]' : 'bg-[#f1f5f9] text-[#0f172a] hover:bg-[#e2e8f0]'
            }`}
          >
            Staff
          </button>
          <button
            type="button"
            onClick={() => { setRole('owner'); setError(''); }}
            className={`flex-1 py-3 px-4 text-[16px] font-medium rounded-full transition-colors ${
              role === 'owner' ? 'bg-[#253b80] text-[#ffffff]' : 'bg-[#f1f5f9] text-[#0f172a] hover:bg-[#e2e8f0]'
            }`}
          >
            Admin
          </button>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-4">
            <div>
              <input
                type="text"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder={role === 'owner' ? "Admin ID" : "Staff ID"}
                required
                disabled={isProcessing}
                className="w-full h-14 bg-[#ffffff] border border-[#cbd5e1] rounded-lg px-4 text-[16px] text-[#0f172a] placeholder-[#94a3b8] focus:outline-none focus:ring-1 focus:ring-[#2563eb] transition-shadow disabled:opacity-50"
              />
            </div>

            <div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
                disabled={isProcessing}
                className="w-full h-14 bg-[#ffffff] border border-[#cbd5e1] rounded-lg px-4 text-[16px] text-[#0f172a] placeholder-[#94a3b8] focus:outline-none focus:ring-1 focus:ring-[#2563eb] transition-shadow disabled:opacity-50"
              />
            </div>

            {error && <p className="text-[#0f172a] text-[14px] font-medium bg-[#f1f5f9] p-3 rounded-lg border border-[#e2e8f0]">{error}</p>}
          </div>

          <button
            type="submit"
            disabled={isProcessing || !userId || !password}
            className="w-full h-14 bg-[#253b80] hover:bg-[#0093d5] disabled:opacity-50 text-[#ffffff] rounded-full font-bold text-[16px] transition-colors flex items-center justify-center"
          >
            {isProcessing ? "Verifying..." : "Continue"}
          </button>
        </form>

        <p className="text-center text-[12px] text-[#94a3b8] mt-10">
          Secure terminal access for authorized personnel only.
        </p>
      </div>
    </div>
  );
};

export default Auth;