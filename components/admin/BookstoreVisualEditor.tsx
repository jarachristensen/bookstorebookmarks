"use client";

import React, { useState, useRef, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BookstoreWithDetails, BookmarkWithDetails } from "@/lib/db/queries";
import { ArchivalMedia, CustomTimelineEvent } from "@/db/schema";
import { BookmarkInspector } from "@/components/exhibit/BookmarkInspector";
import { ClippingLightbox } from "@/components/exhibit/ClippingLightbox";
import {
  BookstoreHorizontalTimeline,
  TimelineEvent,
} from "@/components/bookstores/BookstoreHorizontalTimeline";
import { parseClippingFilename } from "@/lib/utils/clipping-parser";
import { compressImageIfNeeded } from "@/lib/utils/image-compressor";
import {
  MapPin,
  Calendar,
  ExternalLink,
  ArrowLeft,
  Newspaper,
  FileText,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Plus,
  Trash2,
  UploadCloud,
  Save,
  Loader2,
  CheckCircle2,
  Pencil,
  Eye,
  Camera,
  Globe,
  X,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { marked } from "marked";

export interface BookstoreVisualEditorProps {
  initialData: BookstoreWithDetails;
}

export function BookstoreVisualEditor({ initialData }: BookstoreVisualEditorProps) {
  const router = useRouter();

  // Basic Info Form State
  const [name, setName] = useState(initialData.name);
  const [city, setCity] = useState(initialData.city);
  const [stateProvince, setStateProvince] = useState(initialData.stateProvince || "");
  const [country, setCountry] = useState(initialData.country || "United States");
  const [streetAddress, setStreetAddress] = useState(initialData.streetAddress || "");
  const [yearOpened, setYearOpened] = useState<number | string>(initialData.yearOpened);
  const [yearClosed, setYearClosed] = useState<number | string>(initialData.yearClosed || "");
  const [isStillOperating, setIsStillOperating] = useState(initialData.isStillOperating);
  const [websiteUrl, setWebsiteUrl] = useState(initialData.websiteUrl || "");
  const [historicalBlurb, setHistoricalBlurb] = useState(initialData.historicalBlurb || "");
  const [isEditingBlurb, setIsEditingBlurb] = useState(false);

  // Archival Media (Storefront Photos & Clippings)
  const [mediaList, setMediaList] = useState<ArchivalMedia[]>(initialData.archivalMedia || []);
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);

  // Storefront Upload Modal State
  const [isStorefrontModalOpen, setIsStorefrontModalOpen] = useState(false);
  const [storefrontUploadFile, setStorefrontUploadFile] = useState<File | null>(null);
  const [storefrontPreviewUrl, setStorefrontPreviewUrl] = useState<string>("");
  const [storefrontYear, setStorefrontYear] = useState<string>(String(initialData.yearOpened || ""));
  const [storefrontCaption, setStorefrontCaption] = useState<string>("Historic Storefront & Shop Exterior");
  const [isUploadingStorefront, setIsUploadingStorefront] = useState(false);

  // Timeline Events State
  const [timelineEvents, setTimelineEvents] = useState<CustomTimelineEvent[]>(() => {
    if (initialData.timelineEvents) {
      try {
        return JSON.parse(initialData.timelineEvents);
      } catch {}
    }
    // Initial compilation from base bookstore data
    const initialEvents: CustomTimelineEvent[] = [
      {
        id: `ev-init-founding`,
        year: initialData.yearOpened,
        label: "Grand Opening",
        description: initialData.streetAddress
          ? `${initialData.streetAddress}, ${initialData.city}`
          : `Established in ${initialData.city}`,
        type: "opening",
      },
    ];

    // Add media with dates
    initialData.archivalMedia.forEach((m, idx) => {
      if (m.publicationDate) {
        const yearMatch = m.publicationDate.match(/\b(18\d{2}|19\d{2}|20\d{2})\b/);
        if (yearMatch) {
          initialEvents.push({
            id: `ev-init-media-${m.id || idx}`,
            year: parseInt(yearMatch[0], 10),
            label: m.sourcePublication || "Press Clipping",
            description: m.caption || "Archival Press Feature",
            mediaId: m.id,
            type: "press",
          });
        }
      }
    });

    // Add closure if applicable
    if (!initialData.isStillOperating && initialData.yearClosed) {
      initialEvents.push({
        id: `ev-init-closure`,
        year: initialData.yearClosed,
        label: "Bookstore Closed",
        description: `Closed doors after ${initialData.yearClosed - initialData.yearOpened} years`,
        type: "closure",
      });
    }

    return initialEvents.sort((a, b) => a.year - b.year);
  });

  // Timeline Event Modal (Add / Edit)
  const [eventModalOpen, setEventModalOpen] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [eventYear, setEventYear] = useState<string>("");
  const [eventLabel, setEventLabel] = useState<string>("");
  const [eventDescription, setEventDescription] = useState<string>("");
  const [eventMediaId, setEventMediaId] = useState<string>("");

  // Bulk Upload for Clippings
  const [isBulkUploading, setIsBulkUploading] = useState(false);
  const [bulkStatus, setBulkStatus] = useState<string>("");
  const bulkInputRef = useRef<HTMLInputElement>(null);

  // Saving State
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string>("");

  // Modals for Bookmark flip & Lightbox
  const [selectedBookmark, setSelectedBookmark] = useState<BookmarkWithDetails | null>(null);
  const [selectedLightboxMedia, setSelectedLightboxMedia] = useState<ArchivalMedia | null>(null);

  // Filter Storefront vs Press Clippings
  const storefrontPhotos = useMemo(
    () => mediaList.filter((m) => m.isStorefront || m.mediaType === "photo"),
    [mediaList]
  );
  const currentPhoto = storefrontPhotos[activePhotoIdx] || storefrontPhotos[0] || null;

  const pressClippings = useMemo(
    () => mediaList.filter((m) => !m.isStorefront),
    [mediaList]
  );

  // Helper to update current storefront image metadata
  const updateCurrentStorefrontMeta = (field: "publicationDate" | "caption", value: string) => {
    if (!currentPhoto) return;
    setMediaList((prev) =>
      prev.map((m) => (m.id === currentPhoto.id ? { ...m, [field]: value } : m))
    );
  };

  // Helper to remove a storefront photo
  const removeStorefrontPhoto = (id: string) => {
    setMediaList((prev) => prev.filter((m) => m.id !== id));
    if (activePhotoIdx > 0) setActivePhotoIdx(activePhotoIdx - 1);
  };

  // Handle Storefront File Selection
  const handleStorefrontFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setStorefrontUploadFile(file);

    // Parse year if found in filename
    const yearMatch = file.name.match(/\b(18\d{2}|19\d{2}|20\d{2})\b/);
    if (yearMatch) {
      setStorefrontYear(yearMatch[0]);
    }

    const compressed = await compressImageIfNeeded(file);
    const reader = new FileReader();
    reader.onload = () => {
      setStorefrontPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(compressed);
  };

  // Upload & Attach Storefront Photo
  const handleUploadStorefront = async () => {
    if (!storefrontUploadFile && !storefrontPreviewUrl) return;
    setIsUploadingStorefront(true);

    try {
      let finalUrl = storefrontPreviewUrl;

      if (storefrontUploadFile) {
        const formData = new FormData();
        const compressed = await compressImageIfNeeded(storefrontUploadFile);
        formData.append("file", compressed);

        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        if (res.ok) {
          const data = await res.json();
          finalUrl = data.url;
        }
      }

      const newPhoto: ArchivalMedia = {
        id: `media-sf-${Date.now()}`,
        bookstoreId: initialData.id,
        mediaType: "photo",
        imageUrl: finalUrl,
        caption: storefrontCaption || "Historic Storefront",
        sourcePublication: null,
        publicationDate: storefrontYear || null,
        transcriptionText: null,
        isStorefront: true,
        mediaTag: "storefront",
        displayOrder: 0,
        createdAt: new Date().toISOString(),
      };

      setMediaList((prev) => [newPhoto, ...prev]);
      setIsStorefrontModalOpen(false);
      setStorefrontUploadFile(null);
      setStorefrontPreviewUrl("");
      setActivePhotoIdx(0);
    } catch (err) {
      console.error("Storefront upload failed", err);
    } finally {
      setIsUploadingStorefront(false);
    }
  };

  // Handle Bulk Upload for Press Clippings & Photos
  const handleBulkMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsBulkUploading(true);
    setBulkStatus(`Preparing to upload ${files.length} archival items...`);

    const uploadedItems: ArchivalMedia[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setBulkStatus(`Uploading & analyzing ${i + 1} of ${files.length}: ${file.name}`);

      try {
        const parsed = parseClippingFilename(file.name);
        const compressed = await compressImageIfNeeded(file);

        const formData = new FormData();
        formData.append("file", compressed);

        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        let imageUrl = "";
        if (res.ok) {
          const data = await res.json();
          imageUrl = data.url;
        } else {
          // Fallback to data url
          imageUrl = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.readAsDataURL(compressed);
          });
        }

        uploadedItems.push({
          id: `media-bulk-${Date.now()}-${i}`,
          bookstoreId: initialData.id,
          mediaType: parsed.sourcePublication ? "newspaper" : "photo",
          imageUrl: imageUrl,
          caption: parsed.caption || file.name,
          sourcePublication: parsed.sourcePublication || null,
          publicationDate: parsed.publicationDate || null,
          transcriptionText: null,
          isStorefront: false,
          mediaTag: null,
          displayOrder: mediaList.length + i,
          createdAt: new Date().toISOString(),
        });
      } catch (err) {
        console.error(`Failed to process ${file.name}:`, err);
      }
    }

    setMediaList((prev) => [...prev, ...uploadedItems]);
    setIsBulkUploading(false);
    setBulkStatus(`Successfully added ${uploadedItems.length} archival items!`);
    setTimeout(() => setBulkStatus(""), 4000);
    if (bulkInputRef.current) bulkInputRef.current.value = "";
  };

  // Timeline Event Management
  const openAddEventModal = () => {
    setEditingEventId(null);
    setEventYear(String(yearOpened || "1950"));
    setEventLabel("");
    setEventDescription("");
    setEventMediaId("");
    setEventModalOpen(true);
  };

  const openEditEventModal = (ev: TimelineEvent) => {
    setEditingEventId(ev.id);
    setEventYear(String(ev.year));
    setEventLabel(ev.label);
    setEventDescription(ev.description);
    setEventMediaId(ev.mediaId || (ev.media ? ev.media.id : ""));
    setEventModalOpen(true);
  };

  const handleSaveEvent = () => {
    if (!eventYear || !eventDescription.trim()) return;

    const parsedYear = parseInt(eventYear, 10) || 1950;
    const selectedMedia = mediaList.find((m) => m.id === eventMediaId) || null;

    if (editingEventId) {
      // Update existing
      setTimelineEvents((prev) =>
        prev
          .map((ev) =>
            ev.id === editingEventId
              ? {
                  ...ev,
                  year: parsedYear,
                  label: eventLabel.trim() || eventDescription.trim(),
                  description: eventDescription.trim(),
                  mediaId: eventMediaId || undefined,
                  mediaUrl: selectedMedia?.imageUrl,
                  mediaCaption: selectedMedia?.caption,
                }
              : ev
          )
          .sort((a, b) => a.year - b.year)
      );
    } else {
      // Add new
      const newEv: CustomTimelineEvent = {
        id: `ev-custom-${Date.now()}`,
        year: parsedYear,
        label: eventLabel.trim() || eventDescription.trim(),
        description: eventDescription.trim(),
        mediaId: eventMediaId || undefined,
        mediaUrl: selectedMedia?.imageUrl,
        mediaCaption: selectedMedia?.caption,
        type: "milestone",
      };

      setTimelineEvents((prev) => [...prev, newEv].sort((a, b) => a.year - b.year));
    }

    setEventModalOpen(false);
  };

  const handleDeleteEvent = (id: string) => {
    setTimelineEvents((prev) => prev.filter((ev) => ev.id !== id));
  };

  // Save All Changes to Database
  const handleSaveAll = async () => {
    setIsSaving(true);
    setSaveError("");
    setSaveSuccess(false);

    try {
      const payload = {
        bookstore: {
          id: initialData.id,
          name: name.trim(),
          city: city.trim(),
          stateProvince: stateProvince.trim() || null,
          country: country.trim(),
          streetAddress: streetAddress.trim() || null,
          yearOpened: Number(yearOpened) || 1900,
          yearClosed: isStillOperating ? null : Number(yearClosed) || null,
          isStillOperating: isStillOperating,
          websiteUrl: websiteUrl.trim() || null,
          historicalBlurb: historicalBlurb.trim(),
          timelineEvents: timelineEvents,
        },
        archivalMedia: mediaList,
      };

      const res = await fetch(`/api/bookstores/${initialData.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to save dossier");
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
      router.refresh();
    } catch (err: any) {
      setSaveError(err.message || "Failed to save bookstore");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-24">
      {/* 1. Top Action & Navigation Bar */}
      <div className="sticky top-2 z-30 flex items-center justify-between p-3.5 bg-white/95 backdrop-blur-md border border-parchment-border rounded-2xl shadow-md">
        <div className="flex items-center gap-3">
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 text-xs font-serif text-ink-muted hover:text-ink transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Curator's Cabinet</span>
          </Link>
          <span className="text-stone-300">|</span>
          <Link
            href={`/bookstores/${initialData.id}`}
            target="_blank"
            className="inline-flex items-center gap-1 text-xs font-serif text-archival-oxblood hover:underline font-semibold"
          >
            <span>View Public Page</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>

        <div className="flex items-center gap-3">
          {saveSuccess && (
            <span className="inline-flex items-center gap-1.5 text-xs font-serif font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 animate-fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Dossier Saved!</span>
            </span>
          )}

          {saveError && (
            <span className="text-xs font-serif text-rose-700 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200">
              {saveError}
            </span>
          )}

          <Button
            onClick={handleSaveAll}
            disabled={isSaving}
            className="bg-archival-oxblood hover:bg-rose-950 text-white shadow-sm gap-1.5"
            size="sm"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>Save All Changes</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* 2. Editable Bookstore Masthead Header */}
      <div className="p-6 sm:p-8 rounded-2xl bg-white border border-parchment-border shadow-xs space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
          {/* Bookstore Name & Status */}
          <div className="flex-1 space-y-3">
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-ink-muted mb-1">
                Bookstore Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Bookstore Name"
                className="font-serif text-2xl sm:text-3xl font-bold text-ink w-full px-3 py-1.5 bg-parchment-light border border-parchment-border rounded-xl focus:outline-none focus:border-archival-oxblood"
              />
            </div>

            {/* Operating Status Toggle */}
            <div className="flex items-center gap-3 pt-1">
              <span className="text-xs font-mono uppercase tracking-wider text-ink-muted">Status:</span>
              <div className="inline-flex rounded-xl bg-parchment-light p-1 border border-parchment-border">
                <button
                  type="button"
                  onClick={() => setIsStillOperating(true)}
                  className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                    isStillOperating
                      ? "bg-[#0f766e] text-white shadow-xs"
                      : "text-ink-muted hover:text-ink"
                  }`}
                >
                  STILL OPERATING
                </button>
                <button
                  type="button"
                  onClick={() => setIsStillOperating(false)}
                  className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                    !isStillOperating
                      ? "bg-stone-900 text-stone-200 shadow-xs"
                      : "text-ink-muted hover:text-ink"
                  }`}
                >
                  CLOSED
                </button>
              </div>

              {!isStillOperating && (
                <div className="flex items-center gap-1.5 ml-2">
                  <span className="text-xs font-mono text-ink-muted">Closed Year:</span>
                  <input
                    type="number"
                    value={yearClosed}
                    onChange={(e) => setYearClosed(e.target.value)}
                    placeholder="e.g. 2007"
                    className="w-24 px-2.5 py-1 text-xs font-mono bg-parchment-light border border-parchment-border rounded-lg text-ink focus:outline-none focus:border-archival-oxblood"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Location & Year Founded Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 shrink-0 lg:max-w-md">
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-wider text-ink-muted mb-1">
                Year Opened *
              </label>
              <input
                type="number"
                value={yearOpened}
                onChange={(e) => setYearOpened(e.target.value)}
                placeholder="1920"
                className="w-full px-3 py-1.5 text-xs font-mono bg-parchment-light border border-parchment-border rounded-xl text-ink focus:outline-none focus:border-archival-oxblood"
              />
            </div>

            <div>
              <label className="block text-[10px] font-mono uppercase tracking-wider text-ink-muted mb-1">
                City *
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="San Francisco"
                className="w-full px-3 py-1.5 text-xs font-serif bg-parchment-light border border-parchment-border rounded-xl text-ink focus:outline-none focus:border-archival-oxblood"
              />
            </div>

            <div>
              <label className="block text-[10px] font-mono uppercase tracking-wider text-ink-muted mb-1">
                State / Prov
              </label>
              <input
                type="text"
                value={stateProvince}
                onChange={(e) => setStateProvince(e.target.value)}
                placeholder="CA"
                className="w-full px-3 py-1.5 text-xs font-serif bg-parchment-light border border-parchment-border rounded-xl text-ink focus:outline-none focus:border-archival-oxblood"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[10px] font-mono uppercase tracking-wider text-ink-muted mb-1">
                Primary Street Address
              </label>
              <input
                type="text"
                value={streetAddress}
                onChange={(e) => setStreetAddress(e.target.value)}
                placeholder="261 Columbus Ave"
                className="w-full px-3 py-1.5 text-xs font-serif bg-parchment-light border border-parchment-border rounded-xl text-ink focus:outline-none focus:border-archival-oxblood"
              />
            </div>

            <div>
              <label className="block text-[10px] font-mono uppercase tracking-wider text-ink-muted mb-1">
                Website URL
              </label>
              <input
                type="url"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                placeholder="https://..."
                className="w-full px-3 py-1.5 text-xs font-mono bg-parchment-light border border-parchment-border rounded-xl text-ink focus:outline-none focus:border-archival-oxblood"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 3. Hero Showcase: Storefront Photo (Left) & Cataloged Bookmarks (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Storefront Photo & Storefront Management */}
        <div className="lg:col-span-7 flex flex-col items-center space-y-3">
          <div className="relative w-full rounded-2xl bg-stone-900 border border-parchment-border overflow-hidden shadow-xs flex items-center justify-center p-2 sm:p-3">
            {currentPhoto ? (
              <div className="relative w-full h-[320px] sm:h-[400px] flex items-center justify-center">
                <Image
                  src={currentPhoto.imageUrl}
                  alt={currentPhoto.caption || `${name} Storefront`}
                  fill
                  unoptimized
                  className="object-contain object-center"
                />

                {/* Carousel navigation */}
                {storefrontPhotos.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={() =>
                        setActivePhotoIdx((prev) => (prev - 1 + storefrontPhotos.length) % storefrontPhotos.length)
                      }
                      aria-label="Previous photo"
                      className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 hover:bg-black/80 text-white border border-white/20 transition-all cursor-pointer shadow-md"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setActivePhotoIdx((prev) => (prev + 1) % storefrontPhotos.length)
                      }
                      aria-label="Next photo"
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 hover:bg-black/80 text-white border border-white/20 transition-all cursor-pointer shadow-md"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </>
                )}

                {/* Remove current storefront photo button */}
                <button
                  type="button"
                  onClick={() => removeStorefrontPhoto(currentPhoto.id)}
                  title="Remove this photo from storefronts"
                  className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/70 hover:bg-rose-900 text-white border border-white/20 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="w-full h-72 flex flex-col items-center justify-center text-xs font-serif text-stone-400 italic gap-2">
                <Camera className="w-8 h-8 text-stone-500" />
                <span>No storefront photo attached yet</span>
              </div>
            )}
          </div>

          {/* Storefront Details (Year & Caption) & Add Storefront Button */}
          <div className="w-full p-4 rounded-xl bg-white border border-parchment-border shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
            {currentPhoto ? (
              <div className="flex flex-1 items-center gap-2 w-full">
                <div className="w-28">
                  <label className="block text-[9px] font-mono text-ink-muted uppercase">Photo Year</label>
                  <input
                    type="text"
                    value={currentPhoto.publicationDate || ""}
                    onChange={(e) => updateCurrentStorefrontMeta("publicationDate", e.target.value)}
                    placeholder="e.g. 1950"
                    className="w-full px-2 py-1 text-xs font-mono bg-parchment-light border border-parchment-border rounded-lg"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-[9px] font-mono text-ink-muted uppercase">Caption / Note</label>
                  <input
                    type="text"
                    value={currentPhoto.caption || ""}
                    onChange={(e) => updateCurrentStorefrontMeta("caption", e.target.value)}
                    placeholder="Storefront exterior"
                    className="w-full px-2 py-1 text-xs font-serif bg-parchment-light border border-parchment-border rounded-lg"
                  />
                </div>
              </div>
            ) : (
              <span className="text-xs font-serif text-ink-muted italic">Add a storefront photo to showcase on the dossier.</span>
            )}

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsStorefrontModalOpen(true)}
              className="gap-1.5 shrink-0 border-archival-oxblood/30 text-archival-oxblood hover:bg-rose-50"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Storefront</span>
            </Button>
          </div>
        </div>

        {/* Right Column: Cataloged Bookmarks (~42%) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between border-b border-parchment-border pb-2">
            <h2 className="font-serif text-lg font-bold text-ink flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-archival-oxblood" />
              <span>Cataloged Bookmarks</span>
            </h2>
            <span className="text-xs font-mono text-ink-muted">
              {initialData.bookmarks.length} {initialData.bookmarks.length === 1 ? "Specimen" : "Specimens"}
            </span>
          </div>

          {initialData.bookmarks.length === 0 ? (
            <div className="p-8 text-center rounded-xl bg-white border border-parchment-border text-xs font-serif text-ink-muted italic">
              No bookmark specimens cataloged yet for this bookstore. Upload bookmarks via the main uploader.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-1">
              {initialData.bookmarks.map((bm) => (
                <button
                  key={bm.id}
                  type="button"
                  onClick={() => setSelectedBookmark({ ...bm, bookstore: initialData })}
                  className="group flex flex-col items-center text-center cursor-pointer p-2 rounded-xl bg-white hover:bg-parchment/60 border border-parchment-border hover:border-archival-oxblood/40 shadow-2xs hover:shadow-sm transition-all"
                >
                  <div className="relative w-full h-44 sm:h-52 mb-2 flex items-center justify-center overflow-hidden">
                    <Image
                      src={bm.frontImageUrl}
                      alt={bm.title}
                      fill
                      unoptimized
                      className="object-contain object-center group-hover:scale-105 transition-transform duration-200"
                    />
                  </div>
                  <h4 className="font-serif text-xs font-bold text-ink group-hover:text-archival-oxblood transition-colors line-clamp-1 w-full">
                    {bm.title}
                  </h4>
                  <span className="font-mono text-[11px] text-ink-muted mt-0.5">
                    {bm.dimensions}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 4. Timeline Section (With Interactive In-Place Edit Controls) */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="font-serif text-sm font-mono font-bold uppercase tracking-wider text-archival-oxblood">
              Timeline
            </h2>
            <span className="text-xs font-serif text-ink-muted italic hidden sm:inline">
              Edit milestones directly or click "+ Add an Event"
            </span>
          </div>

          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={openAddEventModal}
            className="gap-1.5 border-archival-oxblood/40 text-archival-oxblood hover:bg-rose-50"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add an Event</span>
          </Button>
        </div>

        <BookstoreHorizontalTimeline
          bookstore={{ ...initialData, archivalMedia: mediaList }}
          customEvents={timelineEvents}
          isEditable={true}
          onEditEvent={openEditEventModal}
          onDeleteEvent={handleDeleteEvent}
        />
      </section>

      {/* 5. Lower Section: Historical Narrative & Archival Press Gallery */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Bookstore History Narrative */}
        <div className="lg:col-span-7 space-y-4">
          <section className="p-6 sm:p-8 rounded-2xl bg-white border border-parchment-border shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-parchment-border pb-3">
              <h2 className="font-serif text-xl font-bold text-ink flex items-center gap-2">
                <FileText className="w-5 h-5 text-archival-oxblood" />
                <span>Bookstore History</span>
              </h2>

              <button
                type="button"
                onClick={() => setIsEditingBlurb(!isEditingBlurb)}
                className="inline-flex items-center gap-1.5 text-xs font-serif font-bold text-archival-oxblood hover:underline cursor-pointer"
              >
                {isEditingBlurb ? (
                  <>
                    <Eye className="w-3.5 h-3.5" />
                    <span>Preview Story</span>
                  </>
                ) : (
                  <>
                    <Pencil className="w-3.5 h-3.5" />
                    <span>Edit History Text</span>
                  </>
                )}
              </button>
            </div>

            {isEditingBlurb ? (
              <div className="space-y-2">
                <textarea
                  value={historicalBlurb}
                  onChange={(e) => setHistoricalBlurb(e.target.value)}
                  rows={12}
                  placeholder="Write the historical narrative and cultural background of the bookstore (Markdown supported)..."
                  className="w-full p-4 text-sm font-serif bg-parchment-light border border-parchment-border rounded-xl text-ink focus:outline-none focus:border-archival-oxblood leading-relaxed"
                />
                <p className="text-[11px] font-mono text-ink-muted">
                  Supports Markdown headings (`###`), bold (`**bold**`), italics, and blockquotes.
                </p>
              </div>
            ) : (
              <div
                className="font-serif text-sm sm:text-base text-ink-light leading-relaxed prose prose-stone max-w-none"
                dangerouslySetInnerHTML={{
                  __html: marked.parse(historicalBlurb || "*No historical narrative provided yet. Click 'Edit History Text' to add one.*") as string,
                }}
              />
            )}
          </section>
        </div>

        {/* Right Column: Press & Clippings Section with Bulk Dropzone & In-Place Editing */}
        <div className="lg:col-span-5 space-y-4">
          <section className="p-6 rounded-2xl bg-white border border-parchment-border shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-parchment-border pb-3">
              <div>
                <h2 className="font-serif text-base font-bold text-ink flex items-center gap-2">
                  <Newspaper className="w-4 h-4 text-archival-oxblood" />
                  <span>Press &amp; Clippings</span>
                </h2>
                <span className="text-xs font-mono text-ink-muted">
                  {pressClippings.length} {pressClippings.length === 1 ? "Item" : "Items"}
                </span>
              </div>

              {/* Bulk Upload Button */}
              <div>
                <input
                  ref={bulkInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleBulkMediaUpload}
                  className="hidden"
                  id="bulk-clipping-upload"
                />
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => bulkInputRef.current?.click()}
                  disabled={isBulkUploading}
                  className="gap-1 text-xs border-archival-oxblood/30 text-archival-oxblood hover:bg-rose-50"
                >
                  {isBulkUploading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <UploadCloud className="w-3.5 h-3.5" />
                  )}
                  <span>Upload More</span>
                </Button>
              </div>
            </div>

            {bulkStatus && (
              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-serif text-emerald-800 flex items-center gap-2">
                <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
                <span>{bulkStatus}</span>
              </div>
            )}

            {/* List of Press Clippings with in-place name/date editing */}
            {pressClippings.length === 0 ? (
              <div className="p-6 text-center rounded-xl bg-parchment-light border border-dashed border-parchment-border text-xs font-serif text-ink-muted italic">
                No press clippings attached yet. Click "Upload More" to drop in newspaper scans or articles.
              </div>
            ) : (
              <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
                {pressClippings.map((media) => (
                  <div
                    key={media.id}
                    className="p-3 rounded-xl border border-parchment-border bg-parchment/30 space-y-2"
                  >
                    <div className="flex items-start gap-3">
                      <div className="relative w-16 h-16 rounded bg-stone-100 overflow-hidden shrink-0 border border-parchment-border">
                        <Image
                          src={media.imageUrl}
                          alt={media.caption}
                          fill
                          unoptimized
                          className="object-cover"
                        />
                      </div>

                      <div className="flex-1 space-y-1 min-w-0">
                        <input
                          type="text"
                          value={media.caption}
                          onChange={(e) => {
                            const val = e.target.value;
                            setMediaList((prev) =>
                              prev.map((m) => (m.id === media.id ? { ...m, caption: val } : m))
                            );
                          }}
                          placeholder="Article title / Caption"
                          className="w-full px-2 py-1 text-xs font-serif font-bold text-ink bg-white border border-parchment-border rounded-lg"
                        />

                        <div className="grid grid-cols-2 gap-1.5">
                          <input
                            type="text"
                            value={media.sourcePublication || ""}
                            onChange={(e) => {
                              const val = e.target.value;
                              setMediaList((prev) =>
                                prev.map((m) => (m.id === media.id ? { ...m, sourcePublication: val } : m))
                              );
                            }}
                            placeholder="e.g. NYT"
                            className="px-2 py-0.5 text-[11px] font-serif bg-white border border-parchment-border rounded-lg"
                          />
                          <input
                            type="text"
                            value={media.publicationDate || ""}
                            onChange={(e) => {
                              const val = e.target.value;
                              setMediaList((prev) =>
                                prev.map((m) => (m.id === media.id ? { ...m, publicationDate: val } : m))
                              );
                            }}
                            placeholder="e.g. 1955"
                            className="px-2 py-0.5 text-[11px] font-mono bg-white border border-parchment-border rounded-lg"
                          />
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setMediaList((prev) => prev.filter((m) => m.id !== media.id))}
                        title="Delete this clipping"
                        className="p-1 rounded-md text-stone-400 hover:text-rose-700 hover:bg-rose-50 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>

      {/* --- MODAL: Add Storefront Photo --- */}
      {isStorefrontModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="relative w-full max-w-lg bg-white border border-parchment-border rounded-2xl shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-parchment-border pb-3">
              <h3 className="font-serif text-lg font-bold text-ink flex items-center gap-2">
                <Camera className="w-5 h-5 text-archival-oxblood" />
                <span>Add Storefront Photo</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsStorefrontModalOpen(false)}
                className="p-1 rounded-full text-stone-400 hover:text-ink cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {storefrontPreviewUrl ? (
                <div className="relative w-full h-48 rounded-xl bg-stone-900 overflow-hidden border border-parchment-border flex items-center justify-center">
                  <Image
                    src={storefrontPreviewUrl}
                    alt="Preview"
                    fill
                    unoptimized
                    className="object-contain"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setStorefrontPreviewUrl("");
                      setStorefrontUploadFile(null);
                    }}
                    className="absolute top-2 right-2 p-1 rounded bg-black/70 text-white hover:bg-rose-800"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <label className="border-2 border-dashed border-parchment-border hover:border-archival-oxblood rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer bg-parchment-light/50 hover:bg-parchment-light transition-all">
                  <UploadCloud className="w-8 h-8 text-archival-oxblood mb-2" />
                  <span className="font-serif text-sm font-bold text-ink">Choose Storefront Photo</span>
                  <span className="text-xs text-ink-muted font-mono mt-1">PNG, JPG, or WebP</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleStorefrontFileSelect}
                    className="hidden"
                  />
                </label>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono text-ink-muted uppercase mb-1">
                    Photo Year
                  </label>
                  <input
                    type="text"
                    value={storefrontYear}
                    onChange={(e) => setStorefrontYear(e.target.value)}
                    placeholder="e.g. 1950"
                    className="w-full px-3 py-1.5 text-xs font-mono bg-parchment-light border border-parchment-border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-ink-muted uppercase mb-1">
                    Caption
                  </label>
                  <input
                    type="text"
                    value={storefrontCaption}
                    onChange={(e) => setStorefrontCaption(e.target.value)}
                    placeholder="e.g. 1950 Storefront"
                    className="w-full px-3 py-1.5 text-xs font-serif bg-parchment-light border border-parchment-border rounded-lg"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-parchment-border">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsStorefrontModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleUploadStorefront}
                disabled={!storefrontPreviewUrl || isUploadingStorefront}
                className="bg-archival-oxblood hover:bg-rose-950 text-white"
              >
                {isUploadingStorefront ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Attach Storefront"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL: Add / Edit Timeline Event --- */}
      {eventModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-white border border-parchment-border rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-parchment-border pb-3">
              <h3 className="font-serif text-lg font-bold text-ink flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-archival-amber" />
                <span>{editingEventId ? "Edit Timeline Event" : "Add Timeline Event"}</span>
              </h3>
              <button
                type="button"
                onClick={() => setEventModalOpen(false)}
                className="p-1 rounded-full text-stone-400 hover:text-ink cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-mono text-ink-muted uppercase mb-1">
                  Year *
                </label>
                <input
                  type="number"
                  value={eventYear}
                  onChange={(e) => setEventYear(e.target.value)}
                  placeholder="e.g. 1960"
                  className="w-full px-3 py-1.5 text-sm font-mono bg-parchment-light border border-parchment-border rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-ink-muted uppercase mb-1">
                  Event Title / Description *
                </label>
                <input
                  type="text"
                  value={eventDescription}
                  onChange={(e) => setEventDescription(e.target.value)}
                  placeholder="e.g. Opened 2nd Location at 123 Fake Street"
                  className="w-full px-3 py-1.5 text-sm font-serif bg-parchment-light border border-parchment-border rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-ink-muted uppercase mb-1">
                  Link Archival Photo / Clipping (Optional)
                </label>
                <select
                  value={eventMediaId}
                  onChange={(e) => setEventMediaId(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-serif bg-parchment-light border border-parchment-border rounded-xl"
                >
                  <option value="">None / Text Only</option>
                  {mediaList.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.isStorefront ? "🏬 [Storefront] " : "📰 [Clipping] "}
                      {m.caption || m.sourcePublication || m.imageUrl}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-parchment-border">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setEventModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleSaveEvent}
                className="bg-archival-oxblood hover:bg-rose-950 text-white"
              >
                Save Event
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Bookmark Inspector Modal */}
      {selectedBookmark && (
        <BookmarkInspector
          bookmark={selectedBookmark}
          onClose={() => setSelectedBookmark(null)}
        />
      )}

      {/* Clipping Lightbox */}
      {selectedLightboxMedia && (
        <ClippingLightbox
          media={selectedLightboxMedia}
          onClose={() => setSelectedLightboxMedia(null)}
        />
      )}
    </div>
  );
}
