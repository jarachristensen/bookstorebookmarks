"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import {
  X,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  ArrowLeftRight,
  Sparkles,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export interface BookmarkZoomLightboxProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  alt: string;
  title: string;
  subtitle?: string;
  flipSide?: {
    current: "front" | "back";
    onToggle: () => void;
    hasBack: boolean;
  };
  notes?: string | null;
}

export function BookmarkZoomLightbox({
  isOpen,
  onClose,
  imageUrl,
  alt,
  title,
  subtitle,
  flipSide,
  notes,
}: BookmarkZoomLightboxProps) {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const positionStartRef = useRef({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartDistRef = useRef<number | null>(null);
  const touchStartScaleRef = useRef<number>(1);

  // Reset zoom & pan when opening or switching images
  useEffect(() => {
    if (isOpen) {
      setScale(1);
      setPosition({ x: 0, y: 0 });
    }
  }, [isOpen, imageUrl]);

  // Handle Zoom In / Out / Reset
  const handleZoomIn = useCallback(() => {
    setScale((prev) => Math.min(prev + 0.5, 5));
  }, []);

  const handleZoomOut = useCallback(() => {
    setScale((prev) => {
      const next = Math.max(prev - 0.5, 0.5);
      if (next <= 1) {
        setPosition({ x: 0, y: 0 });
      }
      return next;
    });
  }, []);

  const handleResetZoom = useCallback(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, []);

  // Double click to toggle 1x and 2.5x
  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setScale((prev) => {
      if (prev > 1.2) {
        setPosition({ x: 0, y: 0 });
        return 1;
      } else {
        return 2.5;
      }
    });
  }, []);

  // Wheel to zoom
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const zoomDelta = e.deltaY * -0.002;
    setScale((prev) => {
      const next = Math.min(Math.max(prev + zoomDelta, 0.5), 5);
      if (next <= 1) {
        setPosition({ x: 0, y: 0 });
      }
      return next;
    });
  }, []);

  // Mouse Drag handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return; // Only left click
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    positionStartRef.current = { ...position };
  }, [position]);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - dragStartRef.current.x;
      const dy = e.clientY - dragStartRef.current.y;
      setPosition({
        x: positionStartRef.current.x + dx,
        y: positionStartRef.current.y + dy,
      });
    },
    [isDragging]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Touch handlers for mobile
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      dragStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      positionStartRef.current = { ...position };
    } else if (e.touches.length === 2) {
      // Pinch to zoom start
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const dist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
      touchStartDistRef.current = dist;
      touchStartScaleRef.current = scale;
    }
  }, [position, scale]);

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (e.touches.length === 1 && isDragging) {
        const dx = e.touches[0].clientX - dragStartRef.current.x;
        const dy = e.touches[0].clientY - dragStartRef.current.y;
        setPosition({
          x: positionStartRef.current.x + dx,
          y: positionStartRef.current.y + dy,
        });
      } else if (e.touches.length === 2 && touchStartDistRef.current !== null) {
        const t1 = e.touches[0];
        const t2 = e.touches[1];
        const dist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
        const ratio = dist / touchStartDistRef.current;
        const newScale = Math.min(Math.max(touchStartScaleRef.current * ratio, 0.5), 5);
        setScale(newScale);
      }
    },
    [isDragging]
  );

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
    touchStartDistRef.current = null;
  }, []);

  // Keyboard Shortcuts (Esc, +, -, 0, r, f)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "+" || e.key === "=") {
        handleZoomIn();
      } else if (e.key === "-" || e.key === "_") {
        handleZoomOut();
      } else if (e.key === "0" || e.key.toLowerCase() === "r") {
        handleResetZoom();
      } else if (e.key.toLowerCase() === "f" && flipSide?.hasBack) {
        flipSide.onToggle();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, handleZoomIn, handleZoomOut, handleResetZoom, flipSide]);

  // Global mouse up listener to prevent sticky drag state
  useEffect(() => {
    const handleGlobalMouseUp = () => setIsDragging(false);
    if (isDragging) {
      window.addEventListener("mouseup", handleGlobalMouseUp);
      return () => window.removeEventListener("mouseup", handleGlobalMouseUp);
    }
  }, [isDragging]);

  // Lock background body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "unset";
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const currentSideLabel =
    flipSide?.current === "back" ? "Verso (Back)" : "Recto (Front)";

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-[100] bg-stone-950/95 backdrop-blur-md flex flex-col justify-between select-none overflow-hidden"
      >
        {/* Top Floating Control Bar */}
        <div className="relative z-20 flex items-center justify-between p-4 sm:p-6 bg-gradient-to-b from-black/80 to-transparent">
          <div className="flex items-center gap-3 text-white max-w-[70%]">
            <div className="p-2 rounded-xl bg-white/10 border border-white/15 shrink-0 hidden sm:flex items-center justify-center">
              <ZoomIn className="w-5 h-5 text-amber-400" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-serif font-bold text-sm sm:text-lg text-white truncate">
                  {title}
                </h3>
                {flipSide?.hasBack && (
                  <span className="px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[10px] font-mono uppercase tracking-wider shrink-0">
                    {currentSideLabel}
                  </span>
                )}
              </div>
              {subtitle && (
                <p className="text-xs font-serif text-stone-300 truncate">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {notes && (
              <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 text-stone-300 text-xs font-serif border border-white/15 max-w-sm truncate">
                <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="truncate italic">"{notes}"</span>
              </div>
            )}
            <button
              onClick={onClose}
              aria-label="Close Fullscreen Zoom"
              className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all cursor-pointer flex items-center gap-1"
            >
              <X className="w-5 h-5" />
              <span className="text-[11px] font-mono text-stone-400 hidden sm:inline pr-1">
                ESC
              </span>
            </button>
          </div>
        </div>

        {/* Center Interactive Pan/Zoom Canvas */}
        <div
          ref={containerRef}
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onDoubleClick={handleDoubleClick}
          className={`relative flex-1 w-full h-full flex items-center justify-center overflow-hidden touch-none ${
            scale > 1
              ? isDragging
                ? "cursor-grabbing"
                : "cursor-grab"
              : "cursor-zoom-in"
          }`}
        >
          <div
            style={{
              transform: `translate3d(${position.x}px, ${position.y}px, 0) scale(${scale})`,
              transition: isDragging ? "none" : "transform 0.15s ease-out",
            }}
            className="relative max-w-[90vw] max-h-[80vh] flex items-center justify-center pointer-events-none"
          >
            {/* The High-Resolution Specimen Image mounted on solid paper backing with clean box shadow */}
            <div className="relative flex items-center justify-center bg-white rounded-[4px] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85)] ring-1 ring-black/20 overflow-hidden">
              <img
                src={imageUrl}
                alt={alt}
                className="max-h-[75vh] max-w-[85vw] w-auto h-auto object-contain block select-none"
                draggable={false}
              />
            </div>
          </div>
        </div>

        {/* Bottom Floating Controls HUD */}
        <div className="relative z-20 flex flex-col items-center gap-2 p-4 sm:p-6 bg-gradient-to-t from-black/80 to-transparent">
          <div className="flex items-center gap-1 sm:gap-2 p-1.5 sm:p-2 rounded-2xl bg-stone-900/90 border border-stone-700/80 shadow-2xl backdrop-blur-md">
            {/* Zoom Out */}
            <button
              type="button"
              onClick={handleZoomOut}
              aria-label="Zoom Out"
              disabled={scale <= 0.5}
              className="p-2 rounded-xl text-stone-300 hover:text-white hover:bg-white/10 disabled:opacity-40 disabled:hover:bg-transparent transition-all cursor-pointer"
              title="Zoom Out (-)"
            >
              <ZoomOut className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            {/* Percentage Display */}
            <span className="px-2.5 py-1 text-xs font-mono font-bold text-amber-400 min-w-[54px] text-center select-none">
              {Math.round(scale * 100)}%
            </span>

            {/* Zoom In */}
            <button
              type="button"
              onClick={handleZoomIn}
              aria-label="Zoom In"
              disabled={scale >= 5}
              className="p-2 rounded-xl text-stone-300 hover:text-white hover:bg-white/10 disabled:opacity-40 disabled:hover:bg-transparent transition-all cursor-pointer"
              title="Zoom In (+)"
            >
              <ZoomIn className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            {/* Reset Button */}
            <div className="h-5 w-[1px] bg-stone-700 mx-1" />
            <button
              type="button"
              onClick={handleResetZoom}
              aria-label="Reset Zoom"
              className="px-2.5 py-1.5 rounded-xl text-xs font-serif text-stone-300 hover:text-white hover:bg-white/10 transition-all cursor-pointer flex items-center gap-1.5"
              title="Reset Zoom (0 or R)"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Reset</span>
            </button>

            {/* Flip Side Button if available */}
            {flipSide?.hasBack && (
              <>
                <div className="h-5 w-[1px] bg-stone-700 mx-1" />
                <button
                  type="button"
                  onClick={flipSide.onToggle}
                  aria-label={
                    flipSide.current === "front"
                      ? "Flip to Verso (Back)"
                      : "Flip to Recto (Front)"
                  }
                  className="px-3 py-1.5 rounded-xl text-xs font-serif font-semibold bg-[#2563EB]/80 hover:bg-[#2563EB] text-white transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
                  title="Flip specimen side (F)"
                >
                  <ArrowLeftRight className="w-3.5 h-3.5 text-amber-300" />
                  <span>
                    {flipSide.current === "front"
                      ? "Flip to Back"
                      : "Flip to Front"}
                  </span>
                </button>
              </>
            )}
          </div>

          {/* User Hint */}
          <div className="text-[11px] font-sans text-stone-400 text-center select-none hidden sm:block">
            <span>Scroll or pinch to zoom</span>
            <span className="mx-1.5">·</span>
            <span>Drag to pan across paper</span>
            <span className="mx-1.5">·</span>
            <span>Double-click to toggle 2.5×</span>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
