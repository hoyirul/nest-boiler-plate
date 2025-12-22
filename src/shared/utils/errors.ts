export type AppErrorType =
  | "Validation"
  | "NotFound"
  | "Auth"
  | "Internal";

export class AppError extends Error {
  public readonly type: AppErrorType;
  public readonly msgKey: string;
  public readonly errors?: unknown;

  constructor(
    type: AppErrorType,
    msgKey: string,
    errors?: unknown
  ) {
    super(msgKey);

    this.name = "AppError";
    this.type = type;
    this.msgKey = msgKey;
    this.errors = errors;

    // penting buat stack trace yang rapi
    Error.captureStackTrace?.(this, this.constructor);
  }
}

// helpers (biar clean di usecase / service)
export const ValidationError = (msgKey: string, errors?: unknown) =>
  new AppError("Validation", msgKey, errors);

export const NotFoundError = (msgKey: string) =>
  new AppError("NotFound", msgKey);

export const AuthError = (msgKey: string) =>
  new AppError("Auth", msgKey);

export const InternalError = (msgKey: string) =>
  new AppError("Internal", msgKey);
