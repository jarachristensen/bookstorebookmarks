# The Bookstore Bookmark Archive — Risograph & Papercraft Redesign Spec

**Date**: 2026-09-12  
**Status**: Approved  
**Branch**: `feat/homepage-display-concepts`  

---

## 1. Vision & Background

The Bookstore Bookmark Archive is undergoing a complete visual identity and interface redesign, transitioning from the antique wooden specimen cabinet into a vibrant, editorial **Risograph & Papercraft Archive**.

The new aesthetic is inspired by independent printmaking, retro risograph prints, and book arts ephemera:
- **Brand Hero Artwork**: An illustrated hand holding a fanned bouquet of colorful bookmarks (hot pink, canary yellow, grass green, magenta).
- **Duotone Letterpress Typography**: Alternating vibrant magenta (`The`, `Bookmark`) and ocean cobalt blue (`Bookstore`, `Archive`).
- **Tagline**: *"They saved our place, now there is a place to save them."*
- **Textured Paper Canvas**: A warm cream paper texture background (`#FAF8F5`) with subtle print grain and soft tactile drop shadows.
- **Minimalist Bookmark Spread**: Replacing the hardwood cabinet with a dense, full-width papercraft specimen spread where bookmarks float cleanly on the paper desk with interactive hover lifts and 3D inspection.

---

## 2. Design System & Design Tokens

### Color System (`tailwind.config.ts`)
| Token | Hex Value | Role |
| :--- | :--- | :--- |
| `riso-paper` | `#FAF8F5` | Primary background canvas |
| `riso-paper-warm` | `#FDFBF7` | Card / surface background |
| `riso-paper-border` | `#E8E2D5` | Paper edge borders and dividers |
| `riso-pink` | `#F43F7A` | Primary magenta (titles, active tags, highlights) |
| `riso-blue` | `#2563EB` | Cobalt/denim blue (titles, links, primary CTA) |
| `riso-yellow` | `#F59E0B` | Sunny yellow (era badges, featured tags) |
| `riso-green` | `#10B981` | Grassy green (operating status, country tags) |
| `riso-ink` | `#18181B` | Deep print black for primary typography |
| `riso-ink-muted` | `#52525B` | Muted graphite for secondary metadata |

### Typography
- **Masthead & Display**: Bold classic serif (`Playfair Display`, `Georgia`, `serif`) with duotone color splits and risograph letterpress text shadows.
- **Body & Captions**: Clean sans-serif (`Inter`, `Plus Jakarta Sans`, `system-ui`) for readable interface labels.
- **Archival Metadata**: Crisp monospace (`JetBrains Mono`, `monospace`) for accession numbers, years, and catalog tags.

### Paper Textures & Elevation
- `.riso-paper-bg`: Warm cream background with subtle CSS paper fiber/speckle overlay.
- `.paper-shadow-soft`: Natural soft diffuse drop shadow for bookmarks floating on paper.
- `.paper-lift-hover`: Hover physics with a 1.04x scale, subtle random -1deg to 1deg tilt, and expanded drop shadow.

---

## 3. Homepage Architecture & Component Breakdown

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│ <Header />                                                                       │
│ Clean paper navbar · Duotone text logo · Nav links · Instagram & Curator Portal  │
├──────────────────────────────────────────────────────────────────────────────────┤
│ <RisographHero /> (Split 2-Column Hero)                                          │
│ ┌────────────────────────────────────────┬─────────────────────────────────────┐ │
│ │ LEFT COLUMN:                           │ RIGHT COLUMN:                       │ │
│ │ • Duotone Title (Pink & Blue)          │ • Illustrated Hand holding          │ │
│ │ • Tagline: "They saved our place..."   │   fanned colorful bookmarks         │ │
│ │ • Stats Badges: Bookstores & Bookmarks │ • Gentle floating/elevation         │ │
│ │ • Search Bar & Riso Filter Tags        │   hover animation                   │ │
│ │ • "Shuffle Spread" tactile button      │                                     │ │
│ └────────────────────────────────────────┴─────────────────────────────────────┘ │
├──────────────────────────────────────────────────────────────────────────────────┤
│ <BookmarkPaperSpread /> (Dense Minimalist Ephemera Grid)                         │
│ ┌──────────────────────────────────────────────────────────────────────────────┐ │
│ │ Responsive Grid (2 to 8 columns depending on screen size)                    │ │
│ │ • Clean bookmarks floating directly on warm textured paper background        │ │
│ │ • True-scale bookmark contours with realistic soft paper drop shadows        │ │
│ │ • Interactive Hover: Subtle lift & floating tooltip (Store · City · Year)    │ │
│ │ • Click: Opens 3D Specimen Inspector Modal with front/back flip              │ │
│ └──────────────────────────────────────────────────────────────────────────────┘ │
├──────────────────────────────────────────────────────────────────────────────────┤
│ <Footer />                                                                       │
│ Warm risograph paper footer · Mission statement · Archive credits · Socials      │
└──────────────────────────────────────────────────────────────────────────────────┘
```

### Component Details

#### 1. `<RisographHero />` (`components/home/RisographHero.tsx`)
- **Split 2-Column Layout**:
  - **Left**: Large duotone title ("The Bookstore Bookmark Archive"), italic blue tagline, real-time collection stats pills (`X Historic Bookstores`, `Y Cataloged Bookmarks`), search input with instant matching, and colorful filter pills (State, City, Era, Status) plus a **"Shuffle Spread"** button.
  - **Right**: The illustrated hand holding the fan of colorful bookmarks (`/images/risograph-hero.png`), with subtle float/lift hover physics.

#### 2. `<BookmarkPaperSpread />` (`components/home/BookmarkPaperSpread.tsx`)
- **Minimalist Ephemera Grid**:
  - Replaces `FlatFileCabinet` on the homepage.
  - Responsive multi-column layout (`grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8`).
  - Bookmarks render with transparent PNG alpha contours and soft diffuse paper shadows.
  - **Hover state**: Lifts smoothly, displays a floating risograph tooltip pill above/below the bookmark with the Bookstore Name, City/State, and Year.
  - **Click state**: Triggers the 3D inspection modal.
  - **Empty state**: If search/filters produce 0 results, renders a friendly risograph empty state card with a *"Reset All Filters"* button.

#### 3. `<Header />` & `<Footer />` (`components/ui/Header.tsx`, `components/ui/Footer.tsx`)
- Restyled with clean paper borders, duotone logo typography, and risograph active navigation pills.

#### 4. `<BookmarkInspector />` & `<BookstoreDossier />`
- Updated with risograph paper backgrounds, duotone badges, and magenta/cobalt accents while preserving all 3D flip, hi-res zoom, and dossier navigation features.

---

## 4. Error Handling & Edge Cases

1. **Zero Filter Results**: Friendly risograph card with a one-click reset button.
2. **Missing Bookstore Data**: Graceful fallbacks for bookmarks without full bookstore records or missing dates.
3. **Image Loading & Transparency**: Smooth shimmer placeholder while high-resolution scans load.
4. **Mobile & Viewport Scaling**: Clean stacking on mobile screens with responsive 2-column grid and touch-friendly inspection tap targets.

---

## 5. Verification Plan

1. **Automated Tests**:
   - Update and run `npm test` across all Vitest suites (ensuring 100% pass rate).
   - Test search, filter, shuffle, hover tooltips, and modal inspection flows.
2. **Production Build**:
   - Run `npm run build` to confirm 0 TypeScript / ESLint errors.
3. **Visual & Interaction Verification**:
   - Verify on `http://localhost:3000` for layout fluidity, paper texture consistency, and responsive breakpoints.
