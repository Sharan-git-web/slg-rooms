import React from 'react';
import { useAuth } from '../../context/AuthContext';

const Header = () => {
  const { isAuthenticated, logout } = useAuth();

  return (
    <header className="fixed top-0 w-full z-50 bg-white h-[72px] flex items-center px-[24px] shadow-[0_2px_10px_rgba(15,118,110,0.08)] rounded-none border-b border-[#E5E7EB]">
      <h1 className="text-[34px] font-[800] tracking-[-0.5px] text-[#1F2937] leading-none w-full flex items-center" style={{ fontFamily: 'Roboto, sans-serif' }}>SLG Rooms</h1>
      {isAuthenticated && (
        <button
          onClick={logout}
          className="text-[#6B7280] flex items-center shrink-0 active:scale-95 transition-transform"
          aria-label="Sign out"
        >
          <span className="material-symbols-outlined text-[24px]" data-icon="logout">logout</span>
        </button>
      )}
    </header>
  );
};

export default Header;
