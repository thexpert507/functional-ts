// Reader.test.ts
import { test } from "vitest";
import {
  Either,
  Reader,
  TaskEither,
  TaskIO,
  TaskReader,
  left,
  reader,
  readerEither,
  readerMapContext,
  readerTask,
  readerTaskEither,
  right,
} from "../monads";

test("Reader constructor and run", ({ expect }) => {
  const readerInstance = Reader.from<number, string>((r) => `test ${r}`);
  expect(readerInstance.run(1)).toBe("test 1");
});

test("Reader map", ({ expect }) => {
  const readerInstance = Reader.from<number, string>((r) => `test ${r}`);
  const mappedInstance = readerInstance.map((value) => value + " mapped");
  expect(mappedInstance.run(1)).toBe("test 1 mapped");
});

test("Reader chain", ({ expect }) => {
  const readerInstance = Reader.from<number, string>((r) => `test ${r}`);
  const chainedInstance = readerInstance.chain((value) => Reader.from<number, string>(() => value + " chained"));
  expect(chainedInstance.run(1)).toBe("test 1 chained");
});

test("Reader of", ({ expect }) => {
  const readerInstance = Reader.of<number, string>("test");
  expect(readerInstance.run(1)).toBe("test");
});

test("Reader ask", ({ expect }) => {
  const readerInstance = Reader.ask<number>();
  expect(readerInstance.run(1)).toBe(1);
});

test("Reader operations", ({ expect }) => {
  type CTX = {
    logger: { log: (message: string) => void };
  };

  const ctx: CTX = { logger: { log: console.log } };

  const add = (a: number, b: number): Reader<CTX, number> =>
    reader((ctx) => {
      ctx.logger.log(`Adding ${a} and ${b}`);
      return a + b;
    });

  const multiply = (a: number, b: number): Reader<CTX, number> =>
    reader((ctx) => {
      ctx.logger.log(`Multiplying ${a} and ${b}`);
      return a * b;
    });

  const addAndMultiply = (a: number, b: number, c: number): Reader<CTX, number> => {
    return add(a, b).chain((sum) => multiply(sum, c));
  };

  const result = addAndMultiply(1, 2, 3).run(ctx);

  expect(result).toBe(9);
});

test("Reader async operations", async ({ expect }) => {
  type CTX = {
    logger: { log: (message: string) => void };
  };

  const ctx: CTX = { logger: { log: console.log } };

  const add = (a: number, b: number): TaskReader<CTX, number> =>
    readerTask((ctx) => {
      ctx.logger.log(`Adding ${a} and ${b}`);
      return TaskIO.of(a + b);
    });

  const multiply = (a: number, b: number): TaskReader<CTX, number> =>
    readerTask((ctx) => {
      ctx.logger.log(`Multiplying ${a} and ${b}`);
      return TaskIO.of(a * b);
    });

  const addAndMultiply = (a: number, b: number, c: number): TaskReader<CTX, number> => {
    return add(a, b).chain((sum) => multiply(sum, c));
  };

  const result = await addAndMultiply(1, 2, 3).run(ctx);
  expect(result).toBe(9);
});

test("Reader either operations", async ({ expect }) => {
  type CTX = {
    logger: { log: (message: string) => void };
  };

  const ctx: CTX = { logger: { log: console.log } };

  const add = (a: number, b: number): Reader<CTX, number> =>
    readerEither((ctx): Either<string, number> => {
      ctx.logger.log(`Adding ${a} and ${b}`);
      if (a === 1) return left("1 is not allowed");
      return right(a + b);
    });

  const multiply = (a: number, b: number): Reader<CTX, number> =>
    readerEither((ctx) => {
      ctx.logger.log(`Multiplying ${a} and ${b}`);
      return right(a * b);
    });

  const addAndMultiply = (a: number, b: number, c: number): Reader<CTX, number> => {
    return add(a, b).chain((sum) => multiply(sum, c));
  };

  const result = addAndMultiply(4, 2, 3).run(ctx);

  expect(result).toBe(18);
});

test("Reader task either operations", async ({ expect }) => {
  type CTX = {
    logger: { log: (message: string) => void };
  };

  const ctx: CTX = { logger: { log: console.log } };

  const add = (a: number, b: number): TaskReader<CTX, number> =>
    readerTaskEither((ctx) => {
      ctx.logger.log(`Adding ${a} and ${b}`);
      if (a === 1) return TaskEither.left("1 is not allowed");
      return TaskEither.right(a + b);
    });

  const multiply = (a: number, b: number): TaskReader<CTX, number> =>
    readerTaskEither((ctx) => {
      ctx.logger.log(`Multiplying ${a} and ${b}`);
      return TaskEither.right(a * b);
    });

  const addAndMultiply = (a: number, b: number, c: number): TaskReader<CTX, number> => {
    return add(a, b).chain((sum) => multiply(sum, c));
  };

  const result = await addAndMultiply(4, 2, 3).toEither(ctx, console.error).getOrElse(0);
  expect(result).toBe(18);
});

test("Reader apply", ({ expect }) => {
  const readerInstance = Reader.from<number, (a: number) => number>((r) => (a: number) => a + r);
  const numberInstance = Reader.from<number, number>((r) => r);
  const appliedInstance = Reader.apply(readerInstance, numberInstance);
  expect(appliedInstance.run(1)).toBe(2);
});

test("Reader async apply", async ({ expect }) => {
  const readerInstance = TaskReader.from<number, (a: number) => number>(async (r) => (a: number) => a + r);
  const numberInstance = TaskReader.from<number, number>(async (r) => r);
  const appliedInstance = TaskReader.apply(readerInstance, numberInstance);
  expect(await appliedInstance.run(1)).toBe(2);
});

type F<A, B> = (a: A) => B;
test("Reader async apply with either", async ({ expect }) => {
  const reader1 = readerTaskEither<number, F<number, number>>((ctx) => TaskEither.right((a: number) => a + ctx));
  const reader2 = readerTaskEither<number, number>((ctx) => TaskEither.right(ctx + 1));
  const result = await TaskReader.apply(reader1, reader2).toEither(1).getOrElse(0);
  expect(result).toBe(3);
});

test("Reader map context", ({ expect }) => {
  const reader1 = (a: string) => Reader.from<number, number>((ctx) => ctx + a.length);

  const reader2 = Reader.from<string, string>((ctx) => "test " + ctx);

  const result = readerMapContext((n: number) => n.toString(), reader2).chain(reader1);

  expect(result.run(2)).toBe(8);
});

test("Reader chain context", ({ expect }) => {
  const reader1 = (a: string) => Reader.from<number, number>((ctx) => ctx + a.length);

  const reader2 = Reader.from<string, string>((ctx) => "test " + ctx);

  const result = reader2.chainContext((ctx) => ctx.length, reader1);

  expect(result.run("2")).toBe(7);
});

test("TaskReader ofEither", async ({ expect }) => {
  const either: Either<string, number> = left("error");
  const reader = TaskReader.ofEither(either);
  expect(await reader.toEither(1).getOrElse(0)).toBe(0);
});

test("TaskReader ofReader", async ({ expect }) => {
  const reader = Reader.from<number, number>((r) => r);
  const taskReader = TaskReader.ofReader(reader);
  expect(await taskReader.run(1)).toBe(1);
});

test("TaskReader fromReader", async ({ expect }) => {
  const reader = Reader.from<number, number>((r) => r);
  const taskReader = TaskReader.fromReader<number, number>((r) => reader);
  expect(await taskReader.run(1)).toBe(1);
});
