import { MapFn } from "../free";
import { Monad } from "../types/Monad";

export type PrimitiveEither<L, R> = { isRight: boolean; value: L | R };

type F<A, B> = (a: NonNullable<A>) => B;

export abstract class Either<L, R> implements Monad<R> {
  static apply<L, A, B>(ab: Either<L, F<A, B>>, mb: Either<L, NonNullable<A>>): Either<L, B> {
    return ab.isRight() && mb.isRight()
      ? right(ab.right()!(mb.right()!))
      : ab.isLeft()
      ? (ab as Either<L, B>)
      : (mb as Either<L, B>);
  }

  constructor(protected value: L | R) {}

  abstract fold<T>(left: (l: L) => T, right: (r: R) => T): T;

  abstract execute<T>(f: (e?: any) => T, g: (value: R) => T): Promise<T>;

  abstract left(): L | undefined;

  abstract right(): R | undefined;

  abstract isLeft(): boolean;
  abstract isRight(): boolean;

  abstract tapLeft(f: (l: L) => void): Either<L, R>;
  abstract tapRight(f: (r: R) => void): Either<L, R>;

  abstract tap(f: (a: R) => Monad<void> | void): Monad<R>;

  abstract tapError(f: (e: any) => Monad<void> | void): Monad<R>;

  abstract map<T>(f: (r: R) => T): Either<L, T>;

  abstract bind<T>(f: (r: R) => Either<L, T>): Either<L, T>;

  abstract chain<T>(f: (r: R) => Monad<T>): Monad<T>;

  abstract chainError<B>(f: (e: any) => Monad<B>): Monad<R | B>;

  abstract getAsync(): Promise<R>;

  abstract getAsyncOrElse(f: (e?: any) => R): Promise<R>;

  abstract apply<B>(mb: Monad<MapFn<R, B>>): Monad<B>;

  abstract toPrimitive(): PrimitiveEither<L, R>;

  abstract getOrElseThrow(): R;

  abstract getOrElse(defaultValue: R): R;

  abstract transform<B>(transformer: (monad: Monad<R>) => B): B;
}
export class Left<L> extends Either<L, never> {
  fold<T>(left: (l: L) => T, right: (r: never) => T): T {
    return left(this.value);
  }

  execute<T>(f: (e?: any) => T, g: (value: never) => T): Promise<T> {
    return Promise.resolve(f(this.value));
  }

  getAsync(): Promise<never> {
    return Promise.reject(this.value);
  }

  getAsyncOrElse(f: (e?: any) => never): Promise<never> {
    return Promise.resolve(f(this.value));
  }

  apply<B>(mb: Monad<MapFn<never, B>>): Monad<B> {
    return this as unknown as Monad<B>;
  }

  left(): L | undefined {
    return this.value;
  }

  right(): never {
    return undefined as never;
  }

  isLeft(): boolean {
    return true;
  }

  isRight(): boolean {
    return false;
  }

  tap(f: (a: never) => void): Monad<never> {
    return this as unknown as Monad<never>;
  }

  tapError(f: (e: any) => Monad<void> | void): Monad<never> {
    const monad = f(this.value);
    if (monad) monad.getAsync();
    return this as unknown as Monad<never>;
  }

  tapLeft(f: (l: L) => void): Either<L, never> {
    f(this.value);
    return this;
  }

  tapRight(f: (r: never) => void): Either<L, never> {
    return this as unknown as Either<L, never>;
  }

  map<T>(f: (r: never) => T): Either<L, T> {
    return this as unknown as Either<L, T>;
  }

  bind<T>(f: (r: never) => Either<L, T>): Either<L, T> {
    return this as unknown as Either<L, T>;
  }

  chain<T>(f: (r: never) => Monad<T>): Monad<T> {
    return this as unknown as Either<L, T>;
  }

  chainError<B>(f: (e: any) => Monad<B>): Monad<B> {
    return f(this.value);
  }

  toPrimitive(): { isRight: boolean; value: L | never } {
    return { isRight: false, value: this.value };
  }

  getOrElseThrow(): never {
    throw this.value;
  }

  getOrElse(defaultValue: never): never {
    return defaultValue;
  }

  transform<B>(transformer: (monad: Monad<never>) => B): B {
    return transformer(this);
  }
}

export class Right<R> extends Either<never, R> {
  fold<T>(left: (l: never) => T, right: (r: R) => T): T {
    return right(this.value);
  }

  execute<T>(f: (e?: any) => T, g: (value: R) => T): Promise<T> {
    return Promise.resolve(g(this.value));
  }

  apply<B>(mb: Monad<MapFn<R, B>>): Monad<B> {
    return mb.map((f) => f(this.value));
  }

  getAsync(): Promise<R> {
    return Promise.resolve(this.value);
  }

  getAsyncOrElse(f: (e?: any) => R): Promise<R> {
    return Promise.resolve(this.value);
  }

  left(): never {
    return undefined as never;
  }

  right(): R | undefined {
    return this.value;
  }

  isLeft(): boolean {
    return false;
  }

  isRight(): boolean {
    return true;
  }

  tap(f: (a: R) => Monad<void> | void): Monad<R> {
    const monad = f(this.value);
    if (monad) monad.getAsync();
    return this;
  }

  tapError(f: (e: any) => Monad<void> | void): Monad<R> {
    return this as unknown as Monad<R>;
  }

  tapLeft(f: (l: never) => void): Either<never, R> {
    return this as unknown as Either<never, R>;
  }

  tapRight(f: (r: R) => void): Either<never, R> {
    f(this.value);
    return this;
  }

  map<T>(f: (r: R) => T): Either<never, T> {
    return new Right(f(this.value));
  }

  bind<T>(f: (r: R) => Either<never, T>): Either<never, T> {
    return f(this.value);
  }

  chain<T>(f: (r: R) => Monad<T>): Monad<T> {
    return f(this.value);
  }

  chainError<B>(f: (e: any) => Monad<B>): Monad<R | B> {
    return this as unknown as Monad<R | B>;
  }

  toPrimitive(): { isRight: boolean; value: R | never } {
    return { isRight: true, value: this.value };
  }

  getOrElseThrow(): R {
    return this.value;
  }

  getOrElse(defaultValue: R): R {
    return this.value;
  }

  transform<B>(transformer: (monad: Monad<R>) => B): B {
    return transformer(this);
  }
}

export type PromiseEither<T, E> = Promise<Either<T, E>>;

export const right = <R>(r: R) => new Right<R>(r);
export const left = <L>(l: L) => new Left<L>(l);
export const applyEither = Either.apply;
