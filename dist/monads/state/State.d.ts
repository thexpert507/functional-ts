export declare const Pair: <A, B>(a: A, b: B) => [A, B];
export declare class State<S, A> {
    run: (s: S) => [A, S];
    static of<S, A>(a: A): State<S, A>;
    static from<S, A>(fn: (s: S) => [A, S]): State<S, A>;
    private constructor();
    map<B>(f: (a: A) => B): State<S, B>;
    tap(f: (a: A) => void): State<S, A>;
    tapEffect(f: (s: S) => void): State<S, A>;
    chain<B>(f: (a: A) => State<S, B>): State<S, B>;
    runWith(s: S): [A, S];
    evalWith(s: S): A;
    execWith(s: S): S;
}
