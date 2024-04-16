import { TaskEither } from "./TaskEither";
type Effect<T> = () => Promise<T>;
type F<A, B> = (a: NonNullable<A>) => B;
export declare class TaskIO<T> {
    private effect;
    static from<R>(effect: Effect<R>): TaskIO<R>;
    static void(effect: Effect<any>): TaskIO<void>;
    static of<R>(value: R): TaskIO<R>;
    static rejected<R>(error: any): TaskIO<R>;
    static apply<A, B>(f: TaskIO<F<A, B>>, mb: TaskIO<NonNullable<A>>): TaskIO<B>;
    constructor(effect: Effect<T>);
    run(): Promise<T>;
    map<R>(f: (wrapped: T) => R | Promise<R>): TaskIO<R>;
    tap(f: (wrapped: T) => void): TaskIO<T>;
    chain<R>(f: (wrapped: T) => TaskIO<R>): TaskIO<R>;
    toEither<L = never>(mapError?: (err: any) => L): TaskEither<L, T>;
}
export declare const taskIO: typeof TaskIO.from;
export declare const applyTaskIO: typeof TaskIO.apply;
export {};
