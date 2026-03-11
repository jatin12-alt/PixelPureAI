"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";

export default function ComparisonSlider({ before, after }) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isResizing, setIsResizing] = useState(false);
  const containerRef = useRef(null);

  const handleMove = useCallback((clientX) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percent = (x / rect.width) * 100;
    setSliderPosition(percent);
  }, []);

  const handleMouseDown = () => setIsResizing(true);
  const handleMouseUp = () => setIsResizing(false);

  const handleMouseMove = (e) => {
    if (!isResizing) return;
    handleMove(e.clientX);
  };

  const handleTouchMove = (e) => {
    if (!isResizing) return;
    handleMove(e.touches[0].clientX);
  };

  useEffect(() => {
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("touchend", handleMouseUp);
    return () => {
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchend", handleMouseUp);
    };
  }, []);

  return (
    <div 
      ref={containerRef}
      className="relative w-full aspect-square md:aspect-video rounded-[2rem] overflow-hidden select-none cursor-col-resize shadow-2xl ring-1 ring-white/10"
      onMouseMove={handleMouseMove}
      onTouchMove={handleTouchMove}
      onMouseDown={handleMouseDown}
      onTouchStart={handleMouseDown}
    >
      {/* After Image (Background) */}
      <img
        src={after}
        alt="After"
        className="absolute inset-0 w-full h-full object-cover"
        draggable={false}
      />

      {/* Before Image (Clipped) */}
      <div 
        className="absolute inset-0 w-full h-full overflow-hidden"
        style={{ width: `${sliderPosition}%` }}
      >
        <img
          src={before}
          alt="Before"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ width: containerRef.current?.offsetWidth }}
          draggable={false}
        />
        {/* Before Label */}
        <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest">
          Before
        </div>
      </div>

      {/* After Label */}
      <div className="absolute top-4 right-4 bg-indigo-500 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest">
        After
      </div>

      {/* Slider Handle */}
      <div 
        className="absolute inset-y-0 w-1 bg-white cursor-col-resize flex items-center justify-center"
        style={{ left: `${sliderPosition}%` }}
      >
        <div className="w-10 h-10 bg-white rounded-full shadow-2xl flex items-center justify-center -ml-0.5 ring-4 ring-black/10">
          <div className="flex gap-1">
            <div className="w-1 h-3 bg-slate-300 rounded-full" />
            <div className="w-1 h-3 bg-slate-300 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
