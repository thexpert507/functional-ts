import { TaskEither } from "../TaskEither";

export abstract class TaskReaderT<R, A, Monad = unknown> {
  abstract map<B>(f: (a: A) => B): TaskReaderT<R, B>;

  abstract chain<B>(f: (a: A) => TaskReaderT<R, B>): TaskReaderT<R, B>;

  abstract run(ctx: R): Monad;

  abstract fold<B>(ctx: R, onLeft: (e?: unknown) => B, onRight: (a: A) => B): Promise<B>;

  abstract toEither<E = unknown>(ctx: R, mapErr?: (err: unknown) => E): TaskEither<E, A>;
}
