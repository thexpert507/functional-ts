import { task } from "../../io";
import { Monad } from "../../types";

type RetryOptions = {
  retries: number;
  delay?: number;
};

export const retry =
  (options: RetryOptions) =>
  <T>(monad: Monad<T>): Monad<T> => {
    return task(() => {
      const chained = Array.from({ length: options.retries - 1 })
        .fill(0)
        .reduce((prev) => {
          const currentMonad = prev as Monad<T>;
          return currentMonad.chainError(() => monad);
        }, monad) as Monad<T>;

      return chained.getAsync();
    });
  };
