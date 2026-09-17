"use client";

import React, { useRef } from "react";
import { Bold, Italic, Link as LinkIcon, List, ListOrdered } from "lucide-react";

interface VisualTextareaProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  rows?: number;
  label?: string;
  className?: string;
}

export function VisualTextarea({
  value,
  onChange,
  placeholder,
  rows = 3,
  label,
  className = "",
}: VisualTextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const applyFormat = (prefix: string, suffix: string = prefix, defaultText = "text") => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end) || defaultText;
    const replacement = `${prefix}${selectedText}${suffix}`;

    const newValue = value.substring(0, start) + replacement + value.substring(end);
    onChange(newValue);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + selectedText.length);
    }, 0);
  };

  const handleBold = () => applyFormat("**", "**", "bold text");
  const handleItalic = () => applyFormat("*", "*", "italic text");
  const handleBullet = () => applyFormat("\n- ", "", "list item");
  const handleLink = () => {
    const url = prompt("Enter URL link:", "https://");
    if (!url) return;
    applyFormat("[", `](${url})`, "link text");
  };

  return (
    <div className={`space-y-1.5 ${className}`}>
      <div className="flex items-center justify-between">
        {label ? (
          <label className="block text-xs font-mono text-stone-600 uppercase font-semibold">
            {label}
          </label>
        ) : (
          <div />
        )}
        <div className="inline-flex items-center gap-1 bg-[#FAF8F5] border border-[#E8E2D5] rounded-lg p-0.5">
          <button
            type="button"
            onClick={handleBold}
            className="p-1 hover:bg-white hover:text-stone-900 rounded text-stone-600 transition-colors"
            title="Bold"
          >
            <Bold className="w-3 h-3" />
          </button>
          <button
            type="button"
            onClick={handleItalic}
            className="p-1 hover:bg-white hover:text-stone-900 rounded text-stone-600 transition-colors"
            title="Italic"
          >
            <Italic className="w-3 h-3" />
          </button>
          <button
            type="button"
            onClick={handleBullet}
            className="p-1 hover:bg-white hover:text-stone-900 rounded text-stone-600 transition-colors"
            title="Bullet List"
          >
            <List className="w-3 h-3" />
          </button>
          <button
            type="button"
            onClick={handleLink}
            className="p-1 hover:bg-white hover:text-stone-900 rounded text-stone-600 transition-colors"
            title="Add Link"
          >
            <LinkIcon className="w-3 h-3" />
          </button>
        </div>
      </div>

      <textarea
        ref={textareaRef}
        rows={rows}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 text-xs sm:text-sm font-serif text-stone-800 bg-[#FAF8F5] border border-[#E8E2D5] rounded-xl focus:outline-hidden focus:border-[#2563EB] focus:bg-white transition-all leading-relaxed"
      />
    </div>
  );
}
