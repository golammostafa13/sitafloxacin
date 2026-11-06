import { districtById, thanaById } from "./data/bd-geo";

/** Reader sign-up validation, used by the form and the server (same rules as Gastro Book Bank). */

export const GENDERS = ["male", "female"] as const;
export type Gender = (typeof GENDERS)[number];

export type Profile = {
  name: string;
  phone: string;
  email: string;
  district: string;
  thana: string;
  dob: string;
  gender: Gender;
};
export type ProfileErrors = Partial<Record<keyof Profile, string>>;

const text = (v: unknown) => (typeof v === "string" ? v.trim() : "");

export const normaliseEmail = (v: string) => v.trim().toLowerCase();
export const isEmailShaped = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e) && e.length <= 254;

export function normalisePhone(value: string) {
  const digits = value.replace(/\D+/g, "");
  if (digits.startsWith("880")) return `0${digits.slice(3)}`;
  if (digits.length === 10 && digits.startsWith("1")) return `0${digits}`;
  return digits;
}
export const isMobileShaped = (p: string) => /^01[3-9]\d{8}$/.test(p);

function isPlausibleDob(value: string) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!m) return false;
  const [y, mo, d] = m.slice(1).map(Number);
  const date = new Date(Date.UTC(y, mo - 1, d));
  if (date.getUTCFullYear() !== y || date.getUTCMonth() !== mo - 1 || date.getUTCDate() !== d) return false;
  const age = (Date.now() - date.getTime()) / (365.25 * 864e5);
  return age >= 10 && age <= 100;
}

export function parseProfile(input: Record<string, unknown>): { ok: true; profile: Profile } | { ok: false; errors: ProfileErrors } {
  const errors: ProfileErrors = {};
  const name = text(input.name);
  if (!name) errors.name = "Enter your name";
  else if (name.length > 120) errors.name = "Too long";

  const phone = normalisePhone(text(input.phone));
  if (!phone) errors.phone = "Enter your mobile number";
  else if (!isMobileShaped(phone)) errors.phone = "Enter an 11-digit mobile number (01XXXXXXXXX)";

  const email = normaliseEmail(text(input.email));
  if (!email) errors.email = "Enter your email";
  else if (!isEmailShaped(email)) errors.email = "Enter a valid email";

  const district = text(input.district);
  if (!districtById(district)) errors.district = "Choose your district";
  const thana = text(input.thana);
  if (!thanaById(district, thana)) errors.thana = "Choose your thana / city";

  const dob = text(input.dob);
  if (!dob) errors.dob = "Enter your date of birth";
  else if (!isPlausibleDob(dob)) errors.dob = "Enter a valid date of birth";

  const gender = text(input.gender) as Gender;
  if (!GENDERS.includes(gender)) errors.gender = "Choose one";

  if (Object.keys(errors).length) return { ok: false, errors };
  return { ok: true, profile: { name, phone, email, district, thana, dob, gender } };
}
