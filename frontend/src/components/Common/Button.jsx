import React from 'react';

const Button = ({ 
  children, 
  variant = 'primary', // 'primary', 'secondary', 'tertiary', 'transparent'
  type = 'button',
  onClick,
  disabled = false,
  icon = null,
  fullWidth = true
}) => {
  const baseClasses = `h-touch-target-min rounded-full text-[15px] font-semibold tracking-[0.2px] active:scale-95 transition-transform flex items-center justify-center gap-2 ${fullWidth ? 'w-full' : 'px-6'}`;
  
  const variants = {
    primary: 'bg-[#0F766E] hover:bg-[#0D9488] text-white shadow-sm',
    secondary: 'bg-[#FFFFFF] text-[#1F2937] border border-[#D1D5DB]',
    tertiary: 'bg-[#FFFFFF] text-[#1F2937] border border-[#D1D5DB]',
    transparent: 'bg-transparent text-[#6B7280]',
    danger: 'bg-[#DC2626] text-white shadow-sm',
    outlined: 'bg-[#FFFFFF] text-[#1F2937] border border-[#D1D5DB]',
    filled: 'bg-[#0F766E] hover:bg-[#0D9488] text-white shadow-sm'
  };

  return (
    <button 
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variants[variant]} ${disabled ? 'opacity-80' : ''}`}
    >
      {icon && <span className={`material-symbols-outlined ${disabled && icon === 'progress_activity' ? 'animate-spin' : ''}`} data-icon={icon}>{icon}</span>}
      {children}
    </button>
  );
};

export default Button;
