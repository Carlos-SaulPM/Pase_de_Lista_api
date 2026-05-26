export class ErrorConflicto extends Error {
  public statusCode = 409;
  constructor(mensaje: string) {
    super(mensaje);
    this.name = "ErrorConflicto";
  }
}