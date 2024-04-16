import { test } from "vitest";
import { EitherReaderT, MaybeReaderT, left, maybe, right } from "../monads";

test("ReaderT", ({ expect }) => {
  const maybeReader = MaybeReaderT.from((r: number) => maybe(r * 2));
  const eitherReader = EitherReaderT.from((r: number) => (r % 2 === 0 ? right(r) : left("odd")));

  const chained = maybeReader.chain((a) => eitherReader.map((b) => a + b));

  expect(chained.run(2).get()).toBe(6);
  expect(chained.run(3).get()).toBe(null);
});
