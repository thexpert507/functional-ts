export type UnsubscribeFn = () => void;

let activeComputation: null | (() => void) = null;
let activeUnsubscribe: Set<UnsubscribeFn> = new Set();

export function compute(fn: () => void): UnsubscribeFn {
  activeComputation = fn;
  fn();
  const unsubscribe = () => activeUnsubscribe.forEach((fn) => fn());
  activeComputation = null;
  activeUnsubscribe.clear();
  return unsubscribe;
}

export class Signal<S> {
  static of<S>(value: S): Signal<S> {
    return new Signal(value);
  }

  private observers: Array<(value: S) => void> = [];
  private dependencies: Set<() => void> = new Set();

  private constructor(private _value: S) {}

  get value(): S {
    return this._value;
  }

  subscribe(observer: (value: S) => void): UnsubscribeFn {
    this.observers.push(observer);
    observer(this.value);
    return () => {
      const index = this.observers.indexOf(observer);
      if (index === -1) return;
      this.observers.splice(index, 1);
    };
  }

  next(fn: (value: S) => S): void;
  next(value: S): void;
  next(arg: unknown): void {
    const value = typeof arg === "function" ? (arg as (value: S) => S)(this.value) : (arg as S);
    this._value = value;
    this.observers.forEach((observer) => observer(value));
    this.dependencies.forEach((fn) => fn());
  }

  map<T>(transform: (value: S) => T): Signal<T> {
    const newSignal = new Signal<T>(transform(this.value));
    this.subscribe((value) => newSignal.next(transform(value)));
    return newSignal;
  }

  get(): S {
    if (activeComputation) this.dependencies.add(activeComputation);
    activeUnsubscribe.add(() => {
      if (!activeComputation) return;
      this.dependencies.delete(activeComputation);
    });
    return this.value;
  }
}

export const signal = Signal.of;
