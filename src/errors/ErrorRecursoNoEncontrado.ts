export class ErrorRecursoNoEncontrado extends Error {
  constructor(recurso: string, id: string | number, label = "ID") {
    super(`${recurso} con ${label} ${id} no encontrado`);
    this.name = "ErrorRecursoNoEncontrado";
  }
}
