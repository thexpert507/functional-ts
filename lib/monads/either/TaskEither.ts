import { PrimitiveEither, Either, Left, Right, left, right } from "./Either";
import { Monad } from "../types/Monad";
import { maybe } from "../maybe";
import { MapFn } from "../free";

const handleError = (error: any) => {
  if (error instanceof Either) return error;
  if (error instanceof Error) return left(error);
  if (typeof error === "string") return left(error);
  return left(`Unknown error: ${error}`);
};

type F<A, B> = (a: NonNullable<A>) => B;

export class TaskEither<L, R> implements Monad<R> {
  static sequence<L, R>(arr: TaskEither<L, R>[]): TaskEither<L, R[]> {
    if (arr.length === 0) return TaskEither.right<L, R[]>([]);

    const result = arr.reduce((acc, curr) => {
      return acc.chain((accVal) =>
        TaskEither.from(() =>
          curr.fold<Either<L, R[]>>(
            (l) => left(l) as Either<L, R[]>,
            (r) => right([...accVal, r]) as Either<L, R[]>
          )
        )
      );
    }, TaskEither.right<L, R[]>([]));

    return result;
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
    const evaluatedValue = maybe(value).getOrElse(left("Invalid value from TaskEither.of" as L));
    return new TaskEither(() => Promise.resolve(evaluatedValue));
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
      const eitherFn = await f.effect();
      const eitherValue = await mb.effect();

      if (eitherFn.isLeft()) return left(eitherFn.left()!);
      if (eitherValue.isLeft()) return left(eitherValue.left()!);

      const fn = eitherFn.right() as F<A, B>;
      const value = eitherValue.right() as NonNullable<A>;

      return right(fn(value));
    });
  }

  constructor(public readonly effect: () => Promise<Either<L, R>>) {}

  async fold<T>(left: (l: L) => T, right: (r: R) => T): Promise<T> {
    return this.effect().then((either) => either.fold(left, right));
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

  tap(f: (r: R) => void): TaskEither<L, R> {
    return new TaskEither(() =>
      this.effect().then(async (either) =>
        either.fold(
          (l) => Promise.resolve(new Left(l) as Either<L, R>),
          async (r) => {
            f(r);
            return new Right(r);
          }
        )
      )
    );
  }

  chain<T>(f: (r: R) => TaskEither<L, T>): TaskEither<L, T> {
    return new TaskEither(() =>
      this.effect().then(async (either) =>
        either.fold(
          (l) => Promise.resolve(new Left(l)),
          (r) => f(r).effect()
        )
      )
    );
  }

  chainLeft<T>(f: (l: L) => TaskEither<T, R>): TaskEither<T, R> {
    return new TaskEither(() =>
      this.effect().then(async (either) =>
        either.fold(
          (l) => f(l).effect(),
          (r) => Promise.resolve(new Right(r))
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
}

export const taskEither = TaskEither.from;
export const taskEitherOf = TaskEither.of;
export const applyTaskEither = TaskEither.appply;
