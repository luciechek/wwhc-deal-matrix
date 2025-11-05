// app/api/access/route.ts
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { code } = await req.json();

  // compare à la variable Vercel/loc: APP_ACCESS_CODE
  if (code !== process.env.APP_ACCESS_CODE) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  // Crée la réponse et pose le cookie d'accès dessus
  const res = NextResponse.json({ ok: true });

  res.cookies.set("access", "granted", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 jours
  });

  return res;
}
