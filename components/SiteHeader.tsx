import Link from "next/link";
import Image from "next/image";
import { LogOut } from "lucide-react";
import { readerId } from "@/lib/auth";
import { getReader } from "@/lib/readers";

export default async function SiteHeader() {
  const id = await readerId();
  const reader = id ? await getReader(id) : null;
  const first = reader?.name.split(/\s+/)[0];

  return (
    <header className="fixed inset-x-0 top-0 z-40 px-4 py-3 sm:px-8">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 rounded-full border border-white/15 bg-abyss/75 py-2 pl-4 pr-2 shadow-[0_10px_40px_-10px_rgba(0,0,0,.7)] backdrop-blur-xl backdrop-saturate-150 sm:pl-6">
        <Link href="/" className="font-display text-sm font-black italic tracking-wide text-white sm:text-base">
          SAGE <span className="text-mint">MANUAL</span>
        </Link>
        <nav className="flex items-center gap-3 text-xs font-semibold text-white/80 sm:gap-4 sm:text-sm">
          <Link href="/#articles" className="hidden hover:text-white sm:block">Articles</Link>
          <div className="hidden rounded-full bg-white px-3 py-1 md:block">
            <Image src="/sponsor/sitamax-logo.webp" alt="Sitamax 50" width={535} height={155} className="h-5 w-auto" />
          </div>
          {reader ? (
            <form action="/api/auth/signout" method="post" className="flex items-center gap-2">
              <span className="max-w-28 truncate text-white">Hi, {first}</span>
              <button className="rounded-full bg-white/10 p-2 hover:bg-white/20" aria-label="Sign out" title="Sign out">
                <LogOut className="h-4 w-4" />
              </button>
            </form>
          ) : (
            <>
              <Link href="/signin" className="hover:text-white">Sign in</Link>
              <Link href="/signup" className="rounded-full bg-mint px-4 py-1.5 text-abyss shadow-[0_0_20px_rgba(95,224,207,.5)] hover:bg-white">Sign up</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
