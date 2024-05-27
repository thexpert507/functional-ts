import { describe, test } from "vitest";

describe("Require", () => {
  test("Should load", async ({ expect }) => {
    const { TaskEither, Task } = await import("../../dist/cjs/main.cjs");
    // tu código de prueba aquí

    const task = Task.of(1).chain((x) => TaskEither.right(x + 1));

    const task2 = TaskEither.right(1).chain((x) => Task.of(x + 1));

    expect(task.run()).resolves.toBe(2);
    expect(task2.getOrElseThrow()).resolves.toBe(2);
  });
});
