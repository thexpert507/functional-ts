import { Maybe } from "../maybe";
import { IReaderT } from "./ReaderT";
export declare class MaybeReaderT<R, A> implements IReaderT<R, A> {
    private effect;
    static from<R, A>(fn: (a: R) => Maybe<A>): MaybeReaderT<R, A>;
    constructor(effect: (ctx: R) => Maybe<A>);
    run(ctx: R): Maybe<A>;
    map<B>(f: (a: A) => B): MaybeReaderT<R, B>;
    chain<B>(f: (a: A) => IReaderT<R, B>): MaybeReaderT<R, B>;
    fold<B>(ctx: R, onLeft: (e?: unknown) => B, onRight: (a: A) => B): B;
}
