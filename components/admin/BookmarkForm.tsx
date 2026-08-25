"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ImageDropzone } from "./ImageDropzone";
import { MediaManager, MediaItem } from "./MediaManager";
import { MarkdownRenderer } from "@/components/exhibit/MarkdownRenderer";
import { Button } from "@/components/ui/Button";
import {
  Bookmark,
  Building2,
  Sparkles,
  Layers,
  Save,
  ArrowLeft,
  Eye,
  FileEdit,
  CheckCircle,
} from "lucide-react";
import Link from "next/link";

export interface BookmarkFormData {
  bookmark: {
    id?: string;
    title: string;
    accessionNo: string;
    frontImageUrl: string;
    backImageUrl: string;
    yearProduced: string | number;
    material: string;
    dimensions: string;
    condition: string;
    acquisitionDate: string;
    acquisitionNotes: string;
    isFeatured: boolean;
    displayOrder: number;
    accentColor: string;
  };
  bookstore: {
    id?: string;
    name: string;
    city: string;
    stateProvince: string;
    country: string;
    streetAddress: string;
    yearOpened: string | number;
    yearClosed: string | number;
    isStillOperating: boolean;
    founders: string;
    specialties: string; // comma-separated input
    historicalBlurb: string;
    notablePatronsTrivia: string; // newline-separated input
    websiteUrl: string;
  };
  archivalMedia: MediaItem[];
}

export interface BookmarkFormProps {
  initialData?: BookmarkFormData;
  isEditing?: boolean;
}

