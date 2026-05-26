import { EstadoAsistencia, MetodoAsistencia } from "@prisma/client";
import {
  listarAsistencias as repoListarAsistencias,
  obtenerAsistenciaPorId as repoObtenerAsistenciaPorId,
  obtenerAsistencia,
  registrarAsistencia,
  actualizarAsistencia as repoActualizarAsistencia,
  eliminarAsistencia as repoEliminarAsistencia,
  registrarAsistenciasEnLote as repoRegistrarAsistenciasEnLote,
  listarAlumnosConAsistencia as repoListarAlumnosConAsistencia,
} from "#/repositories/AsistenciaRepository.js";
import {
  obtenerClasePorId as repoObtenerClasePorId,
} from "#/repositories/ClaseRepository.js";
import { ErrorRecursoNoEncontrado } from "#/errors/ErrorRecursoNoEncontrado.js";
import { ErrorValidacion } from "#/errors/ErrorValidacion.js";
import { validarQrToken, generarQrToken, calcularVentana } from "#/util/qrToken.js";
import { calcularHoraFinUnix } from "#/util/fecha.js";
import { validarTotp } from "#/lib/totp.js";
import { notificarUnAlumno, notificarAlumnos, notificarProfesor } from "#/lib/fcm.js";
import { obtenerHorarioDeHoy } from "#/repositories/HorarioRepository.js";

export const listarAsistencias = async (filtros?: { claseId?: number; alumnoId?: number }) => {
  return repoListarAsistencias(filtros);
};

export const listarAlumnosConAsistencia = async (claseId: number) => {
  return repoListarAlumnosConAsistencia(claseId);
};

export const registrarNuevaAsistencia = async (datos: {
  claseId: number;
  alumnoId: number;
  estado: EstadoAsistencia;
  metodo: MetodoAsistencia;
  fechaDispositivo: Date;
}) => {
  return registrarAsistencia(datos);
};

export const obtenerAsistenciaPorId = async (id: number) => {
  const asistencia = await repoObtenerAsistenciaPorId(id);
  if (!asistencia) {
    throw new ErrorRecursoNoEncontrado("Asistencia", id);
  }
  return asistencia;
};

export const actualizarAsistencia = async (
  id: number,
  datos: Partial<{
    estado: EstadoAsistencia;
    metodo: MetodoAsistencia;
    fechaDispositivo: Date;
  }>,
) => {
  await obtenerAsistenciaPorId(id);
  return repoActualizarAsistencia(id, datos);
};

export const eliminarAsistencia = async (id: number) => {
  await obtenerAsistenciaPorId(id);
  return repoEliminarAsistencia(id);
};

export const registrarAsistenciasEnLote = async (datos: {
  claseId: number;
  registros: {
    alumnoId: number;
    estado: EstadoAsistencia;
    metodo: MetodoAsistencia;
    fechaDispositivo: Date;
  }[];
}) => {
  const registrosFiltrados = (
    await Promise.all(
      datos.registros.map(async (reg) => {
        const existente = await obtenerAsistencia(datos.claseId, reg.alumnoId);
        return existente ? null : reg;
      }),
    )
  ).filter((r): r is NonNullable<typeof r> => r !== null);

  if (registrosFiltrados.length === 0) {
    return [];
  }

  const resultado = await repoRegistrarAsistenciasEnLote({
    claseId: datos.claseId,
    registros: registrosFiltrados,
  });

  for (const reg of registrosFiltrados) {
    await notificarUnAlumno(reg.alumnoId, {
      tipo: "asistencia_registrada",
      claseId: String(datos.claseId),
      estado: reg.estado,
    });
  }

  return resultado;
};

