"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { ChevronsLeftRight } from "lucide-react";
import { toast } from "sonner";

export default function ComparisonSlider({ before, after }) {
  // Extract URLs with fallback
  const beforeUrl = typeof before === 'string' ? before : (before?.url || before?.src || before?.toString() || "");
  const afterUrl = typeof after === 'string' ? after : (after?.url || after?.src || after?.toString() || "");

  const [sliderPosition, setSliderPosition] = useState(50);
  const [isResizing, setIsResizing] = useState(false);
  const [containerWidth, setContainerWidth] = useState(0);
  const [isBeforeLoaded, setIsBeforeLoaded] = useState(false);
  const [isAfterLoaded, setIsAfterLoaded] = useState(false);
  const containerRef = useRef(null);

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
    if (beforeUrl) setIsBeforeLoaded(false);
    if (afterUrl) setIsAfterLoaded(false);
  }, [beforeUrl, afterUrl]);

  const handleBeforeLoad = () => {
    setIsBeforeLoaded(true);
  };

  const handleAfterLoad = () => {
    setIsAfterLoaded(true);
  };

  const handleLoadError = (side) => {
    toast.error(`Failed to load ${side === 'before' ? 'original' : 'enhanced'} image. Check your connection.`);
    if (side === 'before') setIsBeforeLoaded(true); // Don't block UI on error
    if (side === 'after') setIsAfterLoaded(true);
  };

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

  // Rules of Hooks: All hooks must be called before early return
  if (!beforeUrl && !afterUrl) return (
    <div className="w-full h-full min-h-[400px] flex items-center justify-center bg-bg-secondary rounded-3xl border border-dashed border-border text-text-muted">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center">
          <ChevronsLeftRight className="h-6 w-6 opacity-20" />
        </div>
        <p className="text-xs font-bold uppercase tracking-widest opacity-40">Awaiting photo processing...</p>
      </div>
    </div>
  );

  const finalBeforeUrl = beforeUrl || afterUrl;
  const finalAfterUrl = afterUrl || beforeUrl;

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
            Loading Visuals...
          </span>
        </div>
      )}

      {/* After Image (Background) */}
      <img
        key={`after-${finalAfterUrl}`}
        src={finalAfterUrl}
        alt="After"
        onLoad={handleAfterLoad}
        onError={() => handleLoadError('after')}
        className={`absolute inset-0 w-full h-full object-contain bg-black/20 transition-opacity duration-500 ${isAfterLoaded ? 'opacity-100' : 'opacity-0'}`}
        draggable={false}
      />

      {/* Before Image (Clipped) */}
      <div 
        className="absolute inset-0 w-full h-full overflow-hidden transition-opacity duration-500"
        style={{ 
          clipPath: `inset(0 ${100 - sliderPosition}% 0 0)`,
          opacity: isBeforeLoaded ? 1 : 0,
          zIndex: 10
        }}
      >
        <img
          key={`before-${finalBeforeUrl}`}
          src={finalBeforeUrl}
          alt="Before"
          onLoad={handleBeforeLoad}
          onError={() => handleLoadError('before')}
          className="absolute inset-0 w-full h-full object-contain bg-black/20"
          draggable={false}
        />
      </div>

      {/* Slider Line & Handle */}
      <div 
        className="absolute inset-y-0 z-30 w-1 bg-white/30 backdrop-blur-md cursor-col-resize group"
        style={{ left: `${sliderPosition}%` }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
          <ChevronsLeftRight className="h-5 w-5 text-black" />
        </div>
      </div>

      {/* Labels */}
      <div className="absolute top-6 left-6 z-20 px-3 py-1.5 bg-black/40 backdrop-blur-md border border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest text-white/70">
        Original
      </div>
      <div className="absolute top-6 right-6 z-20 px-3 py-1.5 bg-accent/40 backdrop-blur-md border border-accent/20 rounded-full text-[10px] font-black uppercase tracking-widest text-white">
        Enhanced
      </div>
    </div>
  );
}
