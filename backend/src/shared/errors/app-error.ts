export class AppError extends Error {
  constructor(
    message: string,
    public readonly statusCode = 400,
    public readonly code = "APPLICATION_ERROR",
  ) {
    super(message);
    this.name = "AppError";
  }
}


