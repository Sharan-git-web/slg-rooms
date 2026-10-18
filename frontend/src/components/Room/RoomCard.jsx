import React from 'react';
import { ArrowRight } from 'lucide-react';

const RoomCard = ({ number, type, status, checkIn, checkOut, members, isReady, showAssign, bookingId, onCheckIn, onCheckout }) => {
  const getStatusStyles = () => {
    switch (status.toLowerCase()) {
      case 'available':
        return { bg: '#E8F6EC', color: '#16A34A' };
      case 'occupied':
        return { bg: '#FDEBEC', color: '#B3122A' };
      case 'checkout soon':
        return { bg: '#FEF3C7', color: '#92400E' };
      default:
        return { bg: '#F1F5F9', color: '#6B6B70' };
    }
  };
  const statusStyles = getStatusStyles();

  return (
    <div className="bg-white rounded-[18px] p-[18px] border border-[#EFEBE8]">
      <div className="flex items-center gap-3">
        <div
          className="font-extrabold text-[15px] px-3 py-2 rounded-[10px] min-w-[34px] text-center"
          style={{ background: '#FDEBEC', color: '#B3122A' }}
        >
          {number}
        </div>
        <div className="flex-1">
          <h3 className="font-extrabold text-[17px] text-[#1B1B1F] leading-tight">{type}</h3>
          <p className="text-[13px] text-[#6B6B70]">{members ? `Guests: ${members}` : 'Guests: Vacant'}</p>
        </div>
        <div
          className="text-[13px] font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 whitespace-nowrap"
          style={{ background: statusStyles.bg, color: statusStyles.color }}
        >
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: statusStyles.color }}></span>
          {status}
        </div>
      </div>

      <div className="h-px bg-[#F0EDEA] my-[14px]" />

      {isReady ? (
        <div className="flex items-center justify-between">
          <span className="text-[14px] italic text-[#8A8A8E]">Ready for Check-in</span>
          {showAssign && (
            <button
              onClick={onCheckIn}
              className="text-white font-bold text-[15px] px-[22px] py-[11px] rounded-full active:scale-95 transition-transform cursor-pointer"
              style={{ background: '#B3122A' }}
            >
              Check In
            </button>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between px-1">
            <div className="flex flex-col">
              <span className="text-[12px] font-semibold text-[#6B6B70] mb-0.5 uppercase tracking-wide">Check-in</span>
              <span className="text-[14px] font-bold text-[#1B1B1F]">{checkIn}</span>
            </div>
            <ArrowRight size={18} className="text-[#B0ACA8]" />
            <div className="flex flex-col text-right">
              <span className="text-[12px] font-semibold text-[#6B6B70] mb-0.5 uppercase tracking-wide">Check-out</span>
              <span className="text-[14px] font-bold text-[#1B1B1F]">{checkOut}</span>
            </div>
          </div>
          {onCheckout && (
            <button
              onClick={() => onCheckout(bookingId)}
              className="text-white font-bold text-[14px] w-full py-[10px] rounded-[10px] active:scale-95 transition-transform cursor-pointer mt-1"
              style={{ background: '#1B1B1F' }}
            >
              Checkout Now
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default React.memo(RoomCard);
