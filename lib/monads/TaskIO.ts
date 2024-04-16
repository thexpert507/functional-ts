import { Either, left, right } from "./either/Either";
import { maybe } from "./maybe/Maybe";
import { TaskEither } from "./TaskEither";

type Effect<T> = () => Promise<T>;

type F<A, B> = (a: NonNullable<A>) => B;

export class TaskIO<T> {
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

  constructor(private effect: Effect<T>) {}

  async run(): Promise<T> {
    return this.effect();
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

  chain<R>(f: (wrapped: T) => TaskIO<R>): TaskIO<R> {
    return new TaskIO(async () => f(await this.run()).run());
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
}

export const taskIO = TaskIO.from;
export const applyTaskIO = TaskIO.apply;
