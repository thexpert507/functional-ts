import { taskIO } from "../io";
import { Monad } from "../types";

export function onceMonad<A>(m: Monad<A>): Monad<A> {
  let cache: A;
  return taskIO(async () => {
    if (cache) return cache as A;
    else return m.tap((value) => void (cache = value)).getAsync();
  });
}
