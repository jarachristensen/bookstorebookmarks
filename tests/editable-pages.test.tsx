import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { EditablePartnersPage } from "@/components/pages/EditablePartnersPage";
import { EditableAboutPage } from "@/components/pages/EditableAboutPage";
import { EditableContactPage } from "@/components/pages/EditableContactPage";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  usePathname: () => "/partners",
  useSearchParams: () => new URLSearchParams("edit=true"),
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
  }),
}));

describe("Editable Pages in Curator Edit Mode", () => {
  it("renders editable inputs on Partners page when edit=true", () => {
    render(
      <EditablePartnersPage
        initialContent={{
          hero_subtitle: "Custom Partners Subtitle",
        }}
      />
    );

    const input = screen.getByDisplayValue("Custom Partners Subtitle");
    expect(input).toBeDefined();
    expect(screen.getByText(/Curator Mode/i)).toBeDefined();
    expect(screen.getByText(/Save Changes/i)).toBeDefined();
  });

  it("renders editable inputs on About page when edit=true", () => {
    render(
      <EditableAboutPage
        initialContent={{
          hero_subtitle: "Custom About Subtitle",
        }}
      />
    );

    const input = screen.getByDisplayValue("Custom About Subtitle");
    expect(input).toBeDefined();
    expect(screen.getByText(/Save Changes/i)).toBeDefined();
  });

  it("renders editable inputs on Contact page when edit=true", () => {
    render(
      <EditableContactPage
        initialContent={{
          hero_subtitle: "Custom Contact Subtitle",
        }}
      />
    );

    const input = screen.getByDisplayValue("Custom Contact Subtitle");
    expect(input).toBeDefined();
    expect(screen.getByText(/Save Changes/i)).toBeDefined();
  });
});
