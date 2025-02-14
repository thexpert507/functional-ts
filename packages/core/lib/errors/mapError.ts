import { AppError, createError } from "./error";

export function toAppError(error: any): AppError {
  if (error instanceof Error) console.error(error);
  if (error instanceof AppError) return error;
  if (error instanceof Error) return createError(error.message).from();
  if (typeof error === "string") return createError(error).from();
  if (typeof error === "object" && "message" in error && "code" in error)
    return createError(error.message, error.code).from();
  return createError("Internal application error").from();
}
