import React from 'react';

const DashboardCard = ({ title, value, icon: Icon, variant = 'surface' }) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          bg: '#FDEBEC',
          iconColor: '#B3122A',
          iconBg: 'rgba(179, 18, 42, 0.12)'
        };
      case 'tertiary':
        return {
          bg: '#E8F6EC',
          iconColor: '#16A34A',
          iconBg: 'rgba(22, 163, 74, 0.12)'
        };
      default:
        return {
          bg: '#FFFFFF',
          iconColor: '#1B1B1F',
          iconBg: '#FAF9F7'
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <div className="bg-white rounded-[18px] border border-[#EFEBE8] p-4 flex flex-col justify-between gap-3 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
      <div className="flex items-center justify-between">
        <span className="text-[13px] font-medium text-[#6B6B70] leading-tight">
          {title}
        </span>
        {Icon && (
          <div
            className="w-8 h-8 rounded-[10px] flex items-center justify-center shrink-0"
            style={{ background: styles.iconBg, color: styles.iconColor }}
          >
            <Icon size={16} strokeWidth={2.2} />
          </div>
        )}
      </div>
      <div>
        <h4 className="font-display text-[22px] font-extrabold text-[#1B1B1F] leading-none">
          {value}
        </h4>
      </div>
    </div>
  );
};

export default React.memo(DashboardCard);
