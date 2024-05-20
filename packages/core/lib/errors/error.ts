export abstract class AppError extends Error {
  static is(classType: any): boolean {
    return classType.prototype instanceof AppError;
  }

  protected constructor(message: string, public code: number) {
    super(message);
  }

  status(code: number) {
    this.code = code;
    return this;
  }
}

export function createError(defaultMessage: string, defaultCode: number = 500) {
  return class extends AppError {
    public static from(message?: string): AppError {
      return new this(message);
    }

    private constructor(message?: string) {
      super(message || defaultMessage, defaultCode);
    }
  };
}

export const UnknownError = createError("Unknown error", 500);
