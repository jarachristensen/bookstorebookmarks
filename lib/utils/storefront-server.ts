import fs from "fs";
import path from "path";

/**
 * Reads the public/images/storefronts directory on the server to check existing files.
 * This function uses Node.js 'fs' and should only be imported in Server Components or API routes.
 */
export function getAvailableStorefrontFiles(): string[] {
  try {
    const storefrontsDir = path.join(process.cwd(), "public", "images", "storefronts");
    if (!fs.existsSync(storefrontsDir)) {
      return [];
    }
    return fs.readdirSync(storefrontsDir).filter((file) => !file.startsWith("."));
  } catch (error) {
    console.error("Error reading storefronts directory:", error);
    return [];
  }
}
