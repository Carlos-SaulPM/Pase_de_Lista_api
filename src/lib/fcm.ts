import prisma from "#/lib/prisma.js";

/**
 * Envía notificaciones FCM a los alumnos inscritos en una clase.
 * Usa la API HTTP v1 de FCM con token de acceso de servicio.
 * Variables de entorno requeridas:
 *   - FCM_PROJECT_ID
 *   - FCM_SERVICE_ACCOUNT_EMAIL
 *   - FCM_PRIVATE_KEY
 *   - FCM_PRIVATE_KEY_ID
 */
export const notificarAlumnos = async (claseId: number, payload: Record<string, unknown>) => {
  const [inscripciones, clase] = await Promise.all([
    prisma.inscripcion.findMany({
      where: {
        claseId,
        estaActivo: true,
        fechaDeBaja: null,
      },
      include: {
        alumno: {
          include: {
            dispositivos: true,
          },
        },
      },
    }),
    prisma.clase.findUnique({
      where: { id: claseId },
      include: { materia: true, profesor: true },
    }),
  ]);

  const materiaNombre = clase?.materia?.nombre || "Clase";
  const grupo = clase?.grupo || "";
  const profesorNombre = clase?.profesor?.nombre || "";

  const esRegistrada = payload.tipo === "asistencia_registrada";
  const titulo = esRegistrada
    ? `Asistencia: ${materiaNombre}${grupo ? ` • ${grupo}` : ""}`
    : `Pase de lista: ${materiaNombre}${grupo ? ` • ${grupo}` : ""}`;
  const cuerpo = esRegistrada
    ? `Registrada como ${payload.estado || "PRESENTE"}`
    : profesorNombre
      ? `El profesor ${profesorNombre} inicio el pase de lista`
      : "Inicio el pase de lista";

  const fcmTokens: string[] = [];
  for (const inscripcion of inscripciones) {
    for (const dispositivo of inscripcion.alumno.dispositivos) {
      if (dispositivo.fcmToken) {
        fcmTokens.push(dispositivo.fcmToken);
      }
    }
  }

  if (fcmTokens.length === 0) {
    return { enviados: 0, mensaje: "No hay tokens FCM registrados" };
  }

  const project = process.env.FCM_PROJECT_ID;
  const serviceAccountEmail = process.env.FCM_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.FCM_PRIVATE_KEY?.replace(/\\n/g, "\n");
  const privateKeyId = process.env.FCM_PRIVATE_KEY_ID;

  if (!project || !serviceAccountEmail || !privateKey) {
    console.warn("FCM no configurado. Tokens encontrados:", fcmTokens.length);
    return { enviados: 0, mensaje: "FCM no configurado en el servidor" };
  }

  const jwt = await crearJwt(serviceAccountEmail, privateKey, privateKeyId);
  const accessToken = await obtenerAccessToken(jwt);

  let enviados = 0;
  for (const token of fcmTokens) {
    try {
      await enviarMensaje(accessToken, project, token, payload, titulo, cuerpo);
      enviados++;
    } catch (error) {
      console.error("Error enviando FCM a token:", token, error);
    }
  }

  return { enviados, total: fcmTokens.length };
};

export const notificarUnAlumno = async (alumnoId: number, payload: Record<string, unknown>) => {
  const [dispositivos, clase] = await Promise.all([
    prisma.dispositivos.findMany({
      where: { usuarioId: alumnoId },
    }),
    prisma.clase.findUnique({
      where: { id: Number(payload.claseId) },
      include: { materia: true, profesor: true },
    }),
  ]);

  const fcmTokens = dispositivos.map(d => d.fcmToken).filter(Boolean);
  if (fcmTokens.length === 0) return { enviados: 0, mensaje: "Sin token FCM" };

  const materiaNombre = clase?.materia?.nombre || "Clase";
  const grupo = clase?.grupo || "";

  const titulo = `Asistencia: ${materiaNombre}${grupo ? ` • ${grupo}` : ""}`;
  const cuerpo = `Registrada como ${payload.estado || "PRESENTE"}`;

  const project = process.env.FCM_PROJECT_ID;
  const serviceAccountEmail = process.env.FCM_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.FCM_PRIVATE_KEY?.replace(/\\n/g, "\n");
  const privateKeyId = process.env.FCM_PRIVATE_KEY_ID;

  if (!project || !serviceAccountEmail || !privateKey) {
    console.warn("FCM no configurado");
    return { enviados: 0, mensaje: "FCM no configurado" };
  }

  const jwt = await crearJwt(serviceAccountEmail, privateKey, privateKeyId);
  const accessToken = await obtenerAccessToken(jwt);

  let enviados = 0;
  for (const token of fcmTokens) {
    try {
      await enviarMensaje(accessToken, project, token, payload, titulo, cuerpo);
      enviados++;
    } catch (error) {
      console.error("Error enviando FCM a alumno:", alumnoId, error);
    }
  }

  return { enviados, total: fcmTokens.length };
};

