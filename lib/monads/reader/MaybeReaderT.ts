import { Maybe, maybe, nothing } from "../maybe";
import { IReaderT } from "./ReaderT";

export class MaybeReaderT<R, A> implements IReaderT<R, A> {
  static from<R, A>(fn: (a: R) => Maybe<A>): MaybeReaderT<R, A> {
    return new MaybeReaderT(fn);
  }

  constructor(private effect: (ctx: R) => Maybe<A>) {}

  run(ctx: R): Maybe<A> {
    return this.effect(ctx);
  }

  map<B>(f: (a: A) => B) {
    return new MaybeReaderT((r: R) => this.run(r).map(f));
  }

  chain<B>(f: (a: A) => IReaderT<R, B>) {
    return new MaybeReaderT((r: R) =>
      this.run(r).chain<B>((a) => f(a).fold(r, () => nothing(), maybe))
    );
  }

  fold<B>(ctx: R, onLeft: (e?: unknown) => B, onRight: (a: A) => B): B {
    return this.run(ctx).fold(onLeft, onRight);
  }
}
