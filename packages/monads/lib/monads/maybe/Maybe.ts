import { Either, left, right } from "../either/Either";
import { MapFn } from "../free";
import { Monad } from "../types/Monad";

export class Maybe<T> implements Monad<T> {
  static of<T>(value: T | undefined | null): Maybe<T> {
    return new Maybe(value as T);
  }

  static apply<A, B>(f: Maybe<MapFn<A, B>>, a: Maybe<A>): Maybe<B> {
    return f.isNothing() || a.isNothing()
      ? Maybe.of(null as B)
      : Maybe.of<B>(f.value(a.value as NonNullable<A>));
  }

  private constructor(private value: T) {}

  isNothing(): boolean {
    return this.value === null || this.value === undefined;
  }

  isJust(): boolean {
    return !this.isNothing();
  }

  tap(f: (a: T) => Monad<void> | void): Maybe<T> {
    if (this.isNothing()) return this;
    const monad = f(this.value);
    if (monad && "getAsync" in monad) monad.getAsync();
    return this;
  }

  tapNullable(f: (a: T | null) => Monad<void> | void): Maybe<T> {
    const monad = f(this.value);
    if (monad && "getAsync" in monad) monad.getAsync();
    return this;
  }

  tapError(f: (e: any) => Monad<void> | void): Monad<T> {
    if (this.isJust()) return this;
    const monad = f(null);
    if (monad && "getAsync" in monad) monad.getAsync();
    return this;
  }

  map<B>(f: (a: T) => B): Maybe<B> {
    return this.isNothing() ? Maybe.of(null as B) : Maybe.of<B>(f(this.value));
  }

  apply<B>(mb: Monad<MapFn<T, B>>): Monad<B> {
    return this.isNothing() ? Maybe.of(null as B) : mb.map((f) => f(this.value));
  }

  ap<B>(this: Maybe<MapFn<T, B>>, mb: Maybe<NonNullable<T>>): Maybe<B> {
    return Maybe.apply(this, mb);
  }

  join(): T | Maybe<T> {
    return this.isNothing() ? Maybe.of(null as T) : this.value;
  }

  bind<B>(f: (a: T) => Maybe<B>): Maybe<B> {
    return this.isNothing() ? Maybe.of(null as B) : f(this.value);
  }

  chain<B>(f: (a: T) => Monad<B>): Monad<B> {
    return this.isNothing() ? Maybe.of(null as B) : f(this.value);
  }

  tchain(f: (a: T) => Monad<void>): Monad<T> {
    return this.isNothing() ? this : f(this.value).map(() => this.value);
  }

  chainError<B>(f: (e: any) => Monad<B>): Monad<T | B> {
    return this.isNothing() ? f(null) : this;
  }

  getAsync(): Promise<T> {
    return Promise.resolve(this.value);
  }

  getAsyncOrElse(f: (e?: any) => T): Promise<T> {
    return this.isNothing() ? Promise.resolve(f()) : Promise.resolve(this.value);
  }

  getOrElse(defaultValue: NonNullable<T>): NonNullable<T> {
    return this.isNothing() ? defaultValue : (this.value as NonNullable<T>);
  }

  getOrThrow(error: unknown): NonNullable<T> {
    if (this.isNothing()) throw error;
    return this.value as NonNullable<T>;
  }

  get(): NonNullable<T> | null {
    return this.value ?? null;
  }

  toEither<L>(leftValue: L): Either<L, NonNullable<T>> {
    return this.isNothing() ? left(leftValue) : right(this.value as NonNullable<T>);
  }

  execute<R>(f: () => R, g: (value: NonNullable<T>) => R): Promise<R> {
    return this.isNothing()
      ? Promise.resolve(f())
      : Promise.resolve(g(this.value as NonNullable<T>));
  }

  fold<R>(onLeft: (e?: unknown) => R, onRight: (a: NonNullable<T>) => R): R {
    return this.isNothing() ? onLeft() : onRight(this.value as NonNullable<T>);
  }

  transform<B>(transformer: (monad: Monad<T>) => B): B {
    return transformer(this);
  }
}

export const nothing = <T>() => Maybe.of<T>(null as T);
export const maybe = Maybe.of;
export const applyMaybe = Maybe.apply;
