import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { EditablePartnersPage } from "@/components/pages/EditablePartnersPage";
import { EditableAboutPage } from "@/components/pages/EditableAboutPage";
import { EditableContactPage } from "@/components/pages/EditableContactPage";
import { FormattedText } from "@/components/ui/FormattedText";

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

describe("FormattedText Component", () => {
  it("renders markdown italics, bold, and links properly", () => {
    const { container } = render(
      <FormattedText text="There is really only one *reliable* source: **used books**." />
    );

    const em = container.querySelector("em");
    const strong = container.querySelector("strong");
    expect(em?.textContent).toBe("reliable");
    expect(strong?.textContent).toBe("used books");
  });
});

describe("Editable Pages in Curator Edit Mode", () => {
  it("renders editable inputs and donor directory manager on Partners page when edit=true", () => {
    render(
      <EditablePartnersPage
        initialContent={{
          letter_p1: "Custom appreciation letter with *italics*",
        }}
      />
    );

    const textarea = screen.getByDisplayValue("Custom appreciation letter with *italics*");
    expect(textarea).toBeDefined();
    expect(screen.getByText(/Curator Mode/i)).toBeDefined();
    expect(screen.getByText(/Save Changes/i)).toBeDefined();
    expect(screen.getByText(/\+ Add Bookstore/i)).toBeDefined();
    expect(screen.getByText(/\+ Add Individual/i)).toBeDefined();
    expect(screen.getByText(/\+ Add Library/i)).toBeDefined();
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
