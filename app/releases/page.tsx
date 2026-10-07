import React from "react";
import { getPageContent } from "@/lib/db/page-content";
import { EditableReleasesPage } from "@/components/pages/EditableReleasesPage";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Release Notes | Bookstore Bookmark Archive",
  description: "Log of updates, enhancements, and fixes for the Bookstore Bookmark Archive.",
};

export default async function ReleasesPage() {
  const content = await getPageContent("releases");
  return <EditableReleasesPage initialContent={content} />;
}
