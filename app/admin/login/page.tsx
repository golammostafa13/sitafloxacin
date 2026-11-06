import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import LoginForm from "./LoginForm";

export const metadata = { title: "Admin login" };

export default async function LoginPage() {
  if (await isAdmin()) redirect("/admin");
  return (
    <main className="relative grid min-h-svh place-items-center overflow-hidden bg-[radial-gradient(ellipse_at_50%_30%,#1e5bd8_0%,#0b2a6f_40%,#030d26_80%)] px-4">
      <div className="hex-grid absolute inset-0 opacity-40" />
      <div className="relative w-full max-w-sm"><LoginForm /></div>
    </main>
  );
}
