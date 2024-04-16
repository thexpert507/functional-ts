import { Either } from "../either/Either";
import { IO } from "../io/IO";
type F<A, B> = (a: NonNullable<A>) => B;
export declare class Reader<R, A, E = unknown> {
    run: (r: R) => A;
    static from<R, A>(f: (r: R) => A): Reader<R, A>;
    static fromIO<R, A>(fn: (a: R) => IO<A>): Reader<R, A>;
    static fromEither<R, A, E = unknown>(fn: (a: R) => Either<E, A>): Reader<R, A>;
    static of<R, A>(a: A): Reader<R, A>;
    static ofEither<R, A, L = unknown>(either: Either<L, A>): Reader<R, A, L>;
    static ask<R>(): Reader<R, R>;
    static apply<C, A, B>(f: Reader<C, F<A, B>>, mb: Reader<C, NonNullable<A>>): Reader<C, B>;
    protected constructor(run: (r: R) => A);
    ask(): Reader<R, R>;
    map<B>(f: (a: A) => B): Reader<R, B>;
    chain<B>(f: (a: A) => Reader<R, B>): Reader<R, B>;
    chainContext<C2, B>(mapFn: (r: R) => C2, fn: (a: A) => Reader<C2, B>): Reader<R, B>;
    toEither(r: R, defaultLeft?: (r: R) => E): Either<E, A>;
}
export declare const reader: typeof Reader.from;
export declare const readerIO: typeof Reader.fromIO;
export declare const readerEither: typeof Reader.fromEither;
export declare const readerAsk: typeof Reader.ask;
export declare const readerOf: typeof Reader.of;
export declare const readerApply: typeof Reader.apply;
export declare function readerMapContext<C, C2, A>(mapFn: (r: C) => C2, reader: Reader<C2, A>): Reader<C, A>;
export {};
