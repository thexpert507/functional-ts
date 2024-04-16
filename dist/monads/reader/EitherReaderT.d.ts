import { Either } from "../either/Either";
import { IReaderT } from "./ReaderT";
export declare class EitherReaderT<R, A, E> implements IReaderT<R, A> {
    private effect;
    static from<R, A, E>(fn: (a: R) => Either<E, A>): EitherReaderT<R, A, E>;
    constructor(effect: (ctx: R) => Either<E, A>);
    run(ctx: R): Either<E, A>;
    map<B>(f: (a: A) => B): EitherReaderT<R, B, E>;
    chain<B>(f: (a: A) => IReaderT<R, B>): EitherReaderT<R, B, E>;
    fold<B>(ctx: R, onLeft: (e?: unknown) => B, onRight: (a: A) => B): B;
}
