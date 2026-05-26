import crypto from "node:crypto";

const VENTANA_SEGUNDOS = 15;
const DIGITOS = 6;

/**
 * Genera un TOTP de 6 dígitos basado en HMAC-SHA1.
 * @param secreto - La llave secreta compartida
 * @param usuarioId - ID del usuario (se concatena con la ventana)
 * @param tiempoServidor - Timestamp en segundos (del servidor)
 */
export function generarTotp(secreto: string, usuarioId: number, tiempoServidor: number): string {
  const ventana = Math.floor(tiempoServidor / VENTANA_SEGUNDOS);
  const mensaje = `${usuarioId}|${ventana}`;
  const hmac = crypto.createHmac("sha1", secreto);
  hmac.update(mensaje);
  const hash = hmac.digest();
  return truncarHash(hash);
}

/**
 * Valida un TOTP recibido contra la ventana actual y ventanas adyacentes.
 * Permite un margen de ±1 ventana para compensar latencia de red.
 * @param totpRecibido - El TOTP de 6 dígitos recibido
 * @param secreto - La llave secreta compartida
 * @param usuarioId - ID del usuario
 * @param tiempoServidor - Timestamp actual del servidor en segundos
 */
export function validarTotp(
  totpRecibido: string,
  secreto: string,
  usuarioId: number,
  tiempoServidor: number,
): boolean {
  const ventanaActual = Math.floor(tiempoServidor / VENTANA_SEGUNDOS);

  for (let offset = -1; offset <= 1; offset++) {
    const ventana = ventanaActual + offset;
    const mensaje = `${usuarioId}|${ventana}`;
    const hmac = crypto.createHmac("sha1", secreto);
    hmac.update(mensaje);
    const hash = hmac.digest();
    const totpEsperado = truncarHash(hash);

    if (totpRecibido === totpEsperado) {
      return true;
    }
  }

  return false;
}

/**
 * Trunca un hash HMAC-SHA1 a un código de 6 dígitos (algoritmo HOTP RFC 4226).
 */
function truncarHash(hash: Buffer): string {
  const offset = hash[hash.length - 1] & 0x0f;
  const code =
    ((hash[offset] & 0x7f) << 24) |
    ((hash[offset + 1] & 0xff) << 16) |
    ((hash[offset + 2] & 0xff) << 8) |
    (hash[offset + 3] & 0xff);

  const totp = code % Math.pow(10, DIGITOS);
  return totp.toString().padStart(DIGITOS, "0");
}
