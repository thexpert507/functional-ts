import { Pair, pair } from "./Pair";

type SubFn<A> = (value: A) => void;

export class State<S, A> {
  static of<S, A>(a: A): State<S, A> {
    return new State<S, A>((s) => pair(a, s));
  }

  static from<S, A>(fn: (s: S) => Pair<A, S>): State<S, A> {
    return new State<S, A>(fn);
  }

  private constructor(public run: (s: S) => Pair<A, S>, private subscribers: SubFn<S>[] = []) {}

  private emit(s: S) {
    this.subscribers.forEach((sub) => sub(s));
  }

  map<B>(f: (a: A) => B): State<S, B> {
    return new State<S, B>((s) => {
      return this.run(s)
        .tapEffect((s) => this.emit(s))
        .mapValue(f);
    }, this.subscribers);
  }

  tap(f: (a: A) => void): State<S, A> {
    return new State<S, A>((s) => this.run(s).tap(f), this.subscribers);
  }

  tapEffect(f: (s: S) => void): State<S, A> {
    return new State<S, A>((s) => this.run(s).tapEffect(f), this.subscribers);
  }

  chain<B>(f: (a: A) => State<S, B>): State<S, B> {
    return new State<S, B>((s) => {
      const pair = this.run(s);
      return f(pair.value).run(pair.state);
    }, this.subscribers);
  }

  runWith(s: S): Pair<A, S> {
    return this.run(s).tapEffect((s) => this.emit(s));
  }

  evalWith(s: S): A {
    return this.runWith(s).value;
  }

  execWith(s: S): S {
    return this.runWith(s).state;
  }

  subscribe(observer: (value: S) => void) {
    return this.subscribers.push(observer);
  }
}
