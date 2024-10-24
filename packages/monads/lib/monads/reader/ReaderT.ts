import { Either, right, left } from "../either/Either";
import { TaskEither } from "../either/TaskEither";
import { MapFn } from "../free";
import { Task } from "../io";
import { Monad } from "../types";
import { listMap, splitArray, toEither, toTask } from "../utils";

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

  static apply<CA, CB, A, B>(f: ReaderT<CA, MapFn<A, B>>, mb: ReaderT<CB, A>): ReaderT<CA & CB, B> {
    return new ReaderT((r: CA & CB) => mb.run(r).apply(f.run(r)));
  }

  static all<R, A>(readers: ReaderT<R, A>[]): ReaderT<R, A[]> {
    return ReaderT.ask<R>()
      .map((ctx) => readers.map((r) => r.run(ctx)))
      .map(listMap((m) => m.transform(toTask)))
      .map(Task.all)
      .chain(ReaderT.of);
  }

  static sequence<R, A>(readers: ReaderT<R, A>[]): ReaderT<R, A[]> {
    return ReaderT.ask<R>()
      .map((ctx) => readers.map((r) => r.run(ctx)))
      .map(listMap((m) => m.transform(toEither)))
      .map(TaskEither.sequence)
      .chain(ReaderT.of);
  }

  static concurrent(concurrency: number) {
    return <R, A>(readers: ReaderT<R, A>[]): ReaderT<R, A[]> => {
      return ReaderT.ask<R>()
        .map((ctx) => readers.map((r) => r.run(ctx)))
        .map(listMap((m) => m.transform(toEither)))
        .map(splitArray(concurrency))
        .map((chunks) => chunks.map(TaskEither.all))
        .map(TaskEither.sequence)
        .chain(ReaderT.of)
        .map((r) => r.flat());
    };
  }

  protected constructor(public run: (r: R) => Monad<A>) {}

  ask(): ReaderT<R, R> {
    return ReaderT.ask<R>();
  }

  off<B>(fn: (a: A) => Monad<B>): ReaderT<R, B> {
    return new ReaderT((r: R) => this.run(r).chain(fn));
  }

  apply<R2, B>(mb: ReaderT<R2, MapFn<A, B>>): ReaderT<R & R2, B> {
    return ReaderT.apply(mb, this);
  }

  tap<B, R2 = R>(fn: (a: A) => ReaderT<R2, B> | void): ReaderT<R & R2, A> {
    return new ReaderT((r: R & R2) =>
      this.run(r).tap((a) => {
        const monad = fn(a);
        return monad ? monad.run(r).map(() => void 0) : void 0;
      })
    );
  }

  tapContext(fn: (r: R) => void): ReaderT<R, A> {
    return new ReaderT((r: R) => this.run(r).tap(() => fn(r)));
  }

  tapError<B, R2 = R>(fn: (e: any) => ReaderT<R2, B> | void): ReaderT<R & R2, A> {
    return new ReaderT((r: R & R2) =>
      this.run(r).tapError((e) => {
        const monad = fn(e);
        return monad ? monad.run(r).map(() => void 0) : void 0;
      })
    );
  }

  map<B>(f: (a: A) => B): ReaderT<R, B> {
    return new ReaderT((r: R) => this.run(r).map(f));
  }

  chain<B, R2 = R>(f: (a: A) => ReaderT<R2, B>): ReaderT<R2 & R, B> {
    return new ReaderT((r: R2 & R) => this.run(r).chain((a) => f(a).run(r)));
  }

  tchain<R2 = R>(f: (a: A) => ReaderT<R2, void>): ReaderT<R2 & R, A> {
    return new ReaderT((r: R2 & R) => this.run(r).tchain((a) => f(a).run(r)));
  }

  chainError<B, R2 = R>(fn: (e: any) => ReaderT<R2, B>): ReaderT<R2 & R, A | B> {
    return new ReaderT((r: R2 & R) => this.run(r).chainError((e) => fn(e).run(r)));
  }

  chainMapContext<R2, B>(mapFn: (r: R) => R2, fn: (a: A) => ReaderT<R2, B>): ReaderT<R, B> {
    return this.chain((a) => ReaderT.from((r: R) => fn(a).run(mapFn(r))));
  }

  chainMapErrorContext<R2, B>(
    mapFn: (r: R) => R2,
    fn: (e: any) => ReaderT<R2, B>
  ): ReaderT<R, A | B> {
    return this.chainError((e) => ReaderT.from((r: R) => fn(e).run(mapFn(r))));
  }

  mapContext<R2>(mapFn: (r: R2) => R): ReaderT<R2, A> {
    return new ReaderT((r: R2) => this.run(mapFn(r)));
  }

  provide<R2 extends Partial<R>>(partial: R2): ReaderT<Omit<R, keyof R2>, A> {
    return new ReaderT((r: Omit<R, keyof R2>) => this.run({ ...r, ...partial } as R));
  }

  toEither<E = unknown>(r: R, defaultLeft?: (e: any) => E): TaskEither<E, A> {
    return TaskEither.from(() =>
      this.run(r).execute<Either<any, A>>((e) => left(defaultLeft ? defaultLeft(e) : e), right)
    );
  }

  transform<B>(transformer: (readerT: ReaderT<R, A>) => B): B {
    return transformer(this);
  }
}

export const readerT = ReaderT.from;
