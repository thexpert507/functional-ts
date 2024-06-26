// Task.test.ts
import { test, vi } from "vitest";
import { Task } from "../monads";
import { TaskEither } from "../monads";

test("Task constructor and run", async ({ expect }) => {
  const TaskInstance = new Task(() => Promise.resolve("test"));
  expect(await TaskInstance.run()).toBe("test");
});

test("Task map", async ({ expect }) => {
  const TaskInstance = new Task(() => Promise.resolve("test"));
  const mappedInstance = TaskInstance.map((value) => Promise.resolve(value + " mapped"));
  expect(await mappedInstance.run()).toBe("test mapped");
});

test("Task tap", async ({ expect }) => {
  const TaskInstance = new Task(() => Promise.resolve("test"));
  const tapFn = vi.fn();
  const tappedInstance = TaskInstance.tap(tapFn);
  expect(await tappedInstance.run()).toBe("test");
  expect(tapFn).toHaveBeenCalledWith("test");
});

test("Task tap error", async ({ expect }) => {
  const TaskInstance = new Task(() => Promise.reject("error"));
  const tapFn = vi.fn();
  const tappedInstance = TaskInstance.tapError(tapFn);
  try {
    await tappedInstance.run();
  } catch (error) {
    expect(error).toBe("error");
    expect(tapFn).toHaveBeenCalledWith("error");
  }
});

test("Task bind", async ({ expect }) => {
  const TaskInstance = new Task(() => Promise.resolve("test"));
  const chainedInstance = TaskInstance.bind((v) => Task.of(v + " chained"));
  expect(await chainedInstance.run()).toBe("test chained");
});

test("Task bind error", async ({ expect }) => {
  const bindFn = vi.fn((v) => Task.of(v + " chained"));
  const TaskInstance = new Task(() => Promise.reject("error"));
  const chainedInstance = TaskInstance.bindError(bindFn);
  expect(await chainedInstance.run()).toBe("error chained");
  expect(bindFn).toHaveBeenCalledWith("error");
});

test("Task chain", async ({ expect }) => {
  const TaskInstance = new Task(() => Promise.resolve("test"));
  const chainedInstance = TaskInstance.chain((v) => TaskEither.right(v + " chained"));
  expect(await chainedInstance.getAsync()).toBe("test chained");
});

test("Task of", async ({ expect }) => {
  const TaskInstance = Task.of("test");
  expect(await TaskInstance.run()).toBe("test");
});

test("Task whith error", async ({ expect }) => {
  const TaskInstance = new Task(() => Promise.reject("error"));
  try {
    await TaskInstance.run();
  } catch (error) {
    expect(error).toBe("error");
  }
});

test("Task map with error", async ({ expect }) => {
  const TaskInstance = new Task(() => Promise.resolve("test"));
  const mappedInstance = TaskInstance.map((value) => Promise.reject(value + " mapped"));
  try {
    await mappedInstance.run();
  } catch (error) {
    expect(error).toBe("test mapped");
  }
});

test("Task toEither", async ({ expect }) => {
  const TaskInstance = new Task<string>(() => Promise.reject("error"));
  const eitherInstance = TaskInstance.toEither();
  expect(await eitherInstance.getOrElse("default")).toBe("default");
});

test("Task apply", async ({ expect }) => {
  const TaskInstance = new Task(() => Promise.resolve((a: number) => a + 1));
  const appliedInstance = Task.apply(TaskInstance, Task.of(1));
  expect(await appliedInstance.run()).toBe(2);
});
