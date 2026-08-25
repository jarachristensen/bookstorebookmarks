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
      className={`prose prose-stone max-w-none font-serif text-ink-light leading-relaxed prose-headings:font-serif prose-headings:text-ink prose-headings:font-bold prose-h3:text-xl prose-h3:mt-6 prose-h3:mb-3 prose-h4:text-base prose-h4:mt-4 prose-h4:mb-2 prose-p:my-3 prose-p:leading-relaxed prose-strong:text-ink prose-blockquote:border-l-2 prose-blockquote:border-archival-oxblood prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-ink/90 ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
