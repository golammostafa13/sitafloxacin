import { redirect } from "next/navigation";
import { Download } from "lucide-react";
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
      <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/5">
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
