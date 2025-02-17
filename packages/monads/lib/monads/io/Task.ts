import { Either, left, right } from "../either/Either";
import { maybe } from "../maybe/Maybe";
import { TaskEither } from "../either/TaskEither";
import { Monad } from "../types/Monad";
import { MapFn } from "../free";

type Effect<T> = () => Promise<T>;

type F<A, B> = (a: NonNullable<A>) => B;

export class Task<T> implements Monad<T> {
  static from<R>(effect: Effect<R>): Task<R> {
    return new Task(effect);
  }

  static void(effect: Effect<any>): Task<void> {
    return new Task(async () => void (await effect()));
  }

  static of<R>(value: R): Task<R> {
    return new Task(() => Promise.resolve(value));
  }

  static rejected<R>(error: any): Task<R> {
    return new Task(() => Promise.reject(error));
  }

  static apply<A, B>(f: Task<F<A, B>>, mb: Task<NonNullable<A>>): Task<B> {
    return new Task(async () => {
      const [fn, value] = await Promise.all([f.run(), mb.run()]);
      return fn(value);
    });
  }

  static all<T>(tasks: Task<T>[]): Task<T[]> {
    return new Task(async () => {
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
    return new Task(async () => {
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

  map<R>(f: (wrapped: T) => R | Promise<R>): Task<R> {
    return new Task(async () => f(await this.run()));
  }

  tap(f: (wrapped: T) => Monad<void> | void): Task<T> {
    return new Task(async () => {
      const result = await this.run();
      const monad = f(result);
      if (monad) monad.getAsync();
      return result;
    });
  }

  tapError(f: (error: any) => Monad<void> | void): Task<T> {
    return new Task(async () => {
      return this.run().catch((error) => {
        const monad = f(error);
        if (monad) monad.getAsync();
        return Promise.reject(error);
      });
    });
  }

  bind<R>(f: (wrapped: T) => Task<R>): Task<R> {
    return new Task(async () => {
      return f(await this.run()).run();
    });
  }

  bindError<R>(f: (error: any) => Task<R>): Task<T | R> {
    return new Task(async () => {
      return this.run().catch((error) => f(error).run());
    });
  }

  chain<R>(f: (wrapped: T) => Monad<R>): Monad<R> {
    return new Task(async () => {
      return this.fold(
        (e) => Promise.reject(e),
        (value) =>
          f(value).execute(
            (e) => Promise.reject(e),
            (value) => Promise.resolve(value)
          )
      );
    });
  }

  tchain(f: (a: T) => Monad<void>): Monad<T> {
    return new Task(async () => {
      return this.fold(
        async (e) => Promise.reject(e),
        async (value) => {
          await f(value).getAsync();
          return value;
        }
      );
    });
  }

  chainError<B>(f: (e: any) => Monad<B>): Monad<T | B> {
    return new Task<T | B>(async () => {
      return this.fold(
        async (e) =>
          f(e).execute<Promise<T | B>>(
            (e) => Promise.reject(e),
            (value) => Promise.resolve(value)
          ),
        (value) => Promise.resolve(value) as unknown as Promise<T | B>
      );
    });
  }

  toEither<L = never>(mapError?: (err: any) => L): TaskEither<L, T> {
    return TaskEither.from(() =>
      this.run()
        .then((result): Either<L, T> => right(result))
        .catch(
          (error): Either<L, T> =>
            maybe(mapError)
              .map((f) => left(f?.(error) ?? error))
              .getOrElse(left(error))
        )
    );
  }

  async fold<R>(f: (e?: any) => R, g: (value: T) => R): Promise<R> {
    return await this.run().then(g).catch(f);
  }

  transform<B>(transformer: (monad: Monad<T>) => B): B {
    return transformer(this);
  }
}

export const task = Task.from;
export const applyTask = Task.apply;
