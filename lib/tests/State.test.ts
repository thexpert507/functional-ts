// State// State.test.ts
import { test, expect } from "vitest";
import { Pair, State } from "../monads";

test("State.of", () => {
  const state = State.of<number, string>("test");
  const [value, stateValue] = state.runWith(1);
  expect(value).toBe("test");
  expect(stateValue).toBe(1);
});

test("State.from", () => {
  const state = State.from<number, string>((s) => Pair("test", s + 1));
  const [value, stateValue] = state.runWith(1);
  expect(value).toBe("test");
  expect(stateValue).toBe(2);
});

test("State.map", () => {
  const state = State.of<number, string>("test").map((value) => value.toUpperCase());
  const [value, stateValue] = state.runWith(1);
  expect(value).toBe("TEST");
  expect(stateValue).toBe(1);
});

test("State.chain", () => {
  const state = State.of<number, string>("test").chain((value) => State.of(value.toUpperCase()));
  const [value, stateValue] = state.runWith(1);
  expect(value).toBe("TEST");
  expect(stateValue).toBe(1);
});

test("State.runWith", () => {
  const state = State.of<number, string>("test");
  const [value, stateValue] = state.runWith(1);
  expect(value).toBe("test");
  expect(stateValue).toBe(1);
});

test("State.evalWith", () => {
  const state = State.of<number, string>("test");
  const value = state.evalWith(1);
  expect(value).toBe("test");
});

test("State.execWith", () => {
  const state = State.of<number, string>("test");
  const stateValue = state.execWith(1);
  expect(stateValue).toBe(1);
});
