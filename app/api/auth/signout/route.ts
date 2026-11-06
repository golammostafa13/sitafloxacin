import { NextResponse } from "next/server";
import { destroyReaderSession } from "@/lib/auth";

export async function POST(req: Request) {
  await destroyReaderSession();
  return NextResponse.redirect(new URL("/", req.url), { status: 303 });
}
