import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Server-only Supabase client using the secret (service role) key.
 * Row Level Security is on with no public policies, so the browser can never
 * read the tables directly; every read and write goes through this server.
 *
 * Without SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY the app falls back to the
 * local JSON/file store (handy for development).
 */
let client: SupabaseClient | null = null;

export const hasSupabase = () => Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);

export function supabase() {
  if (!hasSupabase()) throw new Error("Supabase is not configured");
  client ??= createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return client;
}

export const BUCKET_COVERS = "covers"; // public
export const BUCKET_ARTICLES = "articles"; // private, signed URLs only

type Res<T> = { data: T; error: { message: string } | null };

/** Result data, throwing a readable error when the call failed or returned nothing. */
export function must<T>(res: Res<T>, what: string): NonNullable<T> {
  if (res.error) throw new Error(`${what}: ${res.error.message}`);
  if (res.data == null) throw new Error(`${what}: no data`);
  return res.data;
}

/** Result data that may legitimately be null (lookups, writes without select). */
export function maybe<T>(res: Res<T>, what: string): T {
  if (res.error) throw new Error(`${what}: ${res.error.message}`);
  return res.data;
}
