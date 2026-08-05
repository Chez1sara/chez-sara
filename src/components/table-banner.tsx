"use client";

import { usePathname } from "next/navigation";
import { useTableEnregistree } from "@/lib/table-session";

export default function TableBanner() {
  const pathname = usePathname();
  const table = useTableEnregistree();

  if (!table || pathname.startsWith("/admin")) return null;

  return (
    <div className="bg-accent px-4 py-1.5 text-center text-xs font-medium text-background">
      Table {table.id}
    </div>
  );
}