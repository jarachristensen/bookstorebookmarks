# Bookstore Bookmark Archive & Research Dossier — Design Specification

**Date:** 2026-08-24  
**Status:** Approved by Human Partner  
**Target:** Full-Stack Next.js Application with Interactive Specimen Tray and Research Admin CMS  

---

## 1. Overview & Project Goals

The **Bookstore Bookmark Archive** is a curated, visually stunning digital exhibition and historical research tool designed to catalog, preserve, and showcase bookstore bookmarks and the storied independent bookstores they originate from.

### Core Objectives:
1. **Aesthetic Archival Presentation:** A clean, tactile, museum-grade aesthetic inspired by physical archival specimen trays, collector's linen drawers, and fine editorial print.
2. **Non-Endless Scroll Browsing:** Instead of a generic infinite feed, bookmarks are presented on a fixed-height, physical-feeling **Curator's Specimen Tray** with smooth, tactile page-turning / tray navigation (6–8 bookmarks per tray).
3. **Interactive Inspection & 3D Flip:** Clicking any bookmark smoothly lifts it into an elevated inspection view with a realistic 3D paper flip to view both front and back scans.
4. **Rich Bookstore Research Dossier:** Each bookmark connects to a comprehensive historical dossier featuring structured metadata (Name, Year Opened/Closed, Address, Founders, Specialties), an in-depth research narrative/essay, and an archival media gallery (historical photos, vintage newspaper clippings with click-to-zoom and readable transcriptions).
5. **Private In-App Admin CMS (`/admin`):** A secure, password-protected curation dashboard where the collector can easily upload scans, enter research, manage clippings, and export backups.
6. **Deployable Full-Stack Architecture:** Built to run smoothly locally on macOS with zero setup, with turnkey support for cloud deployment (Vercel, Railway, Turso, Cloudinary/R2).

---

## 2. Visual & User Experience (UI/UX)

### 2.1 Aesthetic & Design System
* **Color Palette:**
  * Backgrounds: Warm archival linen/parchment (`#FBF9F5`, `#F3EFE6`, `#EAE4D5`).
  * Surface/Cards: Crisp warm cotton (`#FFFFFF`, `#FAF8F4`), deep aged borders (`#E5DFD3`, `#D4CBB9`).
  * Typography: Deep archival ink (`#1C1917`, `#292524`), muted pencil annotations (`#78716C`).
  * Accents: Aged Oxblood (`#881337`), Forest Spruce (`#14532D`), Warm Amber Gold (`#B45309`).
* **Typography:**
  * Headers: Classic editorial serif (*Playfair Display* / *Cinzel* / *EB Garamond*).
  * Body: Crisp, readable modern sans-serif (*Inter* / *Plus Jakarta Sans*).
  * Metadata & Catalog Numbers: Monospaced catalog font (*JetBrains Mono* / *Geist Mono*).

### 2.2 The Curator's Specimen Tray (Exhibit View)
* **Tray Layout:** A physical-feeling collector's tray holding 6–8 bookmarks laid out side-by-side with subtle natural rotations (±1.5°) and realistic drop shadows.
* **Navigation & Tray Turning:**
  * Tactile "Previous Tray" (`←`) and "Next Tray" (`→`) controls with page-turn and sliding drawer transitions powered by Framer Motion.
  * Keyboard navigation support (Arrow Left / Arrow Right) and touch swipe gestures.
  * Tray counter indicator (e.g. `Tray II of V · 8 of 34 Bookmarks`).
* **Curator's Filter & Search Bar:**
  * Instant search by bookstore name, city, or keyword.
  * Filter pills by Location (e.g., *New York, Paris, Chicago, London, San Francisco*).
  * Filter by Era (e.g., *Pre-1940, 1940s–1960s, 1970s–1990s, Contemporary*).
  * Filter by Status (*Still Operating* vs. *Historic / Lost*).

### 2.3 Inspection Dossier & 3D Bookmark Flip
* **Lift-to-Inspect:** Clicking a bookmark triggers an elevation zoom animation from the tray into the focal inspection canvas.
* **3D Dual-Side Flip:**
  * Interactive "Flip Bookmark" button / click toggle to smoothly spin the bookmark 180° around the Y-axis.
  * Realistic paper thickness, edge texture, and lighting gradients.
* **The Bookstore Dossier (Inspection Sheet):**
  * **Header:** Bookstore Name, City/Country, Year Opened / Closed badge, Accession Code.
  * **Research Blurb & Story:** Markdown-rendered narrative covering the history, cultural impact, literary circles, and proprietor anecdotes.
  * **Archival Clipping & Photo Gallery:** Carousel/grid of historical photos and old newspaper articles with click-to-expand lightbox, deep zoom, and transcriptions for faded print.
  * **Physical Ephemera Specs:** Dimensions, paper/celluloid material, condition grade, and acquisition notes.

