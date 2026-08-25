import React from "react";
import { getAdminSession } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { getBookmarkBySlug, getAllBookstores } from "@/lib/db/queries";
import { BookmarkForm, BookmarkFormData } from "@/components/admin/BookmarkForm";

export const dynamic = "force-dynamic";

export default async function AdminEditBookmarkPage({
  params,
}: {
  params: { id: string };
}) {
  const isAuth = await getAdminSession();
  if (!isAuth) {
    redirect("/admin/login");
  }

  const [bookmark, bookstores] = await Promise.all([
    getBookmarkBySlug(params.id),
    getAllBookstores(),
  ]);

  if (!bookmark) {
    notFound();
  }

  const store = bookmark.bookstore;

  // Format initial form data
  let specialtiesStr = "";
  if (store?.specialties) {
    try {
      const parsed: string[] = JSON.parse(store.specialties);
      specialtiesStr = parsed.join(", ");
    } catch {}
  }

  let triviaStr = "";
  if (store?.notablePatronsTrivia) {
    try {
      const parsed: string[] = JSON.parse(store.notablePatronsTrivia);
      triviaStr = parsed.join("\n");
    } catch {}
  }

  const initialData: BookmarkFormData = {
    bookmark: {
      id: bookmark.id,
      bookstoreId: bookmark.bookstoreId,
      title: bookmark.title,
      accessionNo: bookmark.accessionNo,
      frontImageUrl: bookmark.frontImageUrl,
      backImageUrl: bookmark.backImageUrl || "",
      yearProduced: bookmark.yearProduced || "",
      material: bookmark.material,
      dimensions: bookmark.dimensions,
      condition: bookmark.condition,
      acquisitionDate: bookmark.acquisitionDate || "",
      acquisitionNotes: bookmark.acquisitionNotes || "",
      isFeatured: bookmark.isFeatured,
      displayOrder: bookmark.displayOrder,
      accentColor: bookmark.accentColor || "#881337",
    },
    bookstore: {
      id: store?.id,
      name: store?.name || "",
      city: store?.city || "",
      stateProvince: store?.stateProvince || "",
      country: store?.country || "United States",
      streetAddress: store?.streetAddress || "",
      yearOpened: store?.yearOpened || "",
      yearClosed: store?.yearClosed || "",
      isStillOperating: store?.isStillOperating || false,
      founders: store?.founders || "",
      specialties: specialtiesStr,
      historicalBlurb: store?.historicalBlurb || "",
      notablePatronsTrivia: triviaStr,
      websiteUrl: store?.websiteUrl || "",
    },
    archivalMedia: (store?.archivalMedia || []).map((m) => ({
      id: m.id,
      mediaType: m.mediaType,
      imageUrl: m.imageUrl,
      caption: m.caption,
      sourcePublication: m.sourcePublication || "",
      publicationDate: m.publicationDate || "",
      transcriptionText: m.transcriptionText || "",
    })),
  };

  return (
    <div className="min-h-screen bg-[#FBF9F5] p-4 sm:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="font-serif text-3xl font-bold text-ink">Edit Archive Record</h1>
          <p className="text-xs text-ink-muted font-serif italic">
            Updating {bookmark.title}
          </p>
        </div>

        <BookmarkForm
          initialData={initialData}
          existingBookstores={bookstores}
          isEditing={true}
        />
      </div>
    </div>
  );
}
