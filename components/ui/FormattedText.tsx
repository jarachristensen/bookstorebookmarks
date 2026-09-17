"use client";

import React, { useMemo } from "react";
import { marked } from "marked";

interface FormattedTextProps {
  text?: string;
  className?: string;
  inline?: boolean;
}

export function FormattedText({
  text,
  className = "",
  inline = false,
}: FormattedTextProps) {
  const html = useMemo(() => {
    if (!text) return "";
    try {
      if (inline) {
        return marked.parseInline(text) as string;
      }
      return marked.parse(text) as string;
    } catch {
      return text;
    }
  }, [text, inline]);

  if (!text) return null;

  if (inline) {
    return (
      <span
        className={`[&_strong]:font-bold [&_em]:italic [&_a]:text-[#2563EB] [&_a]:underline ${className}`}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  }

  return (
    <div
      className={`[&_strong]:font-bold [&_em]:italic [&_p]:mb-3 [&_p:last-child]:mb-0 [&_a]:text-[#2563EB] [&_a]:underline [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:my-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:my-2 leading-relaxed ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
