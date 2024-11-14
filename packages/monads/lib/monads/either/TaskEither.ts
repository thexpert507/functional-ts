import { PrimitiveEither, Either, Left, Right, left, right } from "./Either";
import { Monad } from "../types/Monad";
import { maybe } from "../maybe";
import { MapFn } from "../free";
import { id } from "../identity";

const handleError = (error: any) => {
  if (error instanceof Either) return error;
  if (error instanceof Error) return left(error);
  if (typeof error === "string") return left(error);
  return left(`Unknown error: ${error}`);
};

type F<A, B> = (a: NonNullable<A>) => B;

export class TaskEither<L, R> implements Monad<R> {
  static sequence<L, R>(arr: TaskEither<L, R>[]): TaskEither<L, R[]> {
    return arr.reduce((acc, curr) => {
      return acc.bind((accVal) =>
        TaskEither.from(() => curr.fold<Either<L, R[]>>(left, (r) => right([...accVal, r])))
      );
    }, TaskEither.right<L, R[]>([]));
  }

  static sequenceSettled<L, R>(arr: TaskEither<L, R>[]): TaskEither<L, Either<L, R>[]> {
    return arr.reduce((acc, curr) => {
      return acc.bind((accVal) =>
        TaskEither.from(() => curr.effect().then((r) => right([...accVal, r])))
      );
    }, TaskEither.right<L, Either<L, R>[]>([]));
  }

  static all<L, R>(tasks: TaskEither<L, R>[]): TaskEither<L, R[]> {
    return new TaskEither(async () => {
      return await Promise.all(tasks.map((task) => task.getAsync())).then(right);
    });
  }

  static allSettled<L, R>(tasks: TaskEither<L, R>[]): TaskEither<L, Either<L, R>[]> {
    return new TaskEither(async () => {
      return await Promise.all(tasks.map((task) => task.effect())).then(right);
    });
  }

  static flattenTask<L, R>(task: TaskEither<L, TaskEither<L, R>>): TaskEither<L, R> {
    return TaskEither.from(async () => {
      return task.fold(
        async (l) => left(l),
        async (r) => await r.effect()
      );
    });
  }

  static flatten<L, R>(either: TaskEither<L, Either<L, R>>): TaskEither<L, R> {
    return TaskEither.from(async () => either.fold(left, id));
  }

  private static parsePrimitiveEither<L, R>(value: any): PrimitiveEither<L, R> {
    if (value === null)
      return { isRight: false, value: "Null value from TaskEither.fromPrimitives" as L };
    if (value === undefined)
      return { isRight: false, value: "Undefined value from TaskEither.fromPrimitives" as L };
    if (typeof value === "object" && "isRight" in value) return value;
    if (value instanceof Either) return value.toPrimitive();
    return { isRight: false, value: value };
  }

  static fromPrimitives<L, R>(value: PrimitiveEither<L, R>): TaskEither<L, R> {
    const primitive = TaskEither.parsePrimitiveEither(value);
    if (primitive.isRight) {
      return TaskEither.of<L, R>(right(primitive.value) as Either<L, R>);
    } else {
      return TaskEither.of<L, R>(left(primitive.value) as Either<L, R>);
    }
  }

  static from<L, R>(value: () => Promise<Either<L, R>>): TaskEither<L, R> {
    return new TaskEither(() => value().catch(handleError));
  }

  static of<L, R>(value: Either<L, R>): TaskEither<L, R> {
    if (!(value instanceof Either)) throw new Error("Invalid value from TaskEither.of");
    const evaluatedValue = maybe(value).getOrElse(left("Invalid value from TaskEither.of" as L));
    return new TaskEither(async () => evaluatedValue);
  }

  static right<L, R>(value: R): TaskEither<L, R> {
    return TaskEither.of(right(value));
  }

  static left<L, R>(value: L): TaskEither<L, R> {
    return TaskEither.of(left(value));
  }

  static appply<L, A, B>(
    f: TaskEither<L, F<A, B>>,
    mb: TaskEither<L, NonNullable<A>>
  ): TaskEither<L, B> {
    return TaskEither.from<L, B>(async (): Promise<Either<L, B>> => {
      const [eitherFn, eitherValue] = await Promise.all([f.effect(), mb.effect()]);

      if (eitherFn.isLeft()) return left(eitherFn.left()!);
      if (eitherValue.isLeft()) return left(eitherValue.left()!);

      const fn = eitherFn.right() as F<A, B>;
      const value = eitherValue.right() as NonNullable<A>;

      return right(fn(value));
    });
  }

  constructor(public readonly effect: () => Promise<Either<L, R>>) {}

  async fold<T>(left: (l: L) => T, right: (r: R) => T): Promise<T> {
    return this.effect().then((either) =>
      either.fold(
        (e) => left(e),
        (r) => right(r)
      )
    );
  }

