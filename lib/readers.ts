import "server-only";
import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import type { Profile } from "./profile";
import { hasSupabase, maybe, must, supabase } from "./supabase";

/** Reader accounts. Supabase when configured, otherwise a local JSON file (development). */

export type Reader = Profile & { id: string; createdAt: string; lastSignIn: string; signIns: number };

type Row = {
  id: string; name: string; phone: string; email: string; district: string; thana: string; dob: string;
  gender: Profile["gender"]; created_at: string; last_sign_in: string; sign_ins: number;
};
const fromRow = (r: Row): Reader => ({
  id: r.id, name: r.name, phone: r.phone, email: r.email, district: r.district, thana: r.thana, dob: r.dob,
  gender: r.gender, createdAt: r.created_at, lastSignIn: r.last_sign_in, signIns: r.sign_ins,
});

/* ---------- local JSON ---------- */

const FILE = path.join(process.cwd(), "data/readers.json");
async function readLocal(): Promise<Reader[]> {
  try {
    return JSON.parse(await fs.readFile(FILE, "utf8"));
  } catch {
    return [];
  }
}
async function writeLocal(list: Reader[]) {
  await fs.writeFile(FILE + ".tmp", JSON.stringify(list, null, 2));
  await fs.rename(FILE + ".tmp", FILE);
}

/* ---------- API ---------- */

export async function listReaders(): Promise<Reader[]> {
  if (hasSupabase()) return must(await supabase().from("readers").select("*").order("created_at", { ascending: false }), "List readers").map(fromRow);
  return (await readLocal()).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getReader(id: string) {
  if (hasSupabase()) {
    if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
    const row = maybe(await supabase().from("readers").select("*").eq("id", id).maybeSingle(), "Get reader");
    return row ? fromRow(row) : null;
  }
  return (await readLocal()).find((r) => r.id === id) ?? null;
}

export async function findReader(by: { email?: string; phone?: string }) {
  if (hasSupabase()) {
    let q = supabase().from("readers").select("*").limit(1);
    q = by.email ? q.eq("email", by.email) : q.eq("phone", by.phone ?? "");
    const row = maybe(await q.maybeSingle(), "Find reader");
    return row ? fromRow(row) : null;
  }
  return (await readLocal()).find((r) => (by.email && r.email === by.email) || (by.phone && r.phone === by.phone)) ?? null;
}

/** Creates a reader. Returns "email" / "phone" if that one is already taken. */
export async function createReader(profile: Profile): Promise<Reader | "email" | "phone"> {
  if (hasSupabase()) {
    const res = await supabase().from("readers").insert(profile).select().single();
    if (res.error) {
      // unique violation: another sign-up won the race
      if (res.error.code === "23505") return res.error.message.includes("phone") ? "phone" : "email";
      throw new Error(`Create reader: ${res.error.message}`);
    }
    return fromRow(res.data);
  }
  const all = await readLocal();
  if (all.some((r) => r.email === profile.email)) return "email";
  if (all.some((r) => r.phone === profile.phone)) return "phone";
  const now = new Date().toISOString();
  const reader: Reader = { ...profile, id: crypto.randomUUID(), createdAt: now, lastSignIn: now, signIns: 1 };
  await writeLocal([...all, reader]);
  return reader;
}

export async function recordSignIn(reader: Reader) {
  const now = new Date().toISOString();
  if (hasSupabase()) {
    maybe(await supabase().from("readers").update({ last_sign_in: now, sign_ins: reader.signIns + 1 }).eq("id", reader.id), "Record sign-in");
    return;
  }
  const all = await readLocal();
  const r = all.find((x) => x.id === reader.id);
  if (!r) return;
  r.lastSignIn = now;
  r.signIns += 1;
  await writeLocal(all);
}
