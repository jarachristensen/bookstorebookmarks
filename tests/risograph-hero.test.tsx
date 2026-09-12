import { describe, it, expect, vi } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { RisographHero } from "@/components/home/RisographHero";

describe("RisographHero Component", () => {
  it("renders duotone title, tagline, search input, Permanently Closed pill, and shuffle button", () => {
    const handleSearch = vi.fn();
    const handleShuffle = vi.fn();

    render(
      <RisographHero
        totalBookstores={42}
        totalBookmarks={150}
        search=""
        onSearchChange={handleSearch}
        country="all"
        onCountryChange={vi.fn()}
        countries={["United States", "France"]}
        city="all"
        onCityChange={vi.fn()}
        cities={["New York", "Paris"]}
        era="all"
        onEraChange={vi.fn()}
        eras={[{ label: "All Eras", value: "all" }]}
        status="all"
        onStatusChange={vi.fn()}
        onShuffle={handleShuffle}
      />
    );

    expect(screen.getAllByText(/The/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/Bookstore/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/Bookmark/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/Archive/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/They saved our place, now there is a place to save them/i)).toBeDefined();
    expect(screen.getByText(/Permanently Closed/i)).toBeDefined();

    const searchInput = screen.getByPlaceholderText(/search/i);
    fireEvent.change(searchInput, { target: { value: "gotham" } });
    expect(handleSearch).toHaveBeenCalledWith("gotham");

    const shuffleBtn = screen.getByRole("button", { name: /shuffle/i });
    fireEvent.click(shuffleBtn);
    expect(handleShuffle).toHaveBeenCalled();
  });
});
