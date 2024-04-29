import { maybe } from "../maybe";
import { Monad } from "../types";
import { Pair, pair } from "./Pair";

export const PairT = <A, B>(a: A, b: B) => maybe(pair(a, b));

type StateFn<A, S> = (s: S) => Monad<Pair<A, S>>;

type SubFn<A> = (value: A) => void;

export class StateT<S, A> {
  static of<S, A>(a: A): StateT<S, A> {
    return new StateT<S, A>((s) => PairT(a, s));
  }

  static from<S, A>(fn: StateFn<A, S>): StateT<S, A> {
    return new StateT<S, A>(fn);
  }

  private constructor(public run: StateFn<A, S>, private subscribers: SubFn<S>[] = []) {}

  private emit(s: S) {
    this.subscribers.forEach((sub) => sub(s));
  }

  map<B>(f: (a: A) => B): StateT<S, B> {
    return new StateT<S, B>(
      (s) =>
        this.run(s)
          .tap((pair) => this.emit(pair.state))
          .map((pair) => pair.mapValue(f)),
      this.subscribers
    );
  }

  tap(f: (a: A) => void): StateT<S, A> {
    return new StateT<S, A>((s) => this.run(s).tap((pair) => f(pair.value)), this.subscribers);
  }

  tapEffect(f: (s: S) => void): StateT<S, A> {
    return new StateT<S, A>((s) => this.run(s).tap((pair) => f(pair.state)), this.subscribers);
  }

  chain<B>(f: (a: A) => StateT<S, B>): StateT<S, B> {
    return new StateT<S, B>(
      (s) => this.run(s).chain((pair) => f(pair.value).run(pair.state)),
      this.subscribers
    );
  }

  runWith(s: S): Promise<Pair<A, S>> {
    return this.run(s)
      .tap((pair) => this.emit(pair.state))
      .getAsync();
  }

  async evalWith(s: S): Promise<A> {
    return this.runWith(s).then((pair) => pair.value);
  }

  async execWith(s: S): Promise<S> {
    return this.runWith(s).then((pair) => pair.state);
  }

  subscribe(observer: (value: S) => void) {
    return this.subscribers.push(observer);
  }
}

export const stateT = StateT.from;
