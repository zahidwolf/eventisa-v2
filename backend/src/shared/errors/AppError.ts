export class AppError extends Error {
  readonly statusCode: number;
  readonly code: string;
  readonly isOperational: boolean;
  readonly meta?: Record<string, unknown>;

  constructor(
    message: string,
    statusCode = 500,
    code = "INTERNAL_ERROR",
    meta?: Record<string, unknown>
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
    this.meta = meta;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}
