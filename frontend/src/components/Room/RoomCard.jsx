import React from 'react';

const RoomCard = ({ number, type, status, checkIn, checkOut, members, isReady, showAssign, onCheckIn }) => {
  const getBorderColor = () => {
    switch (status.toLowerCase()) {
      case 'available':
        return 'border-[#22C55E]';
      case 'occupied':
        return 'border-[#DC2626]';
      default:
        return 'border-[#E5E7EB]';
    }
  };

  const getNumberBg = () => {
    switch (status.toLowerCase()) {
      case 'available':
        return 'bg-[#DCFCE7] text-[#166534]';
      case 'occupied':
        return 'bg-[#FEE2E2] text-[#991B1B]';
      default:
        return 'bg-[#F8FAFC] text-[#6B7280]';
    }
  };
  
  const getStatusBadgeStyles = () => {
    switch (status.toLowerCase()) {
      case 'available':
        return 'bg-[#DCFCE7] text-[#166534]';
      case 'occupied':
        return 'bg-[#FEE2E2] text-[#991B1B]';
      case 'checkout soon':
        return 'bg-[#FEF3C7] text-[#92400E]';
      default:
        return 'bg-[#F8FAFC] text-[#6B7280]';
    }
  };

  const getStatusDotColor = () => {
    switch (status.toLowerCase()) {
      case 'available': return 'bg-[#166534]';
      case 'occupied': return 'bg-[#991B1B]';
      case 'checkout soon': return 'bg-[#92400E]';
      default: return 'bg-[#6B7280]';
    }
  };

  return (
    <div className={`bg-[#FFFFFF] rounded-[20px] p-[20px] border-l-[4px] shadow-[0_4px_12px_rgba(0,0,0,0.08)] flex flex-col gap-[18px] relative overflow-hidden ${getBorderColor()} border-t border-r border-b border-[#E5E7EB] border-t-[1px] border-r-[1px] border-b-[1px]`}>
      {/* Top Section */}
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-3">
          {/* Room Number Box */}
          <div className={`w-[40px] h-[40px] rounded-[8px] flex items-center justify-center font-bold text-[16px] ${getNumberBg()}`}>
            {number}
          </div>
          {/* Room Type & Members */}
          <div className="flex flex-col gap-0.5">
            <h3 className="text-[18px] font-bold text-[#1F2937] leading-tight" style={{ fontFamily: 'Roboto, sans-serif' }}>{type}</h3>
            <p className="text-[14px] font-medium text-[#6B7280] leading-tight" style={{ fontFamily: 'Roboto, sans-serif' }}>
              {members ? `Guests: ${members}` : 'Guests: Vacant'}
            </p>
          </div>
        </div>
        
        {/* Status Badge */}
        <div className={`h-[28px] px-[12px] rounded-full text-[12px] font-bold flex items-center justify-center gap-1.5 ${getStatusBadgeStyles()}`} style={{ fontFamily: 'Roboto, sans-serif' }}>
          <div className={`w-1.5 h-1.5 rounded-full ${getStatusDotColor()}`}></div>
          {status}
        </div>
      </div>
      
      {/* Divider */}
      <hr className="border-t border-[#E5E7EB] m-0" />
      
      {/* Bottom Section */}
      {isReady ? (
        <div className="flex justify-between items-center">
          <span className="text-[14px] font-medium italic text-[#6B7280]" style={{ fontFamily: 'Roboto, sans-serif' }}>Ready for Check-in</span>
          {showAssign && (
            <button 
              onClick={onCheckIn}
              className="bg-[#0F766E] hover:bg-[#0D9488] text-white h-[40px] px-4 rounded-[16px] text-[14px] font-semibold transition-colors shadow-sm flex items-center justify-center cursor-pointer" 
              style={{ fontFamily: 'Roboto, sans-serif' }}
            >
              Check In
            </button>
          )}
        </div>
      ) : (
        <div className="flex justify-between items-center px-1">
          <div className="flex flex-col">
            <span className="text-[12px] font-semibold text-[#6B7280] mb-0.5 uppercase tracking-wide" style={{ fontFamily: 'Roboto, sans-serif' }}>Check-in</span>
            <span className="text-[14px] font-bold text-[#1F2937]" style={{ fontFamily: 'Roboto, sans-serif' }}>{checkIn}</span>
          </div>
          <span className="material-symbols-outlined text-[#9CA3AF] text-[18px]">arrow_right_alt</span>
          <div className="flex flex-col text-right">
            <span className="text-[12px] font-semibold text-[#6B7280] mb-0.5 uppercase tracking-wide" style={{ fontFamily: 'Roboto, sans-serif' }}>Check-out</span>
            <span className="text-[14px] font-bold text-[#1F2937]" style={{ fontFamily: 'Roboto, sans-serif' }}>{checkOut}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomCard;
