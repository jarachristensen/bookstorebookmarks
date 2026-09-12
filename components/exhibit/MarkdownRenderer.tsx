"use client";

import React from "react";
import { marked } from "marked";

export interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export function MarkdownRenderer({ content, className = "" }: MarkdownRendererProps) {
  // Configure marked for clean typography output
  marked.setOptions({
    breaks: true,
    gfm: true,
  });

  const html = marked.parse(content) as string;

  return (
    <div
      className={`prose prose-stone max-w-none font-serif text-stone-700 leading-relaxed prose-headings:font-serif prose-headings:text-stone-900 prose-headings:font-bold prose-h3:text-xl prose-h3:mt-6 prose-h3:mb-3 prose-h4:text-base prose-h4:mt-4 prose-h4:mb-2 prose-p:my-3 prose-p:leading-relaxed prose-strong:text-stone-900 prose-blockquote:border-l-2 prose-blockquote:border-[#F43F7A] prose-blockquote:pl-4 prose-blockquote:text-stone-800 ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
