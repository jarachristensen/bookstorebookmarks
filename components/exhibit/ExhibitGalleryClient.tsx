"use client";

import React, { useState, useMemo, useEffect } from "react";
import { BookmarkWithDetails } from "@/lib/db/queries";
import { TrayControls } from "./TrayControls";
import { SpecimenTray } from "./SpecimenTray";
import { BookmarkInspector } from "./BookmarkInspector";
import { BookstoreDossier } from "./BookstoreDossier";
import { motion, AnimatePresence } from "framer-motion";

export interface FilterOptions {
  cities: string[];
  eras: { label: string; value: string }[];
  specialties: string[];
}

export interface ExhibitGalleryClientProps {
  initialBookmarks: BookmarkWithDetails[];
  filterOptions: FilterOptions;
}

export function ExhibitGalleryClient({
  initialBookmarks,
  filterOptions,
}: ExhibitGalleryClientProps) {
  // Filter States
  const [search, setSearch] = useState("");
  const [city, setCity] = useState("all");
  const [era, setEra] = useState("all");
  const [status, setStatus] = useState<"all" | "open" | "historic">("all");

  // Pagination States (8 specimens per tray page for clean display)
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(8);
  const [pageDirection, setPageDirection] = useState(1);

  // Modal / Drawer Selection States
  const [inspectingBookmark, setInspectingBookmark] = useState<BookmarkWithDetails | null>(null);
  const [dossierBookmark, setDossierBookmark] = useState<BookmarkWithDetails | null>(null);

  // Filter Logic
  const filteredBookmarks = useMemo(() => {
    return initialBookmarks.filter((bm) => {
      const store = bm.bookstore;

      // 1. Search query across title, bookstore name, city, state, and notes
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchTitle = bm.title.toLowerCase().includes(q);
        const matchStore = store?.name.toLowerCase().includes(q);
        const matchCity = store?.city.toLowerCase().includes(q);
        const matchState = store?.stateProvince?.toLowerCase().includes(q);
        const matchNotes = bm.acquisitionNotes?.toLowerCase().includes(q);
        const matchTrivia = store?.historicalBlurb?.toLowerCase().includes(q);

        if (!matchTitle && !matchStore && !matchCity && !matchState && !matchNotes && !matchTrivia) {
          return false;
        }
      }

      // 2. City filter
      if (city !== "all" && store?.city !== city) {
        return false;
      }

      // 3. Status filter (open vs historic/closed)
      if (status === "open" && !store?.isStillOperating) {
        return false;
      }
      if (status === "historic" && store?.isStillOperating) {
        return false;
      }

      // 4. Era filter
      if (era !== "all" && bm.yearProduced) {
        const yr = bm.yearProduced;
        if (era === "pre-1970" && yr >= 1970) return false;
        if (era === "1970s" && (yr < 1970 || yr > 1979)) return false;
        if (era === "1980s" && (yr < 1980 || yr > 1989)) return false;
        if (era === "1990s" && (yr < 1990 || yr > 1999)) return false;
        if (era === "2000s" && (yr < 2000 || yr > 2009)) return false;
        if (era === "2010s-present" && yr < 2010) return false;
      }

      return true;
    });
  }, [initialBookmarks, search, city, era, status]);

  // Reset pagination when search or filters change
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

  // Pagination Calculations
  const totalPages = Math.max(1, Math.ceil(filteredBookmarks.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedBookmarks = useMemo(() => {
    const start = (safeCurrentPage - 1) * pageSize;
    return filteredBookmarks.slice(start, start + pageSize);
  }, [filteredBookmarks, safeCurrentPage, pageSize]);

  const handlePrevPage = () => {
    if (safeCurrentPage > 1) {
      setPageDirection(-1);
      setCurrentPage((prev) => prev - 1);
    }
  };

  const handleNextPage = () => {
    if (safeCurrentPage < totalPages) {
      setPageDirection(1);
      setCurrentPage((prev) => prev + 1);
    }
  };

  // Lock body scroll when modal or drawer is open
  useEffect(() => {
    if (inspectingBookmark || dossierBookmark) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [inspectingBookmark, dossierBookmark]);

  return (
    <div className="space-y-6">
      {/* Search and Archival Filter Controls */}
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

      {/* Modal Inspector View with 3D Flip (Mobile & Desktop Responsive) */}
      <AnimatePresence>
        {inspectingBookmark && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/80 backdrop-blur-md p-2 sm:p-6 lg:p-8 flex items-start sm:items-center justify-center min-h-screen">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="w-full max-w-5xl my-auto py-4"
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
