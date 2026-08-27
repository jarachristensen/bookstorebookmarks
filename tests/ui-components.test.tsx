import { describe, it, expect } from "vitest";
import React from "react";
import { render, screen } from "@testing-library/react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Header } from "@/components/ui/Header";

describe("UI Design System Components", () => {
  it("should render Badge with various archival variants", () => {
    render(<Badge variant="oxblood">Historic (1920–2007)</Badge>);
    const badge = screen.getByText("Historic (1920–2007)");
    expect(badge).toBeDefined();
    expect(badge.className).toContain("text-archival-oxblood");
  });

  it("should render Button with tactile styles and handle click", () => {
    let clicked = false;
    render(
      <Button variant="primary" onClick={() => (clicked = true)}>
        Inspect Bookmark
      </Button>
    );
    const btn = screen.getByRole("button", { name: /inspect bookmark/i });
    expect(btn).toBeDefined();
    btn.click();
    expect(clicked).toBe(true);
  });

  it("should render Header with title", () => {
    render(<Header />);
    expect(screen.getByText(/Bookstore Bookmark Archive/i)).toBeDefined();
  });
});
