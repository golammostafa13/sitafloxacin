import { isAdmin } from "@/lib/auth";
import { listReaders } from "@/lib/readers";
import { districtById, thanaById } from "@/lib/data/bd-geo";

const cell = (v: unknown) => {
  const s = String(v ?? "");
  // quote, and neutralise spreadsheet formulas
  return `"${(/^[=+\-@]/.test(s) ? "'" + s : s).replace(/"/g, '""')}"`;
};

export async function GET() {
  if (!(await isAdmin())) return new Response("Unauthorized", { status: 401 });
  const rows = (await listReaders()).map((r) =>
    [r.name, r.phone, r.email, districtById(r.district)?.name, thanaById(r.district, r.thana)?.name, r.dob, r.gender, r.createdAt, r.lastSignIn, r.signIns].map(cell).join(","),
  );
  const csv = ["Name,Mobile,Email,District,Thana,Date of birth,Gender,Joined,Last sign-in,Sign-ins", ...rows].join("\r\n");
  return new Response("﻿" + csv, {
    headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="sage-manual-readers-${new Date().toISOString().slice(0, 10)}.csv"` },
  });
}
