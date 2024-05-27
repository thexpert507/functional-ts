import { test } from "vitest";
import { SendEmailFromAllPosts, devInterpreter, prodInterpreter } from "./posts";
import {
  describe,
  baseInterpreter,
  match,
  handler,
  interpreter,
  DoGen,
  Do,
  pureRecord,
  Task,
  reader,
} from "../monads";
import { Monad } from "../monads/types";

test("[Free] Send email to all posts action", { timeout: 10 * 1000 }, async ({ expect }) => {
  const result = SendEmailFromAllPosts.run(devInterpreter.make());

  const value = await result.execute(
    (err) => `Error: ${err}`,
    () => "All emails sent"
  );

  expect(value).includes("All emails sent");
});

test("[Free] Apply and map", async ({ expect }) => {
  const hello = (name: string) => describe<string>("hello").setPayload(name).make();

  const handleHello = handler((program) =>
    program.payload.map((name) => program.run(`Hello ${name}`))
  );

  const programinterpreter = baseInterpreter().chain(interpreter(match("hello").from(handleHello)));

  const result = hello("world")
    .map((data) => data.toUpperCase())
    .run(programinterpreter.make());

  const value = await result.execute(
    (err) => {
      throw new Error(err);
    },
    (data) => data
  );

  expect(value).toBe("HELLO WORLD");
});

const hello = (name: string) => describe<string>("hello").setPayload(name).make();
const world = (name: string) => describe<string>("world").setPayload(name).make();
const sum = (a: number, b: number) => describe<number>("sum").setPayload({ a, b }).make();

type LogContext = { log: (text: string) => void };
type ErrorContext = { error: (text: string) => void };

const handleHello = reader((ctx: LogContext) =>
  handler<string, string>((program) => {
    return program.payload
      .tap((name) => ctx.log(`Name: ${name}`))
      .map((name) => program.run(`Hello ${name}`));
  })
);

const handleWorld = reader((ctx: ErrorContext) =>
  handler<string, string>((program) => {
    return program.payload
      .tap((name) => ctx.error(`Name: ${name}`))
      .map((name) => program.run(`World ${name}`));
  })
);

const handleSum = handler<number, { a: number; b: number }>((program) => {
  return program.payload.toMonad().chain(({ a, b }) =>
    Task.from(async () => {
      const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
      await sleep(1000);
      return program.run(a + b);
    })
  );
});

const errorInterpreter = interpreter<ErrorContext>(match("world").fromContext(handleWorld));
const logInterpreter = interpreter<LogContext>(
  match("hello").fromContext(handleHello),
  match("sum").from(handleSum)
);

const programinterpreter = baseInterpreter().chain(errorInterpreter).chain(logInterpreter);

const logCtx: LogContext = { log: (text: string) => console.log(`LOG CONTEXT: ${text}`) };
const errorCtx: ErrorContext = { error: (text: string) => console.error(`ERROR CONTEXT: ${text}`) };

test("[Free] DoGen notation", async ({ expect }) => {
  const result = DoGen(function* () {
    const name: string = yield hello("world");
    const name2: string = yield world(name);
    return name + " " + name2;
  }).run(programinterpreter.withContext({ ...logCtx, ...errorCtx }).make());

  const value = await result.execute(
    (err) => {
      throw new Error(err);
    },
    (data) => data
  );

  console.log(value);

  expect(value).toBe("Hello world World Hello world");
});

test.skip("[Free] Do notation", async ({ expect }) => {
  const result = Do({
    name: hello("Adriel"),
    name2: world("world"),
    sum: sum(1, 2),
    sum2: sum(3, 4),
    sum3: sum(5, 6),
    sum4: sum(7, 8),
  })
    .map(pureRecord)
    .chain((data) => Do({ ...data, sum: sum(3, 10) }))
    .map((data) => data.sum + data.sum2 + data.sum3 + data.sum4);

  const value = await result
    .run(programinterpreter.withContext({ ...logCtx, ...errorCtx }).make())
    .getAsyncOrElse(() => 0);

  console.log(value);

  expect(value).toEqual(46);
});
