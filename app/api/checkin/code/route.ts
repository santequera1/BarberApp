import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/session";
import { validateCheckin } from "@/lib/checkin";
import { rateLimit } from "@/lib/rate-limit";

const schema = z.object({ backupCode: z.string().min(6).max(8) });

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || (session.role !== "BARBERO" && session.role !== "ADMIN")) {
    return NextResponse.json({ error: "Sin permiso" }, { status: 403 });
  }

  // Rate limit contra fuerza bruta sobre 6 caracteres
  if (!rateLimit(`checkin-code:${session.userId}`, 10, 60_000)) {
    return NextResponse.json(
      { ok: false, reason: "RATE_LIMIT", detail: "Demasiados intentos. Espera un minuto." },
      { status: 429 }
    );
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, reason: "NO_EXISTE", detail: "Código inválido" },
      { status: 400 }
    );
  }

  const result = await validateCheckin({
    backupCode: parsed.data.backupCode,
    validatorUserId: session.userId,
    deviceInfo: req.headers.get("user-agent") ?? undefined,
  });

  return NextResponse.json(result);
}
