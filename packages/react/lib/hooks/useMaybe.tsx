import { Maybe, maybe } from "@functional-ts/monads";
import { useMemo } from "react";

export function useMaybe<T>(value: T | undefined | null): Maybe<T> {
  return useMemo(() => maybe(value!), [value]);
}
