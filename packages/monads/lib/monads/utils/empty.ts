import { maybe, nothing } from "../maybe";

export const empty = <A>(value: A) =>
  maybe<A>(value).bind<A>((data) => {
    if (Array.isArray(data)) return data.length === 0 ? nothing() : maybe(data);
    if (typeof data === "string" && data.trim() === "") return nothing();
    if (typeof data === "number" && data === 0) return nothing();
    if (!data) return nothing();
    return maybe(data);
  });
