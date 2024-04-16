import { Either, left, right } from "../either/Either";
import { IReaderT } from "./ReaderT";

export class EitherReaderT<R, A, E> implements IReaderT<R, A> {
  static from<R, A, E>(fn: (a: R) => Either<E, A>): EitherReaderT<R, A, E> {
    return new EitherReaderT(fn);
  }

  constructor(private effect: (ctx: R) => Either<E, A>) {}

  run(ctx: R): Either<E, A> {
    return this.effect(ctx);
  }

  map<B>(f: (a: A) => B) {
    return new EitherReaderT((r: R) => this.run(r).map(f));
  }

  chain<B>(f: (a: A) => IReaderT<R, B>) {
    return new EitherReaderT((r: R) =>
      this.run(r).chain<B>((a) => f(a).fold(r, (e): Either<E, B> => left<E>(e as any), right))
    );
  }

  fold<B>(ctx: R, onLeft: (e?: unknown) => B, onRight: (a: A) => B): B {
    return this.run(ctx).fold(onLeft, onRight);
  }
}
