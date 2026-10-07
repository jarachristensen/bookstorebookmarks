import { defineConfig } from "vitest/config";
import path from "path";

process.env.DATABASE_URL = "file:data/test.db";

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: [],
    fileParallelism: false,
    maxConcurrency: 1,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./"),
    },
  },
});
