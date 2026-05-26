export function calcularHoraFinUnix(horario: { horaDeFin: Date } | null): number | null {
  if (!horario?.horaDeFin) return null;
  const ahora = new Date();
  const fin = new Date(horario.horaDeFin);
  fin.setFullYear(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());
  return Math.floor(fin.getTime() / 1000);
}

export function formatearHora(date: Date): string {
  return date.toISOString().slice(11, 16);
}

function minutosMexico(fecha: Date): number {
  const formatter = new Intl.DateTimeFormat("es-MX", {
    timeZone: "America/Mexico_City",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const partes = formatter.formatToParts(fecha);
  const h = parseInt(partes.find((p) => p.type === "hour")?.value || "0", 10);
  const m = parseInt(partes.find((p) => p.type === "minute")?.value || "0", 10);
  return h * 60 + m;
}

export function calcularEnHorario(
  horario: { horaDeInicio: Date; horaDeFin: Date },
  ahoraMs: number,
): boolean {
  const minutosActual = minutosMexico(new Date(ahoraMs));
  const minutosInicio = horario.horaDeInicio.getUTCHours() * 60 + horario.horaDeInicio.getUTCMinutes();
  const minutosFin = horario.horaDeFin.getUTCHours() * 60 + horario.horaDeFin.getUTCMinutes();
  return minutosActual >= minutosInicio && minutosActual <= minutosFin;
}
