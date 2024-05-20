// Maybe.test.ts
import { test } from "vitest";
import { Maybe } from "../monads/maybe/Maybe";

test("Maybe constructor and isNothing", ({ expect }) => {
  const maybeInstance = Maybe.of("test");
  expect(maybeInstance.isNothing()).toBe(false);

  const maybeNullInstance = Maybe.of(null);
  expect(maybeNullInstance.isNothing()).toBe(true);

  const maybeUndefinedInstance = Maybe.of(undefined);
  expect(maybeUndefinedInstance.isNothing()).toBe(true);
});

test("Maybe map", ({ expect }) => {
  const maybeInstance = Maybe.of("test");
  const mappedInstance = maybeInstance.map((value) => value + " mapped");
  expect(mappedInstance.isNothing()).toBe(false);

  const maybeNullInstance = Maybe.of(null);
  const mappedNullInstance = maybeNullInstance.map((value) => value);
  expect(mappedNullInstance.isNothing()).toBe(true);

  const maybeUndefinedInstance = Maybe.of(undefined);
  const mappedUndefinedInstance = maybeUndefinedInstance.map((value) => value);
  expect(mappedUndefinedInstance.isNothing()).toBe(true);
});

test("Maybe getOrElse", ({ expect }) => {
  const maybeInstance = Maybe.of("test");
  expect(maybeInstance.getOrElse("default")).toBe("test");

  const maybeNullInstance = Maybe.of<string>(null as any);
  expect(maybeNullInstance.getOrElse("default")).toBe("default");

  const maybeUndefinedInstance = Maybe.of<string>(undefined as any);
  expect(maybeUndefinedInstance.getOrElse("default")).toBe("default");
});

test("Maybe map object", ({ expect }) => {
  const obj = { name: "test", data: { firstValue: null as unknown as string } };
  const maybeInstance = Maybe.of(obj);
  const mappedInstance = maybeInstance.map((value) => ({ ...value, name: value.name + " mapped" }));
  expect(mappedInstance.isNothing()).toBe(false);
  expect(mappedInstance.get()?.name).toBe("test mapped");

  const maybeNullInstance = mappedInstance
    .map((value) => value.data.firstValue)
    .map((value) => value + " mapped");
  expect(maybeNullInstance.isNothing()).toBe(true);
  expect(maybeNullInstance.getOrElse("default")).toBe("default");
});

test("Maybe null", ({ expect }) => {
  const maybeNullInstance = Maybe.of<string | null>(null);
  expect(maybeNullInstance.isNothing()).toBe(true);
  expect(maybeNullInstance.map((value) => value).isNothing()).toBe(true);
  expect(maybeNullInstance.getOrElse("default")).toBe("default");
  expect(maybeNullInstance.get()).toBe(null);
});

test("Maybe undefined", ({ expect }) => {
  const maybeUndefinedInstance = Maybe.of<string | undefined>(undefined);
  expect(maybeUndefinedInstance.isNothing()).toBe(true);
  expect(maybeUndefinedInstance.map((value) => value).isNothing()).toBe(true);
  expect(maybeUndefinedInstance.getOrElse("default")).toBe("default");
  expect(maybeUndefinedInstance.get()).toBe(null);
});

test("Maybe chain", ({ expect }) => {
  const maybeInstance = Maybe.of("test");
  const chainedInstance = maybeInstance.chain((value) => Maybe.of(value + " chained"));
  expect(chainedInstance.isNothing()).toBe(false);
  expect(chainedInstance.get()).toBe("test chained");

  const maybeNullInstance = Maybe.of<string | null>(null);
  const chainedNullInstance = maybeNullInstance.chain((value) => Maybe.of(value));
  expect(chainedNullInstance.isNothing()).toBe(true);
  expect(chainedNullInstance.getOrElse("default")).toBe("default");

  const maybeUndefinedInstance = Maybe.of<string | undefined>(undefined);
  const chainedUndefinedInstance = maybeUndefinedInstance.chain((value) => Maybe.of(value));
  expect(chainedUndefinedInstance.isNothing()).toBe(true);
  expect(chainedUndefinedInstance.getOrElse("default")).toBe("default");

  const obj = { name: "test", data: { firstValue: null as unknown as string } };
  const maybeObjInstance = Maybe.of(obj);
  const chainedObjInstance = maybeObjInstance.chain((value) => Maybe.of(value.data.firstValue));
  expect(chainedObjInstance.isNothing()).toBe(true);
  expect(chainedObjInstance.getOrElse("default")).toBe("default");
});

test("Maybe apply", ({ expect }) => {
  const maybeInstance = Maybe.of((value: string) => value + " applied");
  const appliedInstance = Maybe.apply(maybeInstance, Maybe.of("test"));
  expect(appliedInstance.isNothing()).toBe(false);
  expect(appliedInstance.get()).toBe("test applied");

  const maybeNullInstance = Maybe.of((value: string) => value + " applied");
  const appliedNullInstance = Maybe.apply(maybeNullInstance, Maybe.of<string>(null as any));
  expect(appliedNullInstance.isNothing()).toBe(true);
  expect(appliedNullInstance.getOrElse("default")).toBe("default");

  const maybeUndefinedInstance = Maybe.of((value: string) => value + " applied");
  const appliedUndefinedInstance = Maybe.apply(
    maybeUndefinedInstance,
    Maybe.of<string>(undefined as any)
  );
  expect(appliedUndefinedInstance.isNothing()).toBe(true);
  expect(appliedUndefinedInstance.getOrElse("default")).toBe("default");
});
