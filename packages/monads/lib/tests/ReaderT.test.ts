import { test, vi } from "vitest";
import { left, maybe, right, readerT, IO, PickContext, nothing, Task, ReaderT } from "../monads";

test("ReaderT", async ({ expect }) => {
  const maybeReader = readerT((r: number) => maybe(r * 2));
  const eitherReader = readerT((r: number) => (r % 2 === 0 ? right(r) : left("odd")));

  const chained = maybeReader.chain((a) => eitherReader.map((b) => a + b));

  expect(await chained.run(2).getAsyncOrElse(() => 0)).toBe(6);
  expect(await chained.run(3).getAsyncOrElse(() => 0)).toBe(0);
});

test("ReaderT chain context", async ({ expect }) => {
  const maybeReader = readerT((r: { n: number }) => maybe(r.n * 2));
  const eitherReader = readerT((r: { t: string }) => maybe(r));

  const chained = maybeReader.chain((a) => eitherReader.map((b) => `${b.t} = ${a}`));

  expect(await chained.run({ n: 3, t: "Number" }).getAsyncOrElse(() => "")).toBe("Number = 6");
  expect(await chained.run({ n: 0, t: "Number" }).getAsyncOrElse(() => "")).toBe("Number = 0");
});

test("ReaderT map context", async ({ expect }) => {
  type LogService = { log: (msg: string) => IO<void> };
  const logService: LogService = { log: (msg) => IO.void(() => console.log(msg)) };

  const multiplyByTwo = readerT((r: { n: number }) => maybe(r.n * 2));

  const helloWorld = (data: number) => readerT((r: { t: string }) => right(`${r.t} = ${data}`));

  const logResult = (n: number) =>
    readerT((r: { logSvc: LogService }) => r.logSvc.log(`LOG: ${n}`).map(() => n));

  const chained = multiplyByTwo
    .chain(logResult)
    .chain(logResult)
    .chain(logResult)
    .chain(logResult)
    .chain(helloWorld);

  type A = Pick<PickContext<typeof chained>, "n">;
  const reduced = chained.mapContext<A>((ctx) => ({ ...ctx, logSvc: logService, t: "Hello" }));

  expect(await reduced.run({ n: 3 }).getAsyncOrElse(() => "")).toBe("Hello = 6");
  expect(await reduced.run({ n: 0 }).getAsyncOrElse(() => "")).toBe("Hello = 0");
});

test("ReaderT tap", async ({ expect }) => {
  const sleep = (ms: number) => Task.void(() => new Promise((resolve) => setTimeout(resolve, ms)));
  const maybeReader = readerT(({ n }: { n: number }) =>
    n % 2 === 0 ? maybe(n * 2) : nothing<number>()
  );

  const tapFn = vi.fn((a: number) => {
    return readerT(({ c }: { c: Console }) =>
      Task.void(async () => c.log(`ReaderT tap reader ${a}`))
    );
  });
  const tapped = maybeReader.tap(tapFn);

  const tapFnVoid = vi.fn(() => console.log("ReaderT tap void"));
  const tapVoid = maybeReader.tap(tapFnVoid);

  expect(await tapped.run({ n: 2, c: console }).getAsyncOrElse(() => 0)).toBe(4);
  expect(await tapped.run({ n: 3, c: console }).getAsyncOrElse(() => 0)).toBe(0);
  await sleep(1).getAsync();
  expect(tapFn).toHaveBeenCalledTimes(1);

  expect(await tapVoid.run({ n: 2 }).getAsyncOrElse(() => 0)).toBe(4);
  expect(await tapVoid.run({ n: 3 }).getAsyncOrElse(() => 0)).toBe(0);
  await sleep(1).getAsync();
  expect(tapFnVoid).toHaveBeenCalledTimes(1);
});

test("ReaderT tapError", async ({ expect }) => {
  const sleep = (ms: number) => Task.void(() => new Promise((resolve) => setTimeout(resolve, ms)));
  const maybeReader = readerT(({ n }: { n: number }) =>
    n % 2 === 0 ? maybe(n * 2) : nothing<number>()
  );

  const tapFn = vi.fn(() => {
    return readerT(({ c }: { c: Console }) =>
      Task.void(async () => c.log("ReaderT tap error reader"))
    );
  });

  const tapped = maybeReader.tapError(tapFn);

  expect(await tapped.run({ n: 2, c: console }).getAsyncOrElse(() => 0)).toBe(4);
  expect(await tapped.run({ n: 3, c: console }).getAsyncOrElse(() => 0)).toBe(0);
  expect(await tapped.run({ n: 5, c: console }).getAsyncOrElse(() => 0)).toBe(0);
  await sleep(1).getAsync();
  expect(tapFn).toHaveBeenCalledTimes(2);
});

test("ReaderT chainError", async ({ expect }) => {
  const eitherReader = readerT((r: number) => (r % 2 === 0 ? right(r) : left("odd")));
  const maybeReader = readerT((r: number) => maybe(r * 2));

  const chained = eitherReader.chainError(() => maybeReader);

  expect(await chained.run(2).getAsyncOrElse(() => 0)).toBe(2);
  expect(await chained.run(3).getAsyncOrElse(() => 0)).toBe(6);
});

test("ReaderT provide", async ({ expect }) => {
  type A = { a: number; b: string };
  const reader = readerT(({ a, b }: A) => right(a + b.length));

  const provided = reader.provide({ a: 2 });

  expect(await provided.run({ b: "hello" }).getAsyncOrElse(() => 0)).toBe(7);
});
