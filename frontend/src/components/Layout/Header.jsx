import React from 'react';
import { LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Header = () => {
  const { isAuthenticated, logout } = useAuth();

  return (
    <header className="md:hidden fixed top-0 w-full z-50 bg-white h-[72px] flex items-center justify-between px-[22px] border-b border-[#EFEBE8]">
      <h1 className="font-display text-[25px] font-extrabold tracking-[-0.8px] text-[#1B1B1F] leading-none">SLG Rooms</h1>
      {isAuthenticated && (
        <button
          onClick={logout}
          className="text-[#B3122A] flex items-center justify-center w-[34px] h-[34px] rounded-[10px] active:scale-95 transition-transform"
          aria-label="Sign out"
        >
          <LogOut size={20} strokeWidth={2} />
        </button>
      )}
    </header>
  );
};

export default Header;
