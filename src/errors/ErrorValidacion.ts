export class ErrorValidacion extends Error {
  constructor(
    message: string,
    public detalles: unknown[] = [],
  ) {
    super(message);
    this.name = "ErrorValidacion";
  }
}
