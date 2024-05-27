import { test } from "vitest";
import { PairT, StateT, TaskEither, Task, maybe, pair, right, stateT } from "../monads";

test("StateT.of", async ({ expect }) => {
  const state = StateT.of<number, string>("test");
  const result = await state.evalWith(0);
  expect(result).toBe("test");
});

test("StateT.from", async ({ expect }) => {
  const state = StateT.from<number, string>((s) => PairT("test", s));
  const result = await state.evalWith(0);
  expect(result).toBe("test");
});

test("StateT.map", async ({ expect }) => {
  const state = StateT.of<number, string>("test").map((value) => value.toUpperCase());
  const result = await state.evalWith(0);
  expect(result).toBe("TEST");
});

test("StateT.tap", async ({ expect }) => {
  let tappedValue = "";
  const state = StateT.of<number, string>("test").tap((value) => {
    tappedValue = value;
  });
  await state.evalWith(0);
  expect(tappedValue).toBe("test");
});

test("StateT.tapEffect", async ({ expect }) => {
  let tappedState = 0;
  const state = StateT.of<number, string>("test").tapEffect((s) => {
    tappedState = s;
  });
  await state.evalWith(10);
  expect(tappedState).toBe(10);
});

test("StateT.chain", async ({ expect }) => {
  const state = StateT.of<number, string>("test").chain((value) =>
    StateT.of<number, string>(value + " chained")
  );
  const result = await state.evalWith(0);
  expect(result).toBe("test chained");
});

test("StateT.runWith", async ({ expect }) => {
  const state = StateT.of<number, string>("test");
  const result = await state.runWith(10);
  expect(result.value).toBe("test");
  expect(result.state).toBe(10);
});

test("StateT.evalWith", async ({ expect }) => {
  const state = StateT.of<number, string>("test");
  const result = await state.evalWith(10);
  expect(result).toBe("test");
});

test("StateT.execWith", async ({ expect }) => {
  const state = StateT.of<number, string>("test");
  const result = await state.execWith(10);
  expect(result).toBe(10);
});

test("StateT.subscribe", async ({ expect }) => {
  let observedState = 0;
  const state = StateT.of<number, string>("test");
  state.subscribe((s) => {
    observedState = s;
  });
  await state.runWith(10);
  expect(observedState).toBe(10);
});

test("Complex state transformations", async ({ expect }) => {
  const t1 = () => stateT((s: number) => maybe(pair(s % 2 === 1 ? s : undefined, s)));

  const t2 = () => stateT((s: number) => right(pair(s + 1, s)));

  const t3 = () => stateT((s: number) => TaskEither.right(pair(s.toString(), s)));

  const t4 = () => stateT((s: number) => Task.of(pair(s + 1, s)));

  const t5 = () => t1().chain(t2).chain(t3).chain(t4);

  const result = await t5().runWith(0);

  expect(result.value).toBe(1);
  expect(result.state).toBe(0);
});
