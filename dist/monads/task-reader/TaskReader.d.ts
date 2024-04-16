import { Either } from "../either/Either";
import { Reader } from "../reader";
import { TaskEither } from "../TaskEither";
import { TaskIO } from "../TaskIO";
type F<A, B> = (a: NonNullable<A>) => B;
export declare class TaskReader<R, A, E = unknown> {
    run: (r: R) => Promise<A>;
    static from<R, A>(f: (r: R) => Promise<A>): TaskReader<R, A>;
    static fromTaskIO<R, A>(fn: (a: R) => TaskIO<A>): TaskReader<R, A>;
    static fromTaskEither<R, A, L = unknown>(fn: (a: R) => TaskEither<L, A>): TaskReader<R, A, L>;
    static fromReader<R, A>(f: (r: R) => Reader<R, A>): TaskReader<R, A>;
    static of<R, A>(a: A): TaskReader<R, A>;
    static ofEither<R, A, L = unknown>(either: Either<L, A>): TaskReader<R, A, L>;
    static ofReader<R, A>(reader: Reader<R, A>): TaskReader<R, A>;
    static ask<R>(): TaskReader<R, R>;
    static apply<C, A, B>(f: TaskReader<C, F<A, B>>, mb: TaskReader<C, NonNullable<A>>): TaskReader<C, B>;
    protected constructor(run: (r: R) => Promise<A>);
    ask(): TaskReader<R, R>;
    map<B>(f: (a: A) => B): TaskReader<R, B>;
    tap(f: (a: A) => void): TaskReader<R, A>;
    chain<B>(f: (a: A) => TaskReader<R, B>): TaskReader<R, B>;
    chainContext<C2, B>(mapFn: (r: R) => C2, fn: (a: A) => TaskReader<C2, B>): TaskReader<R, B>;
    toEither<B>(r: R, left?: (r: R) => B): TaskEither<B, A>;
}
export declare const readerTask: typeof TaskReader.fromTaskIO;
export declare const readerTaskEither: typeof TaskReader.fromTaskEither;
export declare const applyTaskReader: typeof TaskReader.apply;
export declare function readerTaskMapContext<C, C2, A>(mapFn: (r: C) => C2, reader: TaskReader<C2, A>): TaskReader<C, A>;
export {};
