import React from 'react';

const DashboardCard = ({ title, value, icon, variant = 'primary' }) => {
  const variants = {
    primary: 'bg-[#0F766E] text-white',
    secondary: 'bg-[#FFFFFF] border border-[#E5E7EB] text-[#1F2937]',
    tertiary: 'bg-[#0F766E] text-white',
    surface: 'bg-[#FFFFFF] border border-[#E5E7EB] text-[#1F2937]',
  };

  const formattedValue = value.toString().replace('$', '₹');

  return (
    <div className={`rounded-[20px] p-[16px] flex flex-col justify-center shadow-[0_4px_12px_rgba(0,0,0,0.08)] h-[84px] w-full ${variants[variant]}`}>
      <div className="flex justify-between items-center mb-1">
        <p className="text-[12px] font-medium opacity-90 leading-tight" style={{ fontFamily: 'Roboto, sans-serif' }}>{title}</p>
        <span className="material-symbols-outlined text-[20px] opacity-80">{icon}</span>
      </div>
      <div className="mt-0.5">
        <p className="text-[32px] font-bold leading-none tracking-tight" style={{ fontFamily: 'Roboto, sans-serif' }}>{formattedValue}</p>
      </div>
    </div>
  );
};

export default DashboardCard;
