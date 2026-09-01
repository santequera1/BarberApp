import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/session";
import { validateCheckin } from "@/lib/checkin";

const schema = z.object({ token: z.string().min(8).max(64) });

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || (session.role !== "BARBERO" && session.role !== "ADMIN")) {
    return NextResponse.json({ error: "Sin permiso" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Token inválido" }, { status: 400 });
  }

  const result = await validateCheckin({
    token: parsed.data.token,
    validatorUserId: session.userId,
    deviceInfo: req.headers.get("user-agent") ?? undefined,
  });

  return NextResponse.json(result);
}
