type F<A, B> = (a: NonNullable<A>) => B;
export declare class IO<T> {
    private effect;
    static apply<A, B>(f: IO<F<A, B>>, mb: IO<NonNullable<A>>): IO<B>;
    static of<R>(value: R): IO<R>;
    static reject<R>(error: Error): IO<R>;
    constructor(effect: () => T);
    run(): T;
    tap(f: (wrapped: NonNullable<T>) => void): IO<T>;
    map<R>(f: (wrapped: NonNullable<T>) => R): IO<R>;
    chain<R>(f: (wrapped: NonNullable<T>) => IO<R>): IO<R>;
    fold<R>(f: () => R, g: (value: T) => R): R;
}
export declare const io: typeof IO.of;
export declare const applyIO: typeof IO.apply;
export {};
