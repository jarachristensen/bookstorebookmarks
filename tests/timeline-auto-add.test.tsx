import { describe, it, expect, vi } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { MediaManager, MediaItem } from "@/components/admin/MediaManager";
import { CustomTimelineEvent } from "@/db/schema";

describe("MediaManager Individual Clipping Timeline Checkbox & AI Scan", () => {
  const sampleMedia: MediaItem[] = [
    {
      id: "media-1",
      mediaType: "newspaper",
      imageUrl: "/uploads/sample-clipping.jpg",
      caption: "The Tribune (Nov 24, 2000)",
      sourcePublication: "The Tribune",
      publicationDate: "Nov 24, 2000",
      transcriptionText: "NEW INSTALLMENT PIQUES COUNTY INTEREST\nHarry Potter excitement...",
    },
    {
      id: "media-2",
      mediaType: "photo",
      imageUrl: "/uploads/storefront.jpg",
      caption: "Storefront View 1999",
      publicationDate: "1999",
      isStorefront: true,
    },
  ];

  it("renders individual 'Add to Timeline' checkbox for each clipping", () => {
    render(
      <MediaManager
        mediaList={sampleMedia}
        onChange={vi.fn()}
        timelineEvents={[]}
        onTimelineEventsChange={vi.fn()}
      />
    );

    expect(screen.getByLabelText(/Add item #1 to Timeline/i)).toBeDefined();
    expect(screen.getByLabelText(/Add item #2 to Timeline/i)).toBeDefined();
  });

  it("shows checked 'In Timeline' state when item is present in timelineEvents", () => {
    const timelineEvents: CustomTimelineEvent[] = [
      {
        id: "ev-media-1",
        year: 2000,
        label: "NEW INSTALLMENT PIQUES COUNTY INTEREST",
        description: "Harry Potter excitement...",
        mediaId: "media-1",
        type: "press",
      },
    ];

    render(
      <MediaManager
        mediaList={sampleMedia}
        onChange={vi.fn()}
        timelineEvents={timelineEvents}
        onTimelineEventsChange={vi.fn()}
      />
    );

    const checkbox1 = screen.getByLabelText(/Add item #1 to Timeline/i) as HTMLInputElement;
    const checkbox2 = screen.getByLabelText(/Add item #2 to Timeline/i) as HTMLInputElement;

    expect(checkbox1.checked).toBe(true);
    expect(checkbox2.checked).toBe(false);
    expect(screen.getByText("In Timeline")).toBeDefined();
  });

  it("removes event from timeline when unchecking an in-timeline clipping", () => {
    const onTimelineChange = vi.fn();
    const timelineEvents: CustomTimelineEvent[] = [
      {
        id: "ev-media-1",
        year: 2000,
        label: "NEW INSTALLMENT PIQUES COUNTY INTEREST",
        description: "Harry Potter excitement...",
        mediaId: "media-1",
        type: "press",
      },
    ];

    render(
      <MediaManager
        mediaList={sampleMedia}
        onChange={vi.fn()}
        timelineEvents={timelineEvents}
        onTimelineEventsChange={onTimelineChange}
      />
    );

    const checkbox1 = screen.getByLabelText(/Add item #1 to Timeline/i) as HTMLInputElement;
    expect(checkbox1.checked).toBe(true);

    fireEvent.click(checkbox1);
    expect(onTimelineChange).toHaveBeenCalledWith([]);
  });

  it("adds event to timeline when checking an untracked clipping", () => {
    const onTimelineChange = vi.fn();

    render(
      <MediaManager
        mediaList={sampleMedia}
        onChange={vi.fn()}
        timelineEvents={[]}
        onTimelineEventsChange={onTimelineChange}
      />
    );

    const checkbox1 = screen.getByLabelText(/Add item #1 to Timeline/i) as HTMLInputElement;
    expect(checkbox1.checked).toBe(false);

    fireEvent.click(checkbox1);
    expect(onTimelineChange).toHaveBeenCalled();
    const addedEvents = onTimelineChange.mock.calls[0][0];
    expect(addedEvents.length).toBe(1);
    expect(addedEvents[0].year).toBe(2000);
    expect(addedEvents[0].label).toContain("THE TRIBUNE");
  });
});

