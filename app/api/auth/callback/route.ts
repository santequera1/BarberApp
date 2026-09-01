import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/session";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const code = searchParams.get("code");
  const errorParam = searchParams.get("error");
  const stateParam = searchParams.get("state");

  const origin =
    process.env.NEXT_PUBLIC_APP_URL ||
    req.headers.get("origin") ||
    req.nextUrl.origin ||
    "https://barber.wailus.co";

  if (errorParam || !code) {
    return NextResponse.redirect(
      new URL(`/ingreso?error=${encodeURIComponent("Acceso con Google cancelado o fallido")}`, origin)
    );
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = `${origin}/api/auth/callback`;

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(
      new URL(`/ingreso?error=${encodeURIComponent("Google OAuth no configurado en servidor")}`, origin)
    );
  }

  try {
    // 1. Intercambiar código por access token
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    const tokenData = await tokenRes.json();
    if (!tokenRes.ok || !tokenData.access_token) {
      console.error("Error al obtener token de Google:", tokenData);
      return NextResponse.redirect(
        new URL(`/ingreso?error=${encodeURIComponent("No se pudo validar el token de Google")}`, origin)
      );
    }

    // 2. Obtener datos del perfil de Google
    const profileRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const profile = await profileRes.json();

    if (!profile.email) {
      return NextResponse.redirect(
        new URL(`/ingreso?error=${encodeURIComponent("No se pudo obtener el correo de Google")}`, origin)
      );
    }

    const email = profile.email.toLowerCase().trim();
    const name = profile.name || email.split("@")[0];

    // 3. Verificar si este correo tiene una invitación pendiente para unirse a una barbería
    const pendingInvitation = await prisma.barbershopInvitation.findFirst({
      where: { email, status: "PENDIENTE" },
      include: { barbershop: true },
    });

    let desiredRole = pendingInvitation ? "BARBERO" : "CLIENTE";

    if (!pendingInvitation && stateParam) {
      try {
        const parsedState = JSON.parse(
          Buffer.from(stateParam, "base64").toString("utf-8")
        );
        if (parsedState.role === "BARBERO" || parsedState.role === "DUEÑO") {
          desiredRole = parsedState.role;
        }
      } catch {}
    }

    // 4. Buscar o crear usuario en la base de datos
    let user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      const randomPassword = await bcrypt.hash(
        Math.random().toString(36) + Date.now().toString(36),
        10
      );

      user = await prisma.user.create({
        data: {
          email,
          name,
          passwordHash: randomPassword,
          role: desiredRole,
        },
      });
    } else if (pendingInvitation && user.role !== "ADMIN") {
      // Actualizar a rol BARBERO si fue invitado
      user = await prisma.user.update({
        where: { id: user.id },
        data: { role: "BARBERO" },
      });
    }

    // 5. Si fue invitado a una barbería, vincularlo como Barbero activo y crear sus horarios
    if (pendingInvitation) {
      const barber = await prisma.barber.upsert({
        where: { userId: user.id },
        update: {
          barbershopId: pendingInvitation.barbershopId,
          status: "ACTIVO",
          displayName: pendingInvitation.barberName || user.name,
        },
        create: {
          userId: user.id,
          barbershopId: pendingInvitation.barbershopId,
          displayName: pendingInvitation.barberName || user.name,
          specialties: "Cortes modernos, Perfilado, Barba",
          status: "ACTIVO",
        },
      });

      // Crear horarios por defecto de Lunes a Sábado si no tiene
      const existingSched = await prisma.barberSchedule.count({
        where: { barberId: barber.id },
      });

      if (existingSched === 0) {
        await prisma.barberSchedule.createMany({
          data: [1, 2, 3, 4, 5, 6].map((day) => ({
            barberId: barber.id,
            dayOfWeek: day,
            startTime: "09:00",
            endTime: "19:00",
          })),
        });
      }

      // Marcar invitación como aceptada
      await prisma.barbershopInvitation.update({
        where: { id: pendingInvitation.id },
        data: { status: "ACEPTADA" },
      });
    }

    // 6. Iniciar sesión con JWT en cookie segura
    await createSession({
      userId: user.id,
      role: user.role as "CLIENTE" | "BARBERO" | "DUEÑO" | "ADMIN",
      name: user.name,
    });

    // 7. Redireccionar según el rol
    const destination =
      user.role === "BARBERO" || pendingInvitation
        ? "/barbero"
        : user.role === "ADMIN"
        ? "/admin"
        : "/inicio";

    return NextResponse.redirect(new URL(destination, origin));
  } catch (err) {
    console.error("Error en flujo Google OAuth:", err);
    return NextResponse.redirect(
      new URL(`/ingreso?error=${encodeURIComponent("Error al procesar el ingreso con Google")}`, origin)
    );
  }
}
