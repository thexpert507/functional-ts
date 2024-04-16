import { TaskIO } from "../TaskIO";
import { ITaskReaderT } from "./TaskReaderT";
export declare class IOTaskReaderT<R, A> implements ITaskReaderT<R, A> {
    private effect;
    static from<R, A>(fn: (a: R) => TaskIO<A>): IOTaskReaderT<R, A>;
    constructor(effect: (ctx: R) => TaskIO<A>);
    run(ctx: R): TaskIO<A>;
    map<B>(f: (a: A) => B): IOTaskReaderT<R, B>;
    chain<B>(f: (a: A) => ITaskReaderT<R, B>): IOTaskReaderT<R, B>;
    fold<B>(ctx: R, onLeft: (e?: unknown) => B, onRight: (a: A) => B): Promise<B>;
}
