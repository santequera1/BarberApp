import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/session";
import { rateLimit } from "@/lib/rate-limit";

const schema = z.object({
  name: z.string().min(2, "Escribe tu nombre").max(80),
  email: z.string().email("Correo inválido").toLowerCase(),
  phone: z.string().min(7).max(15).regex(/^\d+$/, "Solo números").optional().or(z.literal("")),
  password: z.string().min(8, "Mínimo 8 caracteres").max(100),
});

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? "local";
  if (!rateLimit(`register:${ip}`, 10, 60_000)) {
    return NextResponse.json(
      { error: "Demasiados intentos. Espera un minuto." },
      { status: 429 }
    );
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 }
    );
  }

  const { name, email, phone, password } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json(
      { error: "Ese correo ya está registrado. Inicia sesión." },
      { status: 409 }
    );
  }

  const user = await prisma.user.create({
    data: {
      name,
      email,
      phone: phone || null,
      passwordHash: await bcrypt.hash(password, 12),
      role: "CLIENTE",
    },
  });

  await createSession({ userId: user.id, role: "CLIENTE", name: user.name });
  return NextResponse.json({ ok: true, role: "CLIENTE" });
}
