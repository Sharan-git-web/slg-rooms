import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, CirclePlus, History, Wallet } from 'lucide-react';

const BottomNav = () => {
  const navItems = [
    { id: 'home', label: 'Home', Icon: Home, path: '/' },
    { id: 'new-entry', label: 'New Entry', Icon: CirclePlus, path: '/new-entry' },
    { id: 'records', label: 'Records', Icon: History, path: '/records' },
    { id: 'revenue', label: 'Revenue', Icon: Wallet, path: '/revenue' },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-[68px] bg-white border-t border-[#EFEBE8] flex items-center justify-around z-40 px-2">
      {navItems.map(({ id, label, Icon, path }) => (
        <NavLink
          key={id}
          to={path}
          end={path === '/'}
          className={({ isActive }) =>
            `flex flex-col items-center justify-center gap-1 flex-1 py-1 transition-colors ${
              isActive ? 'text-[#B3122A]' : 'text-[#8A8A8E]'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              <span className={`text-[11px] font-bold ${isActive ? 'text-[#B3122A]' : 'text-[#8A8A8E]'}`}>
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
