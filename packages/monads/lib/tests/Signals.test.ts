import { test, describe, vi } from "vitest";
import { compute, signal } from "../monads/signal";

describe("Signal", () => {
  test("subscribe adds an observer", async ({ expect }) => {
    const value = signal<number>(0);
    let receivedValue: number | null = null;
    value.subscribe((value) => (receivedValue = value));
    value.next(1);
    expect(receivedValue).toBe(1);
  });

  test("Compute", ({ expect }) => {
    const value1 = signal<number>(0);
    const logFn = vi.fn().mockImplementation((value) => console.log("Count", value));

    compute(() => {
      logFn(value1.get());
    });

    value1.next(1);
    value1.next(2);
    expect(logFn).toHaveBeenCalledTimes(3);
  });

  test("Compute multiple", ({ expect }) => {
    const value1 = signal<number>(0);
    const value2 = signal<number>(0);
    const computeFn = vi.fn().mockImplementation(() => {
      console.log("Count", value1.get(), value2.get());
    });

    compute(computeFn);

    value1.next(1);
    value2.next(2);
    expect(computeFn).toHaveBeenCalledTimes(3);
  });

  test.skip("Compute unsubscribe", ({ expect }) => {
    const value1 = signal<number>(0);
    const value2 = signal<number>(0);
    const computeFn = vi.fn().mockImplementation(() => {
      console.log("Count", value1.get(), value2.get());
    });

    const unsubscribe = compute(computeFn);

    value1.next(1);

    unsubscribe();

    value2.next(2);
    expect(computeFn).toHaveBeenCalledTimes(2);
  });
});
