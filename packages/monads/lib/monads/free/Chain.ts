import { describe } from "./Describe";
import { Program } from "./Program";
import { ChainFn } from "./shared";

export type ChainPayload<A> = {
  program: Program<A>;
  fn: ChainFn<A, any>;
};

export const Chain = <A>(payload: ChainPayload<A>) =>
  describe<A>("chain").setPayload(payload).program();
