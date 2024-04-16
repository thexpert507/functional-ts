import { Either } from "../either/Either";
import { Reader } from "../reader";
import { TaskEither } from "../TaskEither";
import { TaskIO } from "../TaskIO";

type F<A, B> = (a: NonNullable<A>) => B;

export class TaskReader<R, A> {
  static from<R, A>(f: (r: R) => Promise<A>): TaskReader<R, A> {
    return new TaskReader(f);
  }

  static fromTaskIO<R, A>(fn: (a: R) => TaskIO<A>): TaskReader<R, A> {
    return new TaskReader((r: R) => fn(r).run());
  }

  static fromTaskEither<R, A, L = unknown>(fn: (a: R) => TaskEither<L, A>): TaskReader<R, A> {
    return new TaskReader((r: R) => fn(r).getOrElseThrow());
  }

  static fromReader<R, A>(f: (r: R) => Reader<R, A>): TaskReader<R, A> {
    return new TaskReader((r: R) => Promise.resolve(f(r).run(r)));
  }

  static of<R, A>(a: A): TaskReader<R, A> {
    return new TaskReader(() => Promise.resolve(a));
  }

  static ofEither<R, A, L = unknown>(either: Either<L, A>): TaskReader<R, A> {
    return new TaskReader(async () => either.getOrElseThrow());
  }

  static ofReader<R, A>(reader: Reader<R, A>): TaskReader<R, A> {
    return new TaskReader((r: R) => Promise.resolve(reader.run(r)));
  }

  static ask<R>(): TaskReader<R, R> {
    return new TaskReader(async (r: R) => r);
  }

  static apply<C, A, B>(f: TaskReader<C, F<A, B>>, mb: TaskReader<C, NonNullable<A>>): TaskReader<C, B> {
    return new TaskReader(async (r: C) => {
      const fn = await f.run(r);
      const value = await mb.run(r);
      return fn(value);
    });
  }

  protected constructor(public run: (r: R) => Promise<A>) {}

  ask(): TaskReader<R, R> {
    return TaskReader.ask<R>();
  }

  map<B>(f: (a: A) => B): TaskReader<R, B> {
    return new TaskReader((r: R) => this.run(r).then(f));
  }

  tap(f: (a: A) => void): TaskReader<R, A> {
    return this.map((a) => {
      f(a);
      return a;
    });
  }

  chain<B>(f: (a: A) => TaskReader<R, B>): TaskReader<R, B> {
    return new TaskReader((r: R) => this.run(r).then((a) => f(a).run(r)));
  }

  chainContext<C2, B>(mapFn: (r: R) => C2, fn: (a: A) => TaskReader<C2, B>): TaskReader<R, B> {
    return this.chain((a) => readerTaskMapContext(mapFn, fn(a)));
  }

  toEither<B>(r: R, left?: (r: R) => B): TaskEither<B, A> {
    return TaskIO.from(async () => this.run(r)).toEither(left);
  }
}

export const readerTask = TaskReader.fromTaskIO;
export const readerTaskEither = TaskReader.fromTaskEither;
export const applyTaskReader = TaskReader.apply;

export function readerTaskMapContext<C, C2, A>(mapFn: (r: C) => C2, reader: TaskReader<C2, A>): TaskReader<C, A> {
  return TaskReader.from((r) => reader.run(mapFn(r)));
}
