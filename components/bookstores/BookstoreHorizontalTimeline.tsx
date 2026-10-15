"use client";

import React from "react";
import {
  BookstoreVerticalTimeline,
  BookstoreVerticalTimelineProps,
  TimelineEvent,
} from "./BookstoreVerticalTimeline";

export {
  BookstoreVerticalTimeline,
  type BookstoreVerticalTimelineProps,
  type TimelineEvent,
};

export type BookstoreHorizontalTimelineProps = BookstoreVerticalTimelineProps;

/**
 * BookstoreHorizontalTimeline bridges to the new antique vertical serpentine timeline.
 * Preserves full backward compatibility for existing imports and tests.
 */
export function BookstoreHorizontalTimeline(props: BookstoreHorizontalTimelineProps) {
  return <BookstoreVerticalTimeline {...props} />;
}
