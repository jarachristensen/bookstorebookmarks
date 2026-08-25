import { describe, it, expect } from "vitest";
import { client } from "@/db";

describe("Database client initialization", () => {
  it("should create a valid client instance without throwing URL_INVALID", () => {
    expect(client).toBeDefined();
    expect(typeof client.execute).toBe("function");
  });
});
