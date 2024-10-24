import { test, vi } from "vitest";
import { Task } from "../monads/io";
import { retry } from "../monads/utils";

test("Retry 3 time monad", async ({ expect }) => {
  const tapFn = vi.fn().mockImplementation((r) => console.log("Sum retry", r));

  const sum = (a: number, b: number) => Task.of(a + b).bind((r) => Task.rejected("Error"));

  const trasnformed = sum(1, 2).transform(retry({ max: 3, delay: 100, onRetry: tapFn }));

  const result = await trasnformed.getAsync().catch((e) => e);
  expect(result).toBe("Error");
  expect(tapFn).toHaveBeenCalledTimes(3);
});
