import React from 'react';

const Input = ({ 
  label, 
  name, 
  value, 
  onChange, 
  placeholder = '', 
  type = 'text', 
  required = false,
  prefix = null,
  tracking = false
}) => {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-[13px] font-medium text-[#6B7280] ml-1">
        {label}
      </label>
      <div className="h-[56px] bg-[#FFFFFF] rounded-[12px] px-4 flex items-center border border-[#E5E7EB] focus-within:border-[#0F766E] focus-within:ring-1 focus-within:ring-[#0F766E] transition-colors shadow-sm">
        {prefix && <span className="text-[15px] font-normal text-[#6B7280] mr-2">{prefix}</span>}
        <input 
          name={name}
          value={value}
          onChange={onChange}
          className={`bg-transparent border-none w-full h-full text-[15px] font-normal text-[#111827] focus:ring-0 p-0 placeholder:text-[#9CA3AF] caret-[#0F766E] ${tracking ? 'tracking-widest' : ''}`}
          placeholder={placeholder}
          type={type}
          required={required}
        />
      </div>
    </div>
  );
};

export default Input;
