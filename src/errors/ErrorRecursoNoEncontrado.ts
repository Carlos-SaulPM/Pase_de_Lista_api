export class ErrorRecursoNoEncontrado extends Error {
  constructor(recurso: string, id: string | number) {
    super(`${recurso} con ID ${id} no encontrado`);
    this.name = "ErrorRecursoNoEncontrado";
  }
}
