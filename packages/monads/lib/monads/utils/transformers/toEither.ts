import { TaskEither, left, right } from "../../either";
import { Monad } from "../../types";

export function toEither<L, R>(monad: Monad<R>, map?: (e: any) => L): TaskEither<L, R> {
  return TaskEither.from(() =>
    monad
      .getAsync()
      .then(right)
      .catch((e) => left(map ? map(e) : e))
  );
}
