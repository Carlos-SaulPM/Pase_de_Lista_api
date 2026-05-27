function calcularUnixDesdeHorario(
  horario: { horaDeFin?: Date; horaDeInicio?: Date } | null,
  campo: "horaDeFin" | "horaDeInicio",
): number | null {
  const valor = horario?.[campo];
  if (!valor) return null;

  const ahoraMs = Date.now();
  const minutosActual = minutosMexico(new Date(ahoraMs));
  const hrs = valor.getUTCHours();
  const min = valor.getUTCMinutes();

  const ahoraUnix = Math.floor(ahoraMs / 1000);
  const medianocheCdmxUnix = ahoraUnix - minutosActual * 60;

  return medianocheCdmxUnix + hrs * 3600 + min * 60;
}

export function calcularHoraFinUnix(horario: { horaDeFin: Date } | null): number | null {
  return calcularUnixDesdeHorario(horario, "horaDeFin");
}

export function formatearHora(date: Date): string {
  return date.toISOString().slice(11, 16);
}

export function minutosMexico(fecha: Date): number {
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

export function diaSemanaMexico(): number {
  const ahora = new Date();
  const ahoraMexico = new Date(
    ahora.toLocaleString("en-US", { timeZone: "America/Mexico_City" }),
  );
  return ahoraMexico.getDay();
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