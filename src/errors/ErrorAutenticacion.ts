export class ErrorAutenticacion extends Error {
  constructor(
    message: string,
    public statusCode: number = 401,
  ) {
    super(message);
    this.name = "ErrorAutenticacion";
  }
}
