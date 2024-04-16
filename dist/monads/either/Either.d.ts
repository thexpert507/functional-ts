export type PrimitiveEither<L, R> = {
    isRight: boolean;
    value: L | R;
};
type F<A, B> = (a: NonNullable<A>) => B;
export declare abstract class Either<L, R> {
    protected value: L | R;
    static apply<L, A, B>(ab: Either<L, F<A, B>>, mb: Either<L, NonNullable<A>>): Either<L, B>;
    constructor(value: L | R);
    abstract fold<T>(left: (l: L) => T, right: (r: R) => T): T;
    abstract left(): L | undefined;
    abstract right(): R | undefined;
    abstract isLeft(): boolean;
    abstract isRight(): boolean;
    abstract tapLeft(f: (l: L) => void): Either<L, R>;
    abstract tapRight(f: (r: R) => void): Either<L, R>;
    abstract map<T>(f: (r: R) => T): Either<L, T>;
    abstract chain<T>(f: (r: R) => Either<L, T>): Either<L, T>;
    abstract toPrimitive(): PrimitiveEither<L, R>;
    abstract getOrElseThrow(): R;
    abstract getOrElse(defaultValue: R): R;
}
export declare class Left<L> extends Either<L, never> {
    fold<T>(left: (l: L) => T, right: (r: never) => T): T;
    left(): L | undefined;
    right(): never;
    isLeft(): boolean;
    isRight(): boolean;
    tapLeft(f: (l: L) => void): Either<L, never>;
    tapRight(f: (r: never) => void): Either<L, never>;
    map<T>(f: (r: never) => T): Either<L, T>;
    chain<T>(f: (r: never) => Either<L, T>): Either<L, T>;
    toPrimitive(): {
        isRight: boolean;
        value: L | never;
    };
    getOrElseThrow(): never;
    getOrElse(defaultValue: never): never;
}
export declare class Right<R> extends Either<never, R> {
    fold<T>(left: (l: never) => T, right: (r: R) => T): T;
    left(): never;
    right(): R | undefined;
    isLeft(): boolean;
    isRight(): boolean;
    tapLeft(f: (l: never) => void): Either<never, R>;
    tapRight(f: (r: R) => void): Either<never, R>;
    map<T>(f: (r: R) => T): Either<never, T>;
    chain<T>(f: (r: R) => Either<never, T>): Either<never, T>;
    toPrimitive(): {
        isRight: boolean;
        value: R | never;
    };
    getOrElseThrow(): R;
    getOrElse(defaultValue: R): R;
}
export type PromiseEither<T, E> = Promise<Either<T, E>>;
export declare const right: <R>(r: R) => Right<R>;
export declare const left: <L>(l: L) => Left<L>;
export declare const applyEither: typeof Either.apply;
export {};