import nodemailer from "nodemailer";

export async function sendBarberInvitationEmail({
  toEmail,
  barberName,
  barbershopName,
  inviteLink,
}: {
  toEmail: string;
  barberName?: string;
  barbershopName: string;
  inviteLink: string;
}) {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const port = Number(process.env.SMTP_PORT || 587);
  const secure = process.env.SMTP_SECURE === "true" || port === 465;
  const fromEmail = process.env.SMTP_FROM || "notificaciones@wailus.co";
  const fromName = process.env.SMTP_FROM_NAME || "BarberApp";

  if (!host || !user || !pass) {
    console.log(
      `[EMAIL SIMULADO] Para: ${toEmail} | Barbería: ${barbershopName} | Enlace: ${inviteLink}`
    );
    return { sent: false, reason: "SMTP_NOT_CONFIGURED" };
  }

  try {
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: { user, pass },
      tls: {
        rejectUnauthorized: false,
      },
    });

    const greeting = barberName ? `¡Hola ${barberName}!` : "¡Hola!";

    const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #000000; color: #ffffff; padding: 20px; }
          .card { max-width: 500px; margin: 0 auto; background-color: #121215; border: 1px solid rgba(255,255,255,0.1); border-radius: 20px; padding: 30px; text-align: center; }
          .badge { display: inline-block; background-color: rgba(239, 68, 68, 0.15); color: #EF4444; font-weight: 800; font-size: 11px; text-transform: uppercase; padding: 4px 12px; border-radius: 50px; margin-bottom: 12px; }
          h1 { font-size: 22px; font-weight: 900; margin: 0 0 10px 0; color: #ffffff; }
          p { color: #a1a1aa; font-size: 14px; line-height: 1.5; margin: 0 0 20px 0; }
          .btn { display: inline-block; background-color: #EF4444; color: #ffffff; text-decoration: none; font-weight: 800; font-size: 13px; text-transform: uppercase; padding: 14px 30px; border-radius: 50px; margin: 15px 0; box-shadow: 0 4px 20px rgba(239, 68, 68, 0.4); }
          .footer { font-size: 11px; color: #52525b; margin-top: 25px; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 15px; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="badge">Invitación de Equipo · BarberApp</div>
          <h1>${greeting}</h1>
          <p>Has sido invitado para formar parte del equipo de barberos en <strong>${barbershopName}</strong>.</p>
          <p>Podrás gestionar tus citas en tiempo real, validar pases QR de tus clientes y configurar tus propios horarios de atención.</p>
          
          <a href="${inviteLink}" class="btn">Aceptar Invitación y Activar Panel</a>
          
          <p style="font-size: 12px; color: #71717a; margin-top: 15px;">
            Solo haz clic en el botón y presiona <strong>"Continuar con Google"</strong> con este correo (<code>${toEmail}</code>).
          </p>
          
          <div class="footer">
            BarberApp · Plataforma Oficial de Gestión de Barberías · <a href="https://barber.wailus.co" style="color: #3b82f6;">barber.wailus.co</a>
          </div>
        </div>
      </body>
    </html>
    `;

    await transporter.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to: toEmail,
      subject: `💈 ¡Te invitaron como Barbero a ${barbershopName} en BarberApp!`,
      html: htmlContent,
    });

    return { sent: true };
  } catch (err) {
    console.error("Error al enviar correo de invitación:", err);
    return { sent: false, error: err };
  }
}
