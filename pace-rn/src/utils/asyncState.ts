/** Data being loaded for a screen: loading, failed with a message, or ready. */
export type AsyncState<T> =
  | { status: 'loading'; data?: undefined; error?: undefined }
  | { status: 'error'; data?: undefined; error: string }
  | { status: 'ready'; data: T; error?: undefined };
