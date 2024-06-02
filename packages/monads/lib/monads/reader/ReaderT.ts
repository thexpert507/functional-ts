import { Either, right, left } from "../either/Either";
import { TaskEither } from "../either/TaskEither";
import { MapFn } from "../free";
import { Monad } from "../types";

export type PickContext<R> = R extends ReaderT<infer C, any> ? C : never;

export class ReaderT<R, A> {
  static from<R, A>(f: (r: R) => Monad<A>): ReaderT<R, A> {
    return new ReaderT(f);
  }

  static of<R, A>(monad: Monad<A>): ReaderT<R, A> {
    return new ReaderT(() => monad);
  }

  static ask<R>(): ReaderT<R, R> {
    return new ReaderT((r: R) => right(r));
  }

  static apply<C, A, B>(f: ReaderT<C, MapFn<A, B>>, mb: ReaderT<C, A>): ReaderT<C, B> {
    return new ReaderT((r: C) => {
      const fn = f.run(r);
      const value = mb.run(r);
      return value.apply(fn);
    });
  }

  protected constructor(public run: (r: R) => Monad<A>) {}

  ask(): ReaderT<R, R> {
    return ReaderT.ask<R>();
  }

  tap(fn: (a: A) => void): ReaderT<R, A> {
    return new ReaderT((r: R) => this.run(r).tap(fn));
  }

  map<B>(f: (a: A) => B): ReaderT<R, B> {
    return new ReaderT((r: R) => this.run(r).map(f));
  }

  chain<B>(f: (a: A) => ReaderT<R, B>): ReaderT<R, B> {
    return new ReaderT((r: R) => this.run(r).chain((a) => f(a).run(r)));
  }

  chainMapContext<C2, B>(mapFn: (r: R) => C2, fn: (a: A) => ReaderT<C2, B>): ReaderT<R, B> {
    return this.chain((a) => ReaderT.from((r: R) => fn(a).run(mapFn(r))));
  }

  chainContext<C2, B>(fn: (a: A) => ReaderT<C2, B>): ReaderT<C2 & R, B> {
    return new ReaderT((r: C2 & R) => {
      return this.run(r).chain((a) => ReaderT.from(() => fn(a).run(r)).run(r));
    });
  }

  mapContext<R2>(mapFn: (r: R2) => R): ReaderT<R2, A> {
    return new ReaderT((r: R2) => this.run(mapFn(r)));
  }

  toEither<E = unknown>(r: R, defaultLeft?: (e: any) => E): TaskEither<E, A> {
    return TaskEither.from(() =>
      this.run(r).execute<Either<any, A>>((e) => left(defaultLeft ? defaultLeft(e) : e), right)
    );
  }
}

export const readerT = ReaderT.from;
