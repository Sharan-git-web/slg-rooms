import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home as HomeIcon, CirclePlus, History, Wallet } from 'lucide-react';

const BottomNav = () => {
  const tabs = [
    { id: 'home', label: 'Home', Icon: HomeIcon, path: '/' },
    { id: 'new-entry', label: 'New Entry', Icon: CirclePlus, path: '/new-entry' },
    { id: 'records', label: 'Records', Icon: History, path: '/records' },
    { id: 'revenue', label: 'Revenue', Icon: Wallet, path: '/revenue' },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 w-full z-50 bg-white border-t border-[#EFEBE8] flex px-2 pt-2.5 pb-3.5 pb-safe">
      {tabs.map(({ id, label, Icon, path }) => (
        <NavLink
          key={id}
          to={path}
          end={path === '/'}
          className="flex-1 flex flex-col items-center gap-1"
        >
          {({ isActive }) => (
            <>
              <div
                className="flex items-center justify-center w-[44px] h-[30px] rounded-full transition-colors"
                style={{ background: isActive ? '#FDEBEC' : 'transparent', color: isActive ? '#B3122A' : '#8A8A8E' }}
              >
                <Icon size={21} strokeWidth={2.2} />
              </div>
              <span className="text-[11.5px] font-bold" style={{ color: isActive ? '#B3122A' : '#8A8A8E' }}>
                {label}
              </span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
};

export default BottomNav;
