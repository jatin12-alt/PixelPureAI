"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { ChevronsLeftRight } from "lucide-react";

export default function ComparisonSlider({ before, after }) {
  // Ensure we are working with string URLs to avoid [object Object] errors
  // Use null instead of empty string to avoid React's "empty string src" warning
  const beforeUrl = typeof before === 'string' ? before : (before?.url || before?.src || null);
  const afterUrl = typeof after === 'string' ? after : (after?.url || after?.src || null);

  const [sliderPosition, setSliderPosition] = useState(50);
  const [isResizing, setIsResizing] = useState(false);
  const [containerWidth, setContainerWidth] = useState(0);
  const [isBeforeLoaded, setIsBeforeLoaded] = useState(false);
  const [isAfterLoaded, setIsAfterLoaded] = useState(false);
  const containerRef = useRef(null);

  // Safeguard: If URLs are missing, don't render or show error
  if (!beforeUrl || !afterUrl) return null;

  const updateWidth = useCallback(() => {
    if (containerRef.current) {
      setContainerWidth(containerRef.current.offsetWidth);
    }
  }, []);

  useEffect(() => {
    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, [updateWidth]);

  // Reset loading states when URLs change
  useEffect(() => {
    setIsBeforeLoaded(false);
    setIsAfterLoaded(false);
  }, [beforeUrl, afterUrl]);

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

  // Logic preserved ✓ | UI updated ✓
  return (
    <div 
      ref={containerRef}
      className="relative w-full h-full min-h-[400px] overflow-hidden select-none cursor-col-resize rounded-3xl shadow-2xl border border-border bg-[#08080F]"
      onMouseMove={handleMouseMove}
      onTouchMove={handleTouchMove}
      onMouseDown={handleMouseDown}
      onTouchStart={handleMouseDown}
    >
      {/* Loading Indicator */}
      {(!isBeforeLoaded || !isAfterLoaded) && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-bg-primary/50 backdrop-blur-sm">
          <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin mb-4" />
          <span className="text-xs font-bold text-text-muted uppercase tracking-widest animate-pulse">
            Processing Visuals...
          </span>
        </div>
      )}

      {/* After Image (Background) */}
      <img
        src={afterUrl}
        alt="After"
        onLoad={() => setIsAfterLoaded(true)}
        className={`absolute inset-0 w-full h-full object-contain bg-black/20 transition-opacity duration-500 ${isAfterLoaded ? 'opacity-100' : 'opacity-0'}`}
        draggable={false}
      />

      {/* Before Image (Clipped) */}
      <div 
        className="absolute inset-0 h-full overflow-hidden z-10"
        style={{ width: `${sliderPosition}%` }}
      >
        <div 
          className="absolute inset-y-0 left-0 h-full" 
          style={{ width: containerWidth ? `${containerWidth}px` : '100%' }}
        >
          <img
            src={beforeUrl}
            alt="Before"
            onLoad={() => setIsBeforeLoaded(true)}
            className={`absolute inset-0 w-full h-full object-contain bg-black/20 transition-opacity duration-500 ${isBeforeLoaded ? 'opacity-100' : 'opacity-0'}`}
            draggable={false}
          />
        </div>
        
        {/* BEFORE Label */}
        <div className={`absolute top-6 left-6 z-20 bg-black/60 backdrop-blur-xs border border-white/10 text-white text-[11px] font-bold px-[10px] py-[4px] rounded-full uppercase tracking-widest transition-opacity duration-300 ${isBeforeLoaded ? 'opacity-100' : 'opacity-0'}`}>
          BEFORE
        </div>
      </div>

      {/* AFTER Label */}
      <div className={`absolute top-6 right-6 z-20 bg-accent/70 backdrop-blur-xs border border-white/10 text-white text-[11px] font-bold px-[10px] py-[4px] rounded-full uppercase tracking-widest transition-opacity duration-300 ${isAfterLoaded ? 'opacity-100' : 'opacity-0'}`}>
        AFTER
      </div>

      {/* Slider Handle */}
      <div 
        className={`absolute inset-y-0 z-30 w-[2px] cursor-col-resize flex items-center justify-center bg-linear-to-b from-accent to-accent2 transition-opacity duration-300 ${isBeforeLoaded && isAfterLoaded ? 'opacity-100' : 'opacity-0'}`}
        style={{ left: `${sliderPosition}%` }}
      >
        <div className="w-[44px] h-[44px] bg-white rounded-full shadow-[0_0_20px_var(--accent-glow)] flex items-center justify-center border-[3px] border-accent -ml-px transition-transform active:scale-90">
          <ChevronsLeftRight className="h-5 w-5 text-accent" />
        </div>
      </div>
    </div>
  );
}
