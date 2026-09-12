import { describe, it, expect } from "vitest";
import tailwindConfig from "../tailwind.config";

describe("Risograph Theme Tokens", () => {
  it("defines riso color palette tokens", () => {
    const colors = tailwindConfig.theme?.extend?.colors as any;
    expect(colors?.riso?.paper).toBe("#FAF8F5");
    expect(colors?.riso?.pink).toBe("#F43F7A");
    expect(colors?.riso?.blue).toBe("#2563EB");
    expect(colors?.riso?.yellow).toBe("#F59E0B");
    expect(colors?.riso?.green).toBe("#10B981");
    expect(colors?.riso?.ink).toBe("#18181B");
  });
});
