import { Task } from "../../io";
import { Monad } from "../../types";

export function toTask<T>(monad: Monad<T>): Task<T> {
  return Task.from(() => monad.getAsync());
}
