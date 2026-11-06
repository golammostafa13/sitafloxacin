import { NextResponse } from "next/server";
import { isEmailShaped, normaliseEmail, normalisePhone } from "@/lib/profile";
import { findReader, recordSignIn } from "@/lib/readers";
import { createReaderSession } from "@/lib/auth";

// Direct sign-in with email or mobile number (no verification for now).
export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as { identifier?: unknown } | null;
  const raw = typeof body?.identifier === "string" ? body.identifier.trim() : "";
  if (!raw) return NextResponse.json({ error: "Enter your email or mobile number" }, { status: 400 });
  const reader = raw.includes("@")
    ? isEmailShaped(normaliseEmail(raw)) ? await findReader({ email: normaliseEmail(raw) }) : null
    : await findReader({ phone: normalisePhone(raw) });
  if (!reader) return NextResponse.json({ error: "No account found. Please sign up first.", notFound: true }, { status: 404 });
  await recordSignIn(reader);
  await createReaderSession(reader.id);
  return NextResponse.json({ ok: true, name: reader.name });
}
