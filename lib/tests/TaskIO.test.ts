// TaskIO.test.ts
import { test } from "vitest";
import { TaskIO } from "../monads/io/TaskIO";
import { TaskEither } from "../monads";

test("TaskIO constructor and run", async ({ expect }) => {
  const taskIOInstance = new TaskIO(() => Promise.resolve("test"));
  expect(await taskIOInstance.run()).toBe("test");
});

test("TaskIO map", async ({ expect }) => {
  const taskIOInstance = new TaskIO(() => Promise.resolve("test"));
  const mappedInstance = taskIOInstance.map((value) => Promise.resolve(value + " mapped"));
  expect(await mappedInstance.run()).toBe("test mapped");
});

test("TaskIO chain", async ({ expect }) => {
  const taskIOInstance = new TaskIO(() => Promise.resolve("test"));
  const chainedInstance = taskIOInstance.chain((v) => TaskIO.of(v + " chained"));
  expect(await chainedInstance.run()).toBe("test chained");
});

test("TaskIO chain either", async ({ expect }) => {
  const taskIOInstance = new TaskIO(() => Promise.resolve("test"));
  const chainedInstance = taskIOInstance.chain((v) => TaskEither.right(v + " chained"));
  expect(await chainedInstance.run()).toBe("test chained");
});

test("TaskIO of", async ({ expect }) => {
  const taskIOInstance = TaskIO.of("test");
  expect(await taskIOInstance.run()).toBe("test");
});

test("TaskIO whith error", async ({ expect }) => {
  const taskIOInstance = new TaskIO(() => Promise.reject("error"));
  try {
    await taskIOInstance.run();
  } catch (error) {
    expect(error).toBe("error");
  }
});

test("TaskIO map with error", async ({ expect }) => {
  const taskIOInstance = new TaskIO(() => Promise.resolve("test"));
  const mappedInstance = taskIOInstance.map((value) => Promise.reject(value + " mapped"));
  try {
    await mappedInstance.run();
  } catch (error) {
    expect(error).toBe("test mapped");
  }
});

test("TaskIO toEither", async ({ expect }) => {
  const taskIOInstance = new TaskIO<string>(() => Promise.reject("error"));
  const eitherInstance = taskIOInstance.toEither();
  expect(await eitherInstance.getOrElse("default")).toBe("default");
});

test("TaskIO apply", async ({ expect }) => {
  const taskIOInstance = new TaskIO(() => Promise.resolve((a: number) => a + 1));
  const appliedInstance = TaskIO.apply(taskIOInstance, TaskIO.of(1));
  expect(await appliedInstance.run()).toBe(2);
});
