import { NextResponse } from "next/server";
import { parseProfile } from "@/lib/profile";
import { createReader, findReader } from "@/lib/readers";
import { createReaderSession } from "@/lib/auth";

// Sign-up: validate, make sure email and mobile are new, then sign in directly (no email code for now).
export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return NextResponse.json({ error: "Bad request" }, { status: 400 });
  const parsed = parseProfile(body);
  if (!parsed.ok) return NextResponse.json({ error: "Please check the highlighted fields", fields: parsed.errors }, { status: 422 });
  const { profile } = parsed;
  if (await findReader({ email: profile.email }))
    return NextResponse.json({ error: "This email already has an account. Please sign in.", fields: { email: "Already registered" } }, { status: 409 });
  if (await findReader({ phone: profile.phone }))
    return NextResponse.json({ error: "This mobile number already has an account.", fields: { phone: "Already registered" } }, { status: 409 });
  const reader = await createReader(profile);
  if (reader === "email")
    return NextResponse.json({ error: "This email already has an account. Please sign in.", fields: { email: "Already registered" } }, { status: 409 });
  if (reader === "phone")
    return NextResponse.json({ error: "This mobile number already has an account.", fields: { phone: "Already registered" } }, { status: 409 });
  await createReaderSession(reader.id);
  return NextResponse.json({ ok: true });
}
