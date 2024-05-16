import { test } from "vitest";
import { onceMonad } from "../monads/utils";
import { taskIO } from "../monads/io";

test("Execute once time monad", async ({ expect }) => {
  const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
  const task = taskIO(async () => {
    await sleep(1000);
    return "Hello";
  });

  const once = onceMonad(task);

  const start1 = Date.now();
  const result1 = await once.getAsync();
  const time1 = Date.now() - start1;

  const start2 = Date.now();
  const result2 = await once.getAsync();
  const time2 = Date.now() - start2;

  const start3 = Date.now();
  const result3 = await once.getAsync();
  const time3 = Date.now() - start3;

  console.log("Time1", time1);
  console.log("Time2", time2);
  console.log("Time3", time3);
  expect(result1).toBe("Hello");
  expect(result2).toBe("Hello");
  expect(result3).toBe("Hello");
  expect(time1).toBeGreaterThan(1000);
  expect(time2).toBeLessThan(100);
  expect(time3).toBeLessThan(100);
});
