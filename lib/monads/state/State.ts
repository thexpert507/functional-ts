export const Pair = <A, B>(a: A, b: B) => [a, b] as [A, B];

export class State<S, A> {
  static of<S, A>(a: A): State<S, A> {
    return new State<S, A>((s) => Pair(a, s));
  }

  static from<S, A>(fn: (s: S) => [A, S]): State<S, A> {
    return new State<S, A>(fn);
  }

  private constructor(public run: (s: S) => [A, S]) {}

  map<B>(f: (a: A) => B): State<S, B> {
    return new State<S, B>((s) => {
      const [a, s1] = this.run(s);
      return Pair(f(a), s1);
    });
  }

  tap(f: (a: A) => void): State<S, A> {
    return new State<S, A>((s) => {
      const [a, s1] = this.run(s);
      f(a);
      return Pair(a, s1);
    });
  }

  tapEffect(f: (s: S) => void): State<S, A> {
    return new State<S, A>((s) => {
      const [a, s1] = this.run(s);
      f(s1);
      return Pair(a, s1);
    });
  }

  chain<B>(f: (a: A) => State<S, B>): State<S, B> {
    return new State<S, B>((s) => {
      const [a, s1] = this.run(s);
      return f(a).run(s1);
    });
  }

  runWith(s: S): [A, S] {
    return this.run(s);
  }

  evalWith(s: S): A {
    return this.run(s)[0];
  }

  execWith(s: S): S {
    return this.run(s)[1];
  }
}
