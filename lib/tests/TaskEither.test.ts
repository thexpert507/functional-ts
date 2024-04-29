// TaskEither.test.ts
import { test } from "vitest";
import { Suite, Deferred } from "benchmark";
import { TaskEither, applyTaskEither } from "../monads/either/TaskEither";
import { TaskIO, left, right } from "../monads";

test("TaskEither.fromPrimitives", async ({ expect }) => {
  const data = right("test");
  const taskEitherInstance = TaskEither.fromPrimitives(data.toPrimitive());
  const result = await taskEitherInstance.getOrElse("error");
  expect(result).toBe("test");
});

test("TaskEither.fromPrimitives with null", async ({ expect }) => {
  const data = null as any;
  const taskEitherInstance = TaskEither.fromPrimitives(data);
  const result = await taskEitherInstance.getOrElse("error");
  expect(result).toBe("error");
});

test("TaskEither.fromPrimitives with undefined", async ({ expect }) => {
  const data = undefined as any;
  const taskEitherInstance = TaskEither.fromPrimitives(data);
  const result = await taskEitherInstance.getOrElse("error");
  expect(result).toBe("error");
});

test("TaskEither.fromPrimitives with not a Right", async ({ expect }) => {
  const data = "test" as any;
  const taskEitherInstance = TaskEither.fromPrimitives(data);
  const result = await taskEitherInstance.getOrElse("error");
  expect(result).toBe("error");
});

test('TaskEither.fromPrimitives whith "isRight" true but no "value"', async ({ expect }) => {
  const data = JSON.parse(JSON.stringify({ isRight: true, value: undefined } as any));
  const taskEitherInstance = TaskEither.fromPrimitives(data);
  const result = await taskEitherInstance.getOrElse("error");
  expect(result).toBe(undefined);
});

test("TaskEither.from", async ({ expect }) => {
  const taskEitherInstance = TaskEither.from(() => Promise.resolve(right("test")));
  const result = await taskEitherInstance.getOrElse("error");
  expect(result).toBe("test");
});

test("TaskEither.fold", async ({ expect }) => {
  const taskEitherInstance = TaskEither.from(() => Promise.resolve(right("test")));
  const result = await taskEitherInstance.fold(
    () => "error",
    (r) => r
  );
  expect(result).toBe("test");
});

test("TaskEither.chain resolve", async ({ expect }) => {
  const taskEitherInstance = TaskEither.from(() => Promise.resolve(right("test")));
  const chainedInstance = taskEitherInstance.chain((r) =>
    TaskEither.from(() => Promise.resolve(right(r + " chained")))
  );
  const result = await chainedInstance.getOrElse("error");
  expect(result).toBe("test chained");
});

test("TaskEither.chain IO", async ({ expect }) => {
  const taskEitherInstance = TaskEither.from(() => Promise.resolve(right("test")));
  const chainedInstance = taskEitherInstance.chain((r) =>
    TaskIO.from(() => Promise.resolve(r + " chained"))
  );
  const result = await chainedInstance.getOrElse("error");
  expect(result).toBe("test chained");
});

test("TaskEither.chain reject", async ({ expect }) => {
  const taskEitherInstance = TaskEither.from(() => Promise.reject("first error"));
  const chainedInstance = taskEitherInstance.chain((r) =>
    TaskEither.from(() => Promise.resolve(right(r + " chained")))
  );
  const result = await chainedInstance.getOrElse("error");
  expect(result).toBe("error");
});

test("TaskEither.chainLeft resolve", async ({ expect }) => {
  const taskEitherInstance = TaskEither.from<string, string>(() =>
    Promise.resolve(left("first error"))
  );
  const chainedInstance = taskEitherInstance.chainLeft((l) => TaskEither.right("Hello"));
  const result = await chainedInstance.getOrElse("error");
  expect(result).toBe("Hello");
});

test("TaskEither.chainLeft succes", async ({ expect }) => {
  const taskEitherInstance = TaskEither.from<string, string>(() => Promise.resolve(right("test")));
  const chainedInstance = taskEitherInstance.chainLeft((l) => TaskEither.right("Hello"));
  const result = await chainedInstance.getOrElse("error");
  expect(result).toBe("test");
});

test("TaskEither.map", async ({ expect }) => {
  const taskEitherInstance = TaskEither.from(() => Promise.resolve(right("test")));
  const mappedInstance = taskEitherInstance.map((r) => r + " mapped");
  const result = await mappedInstance.getOrElse("error");
  expect(result).toBe("test mapped");
});

