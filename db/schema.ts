import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";

export const bookstores = sqliteTable("bookstores", {
  id: text("id").primaryKey(), // slug like 'gotham-book-mart'
  name: text("name").notNull(),
  city: text("city").notNull(),
  stateProvince: text("state_province"),
  country: text("country").notNull(),
  streetAddress: text("street_address"),
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
