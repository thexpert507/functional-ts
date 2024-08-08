export class Lock {
  private promise: Promise<void> = Promise.resolve();
  private release: () => void = () => {};

  async acquire(): Promise<void> {
    const newPromise = new Promise<void>((resolve) => (this.release = resolve));
    const oldPromise = this.promise;
    this.promise = this.promise.then(() => newPromise);
    return oldPromise;
  }

  releaseLock() {
    this.release();
  }
}
