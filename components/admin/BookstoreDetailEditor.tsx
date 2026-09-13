"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { BookstoreWithDetails } from "@/lib/db/queries";
import { BookstoreLocation } from "@/db/schema";
import { MediaManager, MediaItem } from "@/components/admin/MediaManager";
import { Button } from "@/components/ui/Button";
import {
  Building2,
  Save,
  ArrowLeft,
  Plus,
  Trash2,
  MapPin,
  Calendar,
  Navigation,
  ArrowRight,
  ExternalLink,
  Sparkles,
  FileText,
  Eye,
  Edit3,
  Network,
} from "lucide-react";
import { marked } from "marked";

export interface BookstoreDetailEditorProps {
  initialData?: BookstoreWithDetails;
  isEditing?: boolean;
}

export function BookstoreDetailEditor({
  initialData,
  isEditing = false,
}: BookstoreDetailEditorProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const paramFlagshipId = searchParams?.get("flagshipId") || "";
  const paramChainName = searchParams?.get("chainName") || "";

  const [allStores, setAllStores] = useState<BookstoreWithDetails[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [blurbTab, setBlurbTab] = useState<"edit" | "preview">("edit");

  useEffect(() => {
    fetch("/api/bookstores")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setAllStores(data);
        }
      })
      .catch((err) => console.error("Error fetching bookstores list:", err));
  }, []);

  // Parse locations or initialize with default
  const getInitialLocations = (): BookstoreLocation[] => {
    if (initialData?.locations) {
      try {
        const parsed = JSON.parse(initialData.locations);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {}
    }
    if (initialData?.streetAddress) {
      return [
        {
          id: `loc-${Date.now()}`,
          label: "1st Location",
          streetAddress: initialData.streetAddress,
          city: initialData.city,
          stateProvince: initialData.stateProvince || "",
          country: initialData.country || "United States",
          yearsActive: `${initialData.yearOpened}–${initialData.isStillOperating ? "Present" : initialData.yearClosed || ""}`,
          isMovedFrom: false,
          isCurrent: initialData.isStillOperating,
        },
      ];
    }
    return [
      {
        id: `loc-${Date.now()}`,
        label: "1st Location",
        streetAddress: "",
        city: initialData?.city || "",
        stateProvince: initialData?.stateProvince || "",
        country: initialData?.country || "United States",
        yearsActive: "",
        isMovedFrom: false,
        isCurrent: true,
      },
    ];
  };

  const [locations, setLocations] = useState<BookstoreLocation[]>(getInitialLocations());

  // Form state
  const [formData, setFormData] = useState({
    id: initialData?.id || "",
    name: initialData?.name || "",
    city: initialData?.city || "",
    stateProvince: initialData?.stateProvince || "",
    country: initialData?.country || "United States",
    streetAddress: initialData?.streetAddress || "",
    isFlagship: initialData?.isFlagship ?? false,
    flagshipId: initialData?.flagshipId || paramFlagshipId || "",
    chainName: initialData?.chainName || paramChainName || "",
    branchLabel:
      initialData?.branchLabel ||
      (paramFlagshipId ? "Branch Location" : initialData?.isFlagship ? "Flagship Location" : ""),
    yearOpened: initialData?.yearOpened?.toString() || "",
    yearClosed: initialData?.yearClosed?.toString() || "",
    isStillOperating: initialData?.isStillOperating || false,
    founders: initialData?.founders || "",
    specialties: initialData?.specialties
      ? JSON.parse(initialData.specialties).join(", ")
      : "",
    historicalBlurb:
      initialData?.historicalBlurb ||
      `### Bookstore Heritage & Cultural Story\n\nWrite your historical research blurb here...`,
    notablePatronsTrivia: initialData?.notablePatronsTrivia
      ? JSON.parse(initialData.notablePatronsTrivia).join("\n")
      : "",
    websiteUrl: initialData?.websiteUrl || "",
  });

  const [archivalMedia, setArchivalMedia] = useState<MediaItem[]>(
    initialData?.archivalMedia?.map((m) => ({
      id: m.id,
      mediaType: m.mediaType,
      imageUrl: m.imageUrl,
      caption: m.caption,
      sourcePublication: m.sourcePublication || undefined,
      publicationDate: m.publicationDate || undefined,
      transcriptionText: m.transcriptionText || undefined,
      isStorefront: m.isStorefront || false,
      mediaTag: m.mediaTag || undefined,
    })) || []
  );

  // Multi-location operations
  const addLocation = (isBranch = false) => {
    const nextIndex = locations.length + 1;
    const label = isBranch
      ? `New Location / Branch`
      : nextIndex === 2
      ? "2nd Location"
      : nextIndex === 3
      ? "3rd Location"
      : nextIndex === 4
      ? "4th Location"
      : `${nextIndex}th Location`;

    setLocations([
      ...locations,
      {
        id: `loc-${Date.now()}`,
        label,
        streetAddress: "",
        city: formData.city,
        stateProvince: formData.stateProvince,
        country: formData.country,
        yearsActive: "",
        isMovedFrom: false,
        isCurrent: true,
      },
    ]);
  };

  const updateLocation = (index: number, updated: Partial<BookstoreLocation>) => {
    const next = [...locations];
    next[index] = { ...next[index], ...updated };
    setLocations(next);
  };

  const removeLocation = (index: number) => {
    setLocations(locations.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const primaryLoc = locations[0];
      const payload = {
        bookstore: {
          id: formData.id || undefined,
          name: formData.name,
          city: primaryLoc?.city || formData.city,
          stateProvince: primaryLoc?.stateProvince || formData.stateProvince || null,
          country: primaryLoc?.country || formData.country || "United States",
          streetAddress: primaryLoc?.streetAddress || formData.streetAddress || null,
          locations: locations,
          isFlagship: formData.isFlagship,
          flagshipId: formData.isFlagship ? null : formData.flagshipId || null,
          chainName: formData.chainName.trim() || null,
          branchLabel: formData.branchLabel.trim() || null,
          yearOpened: parseInt(formData.yearOpened, 10) || 1900,
          yearClosed: formData.yearClosed ? parseInt(formData.yearClosed, 10) : null,
          isStillOperating: formData.isStillOperating,
          founders: formData.founders || null,
          specialties: formData.specialties
            .split(",")
            .map((s: string) => s.trim())
            .filter(Boolean),
          historicalBlurb: formData.historicalBlurb,
          notablePatronsTrivia: formData.notablePatronsTrivia
            .split("\n")
            .map((t: string) => t.trim())
            .filter(Boolean),
          websiteUrl: formData.websiteUrl || null,
        },
        archivalMedia: archivalMedia.map((m, idx) => ({
          ...m,
          displayOrder: idx,
        })),
      };

      const url = isEditing && initialData?.id
        ? `/api/bookstores/${initialData.id}`
        : `/api/bookstores`;

      const method = isEditing && initialData?.id ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to save bookstore dossier");
      }

      router.push("/admin");
      router.refresh();
    } catch (err: any) {
      console.error("Save bookstore error:", err);
      setError(err.message || "An error occurred while saving the bookstore dossier.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-8 max-w-5xl mx-auto pb-16"
      data-1p-ignore
      data-lpignore="true"
      data-bwignore="true"
      data-form-type="other"
      autoComplete="off"
    >
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E8E2D5]">
        <Link
          href="/admin"
          className="inline-flex items-center gap-1.5 text-xs font-serif text-stone-500 hover:text-[#2563EB] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Curator Dashboard</span>
        </Link>

        <div className="flex items-center gap-3">
          <Button
            type="submit"
            variant="oxblood"
            size="md"
            disabled={loading}
            className="font-serif flex items-center gap-2 bg-[#F43F7A] hover:bg-[#E11D48] text-white"
          >
            <Save className="w-4 h-4 text-amber-200" />
            <span>
              {loading
                ? "Saving Dossier..."
                : isEditing
                ? "Update Bookstore Dossier"
                : "Save Bookstore Dossier"}
            </span>
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-serif">
          {error}
        </div>
      )}

      {/* 1. Bookstore Identity & Core Information */}
      <section className="p-6 sm:p-8 rounded-2xl bg-white border border-[#E8E2D5] shadow-xs space-y-6">
        <div className="flex items-center gap-2 pb-3 border-b border-[#E8E2D5] text-sm font-mono font-bold text-[#F43F7A] uppercase tracking-wider">
          <Building2 className="w-4 h-4" />
          <span>1. Bookstore Identity &amp; Overview</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-mono text-stone-600 mb-1">
              BOOKSTORE NAME *
            </label>
            <input
              type="text"
              required
              data-1p-ignore
              autoComplete="off"
              placeholder="e.g. Gotham Book Mart"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-[#FAF8F5] border border-[#E8E2D5] rounded-lg text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 font-serif"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-stone-600 mb-1">
              PRIMARY CITY *
            </label>
            <input
              type="text"
              required
              data-1p-ignore
              autoComplete="off"
              placeholder="e.g. New York"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-[#FAF8F5] border border-[#E8E2D5] rounded-lg text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 font-serif"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-stone-600 mb-1">
              STATE / PROVINCE
            </label>
            <input
              type="text"
              data-1p-ignore
              autoComplete="off"
              placeholder="e.g. NY or Île-de-France"
              value={formData.stateProvince}
              onChange={(e) => setFormData({ ...formData, stateProvince: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-[#FAF8F5] border border-[#E8E2D5] rounded-lg text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 font-serif"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-stone-600 mb-1">
              COUNTRY *
            </label>
            <input
              type="text"
              required
              data-1p-ignore
              autoComplete="off"
              list="country-suggestions"
              placeholder="e.g. United States, United Kingdom, France"
              value={formData.country}
              onChange={(e) => setFormData({ ...formData, country: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-[#FAF8F5] border border-[#E8E2D5] rounded-lg text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 font-serif"
            />
            <datalist id="country-suggestions">
              <option value="United States" />
              <option value="United Kingdom" />
              <option value="France" />
              <option value="Canada" />
              <option value="Germany" />
              <option value="Japan" />
              <option value="Italy" />
              <option value="Spain" />
              <option value="Australia" />
              <option value="Ireland" />
              <option value="Scotland" />
              <option value="Netherlands" />
              <option value="Belgium" />
              <option value="Switzerland" />
              <option value="Austria" />
              <option value="Argentina" />
              <option value="Mexico" />
              <option value="Brazil" />
              <option value="Portugal" />
              <option value="Greece" />
              <option value="Sweden" />
              <option value="Norway" />
              <option value="Denmark" />
              <option value="India" />
              <option value="New Zealand" />
            </datalist>
          </div>

          <div>
            <label className="block text-xs font-mono text-stone-600 mb-1">
              YEAR OPENED (ESTABLISHED) *
            </label>
            <input
              type="number"
              required
              data-1p-ignore
              autoComplete="off"
              placeholder="e.g. 1920"
              value={formData.yearOpened}
              onChange={(e) => setFormData({ ...formData, yearOpened: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-[#FAF8F5] border border-[#E8E2D5] rounded-lg text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-stone-600 mb-1">
              YEAR CLOSED (LEAVE BLANK IF OPERATING)
            </label>
            <input
              type="number"
              data-1p-ignore
              autoComplete="off"
              placeholder="e.g. 2007"
              value={formData.yearClosed}
              disabled={formData.isStillOperating}
              onChange={(e) => setFormData({ ...formData, yearClosed: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-[#FAF8F5] border border-[#E8E2D5] rounded-lg text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 font-mono disabled:opacity-50"
            />
          </div>

          <div className="flex items-center gap-2 pt-6">
            <input
              type="checkbox"
              id="isStillOperatingStore"
              data-1p-ignore
              checked={formData.isStillOperating}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  isStillOperating: e.target.checked,
                  yearClosed: e.target.checked ? "" : formData.yearClosed,
                })
              }
              className="w-4 h-4 rounded text-[#10B981] border-[#E8E2D5] focus:ring-[#10B981]/30 cursor-pointer"
            />
            <label
              htmlFor="isStillOperatingStore"
              className="text-xs font-serif font-semibold text-stone-900 cursor-pointer"
            >
              Bookstore is Still Operating Today
            </label>
          </div>
        </div>
      </section>

      {/* 1.5 Chain & Flagship Network Configuration */}
      <section className="p-6 sm:p-8 rounded-2xl bg-white border border-[#E8E2D5] shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#E8E2D5]">
          <div className="flex items-center gap-2 text-sm font-mono font-bold text-[#2563EB] uppercase tracking-wider">
            <Network className="w-4 h-4" />
            <span>Chain Bookstore &amp; Flagship Network</span>
          </div>
          {isEditing && formData.isFlagship && formData.id && (
            <Link
              href={`/admin/bookstores/new?flagshipId=${formData.id}&chainName=${encodeURIComponent(formData.chainName || formData.name)}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-[#2563EB] border border-blue-200 hover:bg-blue-100 text-xs font-serif font-bold transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Add Branch Store to this Chain</span>
            </Link>
          )}
        </div>

        <p className="text-xs font-serif text-stone-500 italic">
          Configure whether this bookstore is a primary flagship store or an individual branch of a multi-store network (e.g. Borders, B. Dalton). Each branch maintains its own storefront diecut image and bookmarks while linking back to the flagship parent.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="sm:col-span-3 p-4 rounded-xl bg-[#FAF8F5] border border-[#E8E2D5] flex items-center justify-between gap-4">
            <div className="space-y-0.5">
              <label htmlFor="isFlagshipCheckbox" className="text-xs font-serif font-bold text-stone-900 cursor-pointer">
                Flagship Location (Primary / Original Storefront)
              </label>
              <p className="text-[11px] font-sans text-stone-500">
                Check this if this location is the historical flagship store for this chain.
              </p>
            </div>
            <input
              type="checkbox"
              id="isFlagshipCheckbox"
              data-1p-ignore
              checked={formData.isFlagship}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  isFlagship: e.target.checked,
                  flagshipId: e.target.checked ? "" : formData.flagshipId,
                  branchLabel: e.target.checked
                    ? "Flagship Location"
                    : formData.branchLabel === "Flagship Location"
                    ? ""
                    : formData.branchLabel,
                })
              }
              className="w-5 h-5 rounded text-[#2563EB] border-[#E8E2D5] focus:ring-[#2563EB]/30 cursor-pointer shrink-0"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-stone-600 mb-1">
              CHAIN / BRAND NAME (OPTIONAL)
            </label>
            <input
              type="text"
              data-1p-ignore
              autoComplete="off"
              placeholder="e.g. Borders Book Shop"
              value={formData.chainName}
              onChange={(e) => setFormData({ ...formData, chainName: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-[#FAF8F5] border border-[#E8E2D5] rounded-lg text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 font-serif"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-stone-600 mb-1">
              BRANCH DESCRIPTOR / SUBTITLE
            </label>
            <input
              type="text"
              data-1p-ignore
              autoComplete="off"
              placeholder="e.g. Ann Arbor Flagship, Chestnut Hill, State St."
              value={formData.branchLabel}
              onChange={(e) => setFormData({ ...formData, branchLabel: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-[#FAF8F5] border border-[#E8E2D5] rounded-lg text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 font-serif"
            />
          </div>

          {!formData.isFlagship && (
            <div>
              <label className="block text-xs font-mono text-stone-600 mb-1">
                PARENT FLAGSHIP BOOKSTORE
              </label>
              <select
                value={formData.flagshipId}
                onChange={(e) => setFormData({ ...formData, flagshipId: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-[#FAF8F5] border border-[#E8E2D5] rounded-lg text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 font-serif"
              >
                <option value="">(None / Independent Single Bookstore)</option>
                {allStores
                  .filter((s) => s.id !== formData.id)
                  .map((store) => (
                    <option key={store.id} value={store.id}>
                      {store.name} — {store.city}{store.stateProvince ? `, ${store.stateProvince}` : ""} {store.isFlagship ? "★ (Flagship)" : ""}
                    </option>
                  ))}
              </select>
            </div>
          )}
        </div>
      </section>

      {/* 2. Multi-Location & Relocation History Manager */}
      <section className="p-6 sm:p-8 rounded-2xl bg-white border border-[#E8E2D5] shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E8E2D5]">
          <div>
            <h2 className="font-serif text-sm font-mono font-bold text-[#F43F7A] uppercase tracking-wider flex items-center gap-2">
              <Navigation className="w-4 h-4" />
              <span>2. Multi-Location &amp; Relocation History</span>
            </h2>
            <p className="text-xs font-serif text-stone-500 italic pt-0.5">
              Record physical addresses across time, tag sequence (1st, 2nd, 3rd location), mark relocations, or add concurrent branches.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => addLocation(false)}
              className="text-xs font-serif flex items-center gap-1 bg-white border-[#E8E2D5]"
            >
              <Plus className="w-3.5 h-3.5 text-[#F43F7A]" />
              <span>Add Relocation</span>
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => addLocation(true)}
              className="text-xs font-serif flex items-center gap-1 bg-[#F59E0B]/10 border-[#F59E0B]/30 text-stone-900"
            >
              <Plus className="w-3.5 h-3.5 text-[#F59E0B]" />
              <span>Add Concurrent Branch</span>
            </Button>
          </div>
        </div>

        {/* Location Cards */}
        <div className="space-y-4">
          {locations.map((loc, index) => (
            <div
              key={loc.id || `loc-${index}`}
              className="p-5 rounded-xl border border-[#E8E2D5] bg-[#FAF8F5]/60 space-y-4 shadow-2xs"
            >
              <div className="flex items-center justify-between border-b border-[#E8E2D5] pb-2">
                <div className="flex items-center gap-2.5">
                  <span className="text-xs font-mono font-bold text-[#F43F7A]">
                    #{index + 1}
                  </span>

                  {/* Location Label Sequence Dropdown */}
                  <select
                    value={loc.label}
                    onChange={(e) => updateLocation(index, { label: e.target.value })}
                    className="text-xs font-serif font-bold bg-white border border-[#E8E2D5] rounded px-2.5 py-1 text-stone-900 focus:outline-none"
                  >
                    <option value="1st Location">1st Location (Original)</option>
                    <option value="2nd Location">2nd Location</option>
                    <option value="3rd Location">3rd Location</option>
                    <option value="4th Location">4th Location</option>
                    <option value="New Location / Branch">New Location / Branch</option>
                    <option value="Current Location">Current Location</option>
                  </select>

                  {/* Moved Checkbox */}
                  <label className="inline-flex items-center gap-1.5 text-xs font-serif text-stone-600 cursor-pointer pl-2">
                    <input
                      type="checkbox"
                      checked={loc.isMovedFrom || false}
                      onChange={(e) => updateLocation(index, { isMovedFrom: e.target.checked })}
                      className="w-3.5 h-3.5 rounded text-rose-700 border-[#E8E2D5] focus:ring-rose-700/30 cursor-pointer"
                    />
                    <span className={loc.isMovedFrom ? "font-bold text-rose-700" : ""}>
                      Relocated / Moved from this address
                    </span>
                  </label>
                </div>

                {locations.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeLocation(index)}
                    className="text-stone-400 hover:text-rose-700 transition-colors p-1 cursor-pointer"
                    title="Remove Location"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-mono text-stone-600 mb-1">
                    STREET ADDRESS *
                  </label>
                  <input
                    type="text"
                    required
                    data-1p-ignore
                    autoComplete="off"
                    placeholder="e.g. 123 Fake Street or 41 West 47th Street"
                    value={loc.streetAddress}
                    onChange={(e) => updateLocation(index, { streetAddress: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-[#E8E2D5] rounded-lg text-stone-900 focus:outline-none font-serif"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-stone-600 mb-1">
                    YEARS ACTIVE AT THIS ADDRESS
                  </label>
                  <input
                    type="text"
                    data-1p-ignore
                    autoComplete="off"
                    placeholder="e.g. 1950–1955"
                    value={loc.yearsActive || ""}
                    onChange={(e) => updateLocation(index, { yearsActive: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-[#E8E2D5] rounded-lg text-stone-900 focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-stone-600 mb-1">
                    CITY
                  </label>
                  <input
                    type="text"
                    data-1p-ignore
                    autoComplete="off"
                    placeholder="e.g. New York"
                    value={loc.city || formData.city}
                    onChange={(e) => updateLocation(index, { city: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-[#E8E2D5] rounded-lg text-stone-900 focus:outline-none font-serif"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-stone-600 mb-1">
                    STATE / PROVINCE
                  </label>
                  <input
                    type="text"
                    data-1p-ignore
                    autoComplete="off"
                    placeholder="e.g. NY"
                    value={loc.stateProvince || formData.stateProvince}
                    onChange={(e) => updateLocation(index, { stateProvince: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-[#E8E2D5] rounded-lg text-stone-900 focus:outline-none font-serif"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-stone-600 mb-1">
                    COUNTRY
                  </label>
                  <input
                    type="text"
                    data-1p-ignore
                    autoComplete="off"
                    placeholder="e.g. United States"
                    value={loc.country || formData.country}
                    onChange={(e) => updateLocation(index, { country: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-[#E8E2D5] rounded-lg text-stone-900 focus:outline-none font-serif"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Archival Photos, Storefront Hero & Press Clippings */}
      <section className="p-6 sm:p-8 rounded-2xl bg-white border border-[#E8E2D5] shadow-xs space-y-6">
        <div className="flex items-center gap-2 pb-3 border-b border-[#E8E2D5] text-sm font-mono font-bold text-[#F43F7A] uppercase tracking-wider">
          <Sparkles className="w-4 h-4 text-[#F59E0B]" />
          <span>3. Storefront Imagery &amp; Archival Press Media</span>
        </div>

        <MediaManager
          mediaList={archivalMedia}
          onChange={setArchivalMedia}
        />
      </section>

      {/* 4. Historical Dossier Blurb & Curatorial Lore */}
      <section className="p-6 sm:p-8 rounded-2xl bg-white border border-[#E8E2D5] shadow-xs space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-[#E8E2D5]">
          <div className="flex items-center gap-2 text-sm font-mono font-bold text-[#F43F7A] uppercase tracking-wider">
            <FileText className="w-4 h-4" />
            <span>4. Historical Narrative &amp; Cultural Lore</span>
          </div>

          <div className="inline-flex rounded-lg border border-[#E8E2D5] p-0.5 bg-[#FAF8F5] text-xs font-serif">
            <button
              type="button"
              onClick={() => setBlurbTab("edit")}
              className={`px-3 py-1 rounded-md flex items-center gap-1.5 transition-all cursor-pointer ${
                blurbTab === "edit"
                  ? "bg-white text-stone-900 font-semibold shadow-xs border border-[#E8E2D5]"
                  : "text-stone-500 hover:text-stone-900"
              }`}
            >
              <Edit3 className="w-3.5 h-3.5 text-[#2563EB]" />
              <span>Edit Markdown</span>
            </button>
            <button
              type="button"
              onClick={() => setBlurbTab("preview")}
              className={`px-3 py-1 rounded-md flex items-center gap-1.5 transition-all cursor-pointer ${
                blurbTab === "preview"
                  ? "bg-white text-stone-900 font-semibold shadow-xs border border-[#E8E2D5]"
                  : "text-stone-500 hover:text-stone-900"
              }`}
            >
              <Eye className="w-3.5 h-3.5 text-[#F59E0B]" />
              <span>Live Preview</span>
            </button>
          </div>
        </div>

        {blurbTab === "edit" ? (
          <div>
            <textarea
              rows={8}
              required
              data-1p-ignore
              autoComplete="off"
              value={formData.historicalBlurb}
              onChange={(e) => setFormData({ ...formData, historicalBlurb: e.target.value })}
              className="w-full px-4 py-3 text-sm bg-[#FAF8F5] border border-[#E8E2D5] rounded-xl text-stone-900 font-mono focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 leading-relaxed"
            />
          </div>
        ) : (
          <div
            className="p-6 rounded-xl bg-[#FAF8F5] border border-[#E8E2D5] font-serif text-sm text-stone-900 leading-relaxed prose prose-stone max-w-none"
            dangerouslySetInnerHTML={{
              __html: marked.parse(formData.historicalBlurb || "") as string,
            }}
          />
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div>
            <label className="block text-xs font-mono text-stone-600 mb-1">
              FOUNDERS &amp; PROPRIETORS
            </label>
            <input
              type="text"
              data-1p-ignore
              autoComplete="off"
              placeholder="e.g. Frances Steloff"
              value={formData.founders}
              onChange={(e) => setFormData({ ...formData, founders: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-[#FAF8F5] border border-[#E8E2D5] rounded-lg text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 font-serif"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-stone-600 mb-1">
              OFFICIAL WEBSITE OR ARCHIVE LINK
            </label>
            <input
              type="url"
              data-1p-ignore
              autoComplete="off"
              placeholder="https://..."
              value={formData.websiteUrl}
              onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-[#FAF8F5] border border-[#E8E2D5] rounded-lg text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 font-serif"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-stone-600 mb-1">
              SPECIALTIES (COMMA SEPARATED)
            </label>
            <input
              type="text"
              data-1p-ignore
              autoComplete="off"
              placeholder="e.g. Modernist Poetry, Radical Literature, Small Press"
              value={formData.specialties}
              onChange={(e) => setFormData({ ...formData, specialties: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-[#FAF8F5] border border-[#E8E2D5] rounded-lg text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 font-serif"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-stone-600 mb-1">
              NOTABLE PATRONS &amp; TRIVIA (ONE PER LINE)
            </label>
            <textarea
              rows={2}
              placeholder="e.g. James Joyce Society meetings\nAnarchist gatherings"
              value={formData.notablePatronsTrivia}
              onChange={(e) =>
                setFormData({ ...formData, notablePatronsTrivia: e.target.value })
              }
              className="w-full px-3 py-2 text-sm bg-[#FAF8F5] border border-[#E8E2D5] rounded-lg text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 font-serif"
            />
          </div>
        </div>
      </section>
    </form>
  );
}
