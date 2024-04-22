import { describe } from "./Describe";

export type PurePayload<A> = { value: A };
export const Pure = <A>(value: A) => describe<A>("pure").setPayload({ value }).program();

export const pure = <A>(value: A) => describe<A>("pure").setPayload({ value }).make();
