import { Task } from "../io";
import { maybe } from "../maybe";
import { Monad } from "../types";
import { Lock } from "./lock";

export function createTaskQueue() {
  const tasks: Monad<any>[] = [];
  const lock = new Lock();

  async function start() {
    await lock.acquire();

    const task = maybe(tasks.shift())
      .tapNullable(() => lock.releaseLock())
      .get();

    if (!task) return;
    await task.getAsync().catch();

    lock.releaseLock();
    if (tasks.length > 0) start();
  }

  function enqueue<T>(task: Monad<T>) {
    return Task.from(
      () =>
        new Promise<T>((resolve, reject) => {
          tasks.push(task.tap(resolve).tapError(reject));
          if (tasks.length === 1) start();
        })
    );
  }

  return { enqueue };
}

export type TaskQueue = ReturnType<typeof createTaskQueue>;
