import Link from "next/link";
import { logout } from "./actions";
import { adminEmail } from "@/lib/auth";

export default async function AdminShell({ children, title }: { children: React.ReactNode; title: string }) {
  const email = await adminEmail();
  return (
    <main className="min-h-svh bg-[radial-gradient(ellipse_at_80%_0%,#0b2a6f_0%,#030d26_60%)] text-white">
      <header className="sticky top-0 z-20 border-b border-white/10 bg-abyss/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3 sm:px-8">
          <Link href="/admin" className="font-display font-black italic">SAGE <span className="text-mint">ADMIN</span></Link>
          <Link href="/admin" className="ml-4 text-sm text-white/70 hover:text-white">Articles</Link>
          <Link href="/admin/readers" className="text-sm text-white/70 hover:text-white">Readers</Link>
          <span className="flex-1" />
          {email && <span className="hidden text-xs text-white/45 md:block">{email}</span>}
          <Link href="/" target="_blank" className="text-sm text-white/70 hover:text-white">View site</Link>
          <form action={logout}><button className="rounded-full border border-white/20 px-4 py-1.5 text-sm hover:bg-white/10">Sign out</button></form>
        </div>
      </header>
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-8">
        <h1 className="mb-8 font-display text-4xl font-black italic">{title}</h1>
        {children}
      </div>
    </main>
  );
}
