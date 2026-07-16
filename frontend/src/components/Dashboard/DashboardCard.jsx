import React from 'react';

const DashboardCard = ({ title, value, icon: Icon, variant = 'primary' }) => {
  const isFilled = variant === 'primary' || variant === 'tertiary';
  const formattedValue = value.toString().replace('$', '₹');

  return (
    <div
      className={`rounded-[20px] p-[20px] h-[100px] w-full relative flex flex-col justify-between ${
        isFilled ? 'text-white' : 'border border-[#EFEBE8] text-[#1B1B1F]'
      }`}
      style={{ background: isFilled ? '#B3122A' : '#FFFFFF' }}
    >
      <p className="text-[14px] font-medium" style={{ opacity: isFilled ? 0.9 : 1, color: isFilled ? '#fff' : '#6B6B70' }}>
        {title}
      </p>
      {Icon && (
        <div className="absolute top-[18px] right-[18px]" style={{ color: isFilled ? 'rgba(255,255,255,0.9)' : '#B3122A' }}>
          <Icon size={20} strokeWidth={2} />
        </div>
      )}
      <p className="font-display text-[30px] font-extrabold leading-none">{formattedValue}</p>
    </div>
  );
};

export default DashboardCard;
