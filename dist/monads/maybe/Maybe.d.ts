import { Either } from "../either/Either";
type F<A, B> = (a: NonNullable<A>) => B;
export declare class Maybe<T> {
    private value;
    static of<T>(value: T): Maybe<T>;
    static apply<A, B>(f: Maybe<F<A, B>>, a: Maybe<A>): Maybe<B>;
    private constructor();
    isNothing(): boolean;
    tap(f: (a: NonNullable<T>) => void): Maybe<T>;
    map<B>(f: (a: NonNullable<T>) => B): Maybe<B>;
    ap<B>(this: Maybe<F<T, B>>, mb: Maybe<NonNullable<T>>): Maybe<B>;
    join(): T | Maybe<T>;
    chain<B>(f: (a: NonNullable<T>) => Maybe<B>): Maybe<B>;
    getOrElse(defaultValue: NonNullable<T>): NonNullable<T>;
    get(): NonNullable<T> | null;
    toEither<L>(leftValue: L): Either<L, NonNullable<T>>;
    fold<R>(f: () => R, g: (value: NonNullable<T>) => R): R;
}
export declare const nothing: <T>() => Maybe<T>;
export declare const maybe: typeof Maybe.of;
export declare const applyMaybe: typeof Maybe.apply;
export {};
