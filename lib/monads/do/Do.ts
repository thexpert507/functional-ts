import { maybe } from "../maybe";
import { Monad } from "../types";

type RecordOfMonads = Record<string, Monad<any>>;
type MonadRecord<T extends RecordOfMonads> = {
  [K in keyof T]: T[K] extends Monad<infer U> ? U : never;
};

type RecordOfFnMonads<A> = Record<string, (a: A) => Monad<any>>;
type MonadRecordFn<A, T extends RecordOfFnMonads<A>> = {
  [K in keyof T]: ReturnType<T[K]> extends Monad<infer U> ? U : never;
};

export class Do<A> {
  static of<T extends RecordOfMonads>(data: T): Do<MonadRecord<T>> {
    const [first, ...rest] = Object.entries(data) as [keyof T, Monad<any>][];

    if (!first) return new Do(maybe({} as MonadRecord<T>));

    const initialValue = first[1].map((result) => ({ [first[0]]: result })) as Monad<
      MonadRecord<T>
    >;

    return new Do(
      rest.reduce<Monad<MonadRecord<T>>>(
        (acc, [key, program]) =>
          acc.apply(program.map((result) => (results) => ({ ...results, [key]: result }))),
        initialValue
      )
    );
  }

  constructor(private ctx: Monad<A>) {}

  bind<T extends RecordOfMonads>(data: T): Do<A & MonadRecord<T>> {
    const bindedMonad = this.ctx.chain((ctx) => {
      const [first, ...rest] = Object.entries(data) as [keyof T, Monad<any>][];

      if (!first) return maybe(ctx);

      const initialValue = first[1].map((result) => ({ [first[0]]: result })) as Monad<
        MonadRecord<T>
      >;

      return rest
        .reduce<Monad<MonadRecord<T>>>(
          (acc, [key, program]) =>
            acc.apply(program.map((result) => (results) => ({ ...results, [key]: result }))),
          initialValue
        )
        .map((results) => ({ ...ctx, ...results }));
    }) as Monad<A & MonadRecord<T>>;

    return new Do(bindedMonad);
  }

  bindl<T extends RecordOfFnMonads<A>>(data: T): Do<A & MonadRecordFn<A, T>> {
    const bindedMonad = this.ctx.chain((ctx) => {
      const [first, ...rest] = Object.entries(data) as [keyof T, (a: any) => Monad<any>][];
      if (!first) return maybe(ctx);

      const initialValue = first[1](ctx).map((result) => ({ [first[0]]: result })) as Monad<
        MonadRecordFn<A, T>
      >;

      return rest
        .reduce<Monad<MonadRecordFn<A, T>>>(
          (acc, [key, program]) =>
            acc.apply(program(ctx).map((result) => (results) => ({ ...results, [key]: result }))),
          initialValue
        )
        .map((results) => ({ ...ctx, ...results }));
    }) as Monad<A & MonadRecordFn<A, T>>;

    return new Do(bindedMonad);
  }

  run(): Monad<A> {
    return this.ctx;
  }
}

export const doM = Do.of;
