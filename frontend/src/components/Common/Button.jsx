import React from 'react';

const Button = ({
  children,
  variant = 'primary', // 'primary', 'secondary', 'tertiary', 'transparent'
  type = 'button',
  onClick,
  disabled = false,
  icon: Icon = null,
  iconSpin = false,
  fullWidth = true
}) => {
  const baseClasses = `h-touch-target-min rounded-full text-[15px] font-bold active:scale-95 transition-transform flex items-center justify-center gap-2 ${fullWidth ? 'w-full' : 'px-6'}`;

  const variants = {
    primary: 'text-white',
    secondary: 'bg-white text-[#1B1B1F] border border-[#D8D3CE]',
    tertiary: 'bg-white text-[#1B1B1F] border border-[#D8D3CE]',
    transparent: 'bg-transparent text-[#8A8A8E]',
    danger: 'text-white',
    outlined: 'bg-white text-[#1B1B1F] border border-[#D8D3CE]',
    filled: 'text-white'
  };

  const filledBg = (variant === 'primary' || variant === 'filled') ? '#B3122A' : variant === 'danger' ? '#DC2626' : undefined;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={filledBg ? { background: filledBg } : undefined}
      className={`${baseClasses} ${variants[variant]} ${disabled ? 'opacity-80' : ''}`}
    >
      {Icon && <Icon size={18} className={iconSpin ? 'animate-spin' : ''} />}
      {children}
    </button>
  );
};

export default Button;
