"use client";

import React, { useState, useMemo } from "react";
import { BookmarkWithDetails } from "@/lib/db/queries";
import { SpecimenTray } from "./SpecimenTray";
import { TrayControls } from "./TrayControls";
import { BookmarkInspector } from "./BookmarkInspector";
import { BookstoreDossier } from "./BookstoreDossier";
import { Sparkles, BookOpen, Layers, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export interface ExhibitGalleryClientProps {
  initialBookmarks: BookmarkWithDetails[];
  filterOptions: {
    cities: string[];
    eras: { label: string; value: string }[];
    specialties: string[];
  };
}

export function ExhibitGalleryClient({
  initialBookmarks,
  filterOptions,
}: ExhibitGalleryClientProps) {
  // Search & Filter State
  const [search, setSearch] = useState("");
  const [city, setCity] = useState("all");
  const [era, setEra] = useState("all");
  const [status, setStatus] = useState<"all" | "open" | "historic">("all");

  // Pagination State (Tray Navigation)
  const [currentPage, setCurrentPage] = useState(1);
  const [pageDirection, setPageDirection] = useState(1);
  const pageSize = 8; // 8 bookmarks per physical tray

  // Interaction Modals State
  const [inspectingBookmark, setInspectingBookmark] = useState<BookmarkWithDetails | null>(null);
  const [dossierBookmark, setDossierBookmark] = useState<BookmarkWithDetails | null>(null);

  // Filtered bookmark list
  const filteredBookmarks = useMemo(() => {
    return initialBookmarks.filter((bm) => {
      // City
      if (city !== "all" && bm.bookstore?.city.toLowerCase() !== city.toLowerCase()) {
        return false;
      }

      // Status
      if (status !== "all") {
        if (status === "open" && !bm.bookstore?.isStillOperating) return false;
        if (status === "historic" && bm.bookstore?.isStillOperating) return false;
      }

      // Era
      if (era !== "all") {
        const year = bm.yearProduced || bm.bookstore?.yearOpened || 0;
        if (era === "pre-1940" && year >= 1940) return false;
        if (era === "1940-1960" && (year < 1940 || year > 1960)) return false;
        if (era === "post-1960" && year <= 1960) return false;
      }

      // Search Query
      if (search.trim() !== "") {
        const q = search.toLowerCase().trim();
        const matchesTitle = bm.title.toLowerCase().includes(q);
        const matchesAccession = bm.accessionNo.toLowerCase().includes(q);
        const matchesStore = bm.bookstore?.name.toLowerCase().includes(q);
        const matchesCity = bm.bookstore?.city.toLowerCase().includes(q);
        const matchesBlurb = bm.bookstore?.historicalBlurb.toLowerCase().includes(q);
        const matchesFounders = bm.bookstore?.founders?.toLowerCase().includes(q);

        if (
          !matchesTitle &&
          !matchesAccession &&
          !matchesStore &&
          !matchesCity &&
          !matchesBlurb &&
          !matchesFounders
        ) {
          return false;
        }
      }

      return true;
    });
  }, [initialBookmarks, search, city, era, status]);

  // Pagination slicing
  const totalPages = Math.ceil(filteredBookmarks.length / pageSize) || 1;
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedBookmarks = useMemo(() => {
    const start = (safeCurrentPage - 1) * pageSize;
    return filteredBookmarks.slice(start, start + pageSize);
  }, [filteredBookmarks, safeCurrentPage, pageSize]);

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setPageDirection(-1);
      setCurrentPage((p) => p - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setPageDirection(1);
      setCurrentPage((p) => p + 1);
    }
  };

  const handleSearchChange = (val: string) => {
    setSearch(val);
    setCurrentPage(1);
  };

  const handleCityChange = (val: string) => {
    setCity(val);
    setCurrentPage(1);
  };

  const handleEraChange = (val: string) => {
    setEra(val);
    setCurrentPage(1);
  };

  const handleStatusChange = (val: "all" | "open" | "historic") => {
    setStatus(val);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-8">
      {/* Curator Introduction Banner */}
      <div className="text-center max-w-3xl mx-auto space-y-3 pt-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-archival-amber/10 border border-archival-amber/20 text-xs font-mono text-archival-amber font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>CURATED SPECIMEN EXHIBITION</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-extrabold text-ink tracking-tight">
          Historic Bookstore Bookmarks
        </h1>
        <p className="font-serif text-sm sm:text-base text-ink-light leading-relaxed italic">
          Explore authentic bookmarks preserved from legendary independent booksellers across Paris, New York, San Francisco, and Chicago. Click any specimen to lift and flip its 3D paper scans, or read the full bookstore research dossier and historical press clippings.
        </p>
      </div>

      {/* Curator Filter & Search Controls */}
      <TrayControls
        currentPage={safeCurrentPage}
        totalPages={totalPages}
        totalItems={filteredBookmarks.length}
        pageSize={pageSize}
        search={search}
        onSearchChange={handleSearchChange}
        city={city}
        onCityChange={handleCityChange}
        cities={filterOptions.cities}
        era={era}
        onEraChange={handleEraChange}
        eras={filterOptions.eras}
        status={status}
        onStatusChange={handleStatusChange}
        onPrevPage={handlePrevPage}
        onNextPage={handleNextPage}
      />

      {/* The Interactive Specimen Tray */}
      <SpecimenTray
        bookmarks={paginatedBookmarks}
        currentPage={safeCurrentPage}
        direction={pageDirection}
        onInspect={(bm) => setInspectingBookmark(bm)}
        onPrevPage={handlePrevPage}
        onNextPage={handleNextPage}
        hasPrev={safeCurrentPage > 1}
        hasNext={safeCurrentPage < totalPages}
      />

      {/* Modal Inspector View with 3D Flip */}
      <AnimatePresence>
        {inspectingBookmark && (
          <div className="fixed inset-0 z-40 overflow-y-auto bg-stone-950/75 backdrop-blur-md p-4 sm:p-6 lg:p-8 flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-5xl"
            >
              <BookmarkInspector
                bookmark={inspectingBookmark}
                onClose={() => setInspectingBookmark(null)}
                onOpenDossier={() => {
                  const target = inspectingBookmark;
                  setInspectingBookmark(null);
                  setDossierBookmark(target);
                }}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Slide-over Bookstore Dossier */}
      <AnimatePresence>
        {dossierBookmark && (
          <BookstoreDossier
            bookmark={dossierBookmark}
            allBookmarks={initialBookmarks}
            onClose={() => setDossierBookmark(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
