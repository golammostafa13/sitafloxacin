import "server-only";
import crypto from "node:crypto";
import { cookies } from "next/headers";

const COOKIE = "sm_admin";
const MAX_AGE = 60 * 60 * 8;

function sign(value: string) {
  const secret = process.env.SESSION_SECRET || "dev-secret";
  return crypto.createHmac("sha256", secret).update(value).digest("hex");
}

const safeEqual = (a: string, b: string) => {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && crypto.timingSafeEqual(x, y);
};

/** Emails allowed into /admin (ADMIN_EMAILS, comma-separated). */
export function adminEmails() {
  return (process.env.ADMIN_EMAILS ?? "").split(",").map((e) => e.trim().toLowerCase()).filter(Boolean);
}

/** Shared reader password for sign-in (READER_PASSWORD, default "Sitamax"). */
export function checkReaderPassword(password: string) {
  return safeEqual(password, process.env.READER_PASSWORD || "Sitamax");
}

/** True when the email is a listed admin and the password matches ADMIN_PASSWORD. */
export function checkAdmin(email: string, password: string) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  const okEmail = adminEmails().includes(email.trim().toLowerCase());
  const okPassword = safeEqual(password, expected);
  return okEmail && okPassword;
}

export async function createSession(email: string) {
  const exp = Date.now() + MAX_AGE * 1000;
  const value = `${Buffer.from(email.trim().toLowerCase()).toString("base64url")}.${exp}`;
  (await cookies()).set(COOKIE, `${value}.${sign(value)}`, { httpOnly: true, sameSite: "lax", path: "/", maxAge: MAX_AGE, secure: process.env.NODE_ENV === "production" });
}

export async function destroySession() {
  (await cookies()).delete(COOKIE);
}

/** The signed-in admin's email, or null. Removing an email from ADMIN_EMAILS ends its sessions. */
export async function adminEmail() {
  const token = (await cookies()).get(COOKIE)?.value;
  const parts = token?.split(".");
  if (!parts || parts.length !== 3) return null;
  const [enc, exp, sig] = parts;
  if (Number(exp) < Date.now() || !safeEqual(sig, sign(`${enc}.${exp}`))) return null;
  const email = Buffer.from(enc, "base64url").toString();
  return adminEmails().includes(email) ? email : null;
}

export async function isAdmin() {
  return (await adminEmail()) !== null;
}

/* ---------- Readers ---------- */

const READER = "sm_session";
const KNOWN = "sm_known"; // remembers this browser has an account, so the QR goes to Sign in
const READER_AGE = 60 * 60 * 24 * 30;

export async function createReaderSession(id: string) {
  const exp = Date.now() + READER_AGE * 1000;
  const value = `${id}.${exp}`;
  const jar = await cookies();
  const opts = { httpOnly: true, sameSite: "lax" as const, path: "/", secure: process.env.NODE_ENV === "production" };
  jar.set(READER, `${value}.${sign(value)}`, { ...opts, maxAge: READER_AGE });
  jar.set(KNOWN, "1", { ...opts, maxAge: 60 * 60 * 24 * 400 });
}

export async function destroyReaderSession() {
  (await cookies()).delete(READER);
}

/** The signed-in reader's id, or null. */
export async function readerId() {
  const token = (await cookies()).get(READER)?.value;
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [id, exp, sig] = parts;
  if (Number(exp) < Date.now()) return null;
  const good = sign(`${id}.${exp}`);
  if (sig.length !== good.length || !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(good))) return null;
  return id;
}

export async function isKnownBrowser() {
  return (await cookies()).get(KNOWN)?.value === "1";
}

/** Readers and admins may open articles. */
export async function canRead() {
  return (await readerId()) !== null || (await isAdmin());
}
