import {
  listarInscripcionesPorClase as repoListarInscripcionesPorClase,
  obtenerInscripcionPorId as repoObtenerInscripcionPorId,
  obtenerInscripcionActiva,
  crearInscripcion,
  eliminarInscripcion as repoEliminarInscripcion,
  obtenerInscripcionesPorAlumno as repoObtenerInscripcionesPorAlumno,
  obtenerInscripcionesDeHoy as repoObtenerInscripcionesDeHoy,
} from "#/repositories/InscripcionRepository.js";
import { EncontrarPorMatricula } from "#/repositories/CredencialRepository.js";
import { ErrorConflicto } from "#/errors/ErrorConflicto.js";
import { ErrorRecursoNoEncontrado } from "#/errors/ErrorRecursoNoEncontrado.js";

export const listarInscripcionesPorClase = async (claseId: number) => {
  return repoListarInscripcionesPorClase(claseId);
};

export const crearNuevaInscripcion = async (datos: { claseId: number; matricula: string }) => {
  const credencial = await EncontrarPorMatricula(datos.matricula);
  if (!credencial) {
    throw new ErrorRecursoNoEncontrado("Alumno", datos.matricula);
  }

  const alumnoId = credencial.usuario.id;
  const existente = await obtenerInscripcionActiva(datos.claseId, alumnoId);
  if (existente) {
    throw new ErrorConflicto("El alumno ya esta inscrito en esta clase");
  }
  return crearInscripcion({ claseId: datos.claseId, alumnoId });
};

export const obtenerInscripcionPorId = async (id: number) => {
  const inscripcion = await repoObtenerInscripcionPorId(id);
  if (!inscripcion) {
    throw new ErrorRecursoNoEncontrado("Inscripción", id);
  }
  return inscripcion;
};

export const eliminarInscripcion = async (id: number) => {
  await obtenerInscripcionPorId(id);
  return repoEliminarInscripcion(id);
};

export const obtenerMisClases = async (alumnoId: number) => {
  return repoObtenerInscripcionesPorAlumno(alumnoId);
};

const MAPA_DIAS: Record<string, number> = {
  domingo: 0, lunes: 1, martes: 2, miércoles: 3,
  jueves: 4, viernes: 5, sábado: 6,
};

function fechaMexico(fecha: Date): { diaSemana: number; minutos: number } {
  const partsTime = new Intl.DateTimeFormat("es-MX", {
    timeZone: "America/Mexico_City",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(fecha);
  const h = parseInt(partsTime.find((p) => p.type === "hour")?.value || "0", 10);
  const m = parseInt(partsTime.find((p) => p.type === "minute")?.value || "0", 10);

  const diaNombre = fecha.toLocaleString("es-MX", {
    timeZone: "America/Mexico_City",
    weekday: "long",
  });
  const diaSemana = MAPA_DIAS[diaNombre.toLowerCase()] ?? fecha.getDay();

  return { diaSemana, minutos: h * 60 + m };
}

export const obtenerClasesDeHoy = async (alumnoId: number) => {
  const ahora = new Date();
  const { diaSemana, minutos: minutosActual } = fechaMexico(ahora);
  const tiempoServidor = Math.floor(ahora.getTime() / 1000);

  const inscripciones = await repoObtenerInscripcionesDeHoy(alumnoId, diaSemana);

  const clasesHoy = inscripciones
    .map((i) => {
      const clase = i.clase;
      const horarioHoy = clase.horarios.find((h) => h.dia === diaSemana);
      if (!horarioHoy) return null;

      const minutosInicio = horarioHoy.horaDeInicio.getUTCHours() * 60 + horarioHoy.horaDeInicio.getUTCMinutes();
      const minutosFin = horarioHoy.horaDeFin.getUTCHours() * 60 + horarioHoy.horaDeFin.getUTCMinutes();
      const enHorario = minutosActual >= minutosInicio && minutosActual <= minutosFin;

      const horaInicio = horarioHoy.horaDeInicio.toISOString().slice(11, 16);
      const horaFin = horarioHoy.horaDeFin.toISOString().slice(11, 16);

      const profesor = clase.profesor
        ? {
            id: clase.profesor.id,
            nombre: `${clase.profesor.nombre} ${clase.profesor.apellidoPaterno}`,
          }
        : null;

      return {
        clase: {
          id: clase.id,
          grupo: clase.grupo,
          periodo: clase.periodo,
          aula: clase.aula,
          materia: clase.materia,
          profesor,
          configuracion: clase.configuracion,
          horario: {
            dia: horarioHoy.dia,
            diaDeLaSemana: horarioHoy.diaDeLaSemana,
            horaInicio,
            horaFin,
          },
        },
        enHorario,
      };
    })
    .filter((c): c is NonNullable<typeof c> => c !== null);

  return {
    tiempoServidor,
    clases: clasesHoy,
  };
};
