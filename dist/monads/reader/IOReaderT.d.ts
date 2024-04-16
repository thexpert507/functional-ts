import { IO } from "../io";
import { IReaderT } from "./ReaderT";
export declare class IOReaderT<R, A> implements IReaderT<R, A> {
    private effect;
    static from<R, A>(fn: (a: R) => IO<A>): IOReaderT<R, A>;
    constructor(effect: (ctx: R) => IO<A>);
    run(ctx: R): IO<A>;
    map<B>(f: (a: A) => B): IOReaderT<R, B>;
    chain<B>(f: (a: A) => IReaderT<R, B>): IOReaderT<R, B>;
    fold<B>(ctx: R, onLeft: (e?: unknown) => B, onRight: (a: A) => B): B;
}
