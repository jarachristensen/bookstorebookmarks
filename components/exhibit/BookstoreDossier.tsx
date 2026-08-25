"use client";

import React, { useState } from "react";
import Image from "next/image";
import { BookmarkWithDetails } from "@/lib/db/queries";
import { ArchivalMedia } from "@/db/schema";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { MarkdownRenderer } from "./MarkdownRenderer";
import { ClippingLightbox } from "./ClippingLightbox";
import {
  X,
  MapPin,
  Calendar,
  User,
  Tags,
  BookOpen,
  Newspaper,
  Sparkles,
  ExternalLink,
  Layers,
  ArrowLeft,
} from "lucide-react";
import { motion } from "framer-motion";

export interface BookstoreDossierProps {
  bookmark: BookmarkWithDetails;
  onClose: () => void;
}

export function BookstoreDossier({ bookmark, onClose }: BookstoreDossierProps) {
  const [selectedMedia, setSelectedMedia] = useState<ArchivalMedia | null>(null);

  const store = bookmark.bookstore;
  if (!store) return null;

  // Parse JSON fields safely
  let specialties: string[] = [];
  try {
    if (store.specialties) specialties = JSON.parse(store.specialties);
  } catch {}

  let trivia: string[] = [];
  try {
    if (store.notablePatronsTrivia) trivia = JSON.parse(store.notablePatronsTrivia);
  } catch {}

  return (
    <div className="fixed inset-0 z-40 overflow-y-auto bg-stone-950/70 backdrop-blur-sm p-3 sm:p-6 lg:p-10 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 30 }}
        className="relative w-full max-w-5xl bg-[#FDFCF9] border border-parchment-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Top Action Bar */}
        <div className="sticky top-0 z-20 flex items-center justify-between px-6 py-4 border-b border-parchment-border bg-[#FDFCF9]/95 backdrop-blur-md">
          <button
            onClick={onClose}
            className="inline-flex items-center gap-1.5 text-xs font-serif font-medium text-ink-muted hover:text-ink transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Exhibit</span>
          </button>

          <div className="flex items-center gap-2">
            <Badge variant="mono">{bookmark.accessionNo}</Badge>
            <button
              onClick={onClose}
              aria-label="Close Dossier"
              className="p-1.5 rounded-full hover:bg-parchment-muted text-ink-muted hover:text-ink transition-colors cursor-pointer ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 lg:p-10 space-y-10">
          {/* Header Banner */}
          <div className="space-y-4 border-b border-parchment-border pb-8">
            <div className="flex flex-wrap items-center gap-2.5">
              <Badge variant={store.isStillOperating ? "spruce" : "oxblood"}>
                {store.isStillOperating
                  ? `Still Operating (Opened ${store.yearOpened})`
                  : `Historic Landmark (${store.yearOpened}–${store.yearClosed})`}
              </Badge>
              <span className="text-xs font-mono text-ink-muted">
                {store.country}
              </span>
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-extrabold text-ink tracking-tight">
              {store.name}
            </h1>

            {/* Core Info Row */}
            <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-sm text-ink-light font-serif">
              <div className="flex items-center gap-1.5 text-archival-oxblood font-semibold">
                <MapPin className="w-4 h-4" />
                <span>
                  {store.streetAddress ? `${store.streetAddress}, ` : ""}
                  {store.city}, {store.stateProvince || store.country}
                </span>
              </div>

              {store.founders && (
                <div className="flex items-center gap-1.5 text-ink-muted">
                  <User className="w-4 h-4 text-archival-amber" />
                  <span>Founders: <strong className="text-ink font-medium">{store.founders}</strong></span>
                </div>
              )}

              {store.websiteUrl && (
                <a
                  href={store.websiteUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 text-xs font-mono text-archival-oxblood hover:underline"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Archive Record</span>
                </a>
              )}
            </div>

            {/* Specialties Tags */}
            {specialties.length > 0 && (
              <div className="pt-2 flex flex-wrap items-center gap-1.5">
                <span className="text-xs font-mono text-ink-muted flex items-center gap-1 mr-1">
                  <Tags className="w-3 h-3 text-archival-amber" />
                  <span>Specialties:</span>
                </span>
                {specialties.map((s) => (
                  <Badge key={s} variant="default" size="sm">
                    {s}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Grid Layout: Bookmark & Research Narrative */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Bookmark Artifact Preview */}
            <div className="lg:col-span-4 p-5 rounded-2xl bg-parchment-light border border-parchment-border shadow-xs space-y-4">
              <div className="flex items-center justify-between text-xs font-mono font-bold text-archival-oxblood uppercase tracking-wider">
                <span className="flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Collection Bookmark</span>
                </span>
                <span>c. {bookmark.yearProduced}</span>
              </div>

              <div className="relative w-full aspect-[1/3] max-w-[200px] mx-auto rounded-lg overflow-hidden border border-parchment-border shadow-md bg-white">
                <Image
                  src={bookmark.frontImageUrl}
                  alt={bookmark.title}
                  fill
                  className="object-cover object-top"
                />
              </div>

              <div className="pt-2 space-y-1.5 text-xs text-ink-light">
                <p className="font-serif font-bold text-ink text-sm">{bookmark.title}</p>
                <p className="font-mono text-[11px] text-ink-muted">Accession: {bookmark.accessionNo}</p>
                <p><span className="text-ink-muted">Material:</span> {bookmark.material}</p>
                <p><span className="text-ink-muted">Dimensions:</span> {bookmark.dimensions}</p>
                <p><span className="text-ink-muted">Condition:</span> {bookmark.condition}</p>
                {bookmark.acquisitionNotes && (
                  <p className="pt-2 italic text-ink-muted border-t border-parchment-border/60">
                    "{bookmark.acquisitionNotes}"
                  </p>
                )}
              </div>
            </div>

            {/* Right Column: Research Narrative & History Blurb */}
            <div className="lg:col-span-8 space-y-6">
              <div className="bg-white p-6 sm:p-8 rounded-2xl border border-parchment-border shadow-xs">
                <h2 className="text-xs font-mono font-bold text-archival-amber tracking-wider uppercase mb-4 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Curator's Historical Research &amp; Narrative</span>
                </h2>
                <MarkdownRenderer content={store.historicalBlurb} />
              </div>

              {/* Notable Patrons & Anecdotes / Trivia */}
              {trivia.length > 0 && (
                <div className="bg-parchment-muted/60 p-6 rounded-2xl border border-parchment-border space-y-3">
                  <h3 className="font-serif font-bold text-base text-ink flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-archival-amber" />
                    <span>Notable Literary Lore &amp; Anecdotes</span>
                  </h3>
                  <ul className="space-y-2 text-xs sm:text-sm font-serif text-ink-light">
                    {trivia.map((t, idx) => (
                      <li key={idx} className="flex items-start gap-2.5">
                        <span className="text-archival-oxblood font-bold mt-0.5">✦</span>
                        <span>{t}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Historical Media & Newspaper Clippings Section */}
          {store.archivalMedia && store.archivalMedia.length > 0 && (
            <div className="space-y-4 pt-6 border-t border-parchment-border">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-serif text-2xl font-bold text-ink">
                    Archival Photos &amp; Newspaper Clippings
                  </h2>
                  <p className="text-xs sm:text-sm text-ink-muted font-serif italic">
                    Click any historical article or photograph to open deep zoom and view full transcriptions.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
                {store.archivalMedia.map((media) => (
                  <div
                    key={media.id}
                    onClick={() => setSelectedMedia(media)}
                    className="group cursor-pointer rounded-xl bg-white border border-parchment-border hover:border-archival-oxblood shadow-xs hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col"
                  >
                    <div className="relative w-full aspect-[4/3] bg-stone-900 overflow-hidden">
                      <Image
                        src={media.imageUrl}
                        alt={media.caption}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-black/70 backdrop-blur-xs text-[10px] font-mono text-white">
                        {media.mediaType.toUpperCase()}
                      </div>
                    </div>

                    <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                      <div className="space-y-1">
                        <h4 className="font-serif text-sm font-bold text-ink group-hover:text-archival-oxblood transition-colors line-clamp-2">
                          {media.caption}
                        </h4>
                        <p className="text-xs font-mono text-ink-muted">
                          {media.sourcePublication} · {media.publicationDate}
                        </p>
                      </div>

                      <span className="text-[11px] font-serif font-medium text-archival-oxblood group-hover:underline pt-2 block">
                        Examine clipping &amp; transcription →
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Lightbox for Selected Clipping */}
      {selectedMedia && (
        <ClippingLightbox
          media={selectedMedia}
          onClose={() => setSelectedMedia(null)}
        />
      )}
    </div>
  );
}
