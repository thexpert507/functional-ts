import { describe, test } from "vitest";

describe("Require", () => {
  test("Should load", async ({ expect }) => {
    const { TaskEither, TaskIO } = await import("../../dist/main.umd.cjs");
    // tu código de prueba aquí

    const task = TaskIO.of(1).chain((x) => TaskEither.right(x + 1));

    const task2 = TaskEither.right(1).chain((x) => TaskIO.of(x + 1));

    expect(task.run()).resolves.toBe(2);
    expect(task2.getOrElseThrow()).resolves.toBe(2);
  });
});
