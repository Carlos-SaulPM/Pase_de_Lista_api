import prisma from "#/lib/prisma.js";
import bcrypt from "bcryptjs";

async function main() {
  const existente = await prisma.credencial.findUnique({
    where: { matricula: "admin" },
  });

  if (existente) {
    console.log("✓ Admin ya existe, saltando seed");
    return;
  }

  const hash = await bcrypt.hash("admin123", 10);

  await prisma.usuario.create({
    data: {
      nombre: "Admin",
      apellidoPaterno: "Sistema",
      apellidoMaterno: "Root",
      fechaDeCreacion: new Date(),
      correo: "admin@pasedelista.com",
      rol: "ADMINISTRADOR",
      credencial: {
        create: {
          matricula: "admin",
          contrasena: hash,
          estaActivo: true,
        },
      },
    },
  });

  console.log("✓ Admin creado (admin / admin123)");
}

main()
  .catch((e) => {
    console.error("✗ Error en seed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
