import { test, describe } from "vitest";
import { Task, createTaskQueue } from "../monads";

const sleep = (ms: number) => Task.void(() => new Promise((resolve) => setTimeout(resolve, ms)));

describe("TaskQueue", () => {
  test("without enqueue", async ({ expect }) => {
    const startTime = Date.now();

    const task1 = sleep(1000).tap(() => console.log("First"));
    const task2 = sleep(500).tap(() => console.log("Second"));
    const task3 = sleep(1000).tap(() => console.log("Third"));

    await Task.all([task1, task2, task3]).getAsync();

    expect(Date.now() - startTime).toBeLessThan(2000);
  });

  test(
    "enqueue",
    async ({ expect }) => {
      const queue = createTaskQueue();

      const startTime = Date.now();

      const task1 = sleep(100)
        .bind(() => Task.of("First task 1"))
        .transform(queue.enqueue);
      const task2 = sleep(200)
        .bind(() => Task.of("Second task 2"))
        .transform(queue.enqueue);
      const task3 = sleep(300)
        .bind(() => Task.of("Third task 3"))
        .transform(queue.enqueue);

      await Task.all([task1, task2, task3]).getAsync();

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(duration).toBeGreaterThan(300);
    },
    { timeout: 10 * 1000 }
  );
});