---

## 3. Data Architecture & Database Schema

The database uses SQLite with **Drizzle ORM** for lightweight local persistence and zero-config deployment.

```
┌─────────────────────────────────────────────────────────────┐
│                         BOOKSTORES                          │
├─────────────────────────────────────────────────────────────┤
│ id (PK, TEXT / slug)                                        │
│ name (TEXT)                                                 │
│ city (TEXT)                                                 │
│ state_province (TEXT, nullable)                             │
│ country (TEXT)                                              │
│ street_address (TEXT, nullable)                             │
│ year_opened (INTEGER)                                       │
│ year_closed (INTEGER, nullable)                             │
│ is_still_operating (BOOLEAN)                                │
│ founders (TEXT, nullable)                                   │
│ specialties (JSON TEXT: string[])                           │
│ historical_blurb (TEXT markdown)                            │
│ notable_patrons_trivia (JSON TEXT: string[])                │
│ created_at, updated_at                                      │
└──────────────────────────────┬──────────────────────────────┘
                               │ 1-to-many
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                          BOOKMARKS                          │
├─────────────────────────────────────────────────────────────┤
│ id (PK, TEXT / slug)                                        │
│ bookstore_id (FK -> Bookstores.id)                          │
│ title (TEXT)                                                │
│ accession_no (TEXT, unique)                                 │
│ front_image_url (TEXT)                                      │
│ back_image_url (TEXT, nullable)                             │
│ year_produced (INTEGER, nullable)                           │
│ material (TEXT)                                             │
│ dimensions (TEXT)                                           │
│ condition (TEXT)                                            │
│ acquisition_date (TEXT, nullable)                           │
│ acquisition_notes (TEXT, nullable)                          │
│ is_featured (BOOLEAN)                                       │
│ display_order (INTEGER)                                     │
│ accent_color (TEXT, nullable)                               │
│ created_at, updated_at                                      │
└──────────────────────────────┬──────────────────────────────┘
                               │ 1-to-many
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                       ARCHIVAL_MEDIA                        │
├─────────────────────────────────────────────────────────────┤
│ id (PK, TEXT)                                               │
│ bookstore_id (FK -> Bookstores.id)                          │
│ media_type (TEXT: 'photo' | 'newspaper' | 'ephemera')       │
│ image_url (TEXT)                                            │
│ caption (TEXT)                                              │
│ source_publication (TEXT, nullable)                         │
│ publication_date (TEXT, nullable)                           │
│ transcription_text (TEXT, nullable)                         │
│ display_order (INTEGER)                                     │
│ created_at                                                  │
└─────────────────────────────────────────────────────────────┘
```

---

## 4. Admin Management Suite (`/admin`)

### 4.1 Authentication & Security
* Admin routes protected by session tokens via HTTP-only secure cookies.
* Passphrase validated against `ADMIN_PASSPHRASE` environment variable.
* Public users have read-only access to `/` and `/bookmarks/[id]`.

### 4.2 Curation Dashboard & Forms
* **Catalog Management:** Table / card view of all bookmarks and bookstores with quick edit, duplicate, and delete actions.
* **Bookmark & Bookstore Editor Form:**
  * Dual-side image uploader (front and back scans) with drag-and-drop and image preview.
  * Form inputs for structured metadata (Name, City, Years, Material, Dimensions, Condition).
  * Markdown rich text editor with live side-by-side preview for the research blurb.
  * Archival Media Uploader: Add photos and newspaper clippings with source citations and full transcriptions.
* **One-Click Backup & Export:**
  * Export complete database and metadata as a downloadable structured `archive.json` package.

---

## 5. Technology Stack & Directory Structure

* **Framework:** Next.js 14/15 (App Router, React 18/19, Server Actions, TypeScript)
* **Styling:** Tailwind CSS with custom archival typography and palette
* **Animation & UI:** Framer Motion, Lucide Icons, Canvas-Confetti (curator celebration)
* **Database & ORM:** SQLite (via `better-sqlite3` or `@libsql/client`) + Drizzle ORM
* **File Uploads:** Local storage in `public/uploads/` with pluggable cloud adapters

