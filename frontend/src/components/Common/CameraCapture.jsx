import React, { useRef, useState, useEffect } from 'react';
import { Camera, Eye, Trash2, Check, X } from 'lucide-react';

const CameraCapture = ({
  onCapture,
  onClear,
  image,
  hasImage,
  label = "Capture Aadhaar Card"
}) => {
  const fileInputRef = useRef(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (!image) {
      setPreviewUrl(null);
      return;
    }
    if (typeof image === 'string') {
      setPreviewUrl(image);
      return;
    }
    if (image instanceof Blob || image instanceof File) {
      const url = URL.createObjectURL(image);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [image]);

  const isCaptured = Boolean(image || hasImage || previewUrl);

  const handleCardClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="py-2">
      <div
        role="button"
        tabIndex={0}
        onClick={handleCardClick}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleCardClick();
          }
        }}
        className="w-full aspect-video rounded-[18px] bg-[#FFFFFF] border-2 border-dashed border-[#DCD7D2] flex flex-col items-center justify-center gap-2.5 active:scale-95 transition-all overflow-hidden relative cursor-pointer select-none group"
      >
        {previewUrl ? (
          <div className="w-full h-full relative">
            <img
              src={previewUrl}
              alt={label}
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover"
            />
            {/* Gradient overlay for contrast and actions */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-black/45 flex flex-col justify-between p-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-white bg-black/40 backdrop-blur-sm px-2 py-0.5 rounded-full border border-white/20">
                  {label}
                </span>
                <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    title="Preview Image"
                    onClick={() => setShowModal(true)}
                    className="w-7 h-7 rounded-full bg-white/90 hover:bg-white flex items-center justify-center text-[#1B1B1F] shadow-sm transition-transform active:scale-90"
                  >
                    <Eye size={14} />
                  </button>
                  {onClear && (
                    <button
                      type="button"
                      title="Remove Image"
                      onClick={() => {
                        if (fileInputRef.current) fileInputRef.current.value = '';
                        onClear();
                      }}
                      className="w-7 h-7 rounded-full bg-white/90 hover:bg-white flex items-center justify-center text-[#B3122A] shadow-sm transition-transform active:scale-90"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between text-white">
                <span className="font-bold text-[12px] text-emerald-300 flex items-center gap-1">
                  <Check size={14} strokeWidth={2.5} /> Captured
                </span>
                <span className="text-[11px] text-white/80 underline font-medium">
                  Tap to retake
                </span>
              </div>
            </div>
          </div>
        ) : isCaptured ? (
          <div className="flex flex-col items-center justify-center gap-1">
            <span className="font-bold text-[15px] text-[#B3122A] flex items-center gap-1.5">
              <Check size={16} strokeWidth={2.5} /> Image Captured ✓
            </span>
            <span className="text-[12px] text-[#6B6B70]">{label}</span>
          </div>
        ) : (
          <>
            <Camera size={26} strokeWidth={2} className="text-[#B3122A]" />
            <span className="text-[15px] text-[#6B6B70] font-medium">{label}</span>
          </>
        )}

        <input
          ref={fileInputRef}
          accept="image/*"
          capture="environment"
          className="hidden"
          type="file"
          onChange={(e) => {
            onCapture(e);
          }}
        />
      </div>

      {/* Full Preview Modal */}
      {showModal && previewUrl && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={() => setShowModal(false)}
        >
          <div
            className="relative max-w-lg w-full bg-[#1B1B1F] rounded-[20px] p-4 flex flex-col gap-3 shadow-2xl border border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-1 border-b border-white/10">
              <span className="text-white font-bold text-[15px]">{label} Preview</span>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
              >
                <X size={16} />
              </button>
            </div>
            <div className="rounded-[14px] overflow-hidden max-h-[70vh] flex items-center justify-center bg-black">
              <img
                src={previewUrl}
                alt={`${label} Preview`}
                className="max-h-[70vh] w-auto max-w-full object-contain"
              />
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  setShowModal(false);
                  handleCardClick();
                }}
                className="px-4 py-2 rounded-full text-[13px] font-bold text-white bg-[#B3122A] active:scale-95 transition-transform"
              >
                Retake Photo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default React.memo(CameraCapture);
