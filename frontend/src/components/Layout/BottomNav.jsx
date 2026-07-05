import React from 'react';
import { NavLink } from 'react-router-dom';

const BottomNav = () => {
  const tabs = [
    { id: 'home', label: 'Home', icon: 'home', path: '/' },
    { id: 'new-entry', label: 'New Entry', icon: 'add_circle', path: '/new-entry' },
    { id: 'records', label: 'Records', icon: 'history', path: '/records' },
    { id: 'revenue', label: 'Revenue', icon: 'payments', path: '/revenue' },
  ];

  return (
    <nav className="fixed bottom-0 w-full z-50 bg-white border-t border-[#E5E7EB] h-[64px] flex justify-around items-center px-2 pb-safe" style={{ fontFamily: 'Roboto, sans-serif' }}>
      {tabs.map((tab) => (
        <NavLink
          key={tab.id}
          to={tab.path}
          className={({ isActive }) =>
            `flex flex-col items-center justify-center w-[64px] h-full ${isActive ? 'text-[#0F766E]' : 'text-[#6B7280]'}`
          }
        >
          {({ isActive }) => (
            <>
              <div className={`flex items-center justify-center w-[40px] h-[24px] rounded-full mb-1 transition-colors ${isActive ? 'bg-[#CCFBF1]' : 'bg-transparent'}`}>
                <span className="material-symbols-outlined text-[20px]" style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}} data-icon={tab.icon}>{tab.icon}</span>
              </div>
              <span className="text-[11px] font-medium leading-none tracking-wide">{tab.label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
};

export default BottomNav;
