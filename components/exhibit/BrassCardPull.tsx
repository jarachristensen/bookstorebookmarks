"use client";

import React from "react";

export interface BrassCardPullProps {
  romanNumeral: string;
  title: string;
  subtitle?: string;
  count?: number;
  isMaster?: boolean;
}

export function BrassCardPull({
  romanNumeral,
  title,
  subtitle,
  count,
  isMaster = false,
}: BrassCardPullProps) {
  return (
    <div className="relative flex flex-col items-center justify-center select-none py-1 w-full">
      {/* 
        Skeuomorphic Photorealistic Cast Brass Card-Catalog Pull Fixture 
        Features: Stamped brass backplate, 4 corner slotted wood screws, 
        top thumb notch, aged parchment index card, and 3D sculpted cup handle.
      */}
      <div className="relative w-full max-w-[260px] sm:max-w-[290px] rounded-lg p-[4.5px] sm:p-[5.5px] shadow-[0_10px_22px_rgba(0,0,0,0.75),0_2px_4px_rgba(0,0,0,0.5),inset_0_1px_2px_rgba(255,245,210,0.85),inset_0_-2px_3px_rgba(40,25,5,0.9)] bg-gradient-to-b from-[#f2d37c] via-[#bd9331] to-[#6a4e10] border border-[#d6ad3e]/70 mx-auto">
        {/* Outer Stamped Brass Flange Bevel Highlight */}
        <div className="absolute inset-[1px] rounded-[6px] pointer-events-none border-t border-l border-[#fff4cc]/60 border-b border-r border-[#3d2a05]/80" />

        {/* 4 Authentic Slotted Antique Brass Wood Screws with Counter-sunk Wells */}
        {/* Top-Left Screw */}
        <div className="absolute top-[4.5px] left-[4.5px] w-[8px] h-[8px] rounded-full bg-[#301e05] p-[1px] shadow-[inset_0_1px_2px_rgba(0,0,0,0.9)]">
          <div className="w-full h-full rounded-full bg-gradient-to-br from-[#fae79b] via-[#b68f2c] to-[#593e0b] relative shadow-[0_0.5px_1px_rgba(0,0,0,0.5)]">
            <div className="absolute top-1/2 left-[15%] right-[15%] h-[1px] bg-[#241502] -translate-y-1/2 rotate-[25deg]" />
          </div>
        </div>

        {/* Top-Right Screw */}
        <div className="absolute top-[4.5px] right-[4.5px] w-[8px] h-[8px] rounded-full bg-[#301e05] p-[1px] shadow-[inset_0_1px_2px_rgba(0,0,0,0.9)]">
          <div className="w-full h-full rounded-full bg-gradient-to-br from-[#fae79b] via-[#b68f2c] to-[#593e0b] relative shadow-[0_0.5px_1px_rgba(0,0,0,0.5)]">
            <div className="absolute top-1/2 left-[15%] right-[15%] h-[1px] bg-[#241502] -translate-y-1/2 rotate-[70deg]" />
          </div>
        </div>

        {/* Bottom-Left Screw */}
        <div className="absolute bottom-[4.5px] left-[4.5px] w-[8px] h-[8px] rounded-full bg-[#301e05] p-[1px] shadow-[inset_0_1px_2px_rgba(0,0,0,0.9)]">
          <div className="w-full h-full rounded-full bg-gradient-to-br from-[#fae79b] via-[#b68f2c] to-[#593e0b] relative shadow-[0_0.5px_1px_rgba(0,0,0,0.5)]">
            <div className="absolute top-1/2 left-[15%] right-[15%] h-[1px] bg-[#241502] -translate-y-1/2 rotate-[115deg]" />
          </div>
        </div>

        {/* Bottom-Right Screw */}
        <div className="absolute bottom-[4.5px] right-[4.5px] w-[8px] h-[8px] rounded-full bg-[#301e05] p-[1px] shadow-[inset_0_1px_2px_rgba(0,0,0,0.9)]">
          <div className="w-full h-full rounded-full bg-gradient-to-br from-[#fae79b] via-[#b68f2c] to-[#593e0b] relative shadow-[0_0.5px_1px_rgba(0,0,0,0.5)]">
            <div className="absolute top-1/2 left-[15%] right-[15%] h-[1px] bg-[#241502] -translate-y-1/2 rotate-[40deg]" />
          </div>
        </div>

        {/* Top Card Slot Thumb Notch (Classic library drawer cutout) */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-2 rounded-b-full bg-gradient-to-b from-[#4a3408] to-[#1a1102] shadow-[inset_0_2px_4px_rgba(0,0,0,0.9)] border-b border-[#ffd978]/40" />

        {/* Recessed Inner Brass Bezel & Aged Index Card Window */}
        <div className="relative rounded-[4px] p-[2px] bg-gradient-to-b from-[#5c400c] via-[#8f6d1b] to-[#402a06] shadow-[inset_0_2px_5px_rgba(0,0,0,0.8),0_1px_1px_rgba(255,245,210,0.5)]">
          {/* Aged Manila Parchment Card Insert */}
          <div className="relative rounded-[2px] px-3 pt-2 pb-1.5 text-center overflow-hidden bg-[#faf4e6] bg-[radial-gradient(#d6c29e_1px,transparent_1px)] bg-[size:10px_10px] shadow-[inset_0_2px_4px_rgba(80,50,20,0.3),inset_0_-1px_2px_rgba(255,255,255,0.8)] border border-[#c4ab7e]">
            {/* Top Red/Brown Archival Index Rule Line */}
            <div className="absolute top-1.5 left-2.5 right-2.5 h-[1px] bg-[#a84444]/35 pointer-events-none" />

            {/* Roman Numeral Header */}
            <span className="block text-[8.5px] sm:text-[9.5px] font-mono font-bold tracking-[0.18em] text-[#6b4216] uppercase">
              {romanNumeral}
            </span>

            {/* Region / State Title with Letterpress Ink Impression */}
            <h3
              className={`font-serif font-bold tracking-wide text-xs sm:text-[13px] leading-tight text-[#1a140b] ${
                isMaster ? "text-[#7a2e0e] font-extrabold" : ""
              }`}
              style={{
                textShadow: "0 1px 0 rgba(255,255,255,0.8), 0 -0.5px 0 rgba(0,0,0,0.25)",
              }}
            >
              {title}
            </h3>

            {/* Specimen Count / Subtitle inside the card */}
            <div className="mt-0.5 text-[9px] text-[#786144] font-mono tracking-wider">
              {count !== undefined && (
                <span>
                  {count} {count === 1 ? "SPECIMEN" : "SPECIMENS"}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* 
          3D SCULPTED CAST BRASS CUP PULL HANDLE (EVEN & IN THE MIDDLE)
        */}
        <div className="relative mt-1 flex flex-col items-center justify-center">
          {/* Main Cup Pull Body */}
          <div className="relative w-24 sm:w-28 h-5 sm:h-6 rounded-t-[18px] rounded-b-[3px] bg-gradient-to-b from-[#fce99f] via-[#d6a938] via-50% to-[#6e4e0b] shadow-[0_6px_14px_rgba(0,0,0,0.8),0_2px_4px_rgba(0,0,0,0.6),inset_0_2px_3px_rgba(255,255,255,0.9),inset_0_-3px_5px_rgba(20,12,2,0.9)] border-t border-[#fff3b8] flex items-center justify-center overflow-hidden">
            {/* Horizontal Specular Horizon Gleam Line */}
            <div className="absolute top-[2px] left-[10%] right-[10%] h-[1.5px] rounded-full bg-gradient-to-r from-transparent via-[#ffffff] to-transparent opacity-90" />

            {/* Left & Right Shadow Flares on the Cup Dome */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(255,255,255,0.4)_0%,transparent_60%)] pointer-events-none" />

            {/* Realistic Dark Underside Grip Recess */}
            <div className="absolute bottom-0 left-[14%] right-[14%] h-[55%] rounded-b-[2px] rounded-t-full bg-gradient-to-b from-[#0f0902] via-[#241705] to-[#402a0a] shadow-[inset_0_-2px_4px_rgba(0,0,0,0.95)] border-t border-[#543b0d]" />
          </div>

          {/* Cast Drop Shadow onto the Wood Drawer Face */}
          <div className="w-20 sm:w-24 h-1.5 rounded-full bg-black/75 blur-[2px] -mt-0.5 pointer-events-none" />
        </div>
      </div>
    </div>
  );
}
