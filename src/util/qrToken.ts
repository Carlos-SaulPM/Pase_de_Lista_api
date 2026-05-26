import crypto from "node:crypto";

const INTERVALO_QR = 15;

export function calcularVentana(tiempoServidor: number): number {
  return Math.floor(tiempoServidor / INTERVALO_QR) * INTERVALO_QR;
}

export function generarQrToken(
  claseId: number,
  llaveSecreta: string,
  ventana?: number,
): string {
  const v = ventana ?? calcularVentana(Math.floor(Date.now() / 1000));
  const hmac = crypto
    .createHmac("sha256", llaveSecreta)
    .update(`${claseId}:${v}`)
    .digest("hex")
    .substring(0, 8);
  return `${claseId}:${v}:${hmac}`;
}

export function validarQrToken(
  qrToken: string,
  claseId: number,
  llaveSecreta: string,
  segundosExpiracion: number,
): { valido: boolean; error?: string } {
  const partes = qrToken.split(":");
  if (partes.length !== 3) {
    return { valido: false, error: "Formato de qrToken inválido" };
  }

  const [tokenClaseId, ventanaStr, hmacRecibido] = partes;
  const ventana = Number(ventanaStr);

  if (Number(tokenClaseId) !== claseId || isNaN(ventana)) {
    return { valido: false, error: "qrToken inválido" };
  }

  const ahora = Math.floor(Date.now() / 1000);
  if (ahora - ventana > segundosExpiracion) {
    return { valido: false, error: "El código QR ha expirado" };
  }

  const hmacEsperado = crypto
    .createHmac("sha256", llaveSecreta)
    .update(`${claseId}:${ventana}`)
    .digest("hex")
    .substring(0, 8);

  if (hmacRecibido !== hmacEsperado) {
    return { valido: false, error: "Código QR inválido" };
  }

  return { valido: true };
}
