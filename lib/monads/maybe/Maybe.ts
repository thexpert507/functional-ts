import { Either, left, right } from "../either/Either";

type F<A, B> = (a: NonNullable<A>) => B;

export class Maybe<T> {
  static of<T>(value: T): Maybe<T> {
    return new Maybe(value);
  }

  static apply<A, B>(f: Maybe<F<A, B>>, a: Maybe<A>): Maybe<B> {
    return f.isNothing() || a.isNothing() ? Maybe.of(null as B) : Maybe.of<B>(f.value(a.value as NonNullable<A>));
  }

  private constructor(private value: T) {}

  isNothing(): boolean {
    return this.value === null || this.value === undefined;
  }

  tap(f: (a: NonNullable<T>) => void): Maybe<T> {
    if (!this.isNothing()) f(this.value as NonNullable<T>);
    return this;
  }

  map<B>(f: (a: NonNullable<T>) => B): Maybe<B> {
    return this.isNothing() ? Maybe.of(null as B) : Maybe.of<B>(f(this.value as NonNullable<T>));
  }

  ap<B>(this: Maybe<F<T, B>>, mb: Maybe<NonNullable<T>>): Maybe<B> {
    return Maybe.apply(this, mb);
  }

  join(): T | Maybe<T> {
    return this.isNothing() ? Maybe.of(null as T) : this.value;
  }

  chain<B>(f: (a: NonNullable<T>) => Maybe<B>): Maybe<B> {
    return this.map(f).join() as Maybe<B>;
  }

  getOrElse(defaultValue: NonNullable<T>): NonNullable<T> {
    return this.isNothing() ? defaultValue : (this.value as NonNullable<T>);
  }

  get(): NonNullable<T> | null {
    return this.value ?? null;
  }

  toEither<L>(leftValue: L): Either<L, NonNullable<T>> {
    return this.isNothing() ? left(leftValue) : right(this.value as NonNullable<T>);
  }

  fold<R>(f: () => R, g: (value: NonNullable<T>) => R): R {
    return this.isNothing() ? f() : g(this.value as NonNullable<T>);
  }
}

export const nothing = <T>() => Maybe.of<T>(null as T);
export const maybe = Maybe.of;
export const applyMaybe = Maybe.apply;
