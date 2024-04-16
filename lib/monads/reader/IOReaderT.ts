import { IO } from "../io";
import { IReaderT } from "./ReaderT";

export class IOReaderT<R, A> implements IReaderT<R, A> {
  static from<R, A>(fn: (a: R) => IO<A>): IOReaderT<R, A> {
    return new IOReaderT(fn);
  }

  constructor(private effect: (ctx: R) => IO<A>) {}

  run(ctx: R) {
    return this.effect(ctx);
  }

  map<B>(f: (a: A) => B) {
    return new IOReaderT((r: R) => this.run(r).map(f));
  }

  chain<B>(f: (a: A) => IReaderT<R, B>) {
    return new IOReaderT((r: R) =>
      this.run(r).chain((a) => f(a).fold(r, () => IO.reject<B>(new Error("IO rejected")), IO.of))
    );
  }

  fold<B>(ctx: R, onLeft: (e?: unknown) => B, onRight: (a: A) => B): B {
    try {
      return onRight(this.run(ctx).run());
    } catch (error) {
      return onLeft(error);
    }
  }
}
