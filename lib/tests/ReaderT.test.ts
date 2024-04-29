import { test } from "vitest";
import { left, maybe, right, readerT } from "../monads";

test("ReaderT", async ({ expect }) => {
  const maybeReader = readerT((r: number) => maybe(r * 2));
  const eitherReader = readerT((r: number) => (r % 2 === 0 ? right(r) : left("odd")));

  const chained = maybeReader.chain((a) => eitherReader.map((b) => a + b));

  expect(await chained.run(2).getAsyncOrElse(() => 0)).toBe(6);
  expect(await chained.run(3).getAsyncOrElse(() => 0)).toBe(0);
});
