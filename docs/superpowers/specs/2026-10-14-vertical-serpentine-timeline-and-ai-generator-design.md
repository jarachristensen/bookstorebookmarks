# Vertical Serpentine Timeline & AI Article Event Generator Spec

## Overview
This specification details the redesign of the Bookstore Timeline on individual bookstore detail views into an antique vertical serpentine (winding) timeline inspired by 19th-century broadside infographics, as well as an automated AI article analyzer that scans uploaded newspaper clippings/photos and generates curated timeline milestones.

---

## 1. User Interface & Visual Design

### 1.1 Header & Framing
- **Display Header**: Prominent antique "TIMELINE" banner framed by classic horizontal boundary rules top and bottom.
- **Palette**: Warm riso paper background (`#FAF8F5`, `#FDFBF7`) with charcoal/sepia ink (`#18181B`) and subtle borders (`#E8E2D5`).

### 1.2 Desktop Serpentine Ribbon (≥ 768px)
- **Continuous Serpentine Track**: Smooth SVG curved path snaking down the vertical axis.
- **Milestone Nodes**: Circular milestone dots placed precisely on the curve at each milestone vertex.
- **Alternating Layout**:
  - **Odd Steps**: Event title, clean year pill badge (e.g. `1953`), and description on the left; archival illustration/clipping thumbnail on the right.
  - **Even Steps**: Archival illustration/clipping thumbnail on the left; event title, clean year pill badge (e.g. `1985`), and description on the right.
- **Events Without Media**: When a milestone has no companion image attached, the text card expands centered across the timeline step without rendering an empty image frame.
- **Thumbnails**: Rounded corners, paper drop shadow, and hover zoom indicator.
- **Interaction**: Clicking any thumbnail opens the high-resolution zoom lightbox (`BookmarkZoomLightbox` / `ClippingLightbox`) with full panning, drag, and zoom controls.

### 1.3 Mobile Layout (< 768px)
- Automatically adapts from serpentine into a single left-aligned vertical timeline track.
- Milestone node sits on the left track with event title, dark year pill, description, and thumbnail stacked cleanly together to preserve readability.

---

## 2. AI Newspaper Clipping Scanner & Timeline Entry Generator

### 2.1 Upload Workflow
- In the bookstore visual editor / media manager, an **`Auto-add to Timeline`** toggle/checkbox is provided on media uploads.
- When uploading a press clipping or photo with this checked:
  1. Filename parser extracts the publication date and name (e.g. `1957`).
  2. OCR (`tesseract.js`) extracts text from the clipping.
  3. AI Analyzer endpoint (`POST /api/timeline/generate-entry`) processes the OCR text.

### 2.2 AI Event Synthesis
- The AI does not merely repeat raw newspaper headlines; it generates:
  - **Archival Event Title**: A concise, small-caps historical name (e.g., *"Howl Obscenity Trial Acquittal"*, *"Broadside Press Founded"*).
  - **Historical Summary**: 1–2 polished sentences summarizing the significance of the event.
  - **Year**: Identified from the article or filename.
  - **Attached Media**: Automatically links the uploaded clipping image to the timeline event.
- **Curator Review**: The generated event appears immediately in the bookstore visual editor's timeline manager, allowing the curator to review, edit, or adjust before saving.

### 2.3 API Integration & Fallback
- Supports `GEMINI_API_KEY` (Google Gemini Flash) and `OPENAI_API_KEY`.
- Includes a smart local heuristic fallback (extracting date and primary lead summary from OCR text) so it operates reliably offline or without API keys.

---

## 3. Data Model & Architecture
- **Timeline Events**: Preserves existing `timelineEvents` JSON schema on `bookstores` table:
  ```ts
  interface CustomTimelineEvent {
    id: string;
    year: number;
    label: string; // Event title
    description: string;
    type: "opening" | "relocation" | "closure" | "press" | "milestone";
    mediaId?: string;
    mediaUrl?: string;
    mediaCaption?: string;
  }
  ```
- **Component Replacement**:
  - Replace existing horizontal timeline layout in `components/bookstores/BookstoreHorizontalTimeline.tsx` (renaming or refactoring to `BookstoreVerticalTimeline.tsx` while keeping backward-compatible exports).
  - Update `BookstoreDetailView.tsx` and `BookstoreVisualEditor.tsx` to render the new vertical winding timeline.

---

## 4. Testing Strategy
- Unit tests for the AI timeline entry generation endpoint (`tests/ai-timeline-generator.test.ts`).
- Component tests for the vertical serpentine timeline rendering (`tests/bookstore-vertical-timeline.test.tsx`):
  - Alternating left/right layout on desktop.
  - Centered expanded card when media is absent.
  - Single-column responsive layout on mobile viewport.
  - Click-to-zoom thumbnail interaction.