### Proposed Directory Layout:
```
bookstore-bookmarks/
├── app/
│   ├── layout.tsx                    # Global root layout & font loading
│   ├── page.tsx                      # Exhibition Gallery & Specimen Tray
│   ├── bookmarks/[slug]/page.tsx     # Direct shareable Bookmark & Dossier view
│   ├── admin/
│   │   ├── page.tsx                  # Admin Dashboard & catalog table
│   │   ├── login/page.tsx            # Secure Passphrase Login
│   │   ├── new/page.tsx              # Add New Bookmark & Bookstore
│   │   └── edit/[id]/page.tsx        # Edit existing record
│   └── api/
│       ├── auth/route.ts             # Session login & verification
│       ├── upload/route.ts           # Multipart image upload handler
│       └── export/route.ts           # JSON database export
├── components/
│   ├── exhibit/
│   │   ├── SpecimenTray.tsx          # 6-8 bookmark physical tray with animations
│   │   ├── BookmarkCard.tsx          # Realistic physical bookmark card with tilt/shadow
│   │   ├── BookmarkInspector.tsx     # 3D Flip inspection canvas
│   │   ├── BookstoreDossier.tsx      # Slide-over research essay & metadata
│   │   ├── ClippingLightbox.tsx      # Archival photo & newspaper zoom/transcription
│   │   └── TrayControls.tsx          # Previous/Next tray & filters
│   ├── admin/
│   │   ├── BookmarkForm.tsx          # Comprehensive creation/editing form
│   │   ├── ImageDropzone.tsx         # Drag-and-drop dual scanner
│   │   ├── MarkdownEditor.tsx        # Research blurb editor with preview
│   │   └── MediaManager.tsx          # Archival photos & clippings manager
│   └── ui/                           # Reusable buttons, badges, modals, inputs
├── db/
│   ├── schema.ts                     # Drizzle ORM schema definitions
│   ├── index.ts                      # Database client connection
│   └── seed.ts                       # Curated historic seed data (Gotham, Shakespeare & Co, etc.)
├── lib/
│   ├── auth.ts                       # Admin cookie session validation
│   └── storage.ts                    # Image file storage helpers
└── docs/
    └── superpowers/
        └── specs/
            └── 2026-08-24-bookstore-bookmark-archive-design.md
```

---

## 6. Seed Collection (Initial Exhibition Data)

To ensure the website launches with an immediate, inspiring exhibition, the application will ship with high-quality seed records:

1. **Gotham Book Mart ("Wise Men Fish Here") — New York, NY (1920–2007)**
   * *Bookmark:* 1930s classic woodcut bookmark featuring the iconic fishing motif.
   * *Research Blurb:* Story of Frances Steloff, James Joyce Society headquarters, smuggling banned books.
   * *Clippings:* 1947 NYT literary article and archival photo of the famous 47th St sign.
2. **Shakespeare and Company — Paris, France (1919–Present / 1951 George Whitman revival)**
   * *Bookmark:* Vintage silhouette portrait bookmark with stamp.
   * *Research Blurb:* Sylvia Beach, Hemingway, the Lost Generation, and George Whitman’s "Tumbleweeds".
   * *Clippings:* Archival photo of Sylvia Beach and vintage French press clippings.
3. **City Lights Booksellers & Publishers — San Francisco, CA (1953–Present)**
   * *Bookmark:* Pocket Poets Series pocket-flap bookmark.
   * *Research Blurb:* Lawrence Ferlinghetti, Beat Generation, the landmark 1957 *Howl* obscenity trial.
   * *Clippings:* 1957 San Francisco Chronicle trial coverage clipping.
4. **Kroch's & Brentano's ("The World's Largest Bookstore") — Chicago, IL (1907–1995)**
   * *Bookmark:* Wabash Avenue flagship store bookmark with store map.
   * *Research Blurb:* Adolph Kroch, the Superstore pioneer of the American Midwest.
   * *Clippings:* 1955 Chicago Tribune opening article for the 29 S. Wabash mega-store.

---

## 7. Verification & Testing Plan

1. **Visual & Interaction Verification:**
   * Test tray navigation across trays with smooth transitions.
   * Test bookmark click to lift, 3D flip animation between front/back scans, and shadow responsiveness.
   * Test newspaper clipping lightbox deep-zoom and transcription toggles.
2. **Admin CMS & CRUD Workflow:**
   * Test `/admin/login` with passphrase gate and invalid password handling.
   * Test creating a new bookmark with dual image upload, bookstore metadata, markdown research blurb, and newspaper clippings.
   * Verify newly created bookmarks appear instantly in the public specimen tray.
   * Test editing and deleting records.
3. **Responsiveness & Cross-Browser Testing:**
   * Verify layout on desktop, laptop, tablet, and mobile displays.
   * Verify keyboard arrow shortcuts and touch swipes.
