// Either.test.ts
import { test } from "vitest";
import { Either, Left, Right, left, right } from "../monads/either/Either";

test("Either Left and Right creation", ({ expect }) => {
  const leftInstance = left("error");
  const rightInstance = right("success");

  expect(leftInstance.left()).toBe("error");
  expect(rightInstance.right()).toBe("success");
});

test("Either fold", ({ expect }) => {
  const leftInstance = left("error");
  const rightInstance = right("success");

  expect(
    leftInstance.fold(
      (l) => l,
      (r) => r
    )
  ).toBe("error");
  expect(
    rightInstance.fold(
      (l) => l,
      (r) => r
    )
  ).toBe("success");
});

test("Either isLeft and isRight", ({ expect }) => {
  const leftInstance = left("error");
  const rightInstance = right("success");

  expect(leftInstance.isLeft()).toBe(true);
  expect(leftInstance.isRight()).toBe(false);
  expect(rightInstance.isLeft()).toBe(false);
  expect(rightInstance.isRight()).toBe(true);
});

test("Either tapLeft and tapRight", ({ expect }) => {
  let sideEffect = "";
  const leftInstance = left("error");
  const rightInstance = right("success");

  leftInstance.tapLeft((value) => {
    sideEffect = value;
  });
  rightInstance.tapRight((value) => {
    sideEffect = value;
  });

  expect(sideEffect).toBe("success");
});

test("Either map", ({ expect }) => {
  const rightInstance = right("success");

  const mappedInstance = rightInstance.map((value) => value + " mapped");

  expect(mappedInstance.right()).toBe("success mapped");
});

test("Either chain", ({ expect }) => {
  const rightInstance = right("success");

  const chainedInstance = rightInstance.chain((value) => right(value + " chained"));

  expect(chainedInstance.right()).toBe("success chained");
});

test("Either chain [ERROR]", ({ expect }) => {
  const rightInstance = left("error 1");

  const chainedInstance = rightInstance.tapLeft(console.log).chain((value) => right("value 2"));

  expect(chainedInstance.isLeft()).toBe(true);
  expect(chainedInstance.left()).toBe("error 1");
});

test("Either toPrimitive", ({ expect }) => {
  const leftInstance = left("error");
  const rightInstance = right("success");

  expect(leftInstance.toPrimitive()).toEqual({ isRight: false, value: "error" });
  expect(rightInstance.toPrimitive()).toEqual({ isRight: true, value: "success" });
});

test("Either getOrElseThrow and getOrElse", ({ expect }) => {
  const leftInstance = left("error");
  const rightInstance = right("success");

  expect(() => leftInstance.getOrElseThrow()).toThrow("error");
  expect(rightInstance.getOrElseThrow()).toBe("success");
  expect(rightInstance.getOrElse("default")).toBe("success");
});

test("Either apply", ({ expect }) => {
  let eitherFunc: Either<string, (a: number) => number> = right((a: number) => a * 2);
  let eitherValue: Either<string, number> = right(5);
  let result = Either.apply(eitherFunc, eitherValue);

  expect(result.right()).toBe(10);
});
