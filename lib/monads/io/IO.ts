type F<A, B> = (a: NonNullable<A>) => B;

export class IO<T> {
  static apply<A, B>(f: IO<F<A, B>>, mb: IO<NonNullable<A>>): IO<B> {
    return new IO(() => f.run()(mb.run()));
  }

  static of<R>(value: R): IO<R> {
    return new IO(() => value);
  }

  static reject<R>(error: Error): IO<R> {
    return new IO(() => {
      throw error;
    });
  }

  constructor(private effect: () => T) {}

  run(): T {
    return this.effect();
  }

  tap(f: (wrapped: NonNullable<T>) => void): IO<T> {
    return new IO(() => {
      const value = this.run();
      f(value as NonNullable<T>);
      return value;
    });
  }

  map<R>(f: (wrapped: NonNullable<T>) => R): IO<R> {
    return new IO(() => f(this.run() as NonNullable<T>));
  }

  chain<R>(f: (wrapped: NonNullable<T>) => IO<R>): IO<R> {
    return new IO(() => f(this.run() as NonNullable<T>).run());
  }

  fold<R>(f: () => R, g: (value: T) => R): R {
    try {
      return g(this.run());
    } catch (error) {
      return f();
    }
  }
}

export const io = IO.of;
export const applyIO = IO.apply;
