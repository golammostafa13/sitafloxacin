import Link from "next/link";
import { ExternalLink, LogOut } from "lucide-react";
import { logout } from "./actions";
import { adminEmail } from "@/lib/auth";
import AdminNav, { AdminTabs } from "./AdminNav";

export default async function AdminShell({ children, title }: { children: React.ReactNode; title: string }) {
  const email = await adminEmail();
  return (
    <main className="min-h-svh bg-[radial-gradient(ellipse_at_80%_0%,#0b2a6f_0%,#030d26_60%)] pb-24 text-white sm:pb-0">
      <header className="sticky top-0 z-20 border-b border-white/10 bg-abyss/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3 sm:px-8">
          <Link href="/admin" className="mr-2 font-display font-black italic">SAGE <span className="text-mint">ADMIN</span></Link>
          <AdminNav />
          <span className="flex-1" />
          {email && <span className="hidden max-w-56 truncate text-xs text-white/45 md:block">{email}</span>}
          <Link href="/" target="_blank" className="hidden items-center gap-2 rounded-full px-3 py-2 text-sm text-white/70 hover:bg-white/5 hover:text-white sm:flex">
            <ExternalLink className="h-4 w-4" /> View site
          </Link>
          <form action={logout} className="hidden sm:block">
            <button className="flex items-center gap-2 rounded-full border border-white/20 px-4 py-1.5 text-sm hover:bg-white/10">
              <LogOut className="h-4 w-4" /> Sign out
            </button>
          </form>
        </div>
      </header>
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-8 sm:py-10">
        <h1 className="mb-6 font-display text-3xl font-black italic sm:mb-8 sm:text-4xl">{title}</h1>
        {children}
      </div>
      <AdminTabs />
    </main>
  );
}
