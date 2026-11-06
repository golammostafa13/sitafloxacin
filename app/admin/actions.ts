"use server";

import { redirect } from "next/navigation";
import { checkAdmin, createSession, destroySession } from "@/lib/auth";

export async function login(_: string | null, form: FormData) {
  const email = String(form.get("email") ?? "");
  // one message for both cases, so the form doesn't reveal which emails are admins
  if (!checkAdmin(email, String(form.get("password") ?? ""))) return "Wrong email or password";
  await createSession(email);
  redirect("/admin");
}

export async function logout() {
  await destroySession();
  redirect("/admin/login");
}
