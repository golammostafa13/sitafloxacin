import Link from "next/link";
import Image from "next/image";
import { BookOpen, LayoutDashboard, LogIn, LogOut, UserPlus } from "lucide-react";
import { isAdmin, readerId } from "@/lib/auth";
import { getReader } from "@/lib/readers";

const iconBtn = "grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/20 sm:h-auto sm:w-auto sm:gap-2 sm:bg-transparent sm:px-3 sm:py-2 sm:hover:bg-white/10";

export default async function SiteHeader() {
  const id = await readerId();
  const reader = id ? await getReader(id) : null;
  const admin = await isAdmin();
  const first = reader?.name.split(/\s+/)[0] ?? (admin ? "Admin" : undefined);

  return (
    <header className="fixed inset-x-0 top-0 z-40 px-3 pt-[max(0.75rem,env(safe-area-inset-top))] sm:px-8">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 rounded-full border border-white/15 bg-abyss/80 py-1.5 pl-4 pr-1.5 shadow-[0_10px_40px_-10px_rgba(0,0,0,.7)] backdrop-blur-xl backdrop-saturate-150 sm:pl-6">
        <Link href="/" className="shrink-0 font-display text-sm font-black italic tracking-wide text-white sm:text-base">
          SAGE <span className="text-mint">MANUAL</span>
        </Link>
        <nav className="flex items-center gap-1.5 text-sm font-semibold text-white/85 sm:gap-1">
          <Link href="/#articles" className={iconBtn} aria-label="Articles" title="Articles">
            <BookOpen className="h-[18px] w-[18px]" />
            <span className="hidden sm:inline">Articles</span>
          </Link>
          <div className="mx-1 hidden rounded-full bg-white px-3 py-1 md:block">
            <Image src="/sponsor/sitamax-logo.webp" alt="Sitamax 50" width={535} height={155} className="h-5 w-auto" />
          </div>
          {admin && (
            <Link href="/admin" className={iconBtn} aria-label="Admin" title="Admin">
              <LayoutDashboard className="h-[18px] w-[18px]" />
              <span className="hidden sm:inline">Admin</span>
            </Link>
          )}
          {first ? (
            <form action="/api/auth/signout" method="post" className="flex items-center gap-1.5">
              <span className="hidden max-w-28 truncate pl-1 text-white min-[400px]:block">Hi, {first}</span>
              <button className="grid h-10 w-10 place-items-center rounded-full bg-white/10 hover:bg-signal/30" aria-label="Sign out" title="Sign out">
                <LogOut className="h-[18px] w-[18px]" />
              </button>
            </form>
          ) : (
            <>
              <Link href="/signin" className={iconBtn} aria-label="Sign in" title="Sign in">
                <LogIn className="h-[18px] w-[18px]" />
                <span className="hidden sm:inline">Sign in</span>
              </Link>
              <Link href="/signup" className="flex h-10 items-center gap-1.5 rounded-full bg-mint px-4 text-abyss shadow-[0_0_20px_rgba(95,224,207,.5)] hover:bg-white">
                <UserPlus className="h-[18px] w-[18px]" />
                Sign up
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
