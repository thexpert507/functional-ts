import { test } from "vitest";
import { EitherTaskReaderT, IOTaskReaderT, TaskEither, TaskIO } from "../monads";

test("TaskReaderT", async ({ expect }) => {
  const a = IOTaskReaderT.from((ctx: string) => TaskIO.of(ctx.length));

  const b = (x: number) => EitherTaskReaderT.from((ctx: string) => TaskEither.right(ctx.length + x));

  const chained = a.chain((x) => b(x));

  const result = await chained.run("hello").run();

  expect(result).toBe(10);
});
