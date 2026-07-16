import React, { useRef } from 'react';
import { Camera } from 'lucide-react';

const CameraCapture = ({ onCapture, hasImage }) => {
  const fileInputRef = useRef(null);

  return (
    <div className="py-2">
      <button
        type="button"
        onClick={() => fileInputRef.current.click()}
        className="w-full aspect-video rounded-[18px] bg-[#FFFFFF] border-2 border-dashed border-[#DCD7D2] flex flex-col items-center justify-center gap-2.5 active:scale-95 transition-all overflow-hidden relative"
      >
        {hasImage ? (
          <span className="font-bold text-[15px] text-[#B3122A]">Image Captured ✓</span>
        ) : (
          <>
            <Camera size={26} strokeWidth={2} className="text-[#B3122A]" />
            <span className="text-[15px] text-[#6B6B70]">Capture Aadhaar Card</span>
          </>
        )}
        <input
          ref={fileInputRef}
          accept="image/*"
          capture="environment"
          className="hidden"
          type="file"
          onChange={onCapture}
        />
      </button>
    </div>
  );
};

export default CameraCapture;
