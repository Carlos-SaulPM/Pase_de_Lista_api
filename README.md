# Configuración del proyecto

## Requisitos
- MariaDB (via Docker o local)
- Node.js 20+
- pnpm

## Levantar entorno

```bash
# 1. Iniciar MariaDB
docker compose up -d

# 2. Instalar dependencias
pnpm install

# 3. Generar cliente Prisma + Push schema + Seed (crea admin automáticamente)
pnpm run db:push

# 4. Iniciar servidor (puerto 3001)
pnpm run dev
```

## Scripts disponibles

| Script | Descripción |
|--------|-------------|
| `dev` | Inicia servidor con hot-reload (port 3001) |
| `build` | Compila TypeScript a JS |
| `db:push` | Sincroniza schema Prisma + ejecuta seed automático |
| `db:seed` | Ejecuta seed (crea usuario admin si no existe) |
| `db:generate` | Genera Prisma Client |
| `db:migrate` | Ejecuta migraciones (alternativa a db:push) |
| `db:studio` | Abre Prisma Studio (UI para BD) |

## Seed automático

El usuario ADMINISTRADOR se crea automáticamente al ejecutar `pnpm run db:push` (o `pnpm run db:seed` por separado).

**Credenciales:**
- Matrícula: `admin`
- Contraseña: `admin123`

El seed es idempotente: si el admin ya existe, lo omite.

## Test rápido

Las colecciones de Postman en la raíz del proyecto:
- `pase_de_lista.postman_collection.json` — Flujo completo de prueba (22 requests)
- `seed_data.postman_collection.json` — Seed de datos de prueba (~63 requests)
