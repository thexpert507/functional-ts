import { MapFn } from "../free";
import { Monad } from "../types/Monad";
import { task } from "./Task";

type F<A, B> = (a: NonNullable<A>) => B;

export class IO<T> implements Monad<T> {
  static apply<A, B>(f: IO<F<A, B>>, mb: IO<NonNullable<A>>): IO<B> {
    return new IO(() => f.run()(mb.run()));
  }

  static of<R>(value: R): IO<R> {
    return new IO(() => value);
  }

  static from<R>(f: () => R): IO<R> {
    return new IO(f);
  }

  static void(f: () => any): IO<void> {
    return new IO(() => void f());
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

  execute<R>(f: (e?: any) => R, g: (value: T) => R): Promise<R> {
    return Promise.resolve(this.fold(f, g));
  }

  tap(f: (wrapped: T) => Monad<void> | void): IO<T> {
    return new IO(() => {
      const value = this.run();
      const monad = f(value);
      if (monad) monad.getAsync();
      return value;
    });
  }

  tapError(f: (e: any) => Monad<void> | void): Monad<T> {
    return task(async () => this.run()).tapError(f);
  }

  map<R>(f: (wrapped: T) => R): IO<R> {
    return new IO(() => f(this.run()));
  }

  bind<R>(f: (wrapped: T) => IO<R>): IO<R> {
    return f(this.run());
  }

  chain<R>(f: (wrapped: T) => Monad<R>): Monad<R> {
    return f(this.run());
  }

  tchain(f: (a: T) => Monad<void>): Monad<T> {
    return task(async () => this.run()).tchain(f);
  }

  chainError<B>(f: (e: any) => Monad<B>): Monad<T | B> {
    return task(async () => this.run()).chainError(f);
  }

  fold<R>(f: () => R, g: (value: T) => R): R {
    try {
      return g(this.run());
    } catch (error) {
      return f();
    }
  }

  async getAsync(): Promise<T> {
    return this.run();
  }

  async getAsyncOrElse(f: (e?: any) => T): Promise<T> {
    return this.fold(f, (value) => value);
  }

  apply<B>(mb: Monad<MapFn<T, B>>): Monad<B> {
    return mb.map((f) => f(this.run()));
  }

  transform<B>(transformer: (monad: Monad<T>) => B): B {
    return transformer(this);
  }
}

export const io = IO.of;
export const applyIO = IO.apply;
