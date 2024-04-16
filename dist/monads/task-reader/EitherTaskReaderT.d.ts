import { TaskEither } from "../TaskEither";
import { ITaskReaderT } from "./TaskReaderT";
export declare class EitherTaskReaderT<R, A, E> implements ITaskReaderT<R, A> {
    private effect;
    static from<R, A, E>(fn: (a: R) => TaskEither<E, A>): EitherTaskReaderT<R, A, E>;
    constructor(effect: (ctx: R) => TaskEither<E, A>);
    run(ctx: R): TaskEither<E, A>;
    map<B>(f: (a: A) => B): EitherTaskReaderT<R, B, E>;
    chain<B>(f: (a: A) => ITaskReaderT<R, B>): EitherTaskReaderT<R, B, E>;
    fold<B>(ctx: R, onLeft: (e?: unknown) => B, onRight: (a: A) => B): Promise<B>;
}
