import { left } from "../../either";
import { Task } from "../../io";
import { Monad } from "../../types";

const timeout = (ms: number) => Task.void(() => new Promise((resolve) => setTimeout(resolve, ms)));

type OnRetryFn = (error: any) => void | Monad<void>;

type Config = { max: number; delay?: number; onRetry?: OnRetryFn };

export const retry =
  (config: Config, retries = 0) =>
  <T>(monad: Monad<T>): Monad<T> => {
    return monad.chainError((error) => {
      const transformer = retry(config, retries + 1);
      if (retries >= config.max) return left(error);
      return timeout(config.delay ?? 0)
        .tap(() => config.onRetry?.(error))
        .chain(() => transformer(monad));
    });
  };
