import React from 'react';
import { LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Header = () => {
  const { logout } = useAuth();

  return (
    <header className="md:hidden fixed top-0 left-0 right-0 h-[64px] bg-white border-b border-[#EFEBE8] flex items-center justify-between px-4 z-40">
      <div className="flex items-center gap-2">
        <h1 className="font-display text-[20px] font-extrabold tracking-[-0.5px] text-[#1B1B1F]">
          SLG Rooms
        </h1>
      </div>
      <button
        onClick={logout}
        className="w-9 h-9 rounded-full flex items-center justify-center text-[#6B6B70] hover:text-[#B3122A] hover:bg-[#FDEBEC] transition-colors"
        title="Sign Out"
      >
        <LogOut size={18} />
      </button>
    </header>
  );
};

export default Header;
