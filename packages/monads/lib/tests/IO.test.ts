// IO.test.ts
import { test } from "vitest";
import { IO, io } from "../monads/io/IO";

test("IO constructor and run", ({ expect }) => {
  const ioInstance = new IO(() => "test");
  expect(ioInstance.run()).toBe("test");
});

test("IO map", ({ expect }) => {
  const ioInstance = new IO(() => "test");
  const mappedInstance = ioInstance.map((value) => value + " mapped");
  expect(mappedInstance.run()).toBe("test mapped");
});

test("IO chain", ({ expect }) => {
  const ioInstance = new IO(() => "test");
  const chainedInstance = ioInstance.chain((value) => new IO(() => value + " chained"));
  expect(chainedInstance.run()).toBe("test chained");
});

test("IO of", ({ expect }) => {
  const ioInstance = io("test");
  expect(ioInstance.run()).toBe("test");
});

test("IO apply", ({ expect }) => {
  const ioInstance = new IO(() => (a: number) => a + 1);
  const appliedInstance = IO.apply(ioInstance, io(1));
  expect(appliedInstance.run()).toBe(2);
});
