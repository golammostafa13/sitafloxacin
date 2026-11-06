"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { ExternalLink, LibraryBig, LogOut, Users } from "lucide-react";
import { logout } from "./actions";

const LINKS = [
  { href: "/admin", label: "Articles", Icon: LibraryBig, match: (p: string) => p === "/admin" || (p.startsWith("/admin/") && !p.startsWith("/admin/readers")) },
  { href: "/admin/readers", label: "Readers", Icon: Users, match: (p: string) => p.startsWith("/admin/readers") },
];

/** Inline links in the header on tablets and up. */
export default function AdminNav() {
  const path = usePathname();
  return (
    <nav className="hidden items-center gap-1 sm:flex">
        {LINKS.map(({ href, label, Icon, match }) => (
          <Link key={href} href={href} className={clsx("flex items-center gap-2 rounded-full px-3 py-2 text-sm", match(path) ? "bg-white/10 text-white" : "text-white/70 hover:bg-white/5 hover:text-white")}>
            <Icon className="h-4 w-4" /> {label}
          </Link>
        ))}
    </nav>
  );
}

/**
 * Fixed bottom tab bar on phones (easy thumb reach). Render it outside the
 * header: the header's backdrop-blur would otherwise pin it to the header.
 */
export function AdminTabs() {
  const path = usePathname();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-white/10 bg-abyss/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl sm:hidden">
        <div className="grid grid-cols-4">
          {LINKS.map(({ href, label, Icon, match }) => (
            <Link key={href} href={href} className={clsx("flex flex-col items-center gap-1 py-2.5 text-[11px] font-semibold", match(path) ? "text-mint" : "text-white/60")}>
              <Icon className="h-5 w-5" /> {label}
            </Link>
          ))}
          <Link href="/" target="_blank" className="flex flex-col items-center gap-1 py-2.5 text-[11px] font-semibold text-white/60">
            <ExternalLink className="h-5 w-5" /> View site
          </Link>
          <form action={logout} className="contents">
            <button className="flex flex-col items-center gap-1 py-2.5 text-[11px] font-semibold text-white/60">
              <LogOut className="h-5 w-5" /> Sign out
            </button>
          </form>
        </div>
    </nav>
  );
}
