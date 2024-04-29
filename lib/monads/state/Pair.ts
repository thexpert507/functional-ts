export class Pair<A, S> {
  static of<A, S>(a: A, s: S): Pair<A, S> {
    return new Pair(a, s);
  }

  constructor(private _value: A, private _state: S) {}

  get value(): A {
    return this._value;
  }

  get state(): S {
    return this._state;
  }

  tap(f: (a: A) => void): Pair<A, S> {
    f(this.value);
    return this;
  }

  tapEffect(f: (s: S) => void): Pair<A, S> {
    f(this.state);
    return this;
  }

  mapValue<B>(f: (a: A) => B): Pair<B, S> {
    return Pair.of(f(this.value), this.state);
  }

  mapState<T>(f: (s: S) => T): Pair<A, T> {
    return Pair.of(this.value, f(this.state));
  }
}

export const pair = Pair.of;