test("TaskEither.map throw error", async ({ expect }) => {
  const taskEitherInstance = TaskEither.from(() => Promise.resolve(right("test")));
  const mappedInstance = taskEitherInstance.map((r) => {
    if (r) throw new Error("error");
    return r;
  });
  const result = await mappedInstance.getOrElse("error");
  expect(result).toBe("error");
});

test("TaskEither.tap", async ({ expect }) => {
  let tappedValue = "";
  const taskEitherInstance = TaskEither.from(() => Promise.resolve(right("test")));
  const tappedInstance = taskEitherInstance.tap((r) => {
    tappedValue = r;
  });
  await tappedInstance.getOrElse("error");
  expect(tappedValue).toBe("test");
});

test("TaskEither.getOrElse", async ({ expect }) => {
  const taskEitherInstance = TaskEither.from(() => Promise.resolve(right("test")));
  const result = await taskEitherInstance.getOrElse("default");
  expect(result).toBe("test");
});

test("TaskEither.getOrElse either left", async ({ expect }) => {
  const taskEitherInstance = TaskEither.from<string, string>(() =>
    Promise.resolve(left("first error"))
  );
  const result = await taskEitherInstance.getOrElse("default");
  expect(result).toBe("default");
});

test("TaskEither.getOrElseThrow", async ({ expect }) => {
  const taskEitherInstance = TaskEither.from<string, string>(() => Promise.resolve(right("test")));
  const result = await taskEitherInstance.getOrElseThrow("error");
  expect(result).toBe("test");
});

test("TaskEither.getOrElseThrow reject", async ({ expect }) => {
  const taskEitherInstance = TaskEither.from(() => Promise.resolve(left("error")));
  const result = await taskEitherInstance.getOrElseThrow("error default").catch((e) => e);
  expect(result).toBe("error");
});

test("TaskEither.toPrimitive", async ({ expect }) => {
  const taskEitherInstance = TaskEither.from(() => Promise.resolve(right("test")));
  const result = await taskEitherInstance.toPrimitive();
  expect(result).toMatchObject({ isRight: true, value: "test" });
});

test.skip(
  "TaskEither.benchmark",
  async ({}) => {
    const suite = new Suite();

    await new Promise<void>((resolve, reject) => {
      suite
        .add("TaskEither.getOrElseThrow resolve", {
          defer: true,
          fn: async (deferred: Deferred) => {
            const taskEitherInstance = TaskEither.from<string, string>(() =>
              Promise.resolve(right("test"))
            );
            await taskEitherInstance.getOrElseThrow("error");
            deferred.resolve();
          },
        })
        .add("TaskEither.getOrElseThrow reject", {
          defer: true,
          fn: async (deferred: Deferred) => {
            const taskEitherInstance = TaskEither.from<string, string>(() =>
              Promise.resolve(left("error"))
            );
            await taskEitherInstance.getOrElse("default error");
            deferred.resolve();
          },
        })
        .add("TaskEither.toPrimitive", {
          defer: true,
          fn: async (deferred: Deferred) => {
            const taskEitherInstance = TaskEither.from(() => Promise.resolve(right("test")));
            await taskEitherInstance.toPrimitive();
            deferred.resolve();
          },
        })
        .on("cycle", (event: Event) => {
          console.log(String(event.target));
        })
        .on("complete", function (this: Suite) {
          console.log("Fastest is " + this.filter("fastest").map("name"));
          console.log("Slowest is " + this.filter("slowest").map("name"));
          resolve();
        })
        .on("error", function (event: Event) {
          console.error(event.target);
          reject();
        })
        .run({ async: true });
    });
  },
  { timeout: 10 * 60 * 1000 }
);

test("TaskEither sequence", async ({ expect }) => {
  const task1 = TaskEither.from(() => Promise.resolve(right("test 1")));
  const task2 = TaskEither.from(() => Promise.resolve(right("test 2")));
  const task3 = TaskEither.from(() => Promise.resolve(right("test 3")));
  const result = await TaskEither.sequence([task1, task2, task3])
    .getOrElseThrow()
    .catch((e) => e);
  expect(result).toMatchObject(["test 1", "test 2", "test 3"]);
});

test("TaskEither apply", async ({ expect }) => {
  const taskEitherInstance = TaskEither.from<string, (a: number) => number>(async () =>
    right((a: number) => a + 1)
  );
  const numberInstance = TaskEither.from<string, number>(() => Promise.resolve(right(1)));
  const appliedInstance = TaskEither.appply(taskEitherInstance, numberInstance);
  const result = await appliedInstance.getOrElseThrow();
  expect(result).toBe(2);
});
