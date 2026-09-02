import React from "react";
import { getAdminSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getBookmarksWithBookstores, getAllBookstores } from "@/lib/db/queries";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  Plus,
  Download,
  LogOut,
  Sparkles,
  BookOpen,
  MapPin,
  ExternalLink,
  Edit,
  Trash2,
  Lock,
  Building2,
} from "lucide-react";
import { AdminTableClient } from "./AdminTableClient";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const isAuth = await getAdminSession();
  if (!isAuth) {
    redirect("/admin/login");
  }

  const [bookmarks, bookstores] = await Promise.all([
    getBookmarksWithBookstores(),
    getAllBookstores(),
  ]);

  const totalBookstores = bookstores.length;
  const totalClippings = bookmarks.reduce(
    (acc, b) => acc + (b.bookstore?.archivalMedia.length || 0),
    0
  );

  return (
    <div className="min-h-screen bg-[#FBF9F5] pb-16">
      {/* Header */}
      <header className="border-b border-parchment-border bg-white/90 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-archival-oxblood text-parchment-light flex items-center justify-center shadow-md">
                <Lock className="w-5 h-5 text-amber-300" />
              </div>
              <div>
                <h1 className="font-serif text-xl sm:text-2xl font-bold text-ink flex items-center gap-2">
                  <span>Curator's Cabinet</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-archival-oxblood/10 text-archival-oxblood border border-archival-oxblood/20 font-bold">
                    ADMIN CMS
                  </span>
                </h1>
                <p className="text-xs text-ink-muted font-serif italic hidden sm:block">
                  Catalog management, image scanner, and research dossier editor
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link href="/">
                <Button variant="outline" size="sm" className="text-xs font-serif">
                  Public Exhibit ↗
                </Button>
              </Link>

              <form action="/api/auth/logout" method="POST">
                <button
                  type="submit"
                  className="p-2 rounded-lg text-ink-muted hover:text-archival-oxblood hover:bg-parchment-muted transition-colors"
                  title="Log out of curator session"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {/* Stats Row & Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-white border border-parchment-border shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-mono text-ink-muted uppercase">Cataloged Bookmarks</p>
              <h3 className="font-serif text-3xl font-bold text-ink mt-1">{bookmarks.length}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-archival-amber flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-parchment-border shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-mono text-ink-muted uppercase">Historic Bookstores</p>
              <h3 className="font-serif text-3xl font-bold text-ink mt-1">{totalBookstores}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-archival-spruce flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-parchment-border shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-mono text-ink-muted uppercase">Archival Press Clippings</p>
              <h3 className="font-serif text-3xl font-bold text-ink mt-1">{totalClippings}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-archival-oxblood flex items-center justify-center">
              <Lock className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-parchment-border shadow-xs">
          <div>
            <h2 className="font-serif text-lg font-bold text-ink">Archive Collection Index</h2>
            <p className="text-xs text-ink-muted font-serif italic">
              Manage your collection of bookmarks, historic bookstore dossiers, and multi-location timelines.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
            <a href="/api/export" download>
              <Button variant="outline" size="sm" className="text-xs font-serif flex items-center gap-1.5 bg-white">
                <Download className="w-3.5 h-3.5" />
                <span>Export (JSON)</span>
              </Button>
            </a>

            <Link href="/admin/bookstores/new">
              <Button variant="outline" size="sm" className="text-xs font-serif flex items-center gap-1.5 bg-white">
                <Building2 className="w-3.5 h-3.5 text-archival-spruce" />
                <span>Add Bookstore</span>
              </Button>
            </Link>

            <Link href="/admin/new">
              <Button variant="oxblood" size="sm" className="text-xs font-serif flex items-center gap-1.5">
                <Plus className="w-3.5 h-3.5" />
                <span>Add Bookmark</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Client Table Component */}
        <AdminTableClient initialBookmarks={bookmarks} initialBookstores={bookstores} />
      </main>
    </div>
  );
}
