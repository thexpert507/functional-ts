import { TaskEither } from "../TaskEither";
import { Either, left, right } from "../either";
import { TaskReaderT } from "./TaskReaderT";

export class EitherTaskReaderT<R, A, E> implements TaskReaderT<R, A> {
  static from<R, A, E>(fn: (a: R) => TaskEither<E, A>): EitherTaskReaderT<R, A, E> {
    return new EitherTaskReaderT(fn);
  }

  constructor(private effect: (ctx: R) => TaskEither<E, A>) {}

  run(ctx: R): TaskEither<E, A> {
    return this.effect(ctx);
  }

  map<B>(f: (a: A) => B) {
    return new EitherTaskReaderT((r: R) => this.run(r).map(f));
  }

  chain<B>(f: (a: A) => TaskReaderT<R, B>) {
    return new EitherTaskReaderT((r: R) =>
      this.run(r).chain<B>((a) => TaskEither.from(() => f(a).fold(r, (e): Either<E, B> => left<E>(e as any), right)))
    );
  }

  fold<B>(ctx: R, onLeft: (e?: unknown) => B, onRight: (a: A) => B): Promise<B> {
    return this.run(ctx).fold(onLeft, onRight);
  }

  toEither<E = unknown>(ctx: R, mapErr?: ((err: unknown) => E) | undefined): TaskEither<E, A> {
    return TaskEither.from(() => {
      return this.fold(ctx, (e): Either<E, A> => (mapErr ? left<E>(mapErr(e)) : left<E>(e as any)), right);
    });
  }
}
