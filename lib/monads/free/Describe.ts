import { Maybe, maybe } from "../maybe";
import { Free } from "./Free";
import { Program } from "./Program";
import { NextFn } from "./shared";
import { free, program } from "./utils";

export class Describe<A, C = any, Payload = unknown> {
  private next: Maybe<NextFn<A, C>>;
  private payload: Maybe<Payload>;

  constructor(
    private operation: string,
    payload?: Payload,
    next: NextFn<A, C> = (data) => data as any
  ) {
    this.payload = maybe(payload as Payload);
    this.next = maybe(next as NextFn<A, C>);
  }

  nextFn(next: NextFn<A>): Describe<A> {
    return new Describe(this.operation, this.payload, next);
  }

  setPayload<Payload extends Object>(payload: Payload): Describe<A> {
    return new Describe(this.operation, payload, this.next.get() as NextFn<A, C>);
  }

  program(): Program<A, C> {
    return program<A>(this.operation).setPayload(this.payload).nextFn(this.next);
  }

  make(): Free<Program<A, C>> {
    return free(this.program());
  }
}

export const describe = <A, C = any>(operation: string) => new Describe<A, C>(operation);