  left(): Promise<L | undefined> {
    return this.fold(
      (l) => l,
      (r) => undefined
    );
  }

  right(): Promise<R | undefined> {
    return this.fold(
      (l) => undefined,
      (r) => r
    );
  }

  isLeft(): Promise<boolean> {
    return this.fold(
      (l) => true,
      (r) => false
    );
  }

  isRight(): Promise<boolean> {
    return this.fold(
      (l) => false,
      (r) => true
    );
  }

  execute<T>(f: (e?: any) => T, g: (value: R) => T): Promise<T> {
    return this.fold(
      (l) => f(l),
      (r) => g(r)
    );
  }

  apply<B>(mb: Monad<MapFn<R, B>>): Monad<B> {
    return TaskEither.from(async () => {
      const [fn, value] = await Promise.all([mb.getAsync(), this.effect()]);
      return value.map(fn);
    });
  }

  map<T>(f: MapFn<R, T>): TaskEither<L, T> {
    return new TaskEither(() =>
      this.effect()
        .then(async (either) =>
          either.fold(
            (l) => Promise.resolve(new Left(l) as Either<L, T>),
            (r) => Promise.resolve(new Right(f(r)) as Either<L, T>)
          )
        )
        .catch(handleError)
    );
  }

  tap(f: (r: R) => Monad<void> | void): TaskEither<L, R> {
    return new TaskEither(() =>
      this.effect().then(async (either) =>
        either.fold<Either<L, R>>(
          (l) => left(l),
          (r) => right(r).tapRight(f)
        )
      )
    );
  }

  tapError(f: (e: any) => Monad<void> | void): Monad<R> {
    return this.tapLeft(f);
  }

  tapLeft(f: (l: L) => void): TaskEither<L, R> {
    return new TaskEither(() =>
      this.effect().then(async (either) =>
        either.fold<Either<L, R>>(
          (l) => left(l).tapLeft(f),
          (r) => right(r)
        )
      )
    );
  }

  bind<T>(f: (r: R) => TaskEither<L, T>): TaskEither<L, T> {
    return new TaskEither(() =>
      this.effect().then(async (either) =>
        either.fold(
          (l) => Promise.resolve(new Left(l)),
          (r) => f(r).effect()
        )
      )
    );
  }

  bindLeft<T>(f: (l: L) => TaskEither<T, R>): TaskEither<T, R> {
    return new TaskEither(() =>
      this.effect().then(async (either) =>
        either.fold(
          (l) => f(l).effect(),
          (r) => Promise.resolve(new Right(r))
        )
      )
    );
  }

  chain<T>(f: (r: R) => Monad<T>): Monad<T> {
    return new TaskEither(() =>
      this.effect().then(async (either) =>
        either.fold(
          (l) => Promise.resolve(new Left(l)),
          (r) => f(r).getAsync().then(right).catch(handleError)
        )
      )
    );
  }

  tchain(f: (a: R) => Monad<void>): Monad<R> {
    return new TaskEither(() =>
      this.effect().then(async (either) =>
        either.fold(
          (l) => Promise.resolve(new Left(l)),
          (r) =>
            f(r)
              .getAsync()
              .then(() => right(r))
              .catch(handleError)
        )
      )
    );
  }

  chainError<B>(f: (e: any) => Monad<B>): Monad<R | B> {
    return new TaskEither(() =>
      this.effect().then(async (either) =>
        either.fold(
          (l) => f(l).getAsync().then(right).catch(handleError),
          (r) => Promise.resolve(right(r))
        )
      )
    );
  }

  chainLeft<T>(f: (l: L) => Monad<R>): TaskEither<T, R> {
    return new TaskEither(() =>
      this.effect().then(async (either) =>
        either.fold(
          (l) => f(l).getAsync().then(right).catch(handleError),
          (r) => Promise.resolve(right(r))
        )
      )
    );
  }

  async getOrElse(defaultValue: R): Promise<R> {
    const either = await this.effect();
    return either.fold(
      () => defaultValue,
      (r) => r
    );
  }

  async getOrElseThrow(defaultLeft?: L): Promise<R> {
    const either = await this.effect();
    return either.fold(
      (l) => Promise.reject(l ?? defaultLeft ?? ("Error from TaskEither" as L)) as R,
      (r) => r
    );
  }

  async getAsync(): Promise<R> {
    return this.effect().then((either) => either.getAsync());
  }

  async getAsyncOrElse(f: (e?: any) => R): Promise<R> {
    return this.effect().then((either) => either.getAsyncOrElse(f));
  }

  async toPrimitive(): Promise<PrimitiveEither<L, R>> {
    return this.effect().then((either) => either.toPrimitive());
  }

  transform<B>(transformer: (monad: Monad<R>) => B): B {
    return transformer(this);
  }
}

export const taskEither = TaskEither.from;
export const taskEitherOf = TaskEither.of;
export const applyTaskEither = TaskEither.appply;
