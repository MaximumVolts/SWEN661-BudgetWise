/** A failure whose message is safe to show to the user. Anything else becomes a generic message. */
export class AppException extends Error {
  readonly cause?: unknown;
  constructor(message: string, options?: { cause?: unknown }) {
    super(message);
    this.name = 'AppException';
    this.cause = options?.cause;
  }
}

/**
 * User input broke a business rule. Carries per-field messages (keys are field names such as
 * 'username' / 'password') so screens can show them next to the fields.
 */
export class FieldValidationException extends AppException {
  constructor(
    readonly fieldErrors: Record<string, string>,
    message = 'Please fix the highlighted fields.',
  ) {
    super(message);
    this.name = 'FieldValidationException';
  }
}

/** The message to show for [error]: its own for an AppException, a generic one otherwise. */
export function messageFor(error: unknown): string {
  return error instanceof AppException ? error.message : 'Something went wrong. Please try again.';
}
