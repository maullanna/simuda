import { SidebarPengurus } from "@/components/SidebarPengurus";

// Folder (pengurus) memakai tanda kurung, jadi namanya tidak ikut ke URL:
// (pengurus)/dashboard/page.tsx dibuka di /dashboard, bukan /pengurus/dashboard.
// Semua halaman di dalam folder ini otomatis memakai layout dengan sidebar ini.
export default function PengurusLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen lg:flex">
      <SidebarPengurus />
      <main className="min-w-0 flex-1 px-4 pb-10 pt-2 lg:px-10 lg:pt-8">{children}</main>
    </div>
  );
}
