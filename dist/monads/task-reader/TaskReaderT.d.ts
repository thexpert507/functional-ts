export declare abstract class ITaskReaderT<R, A, Monad = unknown> {
    abstract map<B>(f: (a: A) => B): ITaskReaderT<R, B>;
    abstract chain<B>(f: (a: A) => ITaskReaderT<R, B>): ITaskReaderT<R, B>;
    abstract run(ctx: R): Monad;
    abstract fold<B>(ctx: R, onLeft: (e?: unknown) => B, onRight: (a: A) => B): Promise<B>;
}
