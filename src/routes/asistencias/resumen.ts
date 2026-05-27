import { Response } from "express";
import prisma from "#/lib/prisma.js";
import { authMiddleware, requireRol, AutenticatedRequest } from "#/middleware/auth.js";

/**
 * @openapi
 * /api/asistencias/resumen:
 *   get:
 *     tags:
 *       - Profesor
 *     summary: Resumen de asistencias del profesor autenticado
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estadisticas agregadas de todas las clases del profesor
 */
export const GET = [
  authMiddleware,
  requireRol("PROFESOR"),
  async (req: AutenticatedRequest, res: Response) => {
    const profesorId = req.user.usuarioId;

    const [clases, totalInscritos, conteoGlobal] = await Promise.all([
      prisma.clase.findMany({
        where: { profesorId, estaActivo: true },
        select: {
          id: true,
          grupo: true,
          materia: { select: { nombre: true } },
        },
      }),
      prisma.inscripcion.count({
        where: {
          estaActivo: true,
          clase: { profesorId, estaActivo: true },
        },
      }),
      prisma.asistencia.groupBy({
        by: ["estado"],
        where: { clase: { profesorId, estaActivo: true } },
        _count: true,
      }),
    ]);

    const totalClases = clases.length;
    const totalAsistencias = conteoGlobal.reduce((acc, e) => acc + e._count, 0);
    const totalPresentes = conteoGlobal.find((e) => e.estado === "PRESENTE")?._count ?? 0;
    const tasaAsistencia = totalAsistencias > 0
      ? Math.round((totalPresentes / totalAsistencias) * 100)
      : 0;

    const conteoEstados: Record<string, number> = {};
    for (const e of conteoGlobal) {
      conteoEstados[e.estado] = e._count;
    }

    const porClase = await Promise.all(
      clases.map(async (c) => {
        const [inscritos, conteo] = await Promise.all([
          prisma.inscripcion.count({
            where: { claseId: c.id, estaActivo: true },
          }),
          prisma.asistencia.groupBy({
            by: ["estado"],
            where: { claseId: c.id },
            _count: true,
          }),
        ]);

        const total = conteo.reduce((acc, e) => acc + e._count, 0);
        const presentes = conteo.find((e) => e.estado === "PRESENTE")?._count ?? 0;

        const est: Record<string, number> = {};
        for (const e of conteo) est[e.estado] = e._count;

        return {
          claseId: c.id,
          grupo: c.grupo,
          materia: c.materia.nombre,
          inscritos,
          totalAsistencias: total,
          tasa: total > 0 ? Math.round((presentes / total) * 100) : 0,
          conteo: est,
        };
      }),
    );

    res.json({
      totalClases,
      totalInscritos,
      totalAsistencias,
      tasaAsistencia,
      conteoEstados,
      porClase,
    });
  },
];
