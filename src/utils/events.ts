/** A minimal event stream: subscribe returns an unsubscribe function. */
export class Emitter<T = void> {
  private listeners = new Set<(value: T) => void>();

  subscribe(listener: (value: T) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  emit(value: T): void {
    for (const l of [...this.listeners]) l(value);
  }
}

/** Something screens can listen to for changes. */
export type Subscribable<T = void> = Pick<Emitter<T>, 'subscribe'>;

/** Several event streams as one. */
export const merge = <T>(...sources: Subscribable<T>[]): Subscribable<T> => ({
  subscribe(listener) {
    const offs = sources.map((s) => s.subscribe(listener));
    return () => offs.forEach((off) => off());
  },
});
