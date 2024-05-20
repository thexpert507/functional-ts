import { Either, right, left } from "../either/Either";
import { IO } from "../io/IO";

type F<A, B> = (a: NonNullable<A>) => B;

export class Reader<R, A, E = unknown> {
  static from<R, A>(f: (r: R) => A): Reader<R, A> {
    return new Reader(f);
  }

  static fromIO<R, A>(fn: (a: R) => IO<A>): Reader<R, A> {
    return new Reader((r: R) => fn(r).run());
  }

  static fromEither<R, A, E = unknown>(fn: (a: R) => Either<E, A>): Reader<R, A> {
    return new Reader((r: R) => fn(r).getOrElseThrow());
  }

  static of<R, A>(a: A): Reader<R, A> {
    return new Reader(() => a);
  }

  static ofEither<R, A, L = unknown>(either: Either<L, A>): Reader<R, A, L> {
    return new Reader(() => either.getOrElseThrow());
  }

  static ask<R>(): Reader<R, R> {
    return new Reader((r: R) => r);
  }

  static apply<C, A, B>(f: Reader<C, F<A, B>>, mb: Reader<C, NonNullable<A>>): Reader<C, B> {
    return new Reader((r: C) => {
      const fn = f.run(r);
      const value = mb.run(r);
      return fn(value);
    });
  }

  protected constructor(public run: (r: R) => A) {}

  ask(): Reader<R, R> {
    return Reader.ask<R>();
  }

  map<B>(f: (a: A) => B): Reader<R, B> {
    return new Reader((r: R) => f(this.run(r)));
  }

  chain<B>(f: (a: A) => Reader<R, B>): Reader<R, B> {
    return new Reader((r: R) => f(this.run(r)).run(r));
  }

  chainContext<C2, B>(mapFn: (r: R) => C2, fn: (a: A) => Reader<C2, B>): Reader<R, B> {
    return this.chain((a) => readerMapContext(mapFn, fn(a)));
  }

  toEither(r: R, defaultLeft?: (r: R) => E): Either<E, A> {
    try {
      return right(this.run(r));
    } catch (e) {
      return left<E>(defaultLeft ? defaultLeft(r) : (e as E));
    }
  }
}

export const reader = Reader.from;
export const readerIO = Reader.fromIO;
export const readerEither = Reader.fromEither;
export const readerAsk = Reader.ask;
export const readerOf = Reader.of;
export const readerApply = Reader.apply;

export function readerMapContext<C, C2, A>(mapFn: (r: C) => C2, reader: Reader<C2, A>): Reader<C, A> {
  return Reader.from((r) => reader.run(mapFn(r)));
}
