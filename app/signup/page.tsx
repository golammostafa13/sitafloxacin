import { redirect } from "next/navigation";
import { readerId } from "@/lib/auth";
import AuthScreen from "@/components/auth/AuthScreen";
import SignUpForm from "@/components/auth/SignUpForm";
import { safeNext } from "@/components/auth/fields";

export const metadata = { title: "Sign up" };

export default async function SignUpPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  if (await readerId()) redirect(safeNext(next));
  return (
    <AuthScreen title="Sign up" wide>
      <SignUpForm next={next} />
    </AuthScreen>
  );
}
