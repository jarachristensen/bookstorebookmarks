import type { Metadata } from "next";
import "./globals.css";
import React from "react";

export const metadata: Metadata = {
  title: "Bookstore Bookmark Archive — Curated Specimen Collection & Historical Research",
  description:
    "An aesthetic, physical-feeling archival collection of historic bookstore bookmarks, vintage newspaper clippings, and research dossiers on legendary independent booksellers.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full scroll-smooth">
      <body className="h-full flex flex-col antialiased selection:bg-rose-900/20 selection:text-archival-oxblood">
        {children}
      </body>
    </html>
  );
}
