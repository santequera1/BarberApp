import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🧹 Limpiando base de datos para empezar de nuevo...");

  // 1. Eliminar datos dependientes en orden
  await prisma.appointmentCheckin.deleteMany({});
  await prisma.appointmentService.deleteMany({});
  await prisma.appointment.deleteMany({});
  await prisma.barberSchedule.deleteMany({});
  await prisma.barberTimeOff.deleteMany({});
  await prisma.service.deleteMany({});
  await prisma.barbershopHours.deleteMany({});
  await prisma.barbershopInvitation.deleteMany({});
  await prisma.barber.deleteMany({});
  await prisma.barbershop.deleteMany({});
  await prisma.user.deleteMany({});

  // 2. Crear usuario Super Admin limpio
  const adminPassword = await bcrypt.hash("admin123", 10);
  const admin = await prisma.user.create({
    data: {
      email: "admin@barberia.app",
      name: "Super Admin",
      phone: "3001234567",
      passwordHash: adminPassword,
      role: "ADMIN",
    },
  });

  // 3. Crear ajustes globales por defecto
  await prisma.barbershopSettings.upsert({
    where: { id: "singleton" },
    update: {
      name: "BarberApp",
      address: "Colombia",
      phone: "3001234567",
    },
    create: {
      id: "singleton",
      name: "BarberApp",
      address: "Colombia",
      phone: "3001234567",
      minBookingNotice: 15,
      maxBookingHorizon: 30,
      cancellationWindow: 60,
      bufferMinutes: 5,
      lateTolerance: 20,
      checkinWindowBefore: 20,
    },
  });

  console.log("✅ Base de datos limpiada con éxito.");
  console.log("👑 Super Admin creado: admin@barberia.app / admin123");
  console.log("🚀 Listo para crear nuevas barberías y registrar barberos reales.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
