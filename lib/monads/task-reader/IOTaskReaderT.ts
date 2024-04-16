import { TaskEither } from "../TaskEither";
import { TaskIO } from "../TaskIO";
import { Either, left, right } from "../either";
import { TaskReaderT } from "./TaskReaderT";

export class IOTaskReaderT<R, A> implements TaskReaderT<R, A> {
  static from<R, A>(fn: (a: R) => TaskIO<A>): IOTaskReaderT<R, A> {
    return new IOTaskReaderT(fn);
  }

  constructor(private effect: (ctx: R) => TaskIO<A>) {}

  run(ctx: R) {
    return this.effect(ctx);
  }

  map<B>(f: (a: A) => B) {
    return new IOTaskReaderT((r: R) => this.run(r).map(f));
  }

  chain<B>(f: (a: A) => TaskReaderT<R, B>) {
    return new IOTaskReaderT((r: R) =>
      this.run(r).chain((a) =>
        TaskIO.from(() =>
          f(a).fold(
            r,
            (e) => {
              throw new Error(`Unexpected error ${e}`);
            },
            (a) => a
          )
        )
      )
    );
  }

  fold<B>(ctx: R, onLeft: (e?: unknown) => B, onRight: (a: A) => B): Promise<B> {
    return this.run(ctx).run().then(onRight).catch(onLeft);
  }

  toEither<E = unknown>(ctx: R, mapErr?: (err: unknown) => E): TaskEither<E, A> {
    return TaskEither.from(() => {
      return this.fold(ctx, (e): Either<E, A> => (mapErr ? left<E>(mapErr(e)) : left<E>(e as any)), right);
    });
  }
}
