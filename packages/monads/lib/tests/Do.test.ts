import { describe, test } from "vitest";
import { TaskIO, left, maybe, right } from "../monads";
import { Do } from "../monads/do";

describe("Do", () => {
  test("should map key", async ({ expect }) => {
    const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
    const task = TaskIO.from(() => sleep(1000).then(() => "Task success"));

    const d = Do.of({ test: maybe(1) })
      .bindl({ multiplyByThow: ({ test }) => maybe(test * 2) })
      .bindl({ either: ({ multiplyByThow }) => right(multiplyByThow * 10) })
      .bind({ fail: right(`Oh no`) })
      .bind({ task1: task, task2: task, task3: task, task4: task });

    const result = await d.run().getAsync();

    console.log(result);

    expect(result.test).toBe(1);
    expect(result.multiplyByThow).toBe(2);
    expect(result.either).toBe(20);
    expect(result.task1).toBe("Task success");
  });
});
