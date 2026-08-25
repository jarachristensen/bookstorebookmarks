import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import * as schema from "./schema";
import fs from "fs";
import path from "path";

// Ensure data directory exists for local sqlite file
const dbPath = process.env.DATABASE_URL || "file:data/archive.db";

if (dbPath.startsWith("file:")) {
  const filePath = dbPath.replace("file:", "");
  const dir = path.dirname(path.resolve(process.cwd(), filePath));
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

export const client = createClient({
  url: dbPath,
});

export const db = drizzle(client, { schema });

/**
 * Helper to initialize the database tables if they do not exist yet.
 */
export async function initDb() {
  await client.execute(`
    CREATE TABLE IF NOT EXISTS bookstores (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      city TEXT NOT NULL,
      state_province TEXT,
      country TEXT NOT NULL,
      street_address TEXT,
      year_opened INTEGER NOT NULL,
      year_closed INTEGER,
      is_still_operating INTEGER NOT NULL DEFAULT 0,
      founders TEXT,
      specialties TEXT,
      historical_blurb TEXT NOT NULL,
      notable_patrons_trivia TEXT,
      website_url TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);

  await client.execute(`
    CREATE TABLE IF NOT EXISTS bookmarks (
      id TEXT PRIMARY KEY,
      bookstore_id TEXT NOT NULL REFERENCES bookstores(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      accession_no TEXT NOT NULL UNIQUE,
      front_image_url TEXT NOT NULL,
      back_image_url TEXT,
      year_produced INTEGER,
      material TEXT NOT NULL,
      dimensions TEXT NOT NULL,
      condition TEXT NOT NULL,
      acquisition_date TEXT,
      acquisition_notes TEXT,
      is_featured INTEGER NOT NULL DEFAULT 0,
      display_order INTEGER NOT NULL DEFAULT 0,
      accent_color TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);

  await client.execute(`
    CREATE TABLE IF NOT EXISTS archival_media (
      id TEXT PRIMARY KEY,
      bookstore_id TEXT NOT NULL REFERENCES bookstores(id) ON DELETE CASCADE,
      media_type TEXT NOT NULL,
      image_url TEXT NOT NULL,
      caption TEXT NOT NULL,
      source_publication TEXT,
      publication_date TEXT,
      transcription_text TEXT,
      display_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    );
  `);
}
