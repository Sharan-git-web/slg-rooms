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
      <label className="text-[13px] font-medium text-[#6B6B70] ml-1">
        {label}
      </label>
      <div className="h-[56px] bg-[#FFFFFF] rounded-[14px] px-4 flex items-center border border-[#EFEBE8] focus-within:border-[#B3122A] focus-within:ring-1 focus-within:ring-[#B3122A] transition-colors">
        {prefix && <span className="text-[15px] font-normal text-[#6B6B70] mr-2">{prefix}</span>}
        <input
          name={name}
          value={value}
          onChange={onChange}
          className={`bg-transparent border-none w-full h-full text-[15px] font-normal text-[#1B1B1F] focus:ring-0 p-0 placeholder:text-[#B0ACA8] caret-[#B3122A] ${tracking ? 'tracking-widest' : ''}`}
          placeholder={placeholder}
          type={type}
          required={required}
        />
      </div>
    </div>
  );
};

export default Input;
