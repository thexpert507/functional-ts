import { describe } from "./Describe";
import { Free } from "./Free";
import { Program } from "./Program";

export type ApplyPayload = {
  program: Free<Program<any>>;
  value: Free<Program<any>>;
};

export const Apply = <A>(payload: ApplyPayload) =>
  describe<A>("apply").setPayload(payload).program();
