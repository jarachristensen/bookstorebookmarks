"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { ArchivalMedia } from "@/db/schema";
import { X, ZoomIn, ZoomOut, Newspaper, FileText, Calendar, BookOpen, Quote } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";

export interface ClippingLightboxProps {
  media: ArchivalMedia;
  onClose: () => void;
}

export function ClippingLightbox({ media, onClose }: ClippingLightboxProps) {
  const [isZoomed, setIsZoomed] = useState(false);
  const [showTranscription, setShowTranscription] = useState(true);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-stone-950/85 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-5xl max-h-[90vh] bg-[#FBF9F5] border border-parchment-border rounded-2xl shadow-2xl overflow-hidden flex flex-col"
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-parchment-border bg-parchment-muted/80">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-white border border-parchment-border text-archival-oxblood shadow-xs">
              <Newspaper className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-ink">{media.caption}</h3>
              <div className="flex items-center gap-3 text-xs text-ink-muted">
                {media.sourcePublication && (
                  <span className="font-medium text-ink">{media.sourcePublication}</span>
                )}
                {media.publicationDate && (
                  <span className="flex items-center gap-1 font-mono">
                    <Calendar className="w-3 h-3 text-archival-amber" />
                    <span>{media.publicationDate}</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsZoomed(!isZoomed)}
              className="text-xs flex items-center gap-1"
            >
              {isZoomed ? <ZoomOut className="w-3.5 h-3.5" /> : <ZoomIn className="w-3.5 h-3.5" />}
              <span>{isZoomed ? "Reset Zoom" : "Deep Zoom"}</span>
            </Button>

            {media.transcriptionText && (
              <Button
                variant={showTranscription ? "secondary" : "outline"}
                size="sm"
                onClick={() => setShowTranscription(!showTranscription)}
                className="text-xs flex items-center gap-1"
              >
                <FileText className="w-3.5 h-3.5 text-archival-oxblood" />
                <span>Transcription</span>
              </Button>
            )}

            <button
              onClick={onClose}
              aria-label="Close Lightbox"
              className="p-2 rounded-full hover:bg-parchment-dark text-ink-muted hover:text-ink transition-colors cursor-pointer ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body Viewport */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Media Image Canvas */}
          <div
            className={`transition-all duration-300 ${
              showTranscription && media.transcriptionText
                ? "lg:col-span-7"
                : "lg:col-span-12"
            } flex flex-col items-center justify-center`}
          >
            <div
              className={`relative w-full rounded-xl overflow-hidden bg-stone-900 border-2 border-parchment-border shadow-inner cursor-zoom-in transition-all ${
                isZoomed ? "scale-110 sm:scale-125 my-8" : ""
              }`}
              onClick={() => setIsZoomed(!isZoomed)}
            >
              <div className="relative w-full aspect-[4/3] sm:aspect-[16/10]">
                <Image
                  src={media.imageUrl}
                  alt={media.caption}
                  fill
                  className="object-contain p-4"
                  sizes="(max-width: 1024px) 100vw, 800px"
                  priority
                />
              </div>
            </div>
            <p className="mt-2 text-center text-xs font-mono text-ink-muted">
              {isZoomed ? "Click image again to zoom out" : "Click image to examine print details"}
            </p>
          </div>

          {/* Transcription & Research Sidebar */}
          {showTranscription && media.transcriptionText && (
            <div className="lg:col-span-5 bg-white/80 p-5 rounded-xl border border-parchment-border shadow-sm space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-parchment-border text-xs font-mono font-bold text-archival-oxblood uppercase tracking-wider">
                <Quote className="w-3.5 h-3.5" />
                <span>Archival Transcription</span>
              </div>

              <div className="font-serif text-sm text-ink-light leading-relaxed italic whitespace-pre-wrap bg-parchment-light p-4 rounded-lg border border-parchment-border/60 shadow-xs">
                {media.transcriptionText}
              </div>

              <div className="pt-2 text-[11px] font-mono text-ink-muted flex items-center justify-between">
                <span>HISTORICAL PRESS ARCHIVE</span>
                <span>ORIGINAL CITATION VERIFIED</span>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
