import { Either, left, right } from "../either/Either";
import { maybe } from "../maybe/Maybe";
import { TaskEither } from "../either/TaskEither";
import { Monad } from "../types/Monad";
import { MapFn } from "../free";

type Effect<T> = () => Promise<T>;

type F<A, B> = (a: NonNullable<A>) => B;

export class TaskIO<T> implements Monad<T> {
  static from<R>(effect: Effect<R>): TaskIO<R> {
    return new TaskIO(effect);
  }

  static void(effect: Effect<any>): TaskIO<void> {
    return new TaskIO(async () => {
      await effect();
    });
  }

  static of<R>(value: R): TaskIO<R> {
    return new TaskIO(() => Promise.resolve(value));
  }

  static rejected<R>(error: any): TaskIO<R> {
    return new TaskIO(() => Promise.reject(error));
  }

  static apply<A, B>(f: TaskIO<F<A, B>>, mb: TaskIO<NonNullable<A>>): TaskIO<B> {
    return new TaskIO(async () => {
      const fn = await f.run();
      const value = await mb.run();
      return fn(value);
    });
  }

  static all<T>(tasks: TaskIO<T>[]): TaskIO<T[]> {
    return new TaskIO(async () => {
      return Promise.all(tasks.map((task) => task.run()));
    });
  }

  constructor(private effect: Effect<T>) {}

  execute<R>(f: (e?: any) => R, g: (value: T) => R): Promise<R> {
    return this.effect().then(g).catch(f);
  }

  async run(): Promise<T> {
    return this.effect();
  }

  apply<B>(mb: Monad<MapFn<T, B>>): Monad<B> {
    return new TaskIO(async () => {
      const [fn, value] = await Promise.all([mb.getAsync(), this.run()]);
      return fn(value);
    });
  }

  getAsync(): Promise<T> {
    return this.run();
  }

  getAsyncOrElse(f: (e?: any) => T): Promise<T> {
    return this.run().catch(f);
  }

  map<R>(f: (wrapped: T) => R | Promise<R>): TaskIO<R> {
    return new TaskIO(async () => f(await this.run()));
  }

  tap(f: (wrapped: T) => void): TaskIO<T> {
    return new TaskIO(async () => {
      const result = await this.run();
      f(result);
      return result;
    });
  }

  chain<R>(f: (wrapped: T) => Monad<R>): TaskIO<R> {
    return new TaskIO(async () => f(await this.run()).getAsync());
  }

  toEither<L = never>(mapError?: (err: any) => L): TaskEither<L, T> {
    return TaskEither.from(() =>
      this.run()
        .then((result): Either<L, T> => right(result))
        .catch(
          (error): Either<L, T> =>
            maybe(mapError)
              .map((f) => left(f(error)))
              .getOrElse(left(error))
        )
    );
  }

  fold<R>(f: (e?: any) => R, g: (value: T) => R): Promise<R> {
    return this.run().then(g).catch(f);
  }
}

export const taskIO = TaskIO.from;
export const applyTaskIO = TaskIO.apply;
