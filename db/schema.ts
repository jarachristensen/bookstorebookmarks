import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";

export interface BookstoreLocation {
  id: string;
  label: string; // "1st Location", "2nd Location", "3rd Location", "New Location / Branch", "Current Location", etc.
  streetAddress: string;
  city: string;
  stateProvince?: string;
  country?: string;
  yearsActive?: string; // e.g. "1950–1955"
  isMovedFrom?: boolean; // toggled true if bookstore moved from here to next address
  isCurrent?: boolean;
  notes?: string;
}

export interface CustomTimelineEvent {
  id: string;
  year: number;
  label: string; // e.g. "Grand Opening", "Awarded Best Bookstore in SF", "Relocated"
  description: string;
  mediaId?: string; // ID of linked archival media
  mediaUrl?: string; // Direct image URL if custom
  mediaCaption?: string;
  type?: "opening" | "relocation" | "closure" | "press" | "milestone";
}

export const bookstores = sqliteTable("bookstores", {
  id: text("id").primaryKey(), // slug like 'gotham-book-mart'
  name: text("name").notNull(),
  city: text("city").notNull(),
  stateProvince: text("state_province"),
  country: text("country").notNull(),
  streetAddress: text("street_address"),
  locations: text("locations"), // JSON stringified BookstoreLocation[]
  timelineEvents: text("timeline_events"), // JSON stringified CustomTimelineEvent[]
  yearOpened: integer("year_opened").notNull(),
  yearClosed: integer("year_closed"),
  isStillOperating: integer("is_still_operating", { mode: "boolean" }).notNull().default(false),
  founders: text("founders"),
  specialties: text("specialties"), // JSON stringified array: string[]
  historicalBlurb: text("historical_blurb").notNull(),
  notablePatronsTrivia: text("notable_patrons_trivia"), // JSON stringified array: string[]
  websiteUrl: text("website_url"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const bookmarks = sqliteTable("bookmarks", {
  id: text("id").primaryKey(), // slug like 'gotham-wise-men-fish-here'
  bookstoreId: text("bookstore_id")
    .notNull()
    .references(() => bookstores.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  accessionNo: text("accession_no").notNull().unique(),
  frontImageUrl: text("front_image_url").notNull(),
  backImageUrl: text("back_image_url"),
  yearProduced: integer("year_produced"),
  material: text("material").notNull(),
  dimensions: text("dimensions").notNull(),
  condition: text("condition").notNull(),
  acquisitionDate: text("acquisition_date"),
  acquisitionNotes: text("acquisition_notes"),
  isFeatured: integer("is_featured", { mode: "boolean" }).notNull().default(false),
  displayOrder: integer("display_order").notNull().default(0),
  accentColor: text("accent_color"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const archivalMedia = sqliteTable("archival_media", {
  id: text("id").primaryKey(),
  bookstoreId: text("bookstore_id")
    .notNull()
    .references(() => bookstores.id, { onDelete: "cascade" }),
  mediaType: text("media_type").notNull(), // 'photo' | 'newspaper' | 'ephemera'
  imageUrl: text("image_url").notNull(),
  caption: text("caption").notNull(),
  sourcePublication: text("source_publication"),
  publicationDate: text("publication_date"),
  transcriptionText: text("transcription_text"),
  isStorefront: integer("is_storefront", { mode: "boolean" }).notNull().default(false),
  mediaTag: text("media_tag"), // 'storefront' | 'interior' | 'exterior' | 'press' | 'ephemera'
  displayOrder: integer("display_order").notNull().default(0),
  createdAt: text("created_at").notNull(),
});

// Relations
export const bookstoresRelations = relations(bookstores, ({ many }) => ({
  bookmarks: many(bookmarks),
  archivalMedia: many(archivalMedia),
}));

export const bookmarksRelations = relations(bookmarks, ({ one }) => ({
  bookstore: one(bookstores, {
    fields: [bookmarks.bookstoreId],
    references: [bookstores.id],
  }),
}));

export const archivalMediaRelations = relations(archivalMedia, ({ one }) => ({
  bookstore: one(bookstores, {
    fields: [archivalMedia.bookstoreId],
    references: [bookstores.id],
  }),
}));

export type Bookstore = typeof bookstores.$inferSelect;
export type NewBookstore = typeof bookstores.$inferInsert;

export type Bookmark = typeof bookmarks.$inferSelect;
export type NewBookmark = typeof bookmarks.$inferInsert;

export type ArchivalMedia = typeof archivalMedia.$inferSelect;
export type NewArchivalMedia = typeof archivalMedia.$inferInsert;
