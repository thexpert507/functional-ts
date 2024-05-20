// State// State.test.ts
import { test, expect } from "vitest";
import { Pair, State, pair } from "../monads";

test("State.of", () => {
  const state = State.of<number, string>("test");
  const result = state.runWith(1);
  expect(result.value).toBe("test");
  expect(result.state).toBe(1);
});

test("State.from", () => {
  const state = State.from<number, string>((s) => pair("test", s + 1));
  const result = state.runWith(1);
  expect(result.value).toBe("test");
  expect(result.state).toBe(2);
});

test("State.map", () => {
  const state = State.of<number, string>("test").map((value) => value.toUpperCase());
  const result = state.runWith(1);
  expect(result.value).toBe("TEST");
  expect(result.state).toBe(1);
});

test("State.chain", () => {
  const state = State.of<number, string>("test").chain((value) => State.of(value.toUpperCase()));
  const result = state.runWith(1);
  expect(result.value).toBe("TEST");
  expect(result.state).toBe(1);
});

test("State.runWith", () => {
  const state = State.of<number, string>("test");
  const result = state.runWith(1);
  expect(result.value).toBe("test");
  expect(result.state).toBe(1);
});

test("State.evalWith", () => {
  const state = State.of<number, string>("test");
  const value = state.evalWith(1);
  expect(value).toBe("test");
});

test("State.execWith", () => {
  const state = State.of<number, string>("test");
  const result = state.execWith(1);
  expect(result).toBe(1);
});
