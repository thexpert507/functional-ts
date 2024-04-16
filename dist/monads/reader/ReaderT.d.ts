export declare abstract class IReaderT<R, A, Monad = unknown> {
    abstract map<B>(f: (a: A) => B): IReaderT<R, B>;
    abstract chain<B>(f: (a: A) => IReaderT<R, B>): IReaderT<R, B>;
    abstract run(ctx: R): Monad;
    abstract fold<B>(ctx: R, onLeft: (e?: unknown) => B, onRight: (a: A) => B): B;
}
