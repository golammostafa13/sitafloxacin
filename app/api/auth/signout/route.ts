import { NextResponse } from "next/server";
import { destroyReaderSession, destroySession } from "@/lib/auth";

export async function POST(req: Request) {
  await destroyReaderSession();
  await destroySession();
  return NextResponse.redirect(new URL("/signin", req.url), { status: 303 });
}
