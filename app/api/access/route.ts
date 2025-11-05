import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  const { code } = await req.json();
  const ok = code === process.env.APP_ACCESS_CODE;

  if (!ok) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  // session cookie ~7 days
  cookies().set("access", "granted", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return NextResponse.json({ ok: true });
}
