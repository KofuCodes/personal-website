import React, { useState } from 'react';
import { createPortal } from 'react-dom';

interface Photo {
  id: string;
  url: string;
  location: string;
  year?: string;
}

interface InteractivePolaroidProps {
  photo: Photo;
  rotation?: number;
  customCaption?: React.ReactNode;
  imageClassName?: string;
  backText?: string;
}

const InteractivePolaroid: React.FC<InteractivePolaroidProps> = ({
  photo,
  rotation = 0,
  customCaption,
  imageClassName = "w-full h-48 object-cover sepia-[0.2] contrast-[1.1]",
  backText
}) => {
  const [isEnlarged, setIsEnlarged] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isEnlarged) {
      // First click - enlarge
      setIsEnlarged(true);
      setIsFlipped(false);
    } else {
      // Second click - flip
      setIsFlipped(!isFlipped);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    // Close if clicking the backdrop
    setIsEnlarged(false);
    setIsFlipped(false);
    setIsHovered(false);
  };

  return (
    <>
      {/* Normal polaroid in carousel */}
      {!isEnlarged && (
        <div
          className="bg-white dark:bg-[#f5f5dc] p-2 pb-10 shadow-[4px_4px_12px_rgba(0,0,0,0.3)] relative cursor-pointer transition-all duration-300"
          style={{
            transform: `rotate(${rotation}deg) scale(${isHovered ? 1.08 : 1})`,
            boxShadow: isHovered ? '8px 8px 20px rgba(0,0,0,0.45)' : '4px 4px 12px rgba(0,0,0,0.3)',
          }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onClick={handleClick}
        >
          <img
            src={photo.url}
            alt={photo.location}
            className={imageClassName}
          />
          {customCaption || (
            <p className="text-xs text-[#2a2318] opacity-70 absolute bottom-2 left-2 right-2 text-center handwritten">
              {photo.location}
            </p>
          )}
        </div>
      )}

      {/* Enlarged polaroid with flip capability - rendered in portal */}
      {isEnlarged && typeof document !== 'undefined' && createPortal(
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-6"
          onClick={handleBackdropClick}
        >
          <div
            className="relative"
            style={{
              perspective: '2000px',
              width: 'min(85vw, 480px)',
            }}
          >
            {/* Close button - top-left corner of the polaroid */}
            <button
              className="absolute -top-3 -left-3 z-10 text-red-500 hover:text-red-400 transition-colors"
              onClick={handleBackdropClick}
              aria-label="Close"
            >
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div
              className="transition-transform duration-700 ease-in-out cursor-pointer"
              style={{
                transformStyle: 'preserve-3d',
                transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
              }}
              onClick={handleClick}
            >
              {/* Front of polaroid */}
              <div
                className="bg-white dark:bg-[#f5f5dc] p-3 pb-14 shadow-[12px_12px_40px_rgba(0,0,0,0.5)]"
                style={{ backfaceVisibility: 'hidden' }}
              >
                <div className="w-full aspect-square overflow-hidden bg-zinc-100 dark:bg-zinc-200">
                  <img
                    src={photo.url}
                    alt={photo.location}
                    className="w-full h-full object-cover sepia-[0.2] contrast-[1.1]"
                  />
                </div>
                <div className="mt-3 text-center">
                  <p className="handwritten text-2xl text-[#2a2318] opacity-70">
                    {photo.location}
                  </p>
                </div>
              </div>

              {/* Back of polaroid */}
              <div
                className="absolute inset-0 bg-white dark:bg-[#f5f5dc] p-4 shadow-[12px_12px_40px_rgba(0,0,0,0.5)]"
                style={{
                  backfaceVisibility: 'hidden',
                  transform: 'rotateY(180deg)'
                }}
              >
                <div className="w-full h-full border-2 border-[#c4a882] dark:border-[#8B7355] border-dashed rounded flex items-center justify-center">
                  <div className="text-center text-[#2a2318] dark:text-[#3d2f1f] handwritten text-xl md:text-2xl px-6">
                    {backText || ''}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Close hint - hidden on mobile */}
          <div className="hidden md:block absolute bottom-8 left-1/2 -translate-x-1/2 text-white/70 text-sm mono">
            Click outside to close • Click photo to flip
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

export default InteractivePolaroid;