export const notificarProfesor = async (claseId: number, payload: Record<string, unknown>) => {
  const clase = await prisma.clase.findUnique({
    where: { id: claseId },
    include: { materia: true, profesor: { include: { dispositivos: true } } },
  });

  if (!clase || !clase.profesor) {
    return { enviados: 0, mensaje: "Clase o profesor no encontrado" };
  }

  const fcmTokens = clase.profesor.dispositivos.map(d => d.fcmToken).filter(Boolean);
  if (fcmTokens.length === 0) return { enviados: 0, mensaje: "Sin token FCM" };

  const materiaNombre = clase.materia?.nombre || "Clase";
  const grupo = clase.grupo || "";

  const titulo = `Alumno registrado: ${materiaNombre}${grupo ? ` • ${grupo}` : ""}`;
  const cuerpo = payload.estado
    ? `Registrado como ${payload.estado}`
    : "Se registro un alumno";

  const project = process.env.FCM_PROJECT_ID;
  const serviceAccountEmail = process.env.FCM_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.FCM_PRIVATE_KEY?.replace(/\\n/g, "\n");
  const privateKeyId = process.env.FCM_PRIVATE_KEY_ID;

  if (!project || !serviceAccountEmail || !privateKey) {
    console.warn("FCM no configurado");
    return { enviados: 0, mensaje: "FCM no configurado" };
  }

  const jwt = await crearJwt(serviceAccountEmail, privateKey, privateKeyId);
  const accessToken = await obtenerAccessToken(jwt);

  let enviados = 0;
  for (const token of fcmTokens) {
    try {
      await enviarMensaje(accessToken, project, token, payload, titulo, cuerpo);
      enviados++;
    } catch (error) {
      console.error("Error enviando FCM a profesor:", claseId, error);
    }
  }

  return { enviados, total: fcmTokens.length };
};

async function crearJwt(email: string, privateKey: string, keyId?: string): Promise<string> {
  const header = {
    alg: "RS256",
    typ: "JWT",
    ...(keyId ? { kid: keyId } : {}),
  };

  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: email,
    scope: "https://www.googleapis.com/auth/firebase.messaging",
    aud: "https://oauth2.googleapis.com/token",
    exp: now + 3600,
    iat: now,
  };

  const encodedHeader = btoaUrl(JSON.stringify(header));
  const encodedPayload = btoaUrl(JSON.stringify(payload));
  const signingInput = `${encodedHeader}.${encodedPayload}`;

  const crypto = await import("node:crypto");
  const sign = crypto.createSign("RSA-SHA256");
  sign.update(signingInput);
  const signature = sign.sign(privateKey);

  return `${signingInput}.${btoaUrl(signature)}`;
}

async function obtenerAccessToken(jwt: string): Promise<string> {
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });

  if (!response.ok) {
    throw new Error(`Error obteniendo access token: ${response.status}`);
  }

  const data = await response.json() as { access_token: string };
  return data.access_token;
}

async function enviarMensaje(
  accessToken: string,
  project: string,
  token: string,
  payload: Record<string, unknown>,
  titulo: string,
  cuerpo: string,
) {
  const url = `https://fcm.googleapis.com/v1/projects/${project}/messages:send`;

  const mensaje = {
    message: {
      token,
      notification: {
        title: titulo,
        body: cuerpo,
      },
      data: Object.fromEntries(
        Object.entries(payload).map(([k, v]) => [k, String(v)]),
      ),
      android: {
        priority: "high",
      },
    },
  };

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(mensaje),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`FCM error ${response.status}: ${body}`);
  }
}

function btoaUrl(input: string | Uint8Array): string {
  const base64 = typeof input === "string"
    ? Buffer.from(input).toString("base64")
    : Buffer.from(input).toString("base64");
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}