"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { BookmarkWithDetails, FilterOptions } from "@/lib/db/queries";
import { BookmarkInspector } from "@/components/exhibit/BookmarkInspector";
import { BookstoreDossier } from "@/components/exhibit/BookstoreDossier";
import { BookmarkPaperSpread } from "@/components/home/BookmarkPaperSpread";
import {
  Ticket,
  Search,
  Sparkles,
  Building2,
  ZoomIn,
  Plus,
  BookOpen,
  Info,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export interface BooksellerTicketsGalleryClientProps {
  tickets: BookmarkWithDetails[];
}

export function BooksellerTicketsGalleryClient({
  tickets,
}: BooksellerTicketsGalleryClientProps) {
  const [search, setSearch] = useState("");
  const [inspectingTicket, setInspectingTicket] = useState<BookmarkWithDetails | null>(null);
  const [dossierTicket, setDossierTicket] = useState<BookmarkWithDetails | null>(null);

  const filteredTickets = useMemo(() => {
    if (!search.trim()) return tickets;
    const q = search.toLowerCase().trim();
    return tickets.filter((t) => {
      const titleMatch = t.title.toLowerCase().includes(q);
      const storeMatch = t.bookstore?.name.toLowerCase().includes(q);
      const cityMatch = t.bookstore?.city.toLowerCase().includes(q);
      const accMatch = t.accessionNo.toLowerCase().includes(q);
      const materialMatch = t.material.toLowerCase().includes(q);
      return titleMatch || storeMatch || cityMatch || accMatch || materialMatch;
    });
  }, [tickets, search]);

  return (
    <div className="space-y-6">
      {/* Editorial Masthead */}
      <section className="p-6 sm:p-8 rounded-2xl bg-white border border-[#E8E2D5] shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8E2D5] pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 text-[10px] font-mono text-[#2563EB] uppercase font-bold tracking-widest bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                <Ticket className="w-3 h-3" />
                <span>Rare Ephemera Category</span>
              </span>
              <span className="text-xs font-mono text-stone-500">
                {tickets.length} {tickets.length === 1 ? "Specimen" : "Specimens"}
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-stone-900 tracking-tight font-serif">
              Bookseller Tickets
            </h1>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tickets by bookstore or city..."
              className="w-full pl-9 pr-3 py-2 text-xs font-serif bg-stone-50 border border-[#E8E2D5] rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
            />
          </div>
        </div>

        <div className="text-xs sm:text-sm font-serif text-stone-700 leading-relaxed max-w-4xl space-y-2">
          <p>
            <strong>Bookseller tickets</strong> are diminutive, engraved or letterpress labels pasted onto the inside front covers, endpapers, or flyleaves of books by 18th, 19th, and early 20th-century booksellers, binders, and circulating libraries.
          </p>
          <p className="text-stone-600">
            Predating modern mass-produced bookmarks, these rare typographic specimens preserved shop addresses, bookbinding guilds, and historic commerce in cities around the world.
          </p>
        </div>
      </section>

      {/* Gallery Display or Empty State */}
      {filteredTickets.length > 0 ? (
        <div className="space-y-4">
          <BookmarkPaperSpread
            bookmarks={filteredTickets}
            onInspectBookmark={(b) => setInspectingTicket(b)}
          />
        </div>
      ) : tickets.length === 0 ? (
        <div className="p-12 sm:p-16 text-center rounded-2xl bg-white border border-[#E8E2D5] shadow-xs space-y-4 max-w-2xl mx-auto my-8">
          <div className="w-14 h-14 mx-auto rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center text-[#2563EB]">
            <Ticket className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold font-serif text-stone-900">
            No Bookseller Tickets Cataloged Yet
          </h2>
          <p className="text-xs sm:text-sm font-serif text-stone-600 max-w-md mx-auto leading-relaxed">
            Bookseller tickets are a rare, specialized ephemera category. When adding or editing a specimen in the Curator's Cabinet, check the <strong>Bookseller Ticket</strong> checkbox to display it here.
          </p>
          <div className="pt-2">
            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-serif font-bold bg-[#2563EB] hover:bg-blue-700 text-white shadow-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Go to Curator's Cabinet</span>
            </Link>
          </div>
        </div>
      ) : (
        <div className="p-8 text-center rounded-2xl bg-white border border-[#E8E2D5] shadow-xs text-xs font-serif text-stone-500">
          No bookseller tickets match &ldquo;{search}&rdquo;.
        </div>
      )}

      {/* Bookmark Inspector Modal */}
      <AnimatePresence>
        {inspectingTicket && (
          <div
            className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/80 backdrop-blur-md p-2 sm:p-6 lg:p-8 flex items-start sm:items-center justify-center min-h-screen"
            onClick={() => setInspectingTicket(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="w-full max-w-5xl my-auto py-4"
              onClick={(e) => e.stopPropagation()}
            >
              <BookmarkInspector
                bookmark={inspectingTicket}
                onClose={() => setInspectingTicket(null)}
                onOpenDossier={(b) => {
                  setInspectingTicket(null);
                  setDossierTicket(b);
                }}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Bookstore Dossier Modal */}
      <AnimatePresence>
        {dossierTicket && (
          <div
            className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/80 backdrop-blur-md p-2 sm:p-6 lg:p-8 flex items-start sm:items-center justify-center min-h-screen"
            onClick={() => setDossierTicket(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="w-full max-w-5xl my-auto py-4"
              onClick={(e) => e.stopPropagation()}
            >
              <BookstoreDossier
                bookmark={dossierTicket}
                onClose={() => setDossierTicket(null)}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