export const registrarAsistenciaQR = async (
  claseId: number,
  alumnoId: number,
  qrToken: string,
  fechaDispositivo: Date,
) => {
  const config = await repoObtenerClasePorId(claseId).then(c => c?.configuracion);
  const llaveSecreta = config?.llaveSecreta;
  const segundosExpiracion = config?.segundosDeExpiracionDelToken ?? 300;

  if (!llaveSecreta) {
    throw new ErrorValidacion("Esta clase no tiene configuracion de asistencia");
  }

  const validacion = validarQrToken(qrToken, claseId, llaveSecreta, segundosExpiracion);
  if (!validacion.valido) {
    throw new ErrorValidacion(validacion.error ?? "QR invalido");
  }

  const existente = await obtenerAsistencia(claseId, alumnoId);
  if (existente) {
    return { asistencia: existente, esDuplicado: true };
  }

  const resultado = await registrarAsistencia({
    claseId,
    alumnoId,
    metodo: "QR",
    estado: "PRESENTE",
    fechaDispositivo,
  });

  await notificarUnAlumno(alumnoId, {
    tipo: "asistencia_registrada",
    claseId: String(claseId),
    estado: "PRESENTE",
  });

  await notificarProfesor(claseId, {
    tipo: "asistencia_registrada",
    claseId: String(claseId),
    alumnoId: String(alumnoId),
    estado: "PRESENTE",
  });

  return { asistencia: resultado, esDuplicado: false };
};

export const iniciarSesion = async (claseId: number, metodo: "BLE" | "QR" | "MANUAL", profesorId: number) => {
  const clase = await repoObtenerClasePorId(claseId);
  if (!clase) {
    throw new ErrorRecursoNoEncontrado("Clase", claseId);
  }

  if (clase.profesorId !== profesorId) {
    throw new ErrorValidacion("No eres el profesor de esta clase");
  }

  const config = clase.configuracion;

  const tiempoServidor = Math.floor(Date.now() / 1000);
  const llaveSecreta = config?.llaveSecreta || null;
  const segundosExpiracion = config?.segundosDeExpiracionDelToken ?? 300;

  const horarioHoy = await obtenerHorarioDeHoy(claseId, new Date().getDay());
  const horaFinUnix = calcularHoraFinUnix(horarioHoy);

  let qrToken: string | null = null;
  if (llaveSecreta) {
    const ventana = calcularVentana(tiempoServidor);
    qrToken = generarQrToken(claseId, llaveSecreta, ventana);
  }

  const payload: Record<string, unknown> = {
    claseId: String(claseId),
    metodo,
    tiempoServidor: String(tiempoServidor),
  };

  if (metodo === "BLE" && llaveSecreta) {
    payload.llaveSecreta = llaveSecreta;
  }

  const resultado = await notificarAlumnos(claseId, payload);

  return {
    mensaje: "Sesion iniciada correctamente",
    claseId,
    metodo,
    tiempoServidor,
    segundosExpiracion,
    llaveSecreta,
    qrToken,
    horaFinUnix,
    notificaciones: resultado,
  };
};

export const registrarLoteBle = async (
  claseId: number,
  registros: { alumnoId: number; estado: EstadoAsistencia; totp?: string }[],
) => {
  const config = await repoObtenerClasePorId(claseId).then(c => c?.configuracion);
  const llaveSecreta = config?.llaveSecreta;
  const tiempoServidor = Math.floor(Date.now() / 1000);

  const registrosValidados = (
    await Promise.all(
      registros.map(async (reg) => {
        const existente = await obtenerAsistencia(claseId, reg.alumnoId);
        if (existente) return null;

        let estadoValido = reg.estado;

        if (reg.totp && llaveSecreta) {
          const totpValido = validarTotp(reg.totp, llaveSecreta, reg.alumnoId, tiempoServidor);
          if (!totpValido) {
            estadoValido = "FALTA" as EstadoAsistencia;
          }
        }

        return {
          alumnoId: reg.alumnoId,
          estado: estadoValido as EstadoAsistencia,
          metodo: "BLE" as MetodoAsistencia,
          fechaDispositivo: new Date(),
        };
      }),
    )
  ).filter((r): r is NonNullable<typeof r> => r !== null);

  if (registrosValidados.length === 0) {
    return {
      mensaje: "Todos los alumnos ya tienen asistencia registrada",
      registros: [] as typeof registrosValidados,
    };
  }

  const resultado = await repoRegistrarAsistenciasEnLote({
    claseId,
    registros: registrosValidados,
  });

  for (const reg of registrosValidados) {
    notificarUnAlumno(reg.alumnoId, {
      tipo: "asistencia_registrada",
      claseId: String(claseId),
      estado: reg.estado,
    });
  }

  return resultado;
};