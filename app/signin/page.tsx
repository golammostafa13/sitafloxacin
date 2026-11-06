import { redirect } from "next/navigation";
import { readerId } from "@/lib/auth";
import AuthScreen from "@/components/auth/AuthScreen";
import SignInForm from "@/components/auth/SignInForm";
import { safeNext } from "@/components/auth/fields";

export const metadata = { title: "Sign in" };

export default async function SignInPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  if (await readerId()) redirect(safeNext(next));
  return (
    <AuthScreen title="Sign in" hideBody>
      <SignInForm next={next} />
    </AuthScreen>
  );
}
