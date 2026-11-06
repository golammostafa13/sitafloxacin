import { redirect } from "next/navigation";
import { CalendarDays, Download, LogIn, Mail, MapPin, Phone, User } from "lucide-react";
import { isAdmin } from "@/lib/auth";
import { listReaders } from "@/lib/readers";
import { districtById, thanaById } from "@/lib/data/bd-geo";
import AdminShell from "../AdminShell";

export const dynamic = "force-dynamic";
export const metadata = { title: "Readers" };

export default async function ReadersPage() {
  if (!(await isAdmin())) redirect("/admin/login");
  const readers = await listReaders();
  return (
    <AdminShell title={`Readers (${readers.length})`}>
      <a href="/api/admin/readers" className="mb-6 inline-flex items-center gap-2 rounded-full bg-mint px-5 py-2.5 font-display text-sm font-extrabold italic text-abyss hover:bg-white">
        <Download className="h-4 w-4" /> Export CSV
      </a>
      {/* Phones: one card per reader */}
      <ul className="grid gap-3 md:hidden">
        {readers.length === 0 && <li className="rounded-2xl border border-white/10 bg-white/5 px-4 py-8 text-center text-white/50">No readers yet</li>}
        {readers.map((r) => {
          const place = [thanaById(r.district, r.thana)?.name, districtById(r.district)?.name].filter(Boolean).join(", ");
          return (
            <li key={r.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="mb-3 flex items-start justify-between gap-3">
                <p className="font-semibold leading-snug">{r.name}</p>
                <span className="flex shrink-0 items-center gap-1 rounded-full bg-white/10 px-2.5 py-1 text-xs tabular-nums text-white/70" title="Sign-ins">
                  <LogIn className="h-3.5 w-3.5" /> {r.signIns}
                </span>
              </div>
              <div className="grid gap-2 text-sm text-white/75">
                {r.phone && <a href={`tel:${r.phone}`} className="flex items-center gap-2 tabular-nums hover:text-mint"><Phone className="h-4 w-4 shrink-0 text-white/40" /> {r.phone}</a>}
                {r.email && <a href={`mailto:${r.email}`} className="flex min-w-0 items-center gap-2 hover:text-mint"><Mail className="h-4 w-4 shrink-0 text-white/40" /> <span className="truncate">{r.email}</span></a>}
                {place && <p className="flex items-center gap-2"><MapPin className="h-4 w-4 shrink-0 text-white/40" /> {place}</p>}
                <p className="flex items-center gap-2 capitalize"><User className="h-4 w-4 shrink-0 text-white/40" /> {[r.gender, r.dob && `born ${r.dob}`].filter(Boolean).join(" · ")}</p>
                <p className="flex items-center gap-2 text-white/50"><CalendarDays className="h-4 w-4 shrink-0 text-white/40" /> Joined {r.createdAt.slice(0, 10)}</p>
              </div>
            </li>
          );
        })}
      </ul>

      {/* Tablets and up: full table */}
      <div className="hidden overflow-x-auto rounded-2xl md:block border border-white/10 bg-white/5">
        <table className="w-full min-w-[820px] text-left text-sm">
          <thead className="text-xs uppercase tracking-wider text-white/45">
            <tr>{["Name", "Mobile", "Email", "District", "Thana", "Born", "Gender", "Joined", "Sign-ins"].map((h) => <th key={h} className="px-4 py-3 font-semibold">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {readers.length === 0 && <tr><td colSpan={9} className="px-4 py-8 text-center text-white/50">No readers yet</td></tr>}
            {readers.map((r) => (
              <tr key={r.id}>
                <td className="px-4 py-3 font-semibold">{r.name}</td>
                <td className="px-4 py-3 tabular-nums">{r.phone}</td>
                <td className="px-4 py-3">{r.email}</td>
                <td className="px-4 py-3">{districtById(r.district)?.name}</td>
                <td className="px-4 py-3">{thanaById(r.district, r.thana)?.name}</td>
                <td className="px-4 py-3 tabular-nums">{r.dob}</td>
                <td className="px-4 py-3 capitalize">{r.gender}</td>
                <td className="px-4 py-3 tabular-nums text-white/60">{r.createdAt.slice(0, 10)}</td>
                <td className="px-4 py-3 tabular-nums">{r.signIns}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}
