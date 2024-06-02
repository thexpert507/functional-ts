import { MapFn } from "../free";

export type Monad<A> = {
  apply<B>(mb: Monad<MapFn<A, B>>): Monad<B>;

  map<B>(f: (a: A) => B): Monad<B>;

  tap(f: (a: A) => void): Monad<A>;

  chain<B>(f: (a: A) => Monad<B>): Monad<B>;

  chainError<B>(f: (e: any) => Monad<B>): Monad<A | B>;

  execute<R>(f: (e?: any) => R, g: (value: A) => R): Promise<R>;

  getAsync(): Promise<A>;

  getAsyncOrElse(f: (e?: any) => A): Promise<A>;
};
