import { Maybe } from "../maybe";
import { MapFn, NextFn } from "./shared";

export class Program<A = any, C = any, Payload = unknown> {
  constructor(
    readonly operation: string,
    readonly payload: Maybe<Payload>,
    readonly next: Maybe<NextFn<A, C>>
  ) {}

  nextFn(next: Maybe<NextFn<A, C>>): Program<A, C, Payload> {
    return new Program(this.operation, this.payload, next);
  }

  setPayload<Payload = unknown>(payload: Maybe<Payload>): Program<A, C, Payload> {
    return new Program(this.operation, payload, this.next);
  }

  map<B>(f: MapFn<A, B>): Program<B> {
    return new Program(
      this.operation,
      this.payload,
      this.next.map((nx) => (data) => f(nx(data)))
    );
  }

  run(data: C): A {
    return this.next.getOrThrow(new Error("Next function is not defined"))(data);
  }

  from(fn: (payload: Payload) => A): A {
    return fn(this.payload.getOrThrow(new Error("Payload is not defined")));
  }
}