export function BookmarkForm({ initialData, isEditing = false }: BookmarkFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [blurbTab, setBlurbTab] = useState<"edit" | "preview">("edit");

  const [formData, setFormData] = useState<BookmarkFormData>(
    initialData || {
      bookmark: {
        title: "",
        accessionNo: `BM-${new Date().getFullYear()}-01`,
        frontImageUrl: "",
        backImageUrl: "",
        yearProduced: "",
        material: "Letterpress Heavy Cardstock",
        dimensions: "2.25\" × 7.5\"",
        condition: "Fine",
        acquisitionDate: "",
        acquisitionNotes: "",
        isFeatured: false,
        displayOrder: 0,
        accentColor: "#881337",
      },
      bookstore: {
        name: "",
        city: "",
        stateProvince: "",
        country: "United States",
        streetAddress: "",
        yearOpened: "",
        yearClosed: "",
        isStillOperating: false,
        founders: "",
        specialties: "Literature, Rare Books, Poetry",
        historicalBlurb: `### Bookstore Heritage & Cultural Story\n\nWrite your historical research blurb here...`,
        notablePatronsTrivia: "Famous author signing\nHistoric event",
        websiteUrl: "",
      },
      archivalMedia: [],
    }
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.bookmark.frontImageUrl) {
      setError("Please upload at least the front bookmark scan.");
      return;
    }

    if (!formData.bookmark.title || !formData.bookstore.name || !formData.bookstore.city) {
      setError("Please fill in the required title, bookstore name, and city fields.");
      return;
    }

    setLoading(true);

    try {
      // Parse specialties array and trivia array
      const specialtiesArray = formData.bookstore.specialties
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const triviaArray = formData.bookstore.notablePatronsTrivia
        .split("\n")
        .map((t) => t.trim())
        .filter(Boolean);

      const payload = {
        bookmark: {
          ...formData.bookmark,
          yearProduced: formData.bookmark.yearProduced
            ? Number(formData.bookmark.yearProduced)
            : null,
        },
        bookstore: {
          ...formData.bookstore,
          yearOpened: Number(formData.bookstore.yearOpened) || 1900,
          yearClosed: formData.bookstore.yearClosed
            ? Number(formData.bookstore.yearClosed)
            : null,
          specialties: specialtiesArray,
          notablePatronsTrivia: triviaArray,
        },
        archivalMedia: formData.archivalMedia,
      };

      const url = isEditing
        ? `/api/bookmarks/${formData.bookmark.id}`
        : "/api/bookmarks";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to save record");
      }

      router.push("/admin");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "An error occurred while saving.");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-5xl mx-auto space-y-8">
      {/* Top Bar Navigation & Save */}
      <div className="flex items-center justify-between pb-4 border-b border-parchment-border">
        <Link
          href="/admin"
          className="inline-flex items-center gap-1.5 text-xs font-serif text-ink-muted hover:text-ink transition-colors"
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
            className="font-serif flex items-center gap-2"
          >
            <Save className="w-4 h-4 text-amber-300" />
            <span>{loading ? "Cataloging..." : isEditing ? "Update Archive Record" : "Save New Bookmark & Dossier"}</span>
          </Button>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-serif">
          {error}
        </div>
      )}

      {/* 1. Bookmark Physical Specimen Section */}
      <div className="p-6 rounded-2xl bg-white border border-parchment-border shadow-xs space-y-6">
        <div className="flex items-center gap-2 pb-3 border-b border-parchment-border text-sm font-mono font-bold text-archival-oxblood uppercase tracking-wider">
          <Bookmark className="w-4 h-4" />
          <span>1. Bookmark Specimen &amp; Scans</span>
        </div>

        {/* Dual-Side Image Scanners */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <ImageDropzone
            label="Bookmark Front Scan"
            value={formData.bookmark.frontImageUrl}
            onChange={(url) =>
              setFormData({
                ...formData,
                bookmark: { ...formData.bookmark, frontImageUrl: url },
              })
            }
            aspectRatio="bookmark"
            required
          />

          <ImageDropzone
            label="Bookmark Verso / Back Scan (Optional)"
            value={formData.bookmark.backImageUrl || ""}
            onChange={(url) =>
              setFormData({
                ...formData,
                bookmark: { ...formData.bookmark, backImageUrl: url },
              })
            }
            aspectRatio="bookmark"
          />
        </div>

        {/* Bookmark Metadata Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-mono text-ink-light mb-1">
              BOOKMARK TITLE *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Gotham Book Mart 'Wise Men Fish Here' Letterpress Bookmark"
              value={formData.bookmark.title}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  bookmark: { ...formData.bookmark, title: e.target.value },
                })
              }
              className="w-full px-3 py-2 text-sm bg-parchment-light border border-parchment-border rounded-lg text-ink focus:outline-none font-serif"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-ink-light mb-1">
              ACCESSION NUMBER *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. BM-1934-NY-01"
              value={formData.bookmark.accessionNo}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  bookmark: { ...formData.bookmark, accessionNo: e.target.value },
                })
              }
              className="w-full px-3 py-2 text-sm bg-parchment-light border border-parchment-border rounded-lg text-ink focus:outline-none font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-ink-light mb-1">
              MATERIAL &amp; STOCK
            </label>
            <input
              type="text"
              placeholder="e.g. Letterpress Cream Cardstock"
              value={formData.bookmark.material}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  bookmark: { ...formData.bookmark, material: e.target.value },
                })
              }
              className="w-full px-3 py-2 text-sm bg-parchment-light border border-parchment-border rounded-lg text-ink focus:outline-none font-serif"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-ink-light mb-1">
              DIMENSIONS
            </label>
            <input
              type="text"
              placeholder={'e.g. 2.25" × 7.75"'}
              value={formData.bookmark.dimensions}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  bookmark: { ...formData.bookmark, dimensions: e.target.value },
                })
              }
              className="w-full px-3 py-2 text-sm bg-parchment-light border border-parchment-border rounded-lg text-ink focus:outline-none font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-ink-light mb-1">
              CONDITION GRADE
            </label>
            <input
              type="text"
              placeholder="e.g. Fine, Very Good, Aged Patina"
              value={formData.bookmark.condition}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  bookmark: { ...formData.bookmark, condition: e.target.value },
                })
              }
              className="w-full px-3 py-2 text-sm bg-parchment-light border border-parchment-border rounded-lg text-ink focus:outline-none font-serif"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-ink-light mb-1">
              YEAR PRODUCED (CIRCA)
            </label>
            <input
              type="number"
              placeholder="e.g. 1934"
              value={formData.bookmark.yearProduced}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  bookmark: { ...formData.bookmark, yearProduced: e.target.value },
                })
              }
              className="w-full px-3 py-2 text-sm bg-parchment-light border border-parchment-border rounded-lg text-ink focus:outline-none font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-ink-light mb-1">
              DATE ACQUIRED
            </label>
            <input
              type="date"
              value={formData.bookmark.acquisitionDate || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  bookmark: { ...formData.bookmark, acquisitionDate: e.target.value },
                })
              }
              className="w-full px-3 py-2 text-sm bg-parchment-light border border-parchment-border rounded-lg text-ink focus:outline-none font-mono"
            />
          </div>

          <div className="flex items-center gap-2 pt-6">
            <input
              type="checkbox"
              id="isFeatured"
              checked={formData.bookmark.isFeatured}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  bookmark: { ...formData.bookmark, isFeatured: e.target.checked },
                })
              }
              className="w-4 h-4 rounded text-archival-oxblood border-parchment-border focus:ring-amber-700/30"
            />
            <label htmlFor="isFeatured" className="text-xs font-serif font-semibold text-ink cursor-pointer">
              Highlight as Featured Key Piece
            </label>
          </div>
        </div>

        <div>
          <label className="block text-xs font-mono text-ink-light mb-1">
            CURATOR'S PROVENANCE &amp; ACQUISITION NOTES
          </label>
          <textarea
            rows={2}
            placeholder="e.g. Found inside a 1938 edition of Ulysses acquired in Greenwich Village..."
            value={formData.bookmark.acquisitionNotes || ""}
            onChange={(e) =>
              setFormData({
                ...formData,
                bookmark: { ...formData.bookmark, acquisitionNotes: e.target.value },
              })
            }
            className="w-full px-3 py-2 text-sm bg-parchment-light border border-parchment-border rounded-lg text-ink focus:outline-none font-serif"
          />
        </div>
      </div>

      {/* 2. Bookstore Research Profile & Narrative */}
      <div className="p-6 rounded-2xl bg-white border border-parchment-border shadow-xs space-y-6">
        <div className="flex items-center gap-2 pb-3 border-b border-parchment-border text-sm font-mono font-bold text-archival-oxblood uppercase tracking-wider">
          <Building2 className="w-4 h-4" />
          <span>2. Associated Bookstore Research Dossier</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-mono text-ink-light mb-1">
              BOOKSTORE NAME *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Gotham Book Mart"
              value={formData.bookstore.name}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  bookstore: { ...formData.bookstore, name: e.target.value },
                })
              }
              className="w-full px-3 py-2 text-sm bg-parchment-light border border-parchment-border rounded-lg text-ink focus:outline-none font-serif"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-ink-light mb-1">
              CITY *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. New York"
              value={formData.bookstore.city}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  bookstore: { ...formData.bookstore, city: e.target.value },
                })
              }
              className="w-full px-3 py-2 text-sm bg-parchment-light border border-parchment-border rounded-lg text-ink focus:outline-none font-serif"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-ink-light mb-1">
              STATE / PROVINCE
            </label>
            <input
              type="text"
              placeholder="e.g. NY"
              value={formData.bookstore.stateProvince || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  bookstore: { ...formData.bookstore, stateProvince: e.target.value },
                })
              }
              className="w-full px-3 py-2 text-sm bg-parchment-light border border-parchment-border rounded-lg text-ink focus:outline-none font-serif"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-ink-light mb-1">
              COUNTRY
            </label>
            <input
              type="text"
              placeholder="e.g. United States"
              value={formData.bookstore.country}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  bookstore: { ...formData.bookstore, country: e.target.value },
                })
              }
              className="w-full px-3 py-2 text-sm bg-parchment-light border border-parchment-border rounded-lg text-ink focus:outline-none font-serif"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-ink-light mb-1">
              STREET ADDRESS
            </label>
            <input
              type="text"
              placeholder="e.g. 41 West 47th Street"
              value={formData.bookstore.streetAddress || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  bookstore: { ...formData.bookstore, streetAddress: e.target.value },
                })
              }
              className="w-full px-3 py-2 text-sm bg-parchment-light border border-parchment-border rounded-lg text-ink focus:outline-none font-serif"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-ink-light mb-1">
              YEAR OPENED
            </label>
            <input
              type="number"
              placeholder="e.g. 1920"
              value={formData.bookstore.yearOpened}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  bookstore: { ...formData.bookstore, yearOpened: e.target.value },
                })
              }
              className="w-full px-3 py-2 text-sm bg-parchment-light border border-parchment-border rounded-lg text-ink focus:outline-none font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-ink-light mb-1">
              YEAR CLOSED (OR LEAVE BLANK IF OPEN)
            </label>
            <input
              type="number"
              placeholder="e.g. 2007"
              value={formData.bookstore.yearClosed || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  bookstore: { ...formData.bookstore, yearClosed: e.target.value },
                })
              }
              className="w-full px-3 py-2 text-sm bg-parchment-light border border-parchment-border rounded-lg text-ink focus:outline-none font-mono"
            />
          </div>

          <div className="flex items-center gap-2 pt-6">
            <input
              type="checkbox"
              id="isStillOperating"
              checked={formData.bookstore.isStillOperating}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  bookstore: { ...formData.bookstore, isStillOperating: e.target.checked },
                })
              }
              className="w-4 h-4 rounded text-archival-spruce border-parchment-border focus:ring-emerald-700/30"
            />
            <label htmlFor="isStillOperating" className="text-xs font-serif font-semibold text-ink cursor-pointer">
              Bookstore is Still Operating Today
            </label>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-mono text-ink-light mb-1">
              FOUNDERS &amp; KEY FIGURES
            </label>
            <input
              type="text"
              placeholder="e.g. Frances Steloff"
              value={formData.bookstore.founders || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  bookstore: { ...formData.bookstore, founders: e.target.value },
                })
              }
              className="w-full px-3 py-2 text-sm bg-parchment-light border border-parchment-border rounded-lg text-ink focus:outline-none font-serif"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-ink-light mb-1">
              SPECIALTIES (COMMA SEPARATED)
            </label>
            <input
              type="text"
              placeholder="e.g. Modernist Poetry, Rare Editions, Cinema"
              value={formData.bookstore.specialties}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  bookstore: { ...formData.bookstore, specialties: e.target.value },
                })
              }
              className="w-full px-3 py-2 text-sm bg-parchment-light border border-parchment-border rounded-lg text-ink focus:outline-none font-serif"
            />
          </div>
        </div>

        {/* Markdown Research Blurb with Live Preview */}
        <div className="space-y-2 pt-2">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-mono text-ink-light">
              RESEARCH NARRATIVE BLURB &amp; HISTORICAL ESSAY (MARKDOWN)
            </label>
            <div className="inline-flex rounded-lg border border-parchment-border p-0.5 bg-parchment-muted text-xs font-serif">
              <button
                type="button"
                onClick={() => setBlurbTab("edit")}
                className={`px-2.5 py-1 rounded-md flex items-center gap-1 transition-all ${
                  blurbTab === "edit"
                    ? "bg-white text-ink font-semibold shadow-xs"
                    : "text-ink-muted hover:text-ink"
                }`}
              >
                <FileEdit className="w-3 h-3" />
                <span>Write</span>
              </button>
              <button
                type="button"
                onClick={() => setBlurbTab("preview")}
                className={`px-2.5 py-1 rounded-md flex items-center gap-1 transition-all ${
                  blurbTab === "preview"
                    ? "bg-white text-ink font-semibold shadow-xs"
                    : "text-ink-muted hover:text-ink"
                }`}
              >
                <Eye className="w-3 h-3" />
                <span>Preview</span>
              </button>
            </div>
          </div>

          {blurbTab === "edit" ? (
            <textarea
              rows={8}
              value={formData.bookstore.historicalBlurb}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  bookstore: { ...formData.bookstore, historicalBlurb: e.target.value },
                })
              }
              placeholder="Write your research essay on the bookstore's origins, literary significance, and history..."
              className="w-full p-4 text-sm bg-parchment-light border border-parchment-border rounded-xl text-ink focus:outline-none font-serif leading-relaxed"
            />
          ) : (
            <div className="p-6 bg-parchment-light border border-parchment-border rounded-xl min-h-[200px]">
              <MarkdownRenderer content={formData.bookstore.historicalBlurb} />
            </div>
          )}
        </div>

        {/* Trivia / Anecdotes */}
        <div>
          <label className="block text-xs font-mono text-ink-light mb-1">
            NOTABLE PATRONS &amp; ANECDOTES / TRIVIA (ONE PER LINE)
          </label>
          <textarea
            rows={3}
            value={formData.bookstore.notablePatronsTrivia}
            onChange={(e) =>
              setFormData({
                ...formData,
                bookstore: { ...formData.bookstore, notablePatronsTrivia: e.target.value },
              })
            }
            placeholder="e.g. Patti Smith worked as a clerk here in the 1970s."
            className="w-full px-3 py-2 text-sm bg-parchment-light border border-parchment-border rounded-lg text-ink focus:outline-none font-serif"
          />
        </div>
      </div>

      {/* 3. Archival Media & Newspaper Clippings */}
      <div className="p-6 rounded-2xl bg-white border border-parchment-border shadow-xs">
        <MediaManager
          mediaList={formData.archivalMedia}
          onChange={(list) => setFormData({ ...formData, archivalMedia: list })}
        />
      </div>

      {/* Bottom Save Button */}
      <div className="flex items-center justify-end gap-4 py-4">
        <Link href="/admin">
          <Button type="button" variant="secondary" size="md" className="font-serif">
            Cancel
          </Button>
        </Link>

        <Button
          type="submit"
          variant="oxblood"
          size="md"
          disabled={loading}
          className="font-serif flex items-center gap-2"
        >
          <CheckCircle className="w-4 h-4 text-amber-300" />
          <span>{loading ? "Cataloging..." : isEditing ? "Update Archive Record" : "Save New Bookmark & Dossier"}</span>
        </Button>
      </div>
    </form>
  );
}
