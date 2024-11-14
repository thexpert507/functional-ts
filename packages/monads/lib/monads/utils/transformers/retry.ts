import { left } from "../../either";
import { Task } from "../../io";
import { Monad } from "../../types";
import { parseError } from "../parseError";

const timeout = (ms: number) => Task.void(() => new Promise((resolve) => setTimeout(resolve, ms)));

type OnRetryFn = (error: any) => void | Monad<void>;

type Config = {
  max: number;
  delay?: number;
  onRetry?: OnRetryFn;
  notIf?: (error: Error) => boolean;
};

export const retry =
  (config: Config, retries = 0) =>
  <T>(monad: Monad<T>): Monad<T> => {
    return monad.chainError((error) => {
      if (retries >= config.max) return left(error);
      if (config.notIf?.(parseError(error))) return left(error);
      const transformer = retry(config, retries + 1);
      return timeout(config.delay ?? 0)
        .tap(() => config.onRetry?.(error))
        .chain(() => transformer(monad));
    });
  };
