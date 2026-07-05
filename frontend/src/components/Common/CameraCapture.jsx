import React, { useRef } from 'react';

const CameraCapture = ({ onCapture, hasImage }) => {
  const fileInputRef = useRef(null);

  return (
    <div className="py-2">
      <button 
        type="button"
        onClick={() => fileInputRef.current.click()}
        className="w-full aspect-video rounded-xl bg-[#FFFFFF] border-2 border-dashed border-[#E5E7EB] flex flex-col items-center justify-center gap-2 active:scale-95 transition-all group overflow-hidden relative shadow-sm"
      >
        <div className="absolute inset-0 bg-[#0F766E] opacity-0 group-hover:opacity-5 transition-opacity"></div>
        {hasImage ? (
          <span className="font-label-lg text-[#0F766E]">Image Captured ✓</span>
        ) : (
          <>
            <span className="material-symbols-outlined text-[48px] text-[#0F766E]" data-icon="photo_camera">photo_camera</span>
            <span className="font-label-lg text-label-lg text-[#6B7280]">Capture Aadhaar Card</span>
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
