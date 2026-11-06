import { NextResponse } from "next/server";
import { isEmailShaped, normaliseEmail, normalisePhone } from "@/lib/profile";
import { findReader, recordSignIn } from "@/lib/readers";
import { adminEmails, checkAdmin, checkReaderPassword, createReaderSession, createSession } from "@/lib/auth";

// Sign-in with email or mobile number plus the shared reader password.
// Admin emails sign in with ADMIN_PASSWORD instead, which also opens /admin.
export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as { identifier?: unknown; password?: unknown } | null;
  const raw = typeof body?.identifier === "string" ? body.identifier.trim() : "";
  const password = typeof body?.password === "string" ? body.password : "";
  if (!raw) return NextResponse.json({ error: "Enter your email or mobile number", field: "identifier" }, { status: 400 });
  if (!password) return NextResponse.json({ error: "Enter the password", field: "password" }, { status: 400 });
  const email = normaliseEmail(raw);
  if (raw.includes("@") && adminEmails().includes(email)) {
    if (!checkAdmin(email, password)) return NextResponse.json({ error: "Wrong password", field: "password" }, { status: 401 });
    await createSession(email);
    // An admin who also signed up as a reader gets the reader session too.
    const asReader = await findReader({ email });
    if (asReader) {
      await recordSignIn(asReader);
      await createReaderSession(asReader.id);
    }
    return NextResponse.json({ ok: true, admin: true, name: asReader?.name ?? "Admin" });
  }
  if (!checkReaderPassword(password)) return NextResponse.json({ error: "Wrong password", field: "password" }, { status: 401 });
  const reader = raw.includes("@")
    ? isEmailShaped(normaliseEmail(raw)) ? await findReader({ email: normaliseEmail(raw) }) : null
    : await findReader({ phone: normalisePhone(raw) });
  if (!reader) return NextResponse.json({ error: "No account found. Please sign up first.", field: "identifier", notFound: true }, { status: 404 });
  await recordSignIn(reader);
  await createReaderSession(reader.id);
  return NextResponse.json({ ok: true, name: reader.name });
}
