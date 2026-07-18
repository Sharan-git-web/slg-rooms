import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home as HomeIcon, CirclePlus, History, Wallet, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Sidebar = () => {
  const { logout } = useAuth();

  const tabs = [
    { id: 'home', label: 'Home', Icon: HomeIcon, path: '/' },
    { id: 'new-entry', label: 'New Entry', Icon: CirclePlus, path: '/new-entry' },
    { id: 'records', label: 'Records', Icon: History, path: '/records' },
    { id: 'revenue', label: 'Revenue', Icon: Wallet, path: '/revenue' },
  ];

  return (
    <aside className="hidden md:flex md:flex-col fixed left-0 top-0 h-screen w-[240px] bg-white border-r border-[#EFEBE8] z-50">
      <div className="h-[72px] flex items-center px-6 border-b border-[#EFEBE8] shrink-0">
        <h1 className="font-display text-[21px] font-extrabold tracking-[-0.8px] text-[#1B1B1F] leading-none">SLG Rooms</h1>
      </div>

      <nav className="flex-1 flex flex-col gap-1 p-4">
        {tabs.map(({ id, label, Icon, path }) => (
          <NavLink key={id} to={path} end={path === '/'}>
            {({ isActive }) => (
              <div
                className="flex items-center gap-3 px-4 h-[46px] rounded-[12px] font-bold text-[14.5px] transition-colors"
                style={{ background: isActive ? '#FDEBEC' : 'transparent', color: isActive ? '#B3122A' : '#6B6B70' }}
              >
                <Icon size={19} strokeWidth={2.2} />
                {label}
              </div>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-[#EFEBE8] shrink-0">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 h-[46px] rounded-[12px] font-bold text-[14.5px] text-[#6B6B70] hover:bg-[#FAF9F7] transition-colors"
        >
          <LogOut size={19} strokeWidth={2.2} />
          Sign Out
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
